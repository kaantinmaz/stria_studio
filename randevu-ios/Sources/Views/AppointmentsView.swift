import SwiftUI

struct AppointmentsView: View {
    @Environment(AppStore.self) private var store

    @State private var filter: AppointmentFilter = .all
    @State private var showNew = false
    @State private var showCustomRange = false
    @State private var didInitialScroll = false

    private var today: Date { Studio.calendar.startOfDay(for: Date()) }

    /// Filtered appointments grouped by start-of-day, ascending.
    private var days: [(day: Date, items: [AppointmentDTO])] {
        let range = filter.range
        let filtered = store.appointments.filter { range?.contains($0.startsAt) ?? true }
        let grouped = Dictionary(grouping: filtered) { Studio.calendar.startOfDay(for: $0.startsAt) }
        return grouped.keys.sorted().map { day in
            (day, grouped[day]!.sorted { $0.startsAt < $1.startsAt })
        }
    }

    private var newDefaultDay: Date {
        if let start = filter.range?.lowerBound, start > today { return start }
        return today
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if filter != .all { activeFilter }
                list
            }
            .navigationTitle("Randevular")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) { filterMenu }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showNew = true } label: { Image(systemName: "plus") }
                }
            }
            .navigationDestination(for: AppointmentDTO.self) { appt in
                AppointmentDetailView(appointmentID: appt.id)
            }
            .sheet(isPresented: $showNew) {
                NewAppointmentView(defaultDay: newDefaultDay)
            }
            .sheet(isPresented: $showCustomRange) {
                CustomRangeView(initial: filter.range) { filter = $0 }
            }
            .errorAlert(store)
        }
    }

    private var filterMenu: some View {
        Menu {
            ForEach([AppointmentFilter.all, .today, .week, .month], id: \.self) { option in
                Button { filter = option } label: {
                    if filter == option { Label(option.label, systemImage: "checkmark") } else { Text(option.label) }
                }
            }
            Button { showCustomRange = true } label: {
                if case .custom = filter { Label("Özel aralık…", systemImage: "checkmark") } else { Text("Özel aralık…") }
            }
        } label: {
            Image(systemName: filter == .all ? "line.3.horizontal.decrease.circle" : "line.3.horizontal.decrease.circle.fill")
        }
    }

    private var activeFilter: some View {
        Button { filter = .all } label: {
            HStack(spacing: 6) {
                Text(filter.label)
                Image(systemName: "xmark.circle.fill")
            }
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(Color.accentColor.opacity(0.15), in: Capsule())
            .foregroundStyle(Color.accentColor)
        }
        .buttonStyle(.plain)
        .accessibilityLabel("\(filter.label) filtresini kaldır")
        .padding(.vertical, 8)
    }

    @ViewBuilder
    private var list: some View {
        let days = days
        if days.isEmpty {
            ContentUnavailableView("Randevu yok", systemImage: "calendar.badge.plus",
                                   description: Text("Yeni randevu eklemek için + simgesine dokunun."))
                .frame(maxHeight: .infinity)
        } else {
            ScrollViewReader { proxy in
                List {
                    ForEach(days, id: \.day) { group in
                        Section {
                            ForEach(group.items) { appt in
                                NavigationLink(value: appt) { AppointmentRow(appt: appt) }
                            }
                        } header: {
                            HStack {
                                Text(Fmt.dayHeader.string(from: group.day))
                                if group.day == today {
                                    Text("Bugün").foregroundStyle(Color.accentColor)
                                }
                            }
                        }
                        .id(group.day)
                    }
                }
                .listStyle(.plain)
                .refreshable { await store.refresh() }
                .onAppear {
                    guard !didInitialScroll else { return }
                    didInitialScroll = true
                    scrollToUpcoming(proxy, days: days)
                }
                .onChange(of: filter) { _, _ in scrollToUpcoming(proxy, days: self.days) }
            }
        }
    }

    /// Jump to the first day that is today or later (stay at bottom if all are past).
    private func scrollToUpcoming(_ proxy: ScrollViewProxy, days: [(day: Date, items: [AppointmentDTO])]) {
        guard let target = days.first(where: { $0.day >= today })?.day ?? days.last?.day else { return }
        Task { @MainActor in proxy.scrollTo(target, anchor: .top) }
    }
}

