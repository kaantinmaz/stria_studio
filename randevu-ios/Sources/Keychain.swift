import Foundation
import Security

/// Minimal Keychain-backed credential store for the single-admin app.
enum Keychain {
    private static let service = "com.striastudio.randevu"

    static func set(_ value: String?, for key: String) {
        guard let value, !value.isEmpty else { remove(key); return }
        let data = Data(value.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        let attributes: [String: Any] = [
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock
        ]
        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            var insert = query
            insert.merge(attributes) { _, new in new }
            SecItemAdd(insert as CFDictionary, nil)
        }
    }

    static func get(_ key: String) -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data else { return nil }
        return String(data: data, encoding: .utf8)
    }

    static func remove(_ key: String) {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: key
        ]
        SecItemDelete(query as CFDictionary)
    }
}

/// Persisted credential bundle.
struct StoredCredentials {
    var baseURL: String
    var email: String
    var password: String
    var token: String?

    private static let kBaseURL = "baseURL"
    private static let kEmail = "email"
    private static let kPassword = "password"
    private static let kToken = "token"

    static func load() -> StoredCredentials? {
        guard let email = Keychain.get(kEmail),
              let password = Keychain.get(kPassword) else { return nil }
        let base = Keychain.get(kBaseURL) ?? AppStore.defaultServer
        return StoredCredentials(baseURL: base, email: email, password: password, token: Keychain.get(kToken))
    }

    func save() {
        Keychain.set(baseURL, for: Self.kBaseURL)
        Keychain.set(email, for: Self.kEmail)
        Keychain.set(password, for: Self.kPassword)
        Keychain.set(token, for: Self.kToken)
    }

    static func clear() {
        [kBaseURL, kEmail, kPassword, kToken].forEach(Keychain.remove)
    }

    static func updateToken(_ token: String?) {
        Keychain.set(token, for: kToken)
    }
}
