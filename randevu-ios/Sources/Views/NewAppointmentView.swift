import SwiftUI
import PhotosUI

struct NewAppointmentView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    var defaultDay: Date = Date()
    var presetCustomer: CustomerDTO? = nil

    @State private var selectedCustomer: CustomerDTO?
    @State private var showCustomerPicker = false
    @State private var serviceID: Int?
    @State private var startDate = Date()
    @State private var startTime = Date()
    @State private var duration = 60
    @State private var status: AppointmentStatus = .confirmed
    @State private var note = ""
    @State private var sessionTotal = 1
    @State private var intervalDays = 28
    @State private var pickDates = false
    @State private var customStarts: [Date] = [] // sessions 2..N
    @State private var priceText = ""
    @State private var discount: Discount?
    @State private var discountBase: Decimal?
    @State private var subservices: Set<String> = []
    @State private var bodyRegions: Set<String> = []
    @State private var pickedPhotos: [PhotosPickerItem] = []
    @State private var isUploading = false
    @State private var didInit = false

    private var subserviceOptions: [String] { store.service(serviceID)?.subservices ?? [] }
    private var usesBodyRegions: Bool { store.service(serviceID)?.usesBodyRegions ?? false }
    private var quote: PriceQuote? { store.service(serviceID)?.quote(regionCount: BodyRegion.pricedCount(bodyRegions), sessions: sessionTotal) }

    var body: some View {
        NavigationStack {
            Form {
                Section("Müşteri") {
                    Button {
                        showCustomerPicker = true
                    } label: {
                        HStack {
                            Text(selectedCustomer?.name ?? "Müşteri seç")
                                .foregroundStyle(selectedCustomer == nil ? .secondary : .primary)
                            Spacer()
                            Image(systemName: "chevron.right").font(.caption).foregroundStyle(.tertiary)
                        }
                    }
                }

                Section("Hizmet") {
                    Picker("Hizmet", selection: $serviceID) {
                        Text("Belirtilmemiş").tag(Int?.none)
                        ForEach(store.services) { s in Text(s.title).tag(Int?.some(s.id)) }
                    }
                    .onChange(of: serviceID) { _, newValue in
                        if let s = store.service(newValue) { duration = s.durationMin }
                        subservices = []
                        bodyRegions = []
                    }
                }

                if !subserviceOptions.isEmpty {
                    Section("Alt uygulamalar") {
                        SubservicePicker(options: subserviceOptions, selection: $subservices)
                    }
                }

                if usesBodyRegions {
                    Section("Bölgeler") {
                        BodyRegionPicker(selection: $bodyRegions, sessionPrice: store.service(serviceID)?.sessionPrice, sessionTotal: sessionTotal)
                    }
                }

                Section("Zaman") {
                    DatePicker("Tarih", selection: $startDate, displayedComponents: .date)
                        .environment(\.locale, Studio.locale)
                    DatePicker("Saat", selection: $startTime, displayedComponents: .hourAndMinute)
                        .environment(\.locale, Studio.locale)
                    Stepper("Süre: \(duration) dk", value: $duration, in: 5...600, step: 5)
                }

                Section("Durum") {
                    Picker("Durum", selection: $status) {
                        ForEach(AppointmentStatus.allCases) { s in Text(s.label).tag(s) }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Seans") {
                    Stepper("Seans sayısı: \(sessionTotal)", value: $sessionTotal, in: 1...12)
                    if sessionTotal > 1 {
                        Toggle("Tarihleri tek tek seç", isOn: $pickDates)
                        if pickDates {
                            ForEach(customStarts.indices, id: \.self) { idx in
                                DatePicker("\(idx + 2). seans", selection: customStart(idx),
                                           displayedComponents: [.date, .hourAndMinute])
                                    .environment(\.locale, Studio.locale)
                                    .environment(\.timeZone, Studio.timeZone)
                            }
                            if !customStartsValid {
                                Text("Her seans bir öncekinden sonra olmalı.")
                                    .font(.caption).foregroundStyle(.red)
                            }
                        } else {
                            Stepper("Seans aralığı: \(intervalDays) gün", value: $intervalDays, in: 1...365)
                            sessionPreview
                        }
                    }
                }
                .onChange(of: pickDates) { _, on in
                    if on { customStarts = Array(sessionDates().dropFirst()) }
                }
                .onChange(of: sessionTotal) { _, total in
                    guard pickDates else { return }
                    let target = max(0, total - 1)
                    if customStarts.count > target { customStarts.removeLast(customStarts.count - target) }
                    while customStarts.count < target {
                        let last = customStarts.last ?? DateMerge.combine(day: startDate, time: startTime)
                        customStarts.append(Studio.calendar.date(byAdding: .day, value: intervalDays, to: last) ?? last)
                    }
                }

                Section("Fiyat") {
                    PriceField(text: $priceText, caption: quote?.caption ?? (sessionTotal > 1 ? "Paketin toplam fiyatı" : nil))
                    DiscountControl(priceText: $priceText, discount: $discount, base: $discountBase)
                }
                // The service's session price fills the total; a manual edit stays until the next change.
                .onChange(of: serviceID) { fillPrice() }
                .onChange(of: bodyRegions) { fillPrice() }
                .onChange(of: sessionTotal) { fillPrice() }

                Section("Not") {
                    TextField("Not", text: $note, axis: .vertical).lineLimit(2...5)
                }

                Section("Fotoğraflar") {
                    if isUploading {
                        HStack(spacing: 8) {
                            ProgressView()
                            Text("Fotoğraflar yükleniyor…").font(.subheadline).foregroundStyle(.secondary)
                        }
                    } else {
                        PhotosPicker(selection: $pickedPhotos, maxSelectionCount: 10, matching: .images) {
                            Label(pickedPhotos.isEmpty ? "Fotoğraf seç" : "\(pickedPhotos.count) fotoğraf seçildi",
                                  systemImage: "photo.badge.plus")
                        }
                        if sessionTotal > 1 && !pickedPhotos.isEmpty {
                            Text("1. seansa eklenir").font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .interactiveDismissDisabled(isUploading)
            .navigationTitle("Yeni randevu")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kaydet") { save() }
                        .disabled(store.isMutating || isUploading || selectedCustomer == nil || (useCustomStarts && !customStartsValid)
                                  || !PriceField.isValid(priceText))
                }
            }
            .sheet(isPresented: $showCustomerPicker) {
                CustomerPickerView(selection: $selectedCustomer)
            }
            .onAppear(perform: initialize)
            .errorAlert(store)
        }
    }

    private var sessionPreview: some View {
        let dates = sessionDates()
        return VStack(alignment: .leading, spacing: 4) {
            Text("Oluşturulacak seanslar").font(.caption).foregroundStyle(.secondary)
            ForEach(Array(dates.enumerated()), id: \.offset) { idx, date in
                HStack {
                    Text("\(idx + 1).").font(.caption.monospacedDigit()).foregroundStyle(.secondary)
                    Text(Fmt.dateTime.string(from: date)).font(.caption)
                }
            }
        }
    }

    private var useCustomStarts: Bool { pickDates && sessionTotal > 1 }

    /// Session 2 after session 1, each later than the previous.
    private var customStartsValid: Bool {
        let all = [DateMerge.combine(day: startDate, time: startTime)] + customStarts
        return zip(all, all.dropFirst()).allSatisfy { $0 < $1 }
    }

    // Bounds-checked: ForEach may read a stale index while sessionTotal shrinks.
    private func customStart(_ idx: Int) -> Binding<Date> {
        Binding(get: { idx < customStarts.count ? customStarts[idx] : Date() },
                set: { if idx < customStarts.count { customStarts[idx] = $0 } })
    }

    private func sessionDates() -> [Date] {
        let start = DateMerge.combine(day: startDate, time: startTime)
        return (0..<sessionTotal).compactMap {
            Studio.calendar.date(byAdding: .day, value: intervalDays * $0, to: start)
        }
    }

    /// Recomputed total goes into Fiyat; an active discount is re-applied to it.
    private func fillPrice() {
        guard let quote else { return }
        if let discount {
            discountBase = quote.total
            priceText = Fmt.amount(discount.apply(to: quote.total))
        } else {
            priceText = Fmt.amount(quote.total)
        }
    }

    private func initialize() {
        guard !didInit else { return }
        didInit = true
        selectedCustomer = presetCustomer
        startDate = defaultDay
        // Default start time: 10:00 on selected day.
        startTime = DateMerge.combine(day: defaultDay,
                                      time: Studio.calendar.date(bySettingHour: 10, minute: 0, second: 0, of: defaultDay) ?? defaultDay)
    }

    private func save() {
        guard let customer = selectedCustomer else { return }
        let starts = DateMerge.combine(day: startDate, time: startTime)
        // Keep the service's order; omit when the service has none.
        let chosen = subserviceOptions.isEmpty ? nil : subserviceOptions.filter(subservices.contains)
        let regions = usesBodyRegions ? BodyRegion.ordered(bodyRegions).map(\.key) : nil
        Task {
            guard let rootID = await store.createAppointment(customerID: customer.id, serviceID: serviceID,
                                                             startsAt: starts, durationMin: duration, status: status,
                                                             note: note, sessionTotal: sessionTotal, intervalDays: intervalDays,
                                                             sessionStarts: useCustomStarts ? customStarts : nil,
                                                             price: PriceText.parse(priceText),
                                                             subservices: chosen, bodyRegions: regions) else { return }
            if !pickedPhotos.isEmpty {
                isUploading = true
                let jpegs = await PhotoPrep.jpegs(from: pickedPhotos)
                // The appointment already exists, so close either way (re-saving would duplicate it).
                if jpegs.isEmpty {
                    store.errorMessage = "Randevu kaydedildi, seçilen fotoğraflar okunamadı."
                } else if !(await store.uploadPhotos(appointmentID: rootID, jpegs: jpegs)) {
                    store.errorMessage = "Randevu kaydedildi, fotoğraflar yüklenemedi: \(store.errorMessage ?? "")"
                }
                isUploading = false
            }
            dismiss()
        }
    }
}

struct CustomerPickerView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @Binding var selection: CustomerDTO?

    @State private var search = ""
    @State private var showNew = false

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
            List {
                Section {
                    Button {
                        showNew = true
                    } label: {
                        Label("Yeni müşteri", systemImage: "person.badge.plus")
                    }
                }
                Section {
                    ForEach(filtered) { customer in
                        Button {
                            selection = customer
                            dismiss()
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(customer.name).foregroundStyle(.primary)
                                    if let phone = customer.phone, !phone.isEmpty {
                                        Text(phone).font(.caption).foregroundStyle(.secondary)
                                    }
                                }
                                Spacer()
                                if selection?.id == customer.id {
                                    Image(systemName: "checkmark").foregroundStyle(Color.accentColor)
                                }
                            }
                        }
                    }
                }
            }
            .searchable(text: $search, prompt: "Ad veya telefon")
            .navigationTitle("Müşteri seç")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
            }
            .sheet(isPresented: $showNew) {
                NewCustomerView { created in
                    selection = created
                    dismiss()
                }
            }
            .errorAlert(store)
        }
    }
}

