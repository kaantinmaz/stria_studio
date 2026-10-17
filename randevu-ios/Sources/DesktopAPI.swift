import Foundation

enum APIError: LocalizedError, Equatable {
    case invalidBaseURL
    case invalidResponse
    case unauthorized
    case conflict
    case validation(message: String, fields: [String: [String]])
    case notFound
    case server(status: Int, message: String)
    case network(String)

    /// The first human-facing message to show in an alert.
    var errorDescription: String? {
        switch self {
        case .invalidBaseURL: return "Sunucu adresi geçersiz."
        case .invalidResponse: return "Sunucudan beklenmeyen bir yanıt alındı."
        case .unauthorized: return "Uygulama anahtarı geçersiz ya da iptal edilmiş."
        case .conflict: return "Kayıt başka bir yerde güncellendi, güncel hali yüklendi."
        case let .validation(message, fields):
            if let first = fields.values.first?.first, !first.isEmpty { return first }
            return message
        case .notFound: return "İstenen kayıt bulunamadı."
        case let .server(status, message): return message.isEmpty ? "Sunucu hatası (\(status))." : message
        case let .network(msg): return "Bağlantı hatası: \(msg)"
        }
    }
}

private struct APIMessage: Decodable {
    let message: String?
    let errors: [String: [String]]?
}

/// Response body we decode but do not use (we always re-fetch /state after writes).
struct DiscardResponse: Decodable { init(from decoder: Decoder) throws {} }
private struct EmptyBody: Encodable {}
private struct CustomerEnvelope: Decodable { let customer: CustomerDTO }

final class DesktopAPI {
    let baseURL: URL
    private let session: URLSession

    init(baseURL: URL) {
        self.baseURL = baseURL
        let config = URLSessionConfiguration.ephemeral
        config.urlCache = nil
        config.requestCachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        config.httpAdditionalHeaders = ["Accept": "application/json"]
        self.session = URLSession(configuration: config)
    }

    // MARK: Endpoints

    func state(token: String) async throws -> StateDTO {
        try await send(path: "/state", method: "GET", token: token, body: Optional<EmptyBody>.none)
    }

    func createCustomer(_ payload: CustomerWrite, token: String) async throws -> CustomerDTO {
        let env: CustomerEnvelope = try await send(path: "/customers", method: "POST", token: token, body: payload)
        return env.customer
    }

    func updateCustomer(id: Int, _ payload: CustomerWrite, token: String) async throws -> CustomerDTO {
        let env: CustomerEnvelope = try await send(path: "/customers/\(id)", method: "PATCH", token: token, body: payload)
        return env.customer
    }

    func createAppointment(_ payload: AppointmentWrite, token: String) async throws {
        let _: DiscardResponse = try await send(path: "/appointments", method: "POST", token: token, body: payload)
    }

    func updateAppointment(id: Int, _ payload: AppointmentWrite, token: String) async throws {
        let _: DiscardResponse = try await send(path: "/appointments/\(id)", method: "PATCH", token: token, body: payload)
    }

    func addSession(id: Int, revision: String, intervalDays: Int, token: String) async throws {
        let body = SessionAddWrite(revision: revision, intervalDays: intervalDays)
        let _: DiscardResponse = try await send(path: "/appointments/\(id)/sessions", method: "POST", token: token, body: body)
    }

    func deleteAppointment(id: Int, revision: String, token: String) async throws {
        let body = RevisionWrite(revision: revision)
        let _: DiscardResponse = try await send(path: "/appointments/\(id)", method: "DELETE", token: token, body: body)
    }

    // MARK: Core

    private func endpoint(_ path: String) -> URL {
        var comps = URLComponents(url: baseURL, resolvingAgainstBaseURL: false)!
        comps.path = "/api/desktop" + path
        return comps.url!
    }

