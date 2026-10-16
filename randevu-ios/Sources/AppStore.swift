import Foundation
import Observation

@MainActor
@Observable
final class AppStore {
    static let defaultServer = "https://admin.striastudio.com.tr"

    // Session
    private(set) var isAuthenticated = false
    private(set) var isBootstrapping = true
    private(set) var user: DesktopUser?

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

    // Login form prefill
    var savedServer: String { creds?.baseURL ?? Self.defaultServer }

    private var api: DesktopAPI?
    private var token: String?
    private var creds: StoredCredentials?

    init() {
        creds = StoredCredentials.load()
    }

    // MARK: Bootstrap

    func bootstrap() async {
        defer { isBootstrapping = false }
        guard let creds, let url = DesktopAPI.normalizedBaseURL(creds.baseURL) else {
            isBootstrapping = false
            return
        }
        api = DesktopAPI(baseURL: url)
        token = creds.token
        do {
            try await loadStateWithRetry()
            isAuthenticated = true
        } catch {
            // Stored session unusable; stay logged out (user re-enters password).
            isAuthenticated = false
        }
    }

    // MARK: Auth

    func login(server: String, email: String, password: String) async {
        guard let url = DesktopAPI.normalizedBaseURL(server) else {
            errorMessage = "Sunucu adresi geçersiz. Örn: https://admin.striastudio.com.tr"
            return
        }
        isLoading = true
        defer { isLoading = false }
        let client = DesktopAPI(baseURL: url)
        do {
            let login = try await client.login(email: email, password: password)
            let state = try await client.state(token: login.token)
            api = client
            token = login.token
            user = login.user
            apply(state)
            var stored = StoredCredentials(baseURL: url.absoluteString, email: email, password: password, token: login.token)
            stored.save()
            creds = stored
            isAuthenticated = true
        } catch let APIError.validation(_, fields) {
            errorMessage = fields.values.first?.first ?? "E-posta veya parola hatalı."
        } catch {
            errorMessage = (error as? APIError)?.errorDescription ?? error.localizedDescription
        }
    }

    func logout() async {
        isLoading = true
        defer { isLoading = false }
        if let api, let token { try? await api.logout(token: token) }
        token = nil
        user = nil
        api = nil
        creds = nil
        customers = []; appointments = []; services = []; hours = []
        lastRefresh = nil
        StoredCredentials.clear()
        isAuthenticated = false
    }

    // MARK: Refresh

    func refresh() async {
        guard api != nil else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            try await loadStateWithRetry()
            isAuthenticated = true
        } catch APIError.unauthorized {
            isAuthenticated = false
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
                           status: AppointmentStatus, note: String?, sessionTotal: Int, intervalDays: Int) async -> Bool {
        let payload = AppointmentWrite(customerID: customerID, serviceID: serviceID, startsAt: startsAt,
                                       durationMin: durationMin, status: status.apiValue, note: note.nilIfBlank,
                                       revision: nil,
                                       sessionTotal: sessionTotal > 1 ? sessionTotal : nil,
                                       intervalDays: sessionTotal > 1 ? intervalDays : nil)
        return await mutate { api, token in
            try await api.createAppointment(payload, token: token)
        }
    }

    func updateAppointment(id: Int, revision: String, customerID: Int, serviceID: Int?, startsAt: Date,
                           durationMin: Int, status: AppointmentStatus, note: String?) async -> Bool {
        let payload = AppointmentWrite(customerID: customerID, serviceID: serviceID, startsAt: startsAt,
                                       durationMin: durationMin, status: status.apiValue, note: note.nilIfBlank,
                                       revision: revision, sessionTotal: nil, intervalDays: nil)
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

    func appointments(for customerID: Int) -> [AppointmentDTO] {
        appointments.filter { $0.customerID == customerID }.sorted { $0.startsAt > $1.startsAt }
    }

    func appointments(on day: Date) -> [AppointmentDTO] {
        appointments
            .filter { Studio.calendar.isDate($0.startsAt, inSameDayAs: day) }
            .sorted { $0.startsAt < $1.startsAt }
    }

    func hasAppointments(on day: Date) -> Bool {
        appointments.contains { Studio.calendar.isDate($0.startsAt, inSameDayAs: day) }
    }

    // MARK: Internals

    private func apply(_ state: StateDTO) {
        customers = state.customers
        appointments = state.appointments
        services = state.services
        hours = state.hours.sorted { $0.id < $1.id }
        lastRefresh = Date()
    }

    private func loadStateWithRetry() async throws {
        guard let api else { throw APIError.unauthorized }
        do {
            guard let token else { throw APIError.unauthorized }
            apply(try await api.state(token: token))
        } catch APIError.unauthorized {
            try await reloginOnce()
            guard let token else { throw APIError.unauthorized }
            apply(try await api.state(token: token))
        }
    }

    /// Re-login silently with stored credentials. Throws if no creds or login fails.
    private func reloginOnce() async throws {
        guard let api, let creds else { throw APIError.unauthorized }
        let login = try await api.login(email: creds.email, password: creds.password)
        token = login.token
        user = login.user
        var updated = creds
        updated.token = login.token
        self.creds = updated
        StoredCredentials.updateToken(login.token)
    }

    /// Run a write with one silent re-login retry on 401, then re-fetch /state.
    private func mutate(_ op: @escaping (DesktopAPI, String) async throws -> Void) async -> Bool {
        guard let api else { errorMessage = APIError.unauthorized.errorDescription; return false }
        isMutating = true
        defer { isMutating = false }
        do {
            do {
                guard let token else { throw APIError.unauthorized }
                try await op(api, token)
            } catch APIError.unauthorized {
                try await reloginOnce()
                guard let token else { throw APIError.unauthorized }
                try await op(api, token)
            }
            try? await loadStateWithRetry()
            return true
        } catch APIError.conflict {
            errorMessage = APIError.conflict.errorDescription
            try? await loadStateWithRetry()
            return false
        } catch APIError.unauthorized {
            isAuthenticated = false
            errorMessage = APIError.unauthorized.errorDescription
            return false
        } catch {
            present(error)
            return false
        }
    }

    private func mutateReturning(_ op: @escaping (DesktopAPI, String) async throws -> CustomerDTO) async -> CustomerDTO? {
        guard let api else { errorMessage = APIError.unauthorized.errorDescription; return nil }
        isMutating = true
        defer { isMutating = false }
        do {
            let result: CustomerDTO
            do {
                guard let token else { throw APIError.unauthorized }
                result = try await op(api, token)
            } catch APIError.unauthorized {
                try await reloginOnce()
                guard let token else { throw APIError.unauthorized }
                result = try await op(api, token)
            }
            try? await loadStateWithRetry()
            return result
        } catch APIError.conflict {
            errorMessage = APIError.conflict.errorDescription
            try? await loadStateWithRetry()
            return nil
        } catch APIError.unauthorized {
            isAuthenticated = false
            errorMessage = APIError.unauthorized.errorDescription
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
