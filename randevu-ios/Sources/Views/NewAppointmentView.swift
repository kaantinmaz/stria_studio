import SwiftUI

struct NewAppointmentView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var defaultDay: Date = Date()
    var presetCustomer: CustomerDTO? = nil

    @State private var selectedCustomer: CustomerDTO?
    @State private var showCustomerPicker = false
    @State private var serviceID: Int?
    @State private var startDate = Date()
    @State private var startTime = Date()
    @State private var duration = 60
    @State private var status: AppointmentStatus = .confirmed
    @State private var note = ""
    @State private var sessionTotal = 1
    @State private var intervalDays = 28
    @State private var didInit = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Müşteri") {
                    Button {
                        showCustomerPicker = true
                    } label: {
                        HStack {
                            Text(selectedCustomer?.name ?? "Müşteri seç")
                                .foregroundStyle(selectedCustomer == nil ? .secondary : .primary)
                            Spacer()
                            Image(systemName: "chevron.right").font(.caption).foregroundStyle(.tertiary)
                        }
                    }
                }

                Section("Hizmet") {
                    Picker("Hizmet", selection: $serviceID) {
                        Text("Belirtilmemiş").tag(Int?.none)
                        ForEach(store.services) { s in Text(s.title).tag(Int?.some(s.id)) }
                    }
                    .onChange(of: serviceID) { _, newValue in
                        if let s = store.service(newValue) { duration = s.durationMin }
                    }
                }

                Section("Zaman") {
                    DatePicker("Tarih", selection: $startDate, displayedComponents: .date)
                        .environment(\.locale, Studio.locale)
                    DatePicker("Saat", selection: $startTime, displayedComponents: .hourAndMinute)
                        .environment(\.locale, Studio.locale)
                    Stepper("Süre: \(duration) dk", value: $duration, in: 5...600, step: 5)
                }

                Section("Durum") {
                    Picker("Durum", selection: $status) {
                        ForEach(AppointmentStatus.allCases) { s in Text(s.label).tag(s) }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Seans") {
                    Stepper("Seans sayısı: \(sessionTotal)", value: $sessionTotal, in: 1...12)
                    if sessionTotal > 1 {
                        Stepper("Seans aralığı: \(intervalDays) gün", value: $intervalDays, in: 1...365)
                        sessionPreview
                    }
                }

                Section("Not") {
                    TextField("Not", text: $note, axis: .vertical).lineLimit(2...5)
                }
            }
            .navigationTitle("Yeni randevu")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kaydet") { save() }
                        .disabled(store.isMutating || selectedCustomer == nil)
                }
            }
            .sheet(isPresented: $showCustomerPicker) {
                CustomerPickerView(selection: $selectedCustomer)
            }
            .onAppear(perform: initialize)
            .errorAlert(store)
        }
    }

    private var sessionPreview: some View {
        let dates = sessionDates()
        return VStack(alignment: .leading, spacing: 4) {
            Text("Oluşturulacak seanslar").font(.caption).foregroundStyle(.secondary)
            ForEach(Array(dates.enumerated()), id: \.offset) { idx, date in
                HStack {
                    Text("\(idx + 1).").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    Text(Fmt.dateTime.string(from: date)).font(.caption)
                }
            }
        }
    }

    private func sessionDates() -> [Date] {
        let start = DateMerge.combine(day: startDate, time: startTime)
        return (0..<sessionTotal).compactMap {
            Studio.calendar.date(byAdding: .day, value: intervalDays * $0, to: start)
        }
    }

    private func initialize() {
        guard !didInit else { return }
        didInit = true
        selectedCustomer = presetCustomer
        startDate = defaultDay
        // Default start time: 10:00 on selected day.
        startTime = DateMerge.combine(day: defaultDay,
                                      time: Studio.calendar.date(bySettingHour: 10, minute: 0, second: 0, of: defaultDay) ?? defaultDay)
    }

    private func save() {
        guard let customer = selectedCustomer else { return }
        let starts = DateMerge.combine(day: startDate, time: startTime)
        Task {
            let ok = await store.createAppointment(customerID: customer.id, serviceID: serviceID,
                                                    startsAt: starts, durationMin: duration, status: status,
                                                    note: note, sessionTotal: sessionTotal, intervalDays: intervalDays)
            if ok { dismiss() }
        }
    }
}

struct CustomerPickerView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @Binding var selection: CustomerDTO?

    @State private var search = ""
    @State private var showNew = false

    private var filtered: [CustomerDTO] {
        let q = search.trimmingCharacters(in: .whitespaces).lowercased()
        let all = store.customers.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        guard !q.isEmpty else { return all }
        return all.filter {
            $0.name.lowercased().contains(q) || ($0.phone ?? "").lowercased().contains(q)
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        showNew = true
                    } label: {
                        Label("Yeni müşteri", systemImage: "person.badge.plus")
                    }
                }
                Section {
                    ForEach(filtered) { customer in
                        Button {
                            selection = customer
                            dismiss()
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(customer.name).foregroundStyle(.primary)
                                    if let phone = customer.phone, !phone.isEmpty {
                                        Text(phone).font(.caption).foregroundStyle(.secondary)
                                    }
                                }
                                Spacer()
                                if selection?.id == customer.id {
                                    Image(systemName: "checkmark").foregroundStyle(Color.accentColor)
                                }
                            }
                        }
                    }
                }
            }
            .searchable(text: $search, prompt: "Ad veya telefon")
            .navigationTitle("Müşteri seç")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
            }
            .sheet(isPresented: $showNew) {
                NewCustomerView { created in
                    selection = created
                    dismiss()
                }
            }
            .errorAlert(store)
        }
    }
}

struct NewCustomerView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    var onCreated: (CustomerDTO) -> Void

    @State private var name = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Bilgiler") {
                    TextField("Ad (zorunlu)", text: $name)
                    TextField("Telefon", text: $phone).keyboardType(.phonePad)
                    TextField("E-posta", text: $email).keyboardType(.emailAddress).textInputAutocapitalization(.never)
                    TextField("Not", text: $notes, axis: .vertical).lineLimit(2...4)
                }
            }
            .navigationTitle("Yeni müşteri")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Ekle") { create() }
                        .disabled(store.isMutating || name.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .errorAlert(store)
        }
    }

    private func create() {
        Task {
            if let created = await store.createCustomer(name: name.trimmingCharacters(in: .whitespaces),
                                                        phone: phone, email: email, notes: notes) {
                onCreated(created)
                dismiss()
            }
        }
    }
}
