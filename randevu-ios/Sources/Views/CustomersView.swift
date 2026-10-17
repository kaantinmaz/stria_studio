import SwiftUI

struct CustomersView: View {
    @Environment(AppStore.self) private var store
    @State private var search = ""

    private var filtered: [CustomerDTO] {
        let q = search.trimmingCharacters(in: .whitespaces).lowercased()
        let all = store.customers.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        guard !q.isEmpty else { return all }
        return all.filter {
            $0.name.lowercased().contains(q) || ($0.phone ?? "").lowercased().contains(q)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if store.customers.isEmpty {
                    ContentUnavailableView("Müşteri yok", systemImage: "person.2",
                                           description: Text("Yeni randevu oluştururken müşteri ekleyebilirsiniz."))
                } else {
                    List {
                        ForEach(filtered) { customer in
                            NavigationLink(value: customer) {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(customer.name)
                                    if let phone = customer.phone, !phone.isEmpty {
                                        Text(phone).font(.caption).foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .searchable(text: $search, prompt: "Ad veya telefon")
                    .refreshable { await store.refresh() }
                }
            }
            .navigationTitle("Müşteriler")
            .navigationDestination(for: CustomerDTO.self) { customer in
                CustomerDetailView(customerID: customer.id)
            }
            .navigationDestination(for: AppointmentDTO.self) { appt in
                AppointmentDetailView(appointmentID: appt.id)
            }
            .errorAlert(store)
        }
    }
}

struct CustomerDetailView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.openURL) private var openURL

    let customerID: Int

    @State private var editing = false
    @State private var name = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var notes = ""
    @State private var showNewAppointment = false

    private var customer: CustomerDTO? { store.customer(customerID) }

    var body: some View {
        Group {
            if let customer {
                content(customer)
            } else {
                ContentUnavailableView("Müşteri bulunamadı", systemImage: "person.crop.circle.badge.exclamationmark")
            }
        }
        .navigationTitle("Müşteri")
        .navigationBarTitleDisplayMode(.inline)
    }

    @ViewBuilder
    private func content(_ customer: CustomerDTO) -> some View {
        List {
            Section("Bilgiler") {
                if editing {
                    TextField("Ad", text: $name)
                    TextField("Telefon", text: $phone).keyboardType(.phonePad)
                    TextField("E-posta", text: $email).keyboardType(.emailAddress).textInputAutocapitalization(.never)
                    TextField("Not", text: $notes, axis: .vertical).lineLimit(2...5)
                } else {
                    Text(customer.name).font(.headline)
                    if let phone = customer.phone, !phone.isEmpty {
                        InfoRow(label: "Telefon", value: phone)
                        HStack {
                            if let tel = PhoneHelper.telURL(phone) {
                                Button { openURL(tel) } label: { Label("Ara", systemImage: "phone.fill") }
                                    .buttonStyle(.bordered)
                            }
                            if let wa = PhoneHelper.whatsappURL(phone) {
                                Button { openURL(wa) } label: { Label("WhatsApp", systemImage: "message.fill") }
                                    .buttonStyle(.bordered).tint(.green)
                            }
                        }
                    }
                    if let email = customer.email, !email.isEmpty { InfoRow(label: "E-posta", value: email) }
                    if let n = customer.notes, !n.isEmpty {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Not").font(.subheadline).foregroundStyle(.secondary)
                            Text(n).font(.subheadline)
                        }
                    }
                }
            }

            Section {
                Button {
                    showNewAppointment = true
                } label: {
                    Label("Bu müşteriye randevu", systemImage: "calendar.badge.plus")
                }
            }

            let history = store.appointments(for: customerID)
            if !history.isEmpty {
                Section("Randevu geçmişi") {
                    ForEach(history) { appt in
                        NavigationLink(value: appt) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(Fmt.dateTime.string(from: appt.startsAt)).font(.subheadline)
                                    Text(store.serviceTitle(appt.serviceID)).font(.caption).foregroundStyle(.secondary)
                                    // Package price is stored on the root; show it on every session.
                                    if let price = store.packagePrice(of: appt) {
                                        Text(Fmt.price(price)).font(.caption).foregroundStyle(.secondary).monospacedDigit()
                                    }
                                }
                                Spacer()
                                if let no = appt.sessionNo, let total = appt.sessionTotal {
                                    SessionBadge(no: no, total: total)
                                }
                                StatusChip(status: .from(appt.status))
                            }
                        }
                        .appointmentActions(appt)
                    }
                    let total = store.totalPrice(for: customerID)
                    if total > 0 {
                        InfoRow(label: "Toplam", value: Fmt.price(total)).bold()
                    }
                }
            }
        }
        .listStyle(.insetGrouped)
        .refreshable { await store.refresh() }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                if editing {
                    Button("Kaydet") { saveEdits(customer) }.disabled(store.isMutating)
                } else {
                    Button("Düzenle") { beginEditing(customer) }
                }
            }
            if editing {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Vazgeç") { editing = false }
                }
            }
        }
        .sheet(isPresented: $showNewAppointment) {
            NewAppointmentView(presetCustomer: customer)
        }
        .errorAlert(store)
    }

    private func beginEditing(_ customer: CustomerDTO) {
        name = customer.name
        phone = customer.phone ?? ""
        email = customer.email ?? ""
        notes = customer.notes ?? ""
        editing = true
    }

    private func saveEdits(_ customer: CustomerDTO) {
        Task {
            let ok = await store.updateCustomer(id: customer.id, revision: customer.revision,
                                                name: name.trimmingCharacters(in: .whitespaces),
                                                phone: phone, email: email, notes: notes)
            if ok { editing = false }
        }
    }
}
