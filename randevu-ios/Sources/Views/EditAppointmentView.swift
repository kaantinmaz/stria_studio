import SwiftUI

struct EditAppointmentView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss

    let appointmentID: Int

    @State private var startDate = Date()
    @State private var startTime = Date()
    @State private var duration = 60
    @State private var serviceID: Int?
    @State private var status: AppointmentStatus = .confirmed
    @State private var note = ""
    @State private var priceText = ""
    @State private var subservices: Set<String> = []
    @State private var bodyRegions: Set<String> = []
    @State private var loaded = false

    private var appt: AppointmentDTO? { store.appointments.first { $0.id == appointmentID } }
    private var isChild: Bool { appt?.isChildSession ?? false }
    private var subserviceOptions: [String] { store.service(serviceID)?.subservices ?? [] }
    private var usesBodyRegions: Bool { store.service(serviceID)?.usesBodyRegions ?? false }
    private var quote: PriceQuote? {
        store.service(serviceID)?.quote(regionCount: BodyRegion.pricedCount(bodyRegions), sessions: appt?.sessionTotal ?? 1)
    }

    var body: some View {
        NavigationStack {
            Form {
                if let appt, let customer = store.customer(appt.customerID) {
                    Section("Müşteri") {
                        Text(customer.name)
                        if isChild {
                            Text("Paketin 1. seansında yönetilir")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Hizmet") {
                    // Only the user's choice (not the initial load) refills the price.
                    Picker("Hizmet", selection: Binding(get: { serviceID }, set: { serviceID = $0; fillPrice() })) {
                        Text("Belirtilmemiş").tag(Int?.none)
                        ForEach(store.services) { s in
                            Text(s.title).tag(Int?.some(s.id))
                        }
                    }
                    .disabled(isChild)
                    .onChange(of: serviceID) { _, _ in
                        // Keeps the loaded selection; drops names that don't belong to a newly chosen service.
                        subservices.formIntersection(subserviceOptions)
                    }
                    if isChild {
                        Text("Paketin 1. seansında yönetilir")
                            .font(.caption).foregroundStyle(.secondary)
                    }
                }

                if isChild {
                    if let appt, !appt.subservices.isEmpty {
                        Section("Alt uygulamalar") {
                            Text(appt.subservices.joined(separator: ", "))
                            Text("Paketin 1. seansında yönetilir")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                } else if !subserviceOptions.isEmpty {
                    Section("Alt uygulamalar") {
                        SubservicePicker(options: subserviceOptions, selection: $subservices)
                    }
                }

                if isChild {
                    if let appt, !appt.bodyRegions.isEmpty {
                        Section("Bölgeler") {
                            BodyRegionSummary(keys: appt.bodyRegions)
                            Text("Paketin 1. seansında yönetilir")
                                .font(.caption).foregroundStyle(.secondary)
                        }
                    }
                } else if usesBodyRegions {
                    Section("Bölgeler") {
                        // Only the user's edits (not the initial load) refill the price.
                        BodyRegionPicker(selection: Binding(get: { bodyRegions },
                                                            set: { bodyRegions = $0; fillPrice() }),
                                         sessionPrice: store.service(serviceID)?.sessionPrice,
                                         sessionTotal: appt?.sessionTotal ?? 1)
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

                Section("Fiyat") {
                    if isChild {
                        InfoRow(label: "Paket fiyatı", value: appt.flatMap { store.packagePrice(of: $0) }.map(Fmt.price) ?? "Belirtilmemiş")
                        Text("Paketin 1. seansında yönetilir")
                            .font(.caption).foregroundStyle(.secondary)
                    } else {
                        PriceField(text: $priceText, caption: quote?.caption ?? (appt?.isPackage == true ? "Paketin toplam fiyatı" : nil))
                    }
                }

                Section("Not") {
                    TextField("Not", text: $note, axis: .vertical).lineLimit(2...5)
                }
            }
            .navigationTitle("Randevuyu düzenle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kaydet") { save() }
                        .disabled(store.isMutating || (!isChild && !PriceField.isValid(priceText)))
                }
            }
            .onAppear(perform: loadIfNeeded)
            .errorAlert(store)
        }
    }

    private func loadIfNeeded() {
        guard !loaded, let appt else { return }
        loaded = true
        startDate = appt.startsAt
        startTime = appt.startsAt
        duration = appt.durationMin
        serviceID = appt.serviceID
        status = .from(appt.status)
        note = appt.note ?? ""
        priceText = appt.price.map(Fmt.amount) ?? ""
        subservices = Set(appt.subservices)
        bodyRegions = Set(appt.bodyRegions)
    }

    private func fillPrice() {
        if let quote { priceText = Fmt.amount(quote.total) }
    }

    private func save() {
        guard let appt else { return }
        let starts = DateMerge.combine(day: startDate, time: startTime)
        // Child sessions must not send price; root/single sends null to clear it.
        let price: PriceWrite = isChild ? .omit : (PriceText.parse(priceText).map { .set($0) } ?? .clear)
        // Same rule for sub-treatments: child omits; root/single sends the full list ([] clears).
        let chosen: [String]? = isChild ? nil : subserviceOptions.filter(subservices.contains)
        // Body regions likewise; [] when the service no longer uses them.
        let regions: [String]? = isChild ? nil : (usesBodyRegions ? BodyRegion.ordered(bodyRegions).map(\.key) : [])
        Task {
            let ok = await store.updateAppointment(id: appt.id, revision: appt.revision,
                                                    customerID: appt.customerID,
                                                    serviceID: isChild ? appt.serviceID : serviceID,
                                                    startsAt: starts, durationMin: duration,
                                                    status: status, note: note, price: price,
                                                    subservices: chosen, bodyRegions: regions)
            if ok { dismiss() }
        }
    }
}

enum DateMerge {
    static func combine(day: Date, time: Date) -> Date {
        let cal = Studio.calendar
        let d = cal.dateComponents([.year, .month, .day], from: day)
        let t = cal.dateComponents([.hour, .minute], from: time)
        var merged = DateComponents()
        merged.year = d.year; merged.month = d.month; merged.day = d.day
        merged.hour = t.hour; merged.minute = t.minute
        return cal.date(from: merged) ?? day
    }
}
