import SwiftUI

struct SettingsView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        NavigationStack {
            Form {
                Section("Bağlantı") {
                    InfoRow(label: "Sunucu", value: AppStore.server.absoluteString)
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
            }
            .navigationTitle("Ayarlar")
            .errorAlert(store)
        }
    }
}
