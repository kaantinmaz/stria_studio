import Foundation
import Observation

@MainActor
@Observable
final class AppStore {
    static let server = URL(string: "https://admin.striastudio.com.tr")!

    private(set) var isBootstrapping = true

    // Data
    private(set) var customers: [CustomerDTO] = []
    private(set) var appointments: [AppointmentDTO] = []
    private(set) var services: [ServiceDTO] = []
    private(set) var hours: [WorkingDayDTO] = []
    private(set) var lastRefresh: Date?

    // UI
    var isLoading = false
    var isMutating = false
    var errorMessage: String?

    /// Studio-only app: authenticates with a non-expiring `desktop:manage` token
    /// baked in at build time (gitignored `EmbeddedToken.swift`); no login screen.
    private let api = DesktopAPI(baseURL: AppStore.server)
    private let token = EmbeddedToken.value

    // MARK: Bootstrap / refresh

    func bootstrap() async {
        defer { isBootstrapping = false }
        await refresh()
    }

    func refresh() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await loadState()
        } catch {
            present(error)
        }
    }

    // MARK: Writes

    func createCustomer(name: String, phone: String?, email: String?, notes: String?) async -> CustomerDTO? {
        let payload = CustomerWrite(name: name, phone: phone.nilIfBlank, email: email.nilIfBlank,
                                    notes: notes.nilIfBlank, revision: nil)
        return await mutateReturning { api, token in
            try await api.createCustomer(payload, token: token)
        }
    }

    func updateCustomer(id: Int, revision: String, name: String, phone: String?, email: String?, notes: String?) async -> Bool {
        let payload = CustomerWrite(name: name, phone: phone.nilIfBlank, email: email.nilIfBlank,
                                    notes: notes.nilIfBlank, revision: revision)
        return await mutate { api, token in
            _ = try await api.updateCustomer(id: id, payload, token: token)
        }
    }

    func createAppointment(customerID: Int, serviceID: Int?, startsAt: Date, durationMin: Int,
                           status: AppointmentStatus, note: String?, sessionTotal: Int, intervalDays: Int,
                           sessionStarts: [Date]? = nil, price: Decimal? = nil) async -> Bool {
        var payload = AppointmentWrite(customerID: customerID, serviceID: serviceID, startsAt: startsAt,
                                       durationMin: durationMin, status: status.apiValue, note: note.nilIfBlank,
                                       revision: nil,
                                       sessionTotal: sessionTotal > 1 ? sessionTotal : nil,
                                       intervalDays: sessionTotal > 1 ? intervalDays : nil,
                                       sessionStarts: sessionTotal > 1 ? sessionStarts : nil)
        if let price { payload.price = .set(price) }
        return await mutate { api, token in
            try await api.createAppointment(payload, token: token)
        }
    }

    func updateAppointment(id: Int, revision: String, customerID: Int, serviceID: Int?, startsAt: Date,
                           durationMin: Int, status: AppointmentStatus, note: String?,
                           price: PriceWrite = .omit) async -> Bool {
        let payload = AppointmentWrite(customerID: customerID, serviceID: serviceID, startsAt: startsAt,
                                       durationMin: durationMin, status: status.apiValue, note: note.nilIfBlank,
                                       revision: revision, sessionTotal: nil, intervalDays: nil, sessionStarts: nil,
                                       price: price)
        return await mutate { api, token in
            try await api.updateAppointment(id: id, payload, token: token)
        }
    }

    func addSession(appointmentID: Int, revision: String, intervalDays: Int) async -> Bool {
        await mutate { api, token in
            try await api.addSession(id: appointmentID, revision: revision, intervalDays: intervalDays, token: token)
        }
    }

    func deleteAppointment(id: Int, revision: String) async -> Bool {
        await mutate { api, token in
            try await api.deleteAppointment(id: id, revision: revision, token: token)
        }
    }

    // MARK: Lookups

    func customer(_ id: Int) -> CustomerDTO? { customers.first { $0.id == id } }
    func service(_ id: Int?) -> ServiceDTO? { guard let id else { return nil }; return services.first { $0.id == id } }
    func serviceTitle(_ id: Int?) -> String { service(id)?.title ?? "Hizmet belirtilmemiş" }

    /// All appointments in the same session package as `appt`, ordered by start.
    func packageMembers(of appt: AppointmentDTO) -> [AppointmentDTO] {
        guard appt.isPackage else { return [appt] }
        let root = appt.rootID
        return appointments
            .filter { ($0.parentID ?? $0.id) == root }
            .sorted { $0.startsAt < $1.startsAt }
    }

    /// Customer's appointments that are not part of `appt`'s package, newest first.
    func otherAppointments(for customerID: Int, excludingPackageOf appt: AppointmentDTO?) -> [AppointmentDTO] {
        let excludedRoot = appt?.rootID
        return appointments
            .filter { $0.customerID == customerID }
            .filter { excludedRoot == nil || ($0.parentID ?? $0.id) != excludedRoot }
            .sorted { $0.startsAt > $1.startsAt }
    }

    /// Package price lives on the root session; for singles it's the appointment's own price.
    func packagePrice(of appt: AppointmentDTO) -> Decimal? {
        appt.isChildSession ? appointments.first { $0.id == appt.rootID }?.price : appt.price
    }

    /// Sum of single and package prices for a customer (each package counted once, via its root).
    func totalPrice(for customerID: Int) -> Decimal {
        appointments.filter { $0.customerID == customerID && !$0.isChildSession }
            .compactMap(\.price)
            .reduce(0, +)
    }

    func appointments(for customerID: Int) -> [AppointmentDTO] {
        appointments.filter { $0.customerID == customerID }.sorted { $0.startsAt > $1.startsAt }
    }

    // MARK: Internals

    private func apply(_ state: StateDTO) {
        customers = state.customers
        appointments = state.appointments
        services = state.services
        hours = state.hours.sorted { $0.id < $1.id }
        lastRefresh = Date()
    }

    private func loadState() async throws {
        apply(try await api.state(token: token))
    }

    /// Run a write, then re-fetch /state.
    private func mutate(_ op: @escaping (DesktopAPI, String) async throws -> Void) async -> Bool {
        isMutating = true
        defer { isMutating = false }
        do {
            try await op(api, token)
            try? await loadState()
            return true
        } catch APIError.conflict {
            errorMessage = APIError.conflict.errorDescription
            try? await loadState()
            return false
        } catch {
            present(error)
            return false
        }
    }

    private func mutateReturning(_ op: @escaping (DesktopAPI, String) async throws -> CustomerDTO) async -> CustomerDTO? {
        isMutating = true
        defer { isMutating = false }
        do {
            let result = try await op(api, token)
            try? await loadState()
            return result
        } catch APIError.conflict {
            errorMessage = APIError.conflict.errorDescription
            try? await loadState()
            return nil
        } catch {
            present(error)
            return nil
        }
    }

    private func present(_ error: Error) {
        errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
    }
}

extension Optional where Wrapped == String {
    var nilIfBlank: String? {
        guard let self else { return nil }
        let trimmed = self.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}

extension String {
    var nilIfBlank: String? {
        let trimmed = trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
