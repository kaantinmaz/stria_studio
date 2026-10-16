import SwiftUI

struct LoginView: View {
    @Environment(AppStore.self) private var store

    @State private var server = AppStore.defaultServer
    @State private var email = ""
    @State private var password = ""
    @State private var showAdvanced = false

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    VStack(spacing: 6) {
                        Image(systemName: "sparkles")
                            .font(.largeTitle)
                            .foregroundStyle(Color.accentColor)
                        Text("Stria Randevu")
                            .font(.title2.weight(.semibold))
                        Text("Yönetici girişi")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                }
                .listRowBackground(Color.clear)

                Section {
                    TextField("E-posta", text: $email)
                        .textContentType(.emailAddress)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                    SecureField("Parola", text: $password)
                        .textContentType(.password)
                }

                Section {
                    DisclosureGroup("Gelişmiş", isExpanded: $showAdvanced) {
                        TextField("Sunucu adresi", text: $server)
                            .textInputAutocapitalization(.never)
                            .autocorrectionDisabled()
                            .keyboardType(.URL)
                    }
                }

                Section {
                    Button(action: submit) {
                        HStack {
                            Spacer()
                            if store.isLoading { ProgressView() } else { Text("Giriş yap").bold() }
                            Spacer()
                        }
                    }
                    .disabled(store.isLoading || email.isEmpty || password.isEmpty)
                }
            }
            .navigationTitle("Giriş")
            .navigationBarTitleDisplayMode(.inline)
            .errorAlert(store)
            .onAppear { if server.isEmpty { server = store.savedServer } }
        }
    }

    private func submit() {
        Task { await store.login(server: server, email: email, password: password) }
    }
}
