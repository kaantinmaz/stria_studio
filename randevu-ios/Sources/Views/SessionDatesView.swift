import SwiftUI

/// Edit the start date/time of every session in a package.
struct SessionDatesView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    let appointmentID: Int

    @State private var dates: [Int: Date] = [:]
    @State private var original: [Int: Date] = [:]
    @State private var didInit = false

    private var members: [AppointmentDTO] {
        guard let appt = store.appointments.first(where: { $0.id == appointmentID }) else { return [] }
        return store.packageMembers(of: appt)
    }

    private var changedIDs: [Int] {
        dates.filter { original[$0.key] != $0.value }
            .sorted { $0.value < $1.value }
            .map(\.key)
    }

    var body: some View {
        NavigationStack {
            Form {
                ForEach(members) { member in
                    HStack(spacing: 10) {
                        if let no = member.sessionNo, let total = member.sessionTotal {
                            SessionBadge(no: no, total: total)
                        }
                        DatePicker("Seans", selection: date(for: member),
                                   displayedComponents: [.date, .hourAndMinute])
                            .labelsHidden()
                            .environment(\.locale, Studio.locale)
                            .environment(\.timeZone, Studio.timeZone)
                        Spacer(minLength: 0)
                        StatusChip(status: .from(member.status))
                    }
                }
            }
            .navigationTitle("Seans tarihleri")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kaydet") { save() }
                        .disabled(store.isMutating || changedIDs.isEmpty)
                }
            }
            .onAppear {
                guard !didInit else { return }
                didInit = true
                original = Dictionary(uniqueKeysWithValues: members.map { ($0.id, $0.startsAt) })
                dates = original
            }
            .errorAlert(store)
        }
    }

    private func date(for member: AppointmentDTO) -> Binding<Date> {
        Binding(get: { dates[member.id] ?? member.startsAt },
                set: { dates[member.id] = $0 })
    }

    private func save() {
        let ids = changedIDs
        Task {
            for id in ids {
                // Each write re-fetches state, so revisions change: read the current one per call.
                guard let current = store.appointments.first(where: { $0.id == id }), let startsAt = dates[id] else {
                    store.errorMessage = "Seans bulunamadı. Liste yenilendi, tekrar deneyin."
                    return
                }
                let ok = await store.updateAppointment(id: id, revision: current.revision,
                                                       customerID: current.customerID, serviceID: current.serviceID,
                                                       startsAt: startsAt, durationMin: current.durationMin,
                                                       status: .from(current.status), note: current.note)
                guard ok else { return }
                original[id] = startsAt
            }
            dismiss()
        }
    }
}
