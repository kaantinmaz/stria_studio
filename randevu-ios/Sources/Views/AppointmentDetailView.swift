import SwiftUI
import PhotosUI

struct AppointmentDetailView: View {
    @Environment(AppStore.self) private var store
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL

    let appointmentID: Int

    @State private var showEdit = false
    @State private var showAddSession = false
    @State private var showSessionDates = false
    @State private var intervalDays = 28
    @State private var confirmDelete = false
    @State private var pickedPhotos: [PhotosPickerItem] = []
    @State private var isUploading = false
    @State private var viewerPhoto: PhotoRef?
    @State private var photoToDelete: Int?

    private var appt: AppointmentDTO? { store.appointments.first { $0.id == appointmentID } }

    var body: some View {
        Group {
            if let appt {
                content(appt)
            } else {
                ContentUnavailableView("Randevu bulunamadı", systemImage: "calendar.badge.exclamationmark")
            }
        }
        .navigationTitle("Randevu")
        .navigationBarTitleDisplayMode(.inline)
        .onChange(of: store.appointments) { _, _ in
            if appt == nil { dismiss() }
        }
    }

    @ViewBuilder
    private func content(_ appt: AppointmentDTO) -> some View {
        let status = AppointmentStatus.from(appt.status)
        List {
            if let customer = store.customer(appt.customerID) {
                customerSection(customer)
            }

            Section("Randevu") {
                InfoRow(label: "Hizmet", value: store.serviceTitle(appt.serviceID))
                if !appt.subservices.isEmpty {
                    InfoRow(label: "Alt uygulamalar", value: appt.subservices.joined(separator: ", "))
                }
                InfoRow(label: "Tarih", value: Fmt.dateOnly.string(from: appt.startsAt))
                InfoRow(label: "Saat", value: Fmt.timeRange(appt.startsAt, appt.endsAt))
                InfoRow(label: "Süre", value: "\(appt.durationMin) dk")
                HStack {
                    Text("Durum").foregroundStyle(.secondary)
                    Spacer()
                    StatusChip(status: status)
                }
                .font(.subheadline)
                if let no = appt.sessionNo, let total = appt.sessionTotal {
                    HStack {
                        Text("Seans").foregroundStyle(.secondary)
                        Spacer()
                        SessionBadge(no: no, total: total)
                    }
                    .font(.subheadline)
                }
                if let price = store.packagePrice(of: appt) {
                    InfoRow(label: appt.isPackage ? "Paket fiyatı" : "Fiyat", value: Fmt.price(price))
                }
                if let note = appt.note, !note.isEmpty {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Not").font(.subheadline).foregroundStyle(.secondary)
                        Text(note).font(.subheadline)
                    }
                }
            }

            quickStatusSection(appt, current: status)

            photosSection(appt)

            if appt.isPackage {
                sessionsSection(appt)
            }

            otherAppointmentsSection(appt)

            actionsSection(appt)
        }
        .listStyle(.insetGrouped)
        .refreshable { await store.refresh() }
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Düzenle") { showEdit = true }
            }
        }
        .sheet(isPresented: $showEdit) {
            EditAppointmentView(appointmentID: appt.id)
        }
        .sheet(isPresented: $showSessionDates) {
            SessionDatesView(appointmentID: appt.id)
        }
        .alert("Seans ekle", isPresented: $showAddSession) {
            TextField("Aralık (gün)", value: $intervalDays, format: .number)
                .keyboardType(.numberPad)
            Button("Ekle") {
                Task { _ = await store.addSession(appointmentID: appt.id, revision: appt.revision, intervalDays: max(1, intervalDays)) }
            }
            Button("Vazgeç", role: .cancel) {}
        } message: {
            Text("Yeni seans, son seanstan \(intervalDays) gün sonra aynı saatte oluşturulur.")
        }
        .fullScreenCover(item: $viewerPhoto) { PhotoViewer(url: $0.url) }
        .onChange(of: pickedPhotos) { _, items in
            guard !items.isEmpty else { return }
            Task { await upload(items, to: appt.id) }
        }
        .confirmationDialog("Fotoğraf silinsin mi?", isPresented: Binding(
            get: { photoToDelete != nil },
            set: { if !$0 { photoToDelete = nil } }
        ), titleVisibility: .visible, presenting: photoToDelete) { index in
            Button("Sil", role: .destructive) {
                Task {
                    // Read the revision at tap time so a refresh in between doesn't 409.
                    guard let current = self.appt else { return }
                    _ = await store.deletePhoto(appointmentID: current.id, index: index, revision: current.revision)
                }
            }
            Button("Vazgeç", role: .cancel) {}
        }
        .confirmationDialog(deleteTitle(appt), isPresented: $confirmDelete, titleVisibility: .visible) {
            Button(deleteButton(appt), role: .destructive) {
                Task {
                    if await store.deleteAppointment(id: appt.id, revision: appt.revision) { dismiss() }
                }
            }
            Button("Vazgeç", role: .cancel) {}
        }
        .errorAlert(store)
    }

    // MARK: Sections

    private func customerSection(_ customer: CustomerDTO) -> some View {
        Section("Müşteri") {
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
                            .buttonStyle(.bordered)
                            .tint(.green)
                    }
                }
            }
            if let email = customer.email, !email.isEmpty {
                InfoRow(label: "E-posta", value: email)
            }
            if let notes = customer.notes, !notes.isEmpty {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Not").font(.subheadline).foregroundStyle(.secondary)
                    Text(notes).font(.subheadline)
                }
            }
        }
    }

    private func quickStatusSection(_ appt: AppointmentDTO, current: AppointmentStatus) -> some View {
        Section("Durumu değiştir") {
            HStack(spacing: 8) {
                ForEach(AppointmentStatus.allCases) { s in
                    Button {
                        guard s != current else { return }
                        Task { await applyStatus(s, to: appt) }
                    } label: {
                        Text(s.label)
                            .font(.caption.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 6)
                    }
                    .buttonStyle(.bordered)
                    .tint(s == current ? Color.accentColor : .secondary)
                    .disabled(store.isMutating)
                }
            }
        }
    }

    private func photosSection(_ appt: AppointmentDTO) -> some View {
        Section("Fotoğraflar") {
            if !appt.photos.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 8) {
                        ForEach(Array(appt.photos.enumerated()), id: \.offset) { index, raw in
                            if let url = URL(string: raw) {
                                Button { viewerPhoto = PhotoRef(url: url) } label: {
                                    AsyncImage(url: url) { image in
                                        image.resizable().scaledToFill()
                                    } placeholder: {
                                        Color.secondary.opacity(0.15)
                                    }
                                    .frame(width: 84, height: 84)
                                    .clipShape(RoundedRectangle(cornerRadius: 8))
                                }
                                .buttonStyle(.plain)
                                .contextMenu {
                                    Button(role: .destructive) { photoToDelete = index } label: {
                                        Label("Sil", systemImage: "trash")
                                    }
                                }
                                .accessibilityLabel("Fotoğraf \(index + 1)")
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
            if isUploading {
                HStack(spacing: 8) {
                    ProgressView()
                    Text("Fotoğraflar yükleniyor…").font(.subheadline).foregroundStyle(.secondary)
                }
            } else {
                PhotosPicker(selection: $pickedPhotos, maxSelectionCount: 10, matching: .images) {
                    Label("Fotoğraf ekle", systemImage: "photo.badge.plus")
                }
                .disabled(store.isMutating)
            }
        }
    }

    private func sessionsSection(_ appt: AppointmentDTO) -> some View {
        let members = store.packageMembers(of: appt)
        let now = Date()
        return Section("Seanslar") {
            ForEach(members) { member in
                let isCurrent = member.id == appt.id
                let isPast = member.endsAt < now
                NavigationLink(value: member) {
                    HStack(spacing: 10) {
                        if let no = member.sessionNo, let total = member.sessionTotal {
                            SessionBadge(no: no, total: total)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text(Fmt.dateOnly.string(from: member.startsAt))
                                .font(.subheadline.weight(isCurrent ? .bold : .regular))
                            HStack(spacing: 6) {
                                Text(Fmt.time.string(from: member.startsAt))
                                    .font(.caption).foregroundStyle(.secondary)
                                StatusChip(status: .from(member.status))
                                if isPast { Text("geçti").font(.caption2).foregroundStyle(.secondary) }
                            }
                            if let note = member.note, !note.isEmpty {
                                Text(note).font(.caption2).foregroundStyle(.secondary).lineLimit(1)
                            }
                        }
                        Spacer()
                    }
                    .padding(.vertical, 2)
                    .listRowBackground(isCurrent ? Color.accentColor.opacity(0.08) : nil)
                }
                .appointmentActions(member)
            }
            Button {
                showSessionDates = true
            } label: {
                Label("Seans tarihlerini düzenle", systemImage: "calendar.badge.clock")
            }
            .disabled(store.isMutating)
        }
    }

    private func otherAppointmentsSection(_ appt: AppointmentDTO) -> some View {
        let others = store.otherAppointments(for: appt.customerID, excludingPackageOf: appt)
        return Group {
            if !others.isEmpty {
                Section("Müşterinin diğer randevuları") {
                    ForEach(others) { other in
                        NavigationLink(value: other) {
                            HStack {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(Fmt.dateTime.string(from: other.startsAt)).font(.subheadline)
                                    Text(store.serviceTitle(other.serviceID)).font(.caption).foregroundStyle(.secondary)
                                }
                                Spacer()
                                if let no = other.sessionNo, let total = other.sessionTotal {
                                    SessionBadge(no: no, total: total)
                                }
                                StatusChip(status: .from(other.status))
                            }
                        }
                        .appointmentActions(other)
                    }
                }
            }
        }
    }

    private func actionsSection(_ appt: AppointmentDTO) -> some View {
        Section {
            Button {
                intervalDays = 28
                showAddSession = true
            } label: {
                Label("Seans ekle", systemImage: "plus.circle")
            }
            .disabled(store.isMutating)

            Button(role: .destructive) {
                confirmDelete = true
            } label: {
                Label(deleteButton(appt), systemImage: "trash")
            }
            .disabled(store.isMutating)
        }
    }

    // MARK: Helpers

    private func upload(_ items: [PhotosPickerItem], to appointmentID: Int) async {
        isUploading = true
        defer { isUploading = false; pickedPhotos = [] }
        let jpegs = await PhotoPrep.jpegs(from: items)
        guard !jpegs.isEmpty else {
            store.errorMessage = "Seçilen fotoğraflar okunamadı."
            return
        }
        _ = await store.uploadPhotos(appointmentID: appointmentID, jpegs: jpegs)
    }

    private func applyStatus(_ status: AppointmentStatus, to appt: AppointmentDTO) async {
        _ = await store.updateAppointment(id: appt.id, revision: appt.revision,
                                          customerID: appt.customerID, serviceID: appt.serviceID,
                                          startsAt: appt.startsAt, durationMin: appt.durationMin,
                                          status: status, note: appt.note)
    }

    private func deleteButton(_ appt: AppointmentDTO) -> String {
        appt.isPackage ? "Seansı çıkar" : "Randevuyu sil"
    }

    private func deleteTitle(_ appt: AppointmentDTO) -> String {
        appt.isPackage ? "Bu seans paketten çıkarılsın mı?" : "Randevu silinsin mi?"
    }
}

private struct PhotoRef: Identifiable {
    let url: URL
    var id: URL { url }
}
