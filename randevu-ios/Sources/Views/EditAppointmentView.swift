import SwiftUI

struct EditAppointmentView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    let appointmentID: Int

    @State private var startDate = Date()
    @State private var startTime = Date()
    @State private var duration = 60
    @State private var serviceID: Int?
    @State private var status: AppointmentStatus = .confirmed
    @State private var note = ""
    @State private var loaded = false

    private var appt: AppointmentDTO? { store.appointments.first { $0.id == appointmentID } }
    private var isChild: Bool { appt?.isChildSession ?? false }

    var body: some View {
        NavigationStack {
            Form {
                if let appt, let customer = store.customer(appt.customerID) {
                    Section("Müşteri") {
                        Text(customer.name)
                        if isChild {
                            Text("Paketin 1. seansında yönetilir")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Hizmet") {
                    Picker("Hizmet", selection: $serviceID) {
                        Text("Belirtilmemiş").tag(Int?.none)
                        ForEach(store.services) { s in
                            Text(s.title).tag(Int?.some(s.id))
                        }
                    }
                    .disabled(isChild)
                    if isChild {
                        Text("Paketin 1. seansında yönetilir")
                            .font(.caption).foregroundStyle(.secondary)
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

                Section("Not") {
                    TextField("Not", text: $note, axis: .vertical).lineLimit(2...5)
                }
            }
            .navigationTitle("Randevuyu düzenle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kaydet") { save() }.disabled(store.isMutating)
                }
            }
            .onAppear(perform: loadIfNeeded)
            .errorAlert(store)
        }
    }

    private func loadIfNeeded() {
        guard !loaded, let appt else { return }
        loaded = true
        startDate = appt.startsAt
        startTime = appt.startsAt
        duration = appt.durationMin
        serviceID = appt.serviceID
        status = .from(appt.status)
        note = appt.note ?? ""
    }

    private func save() {
        guard let appt else { return }
        let starts = DateMerge.combine(day: startDate, time: startTime)
        Task {
            let ok = await store.updateAppointment(id: appt.id, revision: appt.revision,
                                                    customerID: appt.customerID,
                                                    serviceID: isChild ? appt.serviceID : serviceID,
                                                    startsAt: starts, durationMin: duration,
                                                    status: status, note: note)
            if ok { dismiss() }
        }
    }
}

enum DateMerge {
    static func combine(day: Date, time: Date) -> Date {
        let cal = Studio.calendar
        let d = cal.dateComponents([.year, .month, .day], from: day)
        let t = cal.dateComponents([.hour, .minute], from: time)
        var merged = DateComponents()
        merged.year = d.year; merged.month = d.month; merged.day = d.day
        merged.hour = t.hour; merged.minute = t.minute
        return cal.date(from: merged) ?? day
    }
}
