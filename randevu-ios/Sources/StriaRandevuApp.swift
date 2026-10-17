import SwiftUI

@main
struct StriaRandevuApp: App {
    @State private var store = AppStore()
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            RootView()
                .environment(store)
                .task { await store.bootstrap() }
                .tint(Color("AccentColor"))
                .onChange(of: scenePhase) { _, phase in
                    if phase == .active && !store.isBootstrapping {
                        Task { await store.refresh() }
                    }
                }
        }
    }
}

struct RootView: View {
    @Environment(AppStore.self) private var store

    var body: some View {
        Group {
            if store.isBootstrapping {
                VStack(spacing: 16) {
                    ProgressView()
                    Text("Yükleniyor…").foregroundStyle(.secondary)
                }
            } else {
                MainTabView()
            }
        }
        .animation(.default, value: store.isBootstrapping)
    }
}

struct MainTabView: View {
    var body: some View {
        TabView {
            AppointmentsView()
                .tabItem { Label("Randevular", systemImage: "calendar") }
            CustomersView()
                .tabItem { Label("Müşteriler", systemImage: "person.2") }
            SettingsView()
                .tabItem { Label("Ayarlar", systemImage: "gearshape") }
        }
    }
}
