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
                    NavigationLink("Bölge seans fiyatları") { RegionPricesView() }
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

/// Session price per body-region category, used to price camouflage consultations.
struct RegionPricesView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    @State private var texts: [String: String] = [:]
    @State private var loaded = false

    private var isValid: Bool { texts.values.allSatisfy(PriceField.isValid) }

    var body: some View {
        Form {
            Section {
                Text("Kamuflaj randevusunda seçilen her bölge için seans başı fiyat")
                    .font(.caption).foregroundStyle(.secondary)
            }
            ForEach(BodyRegionCategory.all) { category in
                Section(category.label) {
                    PriceField(text: Binding(get: { texts[category.key] ?? "" },
                                             set: { texts[category.key] = $0 }))
                }
            }
        }
        .navigationTitle("Bölge seans fiyatları")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Kaydet") { save() }
                    .disabled(store.isMutating || !isValid)
            }
        }
        .onAppear {
            guard !loaded else { return }
            loaded = true
            texts = store.regionPrices.mapValues(Fmt.amount)
        }
    }

    private func save() {
        // Every category is sent; blank = null (unpriced).
        let prices = Dictionary(uniqueKeysWithValues: BodyRegionCategory.all.map {
            ($0.key, (texts[$0.key] ?? "").nilIfBlank.flatMap(PriceText.parse))
        })
        Task {
            if await store.updateRegionPrices(prices) { dismiss() }
        }
    }
}