    private func send<Response: Decodable, Body: Encodable>(path: String, method: String, token: String?, body: Body?) async throws -> Response {
        var request = URLRequest(url: endpoint(path))
        request.httpMethod = method
        request.cachePolicy = .reloadIgnoringLocalAndRemoteCacheData
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        if let token { request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        if let body {
            request.httpBody = try Self.encoder.encode(body)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        let data: Data
        let response: URLResponse
        do {
            (data, response) = try await session.data(for: request)
        } catch {
            throw APIError.network(error.localizedDescription)
        }

        guard let http = response as? HTTPURLResponse else { throw APIError.invalidResponse }
        guard (200..<300).contains(http.statusCode) else {
            switch http.statusCode {
            case 401: throw APIError.unauthorized
            case 409: throw APIError.conflict
            case 404: throw APIError.notFound
            case 422:
                let msg = try? JSONDecoder().decode(APIMessage.self, from: data)
                throw APIError.validation(message: msg?.message ?? "Bilgileri kontrol edip yeniden deneyin.",
                                          fields: msg?.errors ?? [:])
            default:
                let msg = try? JSONDecoder().decode(APIMessage.self, from: data)
                throw APIError.server(status: http.statusCode, message: msg?.message ?? "")
            }
        }

        if Response.self == DiscardResponse.self { return DiscardResponse(ignoring: ()) as! Response }
        do {
            return try Self.decoder.decode(Response.self, from: data)
        } catch {
            throw APIError.invalidResponse
        }
    }

    // MARK: Coders

    static let encoder: JSONEncoder = {
        let encoder = JSONEncoder()
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = Studio.timeZone
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ssZZZZZ" // 2026-10-16T14:00:00+03:00
        encoder.dateEncodingStrategy = .custom { date, encoder in
            var container = encoder.singleValueContainer()
            try container.encode(formatter.string(from: date))
        }
        return encoder
    }()

    static let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        let fractional = ISO8601DateFormatter()
        fractional.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        let plain = ISO8601DateFormatter()
        plain.formatOptions = [.withInternetDateTime]
        decoder.dateDecodingStrategy = .custom { decoder in
            let value = try decoder.singleValueContainer().decode(String.self)
            if let date = fractional.date(from: value) ?? plain.date(from: value) { return date }
            throw DecodingError.dataCorruptedError(in: try decoder.singleValueContainer(),
                                                   debugDescription: "Geçersiz ISO 8601 tarihi: \(value)")
        }
        return decoder
    }()
}

private extension DiscardResponse {
    init(ignoring: ()) {}
}

// MARK: - Write payloads

struct CustomerWrite: Encodable {
    let name: String
    let phone: String?
    let email: String?
    let notes: String?
    let revision: String?

    enum CodingKeys: String, CodingKey { case name, phone, email, notes, revision }
    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(name, forKey: .name)
        try encodeOptional(&c, phone, .phone)
        try encodeOptional(&c, email, .email)
        try encodeOptional(&c, notes, .notes)
        if let revision { try c.encode(revision, forKey: .revision) }
    }
    private func encodeOptional(_ c: inout KeyedEncodingContainer<CodingKeys>, _ value: String?, _ key: CodingKeys) throws {
        if let value { try c.encode(value, forKey: key) } else { try c.encodeNil(forKey: key) }
    }
}

struct AppointmentWrite: Encodable {
    let customerID: Int
    let serviceID: Int?
    let startsAt: Date
    let durationMin: Int
    let status: String
    let note: String?
    let revision: String?
    let sessionTotal: Int?
    let intervalDays: Int?
    let sessionStarts: [Date]?
    var price: PriceWrite = .omit

    enum CodingKeys: String, CodingKey {
        case status, note, revision, price
        case customerID = "customer_id"
        case serviceID = "service_id"
        case startsAt = "starts_at"
        case durationMin = "duration_min"
        case sessionTotal = "session_total"
        case intervalDays = "interval_days"
        case sessionStarts = "session_starts"
    }

    func encode(to encoder: Encoder) throws {
        var c = encoder.container(keyedBy: CodingKeys.self)
        try c.encode(customerID, forKey: .customerID)
        if let serviceID { try c.encode(serviceID, forKey: .serviceID) } else { try c.encodeNil(forKey: .serviceID) }
        try c.encode(startsAt, forKey: .startsAt)
        try c.encode(durationMin, forKey: .durationMin)
        try c.encode(status, forKey: .status)
        if let note { try c.encode(note, forKey: .note) } else { try c.encodeNil(forKey: .note) }
        if let revision { try c.encode(revision, forKey: .revision) }
        if let sessionTotal { try c.encode(sessionTotal, forKey: .sessionTotal) }
        if let intervalDays { try c.encode(intervalDays, forKey: .intervalDays) }
        if let sessionStarts { try c.encode(sessionStarts, forKey: .sessionStarts) }
        switch price {
        case .omit: break
        case .clear: try c.encodeNil(forKey: .price)
        case let .set(value): try c.encode(value, forKey: .price)
        }
    }
}

/// `price` key handling: child sessions must omit it (server 422s), root/single may clear it with null.
enum PriceWrite {
    case omit, clear, set(Decimal)
}

struct SessionAddWrite: Encodable {
    let revision: String
    let intervalDays: Int
    enum CodingKeys: String, CodingKey { case revision; case intervalDays = "interval_days" }
}

struct RevisionWrite: Encodable {
    let revision: String
}
