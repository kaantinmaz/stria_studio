import SwiftUI

struct AppointmentsView: View {
    @Environment(AppStore.self) private var store

    @State private var selectedDay = Studio.calendar.startOfDay(for: Date())
    @State private var showNew = false

    private var dayAppointments: [AppointmentDTO] { store.appointments(on: selectedDay) }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                header
                weekStrip
                Divider()
                list
            }
            .navigationTitle("Randevular")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Bugün") { withAnimation { selectedDay = Studio.calendar.startOfDay(for: Date()) } }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button { showNew = true } label: { Image(systemName: "plus") }
                }
            }
            .navigationDestination(for: AppointmentDTO.self) { appt in
                AppointmentDetailView(appointmentID: appt.id)
            }
            .sheet(isPresented: $showNew) {
                NewAppointmentView(defaultDay: selectedDay)
            }
            .errorAlert(store)
        }
    }

    private var header: some View {
        HStack {
            Button { changeDay(by: -1) } label: { Image(systemName: "chevron.left") }
            Spacer()
            VStack(spacing: 2) {
                Text(Fmt.dayHeader.string(from: selectedDay))
                    .font(.headline)
                if Studio.calendar.isDateInToday(selectedDay) {
                    Text("Bugün").font(.caption2).foregroundStyle(Color.accentColor)
                }
            }
            Spacer()
            Button { changeDay(by: 1) } label: { Image(systemName: "chevron.right") }
        }
        .font(.title3)
        .padding(.horizontal)
        .padding(.vertical, 10)
    }

    private var weekStrip: some View {
        let days = weekDays(around: selectedDay)
        return ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(days, id: \.self) { day in
                    let isSelected = Studio.calendar.isDate(day, inSameDayAs: selectedDay)
                    Button {
                        withAnimation { selectedDay = day }
                    } label: {
                        VStack(spacing: 4) {
                            Text(Fmt.weekdayShort.string(from: day))
                                .font(.caption2)
                                .foregroundStyle(isSelected ? .white : .secondary)
                            Text("\(Studio.calendar.component(.day, from: day))")
                                .font(.callout.weight(.semibold))
                                .foregroundStyle(isSelected ? .white : .primary)
                            Circle()
                                .fill(store.hasAppointments(on: day) ? (isSelected ? Color.white : Color.accentColor) : .clear)
                                .frame(width: 5, height: 5)
                        }
                        .frame(width: 42)
                        .padding(.vertical, 8)
                        .background(isSelected ? Color.accentColor : Color(.secondarySystemBackground),
                                    in: RoundedRectangle(cornerRadius: 10))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 8)
        }
    }

    @ViewBuilder
    private var list: some View {
        if dayAppointments.isEmpty {
            ContentUnavailableView("Bu gün randevu yok", systemImage: "calendar.badge.plus",
                                   description: Text("Yeni randevu eklemek için + simgesine dokunun."))
                .frame(maxHeight: .infinity)
                .contentShape(Rectangle())
                .gesture(swipe)
        } else {
            List {
                ForEach(dayAppointments) { appt in
                    NavigationLink(value: appt) { AppointmentRow(appt: appt) }
                }
            }
            .listStyle(.plain)
            .refreshable { await store.refresh() }
            .gesture(swipe)
            .id(selectedDay)
            .transition(.opacity)
        }
    }

    private var swipe: some Gesture {
        DragGesture(minimumDistance: 40)
            .onEnded { value in
                if value.translation.width < -50 { changeDay(by: 1) }
                else if value.translation.width > 50 { changeDay(by: -1) }
            }
    }

    private func changeDay(by delta: Int) {
        if let next = Studio.calendar.date(byAdding: .day, value: delta, to: selectedDay) {
            withAnimation { selectedDay = Studio.calendar.startOfDay(for: next) }
        }
    }

    private func weekDays(around day: Date) -> [Date] {
        let start = Studio.calendar.startOfDay(for: day)
        // Monday-based week containing `day`.
        let weekday = Studio.calendar.component(.weekday, from: start) // 1=Sun..7=Sat
        let offsetToMonday = (weekday + 5) % 7 // days since Monday
        guard let monday = Studio.calendar.date(byAdding: .day, value: -offsetToMonday, to: start) else { return [start] }
        return (0..<7).compactMap { Studio.calendar.date(byAdding: .day, value: $0, to: monday) }
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
                }
            }
            Spacer()
        }
        .padding(.vertical, 4)
        .opacity(status == .cancelled ? 0.5 : 1)
    }
}