enum AppointmentFilter: Hashable {
    case all, today, week, month
    case custom(from: Date, to: Date) // inclusive start-of-days

    var label: String {
        switch self {
        case .all: return "Tümü"
        case .today: return "Bugün"
        case .week: return "Bu hafta"
        case .month: return "Bu ay"
        case let .custom(from, to): return "\(Fmt.dayShort.string(from: from)) – \(Fmt.dayShort.string(from: to))"
        }
    }

    /// Half-open date range covered by the filter; nil = no filtering.
    var range: Range<Date>? {
        let cal = Studio.calendar
        let now = Date()
        switch self {
        case .all: return nil
        case .today: return cal.dateInterval(of: .day, for: now).map { $0.start..<$0.end }
        case .week: return cal.dateInterval(of: .weekOfYear, for: now).map { $0.start..<$0.end }
        case .month: return cal.dateInterval(of: .month, for: now).map { $0.start..<$0.end }
        case let .custom(from, to):
            let start = cal.startOfDay(for: from)
            let end = cal.date(byAdding: .day, value: 1, to: cal.startOfDay(for: to)) ?? to
            return start..<max(start, end)
        }
    }
}

private struct CustomRangeView: View {
    @Environment(\.dismiss) private var dismiss
    let initial: Range<Date>?
    var onApply: (AppointmentFilter) -> Void

    @State private var from = Date()
    @State private var to = Date()
    @State private var didInit = false

    var body: some View {
        NavigationStack {
            Form {
                DatePicker("Başlangıç", selection: $from, displayedComponents: .date)
                DatePicker("Bitiş", selection: $to, in: from..., displayedComponents: .date)
            }
            .environment(\.locale, Studio.locale)
            .environment(\.timeZone, Studio.timeZone)
            .navigationTitle("Özel aralık")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Uygula") {
                        onApply(.custom(from: Studio.calendar.startOfDay(for: from),
                                        to: Studio.calendar.startOfDay(for: max(from, to))))
                        dismiss()
                    }
                }
            }
            .onAppear {
                guard !didInit else { return }
                didInit = true
                if let initial {
                    from = initial.lowerBound
                    to = initial.upperBound.addingTimeInterval(-1)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

struct AppointmentRow: View {
    @Environment(AppStore.self) private var store
    let appt: AppointmentDTO

    private var status: AppointmentStatus { .from(appt.status) }

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text(Fmt.time.string(from: appt.startsAt))
                    .font(.headline)
                    .monospacedDigit()
                Text(Fmt.time.string(from: appt.endsAt))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .monospacedDigit()
            }
            .frame(width: 54, alignment: .leading)

            Rectangle().fill(Color.accentColor.opacity(0.3)).frame(width: 2)

            VStack(alignment: .leading, spacing: 4) {
                Text(store.customer(appt.customerID)?.name ?? "Müşteri")
                    .font(.subheadline.weight(.semibold))
                Text(store.serviceTitle(appt.serviceID))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                HStack(spacing: 6) {
                    StatusChip(status: status)
                    if let no = appt.sessionNo, let total = appt.sessionTotal {
                        SessionBadge(no: no, total: total)
                    }
                    // Package price lives on the root only, so it isn't read as per-session.
                    if let price = appt.price {
                        Text(Fmt.price(price)).font(.caption).foregroundStyle(.secondary).monospacedDigit()
                    }
                }
            }
            Spacer()
        }
        .padding(.vertical, 4)
        .opacity(status == .cancelled ? 0.5 : 1)
    }
}
