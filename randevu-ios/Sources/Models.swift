import Foundation

// MARK: - Timezone / locale

enum Studio {
    static let timeZone = TimeZone(identifier: "Europe/Istanbul")!
    static let locale = Locale(identifier: "tr_TR")

    static var calendar: Calendar = {
        var cal = Calendar(identifier: .gregorian)
        cal.timeZone = timeZone
        cal.locale = locale
        cal.firstWeekday = 2 // Monday
        return cal
    }()
}

// MARK: - API DTOs

struct CustomerDTO: Codable, Equatable, Identifiable, Hashable {
    let id: Int
    let name: String
    let phone: String?
    let email: String?
    let notes: String?
    let updatedAt: String?
    let revision: String

    enum CodingKeys: String, CodingKey {
        case id, name, phone, email, notes, revision
        case updatedAt = "updated_at"
    }
}

struct AppointmentDTO: Codable, Equatable, Identifiable, Hashable {
    let id: Int
    let customerID: Int
    let serviceID: Int?
    let startsAt: Date
    let durationMin: Int
    let status: String
    let note: String?
    let updatedAt: String?
    let revision: String
    let parentID: Int?
    let sessionNo: Int?
    let sessionTotal: Int?
    let price: Decimal?

    var endsAt: Date { startsAt.addingTimeInterval(Double(durationMin) * 60) }
    // Root id of the session package (siblings share this).
    var rootID: Int { parentID ?? id }
    var isPackage: Bool { sessionTotal != nil }
    var isChildSession: Bool { parentID != nil }

    enum CodingKeys: String, CodingKey {
        case id, status, note, revision, price
        case customerID = "customer_id"
        case serviceID = "service_id"
        case startsAt = "starts_at"
        case durationMin = "duration_min"
        case updatedAt = "updated_at"
        case parentID = "parent_id"
        case sessionNo = "session_no"
        case sessionTotal = "session_total"
    }
}

struct ServiceDTO: Codable, Equatable, Identifiable, Hashable {
    let id: Int
    let title: String
    let durationMin: Int

    enum CodingKeys: String, CodingKey {
        case id, title
        case durationMin = "duration_min"
    }
}

struct WorkingDayDTO: Codable, Equatable {
    let id: Int
    let enabled: Bool
    let open: Int
    let close: Int
}

struct StateDTO: Codable, Equatable {
    let customers: [CustomerDTO]
    let appointments: [AppointmentDTO]
    let services: [ServiceDTO]
    let hours: [WorkingDayDTO]
    let timezone: String
}

// MARK: - Status

enum AppointmentStatus: String, CaseIterable, Identifiable {
    case confirmed, requested, cancelled, no_show

    var id: String { rawValue }
    var apiValue: String { rawValue }

    var label: String {
        switch self {
        case .confirmed: return "Onaylı"
        case .requested: return "Talep"
        case .cancelled: return "İptal"
        case .no_show: return "Gelmedi"
        }
    }

    static func from(_ raw: String) -> AppointmentStatus {
        AppointmentStatus(rawValue: raw) ?? .requested
    }
}

// MARK: - Phone helpers

enum PhoneHelper {
    /// Normalize a Turkish phone number to the digits-only international form (90XXXXXXXXXX) for wa.me.
    static func whatsappNumber(_ raw: String) -> String? {
        let digits = raw.filter { $0.isNumber }
        guard !digits.isEmpty else { return nil }
        if digits.hasPrefix("90") { return digits }
        if digits.hasPrefix("0") { return "90" + digits.dropFirst() }
        if digits.count == 10 { return "90" + digits }      // 5XXXXXXXXX
        return digits
    }

    static func telURL(_ raw: String) -> URL? {
        let allowed = raw.filter { $0.isNumber || $0 == "+" }
        guard !allowed.isEmpty else { return nil }
        return URL(string: "tel:\(allowed)")
    }

    static func whatsappURL(_ raw: String) -> URL? {
        guard let num = whatsappNumber(raw) else { return nil }
        return URL(string: "https://wa.me/\(num)")
    }
}

// MARK: - Formatting

enum Fmt {
    static let dayHeader: DateFormatter = make("d MMMM yyyy EEEE") // 16 Ekim 2026 Cuma
    static let dayShort: DateFormatter = make("d MMM")            // 16 Eki
    static let time: DateFormatter = make("HH:mm")
    static let dateTime: DateFormatter = make("d MMMM yyyy, HH:mm")
    static let dateOnly: DateFormatter = make("d MMMM yyyy")

    private static func make(_ pattern: String) -> DateFormatter {
        let f = DateFormatter()
        f.calendar = Studio.calendar
        f.locale = Studio.locale
        f.timeZone = Studio.timeZone
        f.dateFormat = pattern
        return f
    }

    static func timeRange(_ start: Date, _ end: Date) -> String {
        "\(time.string(from: start))–\(time.string(from: end))"
    }

    /// 1500 → "1.500", 1500.5 → "1.500,50" (no ₺; also valid input for `PriceText.parse`).
    static func amount(_ value: Decimal) -> String {
        var v = value, whole = Decimal()
        NSDecimalRound(&whole, &v, 0, .plain)
        return value.formatted(.number.locale(Studio.locale).precision(.fractionLength(whole == value ? 0 : 2)))
    }

    static func price(_ value: Decimal) -> String { "\(amount(value)) ₺" }
}

// MARK: - Price input

enum PriceText {
    /// Parses "1500", "1.500", "1500,50", "1.500,50" (and "1500.50"); nil when not a valid amount ≥ 0.
    static func parse(_ raw: String) -> Decimal? {
        var s = raw.replacingOccurrences(of: "₺", with: "").filter { !$0.isWhitespace }
        if s.contains(",") {
            s = s.replacingOccurrences(of: ".", with: "").replacingOccurrences(of: ",", with: ".")
        } else if s.range(of: #"^\d{1,3}(\.\d{3})+$"#, options: .regularExpression) != nil {
            s = s.replacingOccurrences(of: ".", with: "") // "1.500" = thousands grouping
        }
        guard s.range(of: #"^\d+(\.\d{1,2})?$"#, options: .regularExpression) != nil else { return nil }
        return Decimal(string: s, locale: Locale(identifier: "en_US_POSIX"))
    }
}
