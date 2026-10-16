import SwiftUI

struct SettingsView: View {
    @Environment(AppStore.self) private var store
    @State private var confirmLogout = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Hesap") {
                    if let user = store.user {
                        InfoRow(label: "Ad", value: user.name)
                        InfoRow(label: "E-posta", value: user.email)
                    }
                    InfoRow(label: "Sunucu", value: store.savedServer)
                }

                if let last = store.lastRefresh {
                    Section("Veri") {
                        InfoRow(label: "Son güncelleme", value: Fmt.dateTime.string(from: last))
                        Button {
                            Task { await store.refresh() }
                        } label: {
                            Label("Yenile", systemImage: "arrow.clockwise")
                        }
                        .disabled(store.isLoading)
                    }
                }

                Section {
                    Button(role: .destructive) {
                        confirmLogout = true
                    } label: {
                        Label("Çıkış yap", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .navigationTitle("Ayarlar")
            .confirmationDialog("Çıkış yapılsın mı?", isPresented: $confirmLogout, titleVisibility: .visible) {
                Button("Çıkış yap", role: .destructive) { Task { await store.logout() } }
                Button("Vazgeç", role: .cancel) {}
            }
            .errorAlert(store)
        }
    }
}
