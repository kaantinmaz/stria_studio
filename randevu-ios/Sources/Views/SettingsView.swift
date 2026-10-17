import SwiftUI

struct SettingsView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        NavigationStack {
            Form {
                Section("Bağlantı") {
                    InfoRow(label: "Sunucu", value: AppStore.server.absoluteString)
                }

                Section {
                    NavigationLink("Hizmet seans fiyatları") { ServicePricesView() }
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

/// One session price per service (camouflage: per region), used to fill appointment prices.
struct ServicePricesView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var texts: [Int: String] = [:]
    @State private var loaded = false

    private var isValid: Bool { texts.values.allSatisfy(PriceField.isValid) }

    var body: some View {
        Form {
            ForEach(store.services) { service in
                Section(service.title) {
                    PriceField(text: Binding(get: { texts[service.id] ?? "" },
                                             set: { texts[service.id] = $0 }),
                               caption: service.usesBodyRegions ? "Bölge başına, seans başı" : "Seans başı")
                }
            }
        }
        .navigationTitle("Hizmet seans fiyatları")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Kaydet") { save() }
                    .disabled(store.isMutating || store.services.isEmpty || !isValid)
            }
        }
        .onAppear {
            guard !loaded else { return }
            loaded = true
            texts = Dictionary(uniqueKeysWithValues: store.services.map { ($0.id, $0.sessionPrice.map(Fmt.amount) ?? "") })
        }
    }

    private func save() {
        // Every listed service is sent; blank = null (no price).
        let prices = Dictionary(uniqueKeysWithValues: store.services.map {
            ($0.id, (texts[$0.id] ?? "").nilIfBlank.flatMap(PriceText.parse))
        })
        Task {
            if await store.updateServicePrices(prices) { dismiss() }
        }
    }
}