/// Filled in by the customer on the studio phone, then handed back to staff.
struct NewCustomerView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    var onCreated: (CustomerDTO) -> Void

    @State private var name = ""
    @State private var phone = ""
    @State private var email = ""
    @State private var created: CustomerDTO?
    @FocusState private var focus: Field?

    private enum Field { case name, phone, email }

    private var trimmedName: String { name.trimmingCharacters(in: .whitespaces) }
    private var phoneDigits: Int { phone.filter(\.isNumber).count }
    private var phoneValid: Bool { (10...13).contains(phoneDigits) }
    private var emailValid: Bool { email.nilIfBlank.map { $0.contains("@") && $0.contains(".") } ?? true }
    private var canSave: Bool { !trimmedName.isEmpty && phoneValid && emailValid && !store.isMutating }

    var body: some View {
        NavigationStack {
            Group {
                if let created { thankYou(created) } else { form }
            }
            .toolbar {
                if created == nil {
                    ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                }
            }
            .errorAlert(store)
        }
        .interactiveDismissDisabled()
    }

    private var form: some View {
        Form {
            Section {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Hoş geldiniz").font(.largeTitle.bold())
                    Text("Randevunuz için lütfen bilgilerinizi doldurun.")
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 8)
                .listRowBackground(Color.clear)
            }

            Section {
                TextField("Adınız Soyadınız", text: $name)
                    .textContentType(.name)
                    .textInputAutocapitalization(.words)
                    .submitLabel(.next)
                    .focused($focus, equals: .name)
                    .onSubmit { focus = .phone }
            } header: {
                Text("Ad Soyad")
            }

            Section {
                TextField("05xx xxx xx xx", text: $phone)
                    .textContentType(.telephoneNumber)
                    .keyboardType(.phonePad)
                    .focused($focus, equals: .phone)
            } header: {
                Text("Telefon numaranız")
            } footer: {
                if !phone.isEmpty && !phoneValid {
                    Text("Lütfen telefon numaranızı eksiksiz yazın.").foregroundStyle(.red)
                } else {
                    Text("Randevu hatırlatmaları için kullanılır.")
                }
            }

            Section {
                TextField("ornek@mail.com", text: $email)
                    .textContentType(.emailAddress)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .focused($focus, equals: .email)
            } header: {
                Text("E-posta adresiniz (isteğe bağlı)")
            } footer: {
                if !emailValid { Text("E-posta adresi geçerli görünmüyor.").foregroundStyle(.red) }
            }

            Section {
                Button(action: create) {
                    HStack {
                        Spacer()
                        if store.isMutating { ProgressView() } else { Text("Bilgilerimi kaydet").bold() }
                        Spacer()
                    }
                    .padding(.vertical, 6)
                }
                .disabled(!canSave)
            }
        }
        .font(.title3)
        .onAppear { focus = .name }
    }

    private func thankYou(_ customer: CustomerDTO) -> some View {
        VStack(spacing: 20) {
            Spacer()
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 72))
                .foregroundStyle(Color.accentColor)
            Text("Teşekkürler, \(customer.name)!").font(.title.bold()).multilineTextAlignment(.center)
            Text("Bilgileriniz kaydedildi. Telefonu görevliye geri verebilirsiniz.")
                .font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center)
            Spacer()
            Button {
                onCreated(customer)
                dismiss()
            } label: {
                Text("Tamam").bold().frame(maxWidth: .infinity).padding(.vertical, 8)
            }
            .buttonStyle(.borderedProminent)
        }
        .padding(24)
    }

    private func create() {
        focus = nil
        Task {
            if let customer = await store.createCustomer(name: trimmedName, phone: phone, email: email, notes: nil) {
                created = customer
            }
        }
    }
}
