import SwiftUI
import PhotosUI
import ImageIO

struct StatusChip: View {
    let status: AppointmentStatus

    private var color: Color {
        switch status {
        case .confirmed: return .green
        case .requested: return .orange
        case .cancelled: return .gray
        case .no_show: return .red
        }
    }

    var body: some View {
        Text(status.label)
            .font(.caption2.weight(.semibold))
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15), in: Capsule())
            .foregroundStyle(color)
    }
}

struct SessionBadge: View {
    let no: Int
    let total: Int

    var body: some View {
        Text("\(no)/\(total)")
            .font(.caption2.weight(.bold))
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(Color.accentColor.opacity(0.18), in: Capsule())
            .foregroundStyle(Color.accentColor)
    }
}

/// A labelled info row used in detail cards.
struct InfoRow: View {
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .top) {
            Text(label).foregroundStyle(.secondary)
            Spacer()
            Text(value).multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}

/// Optional TL price input ("1.500", "1500,50"); blank = no price.
struct PriceField: View {
    @Binding var text: String
    var caption: String? = nil

    static func isValid(_ text: String) -> Bool { text.nilIfBlank == nil || PriceText.parse(text) != nil }

    var body: some View {
        HStack {
            TextField("Fiyat", text: $text).keyboardType(.decimalPad)
            Text("₺").foregroundStyle(.secondary)
        }
        if !Self.isValid(text) {
            Text("Geçersiz fiyat (ör. 1.500 veya 1500,50)").font(.caption).foregroundStyle(.red)
        } else if let caption {
            Text(caption).font(.caption).foregroundStyle(.secondary)
        }
    }
}

/// A discount on the appointment price, either a percentage or a fixed TL amount.
struct Discount: Equatable {
    enum Kind: String, CaseIterable, Identifiable {
        case percent = "%", amount = "₺"
        var id: String { rawValue }
    }

    var kind: Kind
    var value: Decimal

    /// Discounted price, rounded to kuruş and never below zero.
    func apply(to base: Decimal) -> Decimal {
        var result = kind == .percent ? base - base * value / 100 : base - value
        var rounded = Decimal()
        NSDecimalRound(&rounded, &result, 2, .plain)
        return max(rounded, 0)
    }

    var label: String { kind == .percent ? "%\(Fmt.amount(value))" : Fmt.price(value) }
}

/// "İndirim uygula" button + active-discount row for the Fiyat section.
/// While a discount is active, `base` holds the undiscounted price and `priceText` the
/// discounted one; callers that recompute the total must update `base` and re-apply.
struct DiscountControl: View {
    @Binding var priceText: String
    @Binding var discount: Discount?
    @Binding var base: Decimal?

    @State private var showSheet = false

    /// Price the next discount applies to: the stored base, else what is typed now.
    private var currentBase: Decimal? { discount == nil ? PriceText.parse(priceText) : base }

    var body: some View {
        Group {
            if let discount, let base {
                HStack {
                    Label("İndirim \(discount.label)", systemImage: "tag.fill").foregroundStyle(Color.accentColor)
                    Spacer()
                    Text("\(Fmt.price(base)) → \(Fmt.price(discount.apply(to: base)))")
                        .font(.caption).foregroundStyle(.secondary).monospacedDigit()
                }
                Button("İndirimi değiştir") { showSheet = true }
                Button("İndirimi kaldır", role: .destructive) {
                    priceText = Fmt.amount(base)
                    self.discount = nil
                    self.base = nil
                }
            } else {
                Button { showSheet = true } label: { Label("İndirim uygula", systemImage: "tag") }
                    .disabled((currentBase ?? 0) <= 0)
            }
        }
        .sheet(isPresented: $showSheet) {
            DiscountSheet(initial: discount, base: currentBase ?? 0) { applied in
                guard let currentBase else { return }
                base = currentBase
                discount = applied
                priceText = Fmt.amount(applied.apply(to: currentBase))
            }
        }
    }
}

private struct DiscountSheet: View {
    @Environment(\.dismiss) private var dismiss
    let initial: Discount?
    let base: Decimal
    let onApply: (Discount) -> Void

    @State private var kind: Discount.Kind = .percent
    @State private var text = ""
    @FocusState private var focused: Bool

    private var value: Decimal? { PriceText.parse(text) }
    private var valid: Bool {
        guard let value, value > 0 else { return false }
        return kind == .percent ? value <= 100 : value <= base
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Tür", selection: $kind) {
                        Text("Yüzde (%)").tag(Discount.Kind.percent)
                        Text("Tutar (₺)").tag(Discount.Kind.amount)
                    }
                    .pickerStyle(.segmented)
                    HStack {
                        TextField(kind == .percent ? "10" : "500", text: $text)
                            .keyboardType(.decimalPad)
                            .focused($focused)
                        Text(kind.rawValue).foregroundStyle(.secondary)
                    }
                } footer: {
                    if let value, valid {
                        let discounted = Discount(kind: kind, value: value).apply(to: base)
                        Text("\(Fmt.price(base)) − \(Discount(kind: kind, value: value).label) = \(Fmt.price(discounted))")
                    } else if !text.isEmpty {
                        Text(kind == .percent ? "1 ile 100 arasında bir yüzde yazın." : "İndirim fiyattan büyük olamaz.")
                            .foregroundStyle(.red)
                    } else {
                        Text("Fiyat: \(Fmt.price(base))")
                    }
                }
            }
            .navigationTitle("İndirim uygula")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) { Button("Vazgeç") { dismiss() } }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Uygula") {
                        if let value { onApply(Discount(kind: kind, value: value)) }
                        dismiss()
                    }
                    .disabled(!valid)
                }
            }
            .onAppear {
                if let initial { kind = initial.kind; text = Fmt.amount(initial.value) }
                focused = true
            }
        }
        .presentationDetents([.medium])
    }
}

/// Multi-select checkmark rows for a service's sub-treatments.
struct SubservicePicker: View {
    let options: [String]
    @Binding var selection: Set<String>

    var body: some View {
        ForEach(options, id: \.self) { name in
            Button {
                if selection.contains(name) { selection.remove(name) } else { selection.insert(name) }
            } label: {
                HStack {
                    Text(name).foregroundStyle(.primary)
                    Spacer()
                    if selection.contains(name) {
                        Image(systemName: "checkmark").foregroundStyle(Color.accentColor)
                    }
                }
            }
        }
    }
}

enum PhotoPrep {
    /// Loads picked images, downscales to ≤2048 px long edge and JPEG-encodes (~0.8). Unreadable items are skipped.
    static func jpegs(from items: [PhotosPickerItem]) async -> [Data] {
        var result: [Data] = []
        for item in items {
            guard let data = try? await item.loadTransferable(type: Data.self),
                  let jpeg = jpeg(from: data) else { continue }
            result.append(jpeg)
        }
        return result
    }

    // ImageIO thumbnailing avoids decoding the full-size image; the transform option bakes in EXIF orientation.
    private static func jpeg(from data: Data) -> Data? {
        let options: [CFString: Any] = [
            kCGImageSourceCreateThumbnailFromImageAlways: true,
            kCGImageSourceCreateThumbnailWithTransform: true,
            kCGImageSourceThumbnailMaxPixelSize: 2048,
        ]
        guard let source = CGImageSourceCreateWithData(data as CFData, nil),
              let cgImage = CGImageSourceCreateThumbnailAtIndex(source, 0, options as CFDictionary) else { return nil }
        return UIImage(cgImage: cgImage).jpegData(compressionQuality: 0.8)
    }
}

/// Full-screen photo; tap anywhere to close.
struct PhotoViewer: View {
    @Environment(\.dismiss) private var dismiss
    let url: URL

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()
            AsyncImage(url: url) { phase in
                switch phase {
                case let .success(image): image.resizable().scaledToFit()
                case .failure: Image(systemName: "photo").font(.largeTitle).foregroundStyle(.secondary)
                default: ProgressView().tint(.white)
                }
            }
        }
        .overlay(alignment: .topTrailing) {
            Button { dismiss() } label: {
                Image(systemName: "xmark.circle.fill").font(.title).symbolRenderingMode(.hierarchical).foregroundStyle(.white)
            }
            .padding()
            .accessibilityLabel("Kapat")
        }
        .onTapGesture { dismiss() }
    }
}

extension View {
    /// Binds the store's errorMessage to a simple alert.
    func errorAlert(_ store: AppStore) -> some View {
        modifier(ErrorAlertModifier(store: store))
    }

    /// Long-press menu + trailing swipe for an appointment row: edit, change status,
    /// and delete (removes just this session when it belongs to a package).
    func appointmentActions(_ appt: AppointmentDTO) -> some View {
        modifier(AppointmentActionsModifier(appointmentID: appt.id))
    }
}

private struct AppointmentActionsModifier: ViewModifier {
    @Environment(AppStore.self) private var store
    let appointmentID: Int

    @State private var confirmDelete = false
    @State private var showEdit = false

    /// Always act on the latest copy so the revision is current.
    private var appt: AppointmentDTO? { store.appointments.first { $0.id == appointmentID } }

    func body(content: Content) -> some View {
        let isPackage = appt?.isPackage ?? false
        let deleteLabel = isPackage ? "Seansı çıkar" : "Randevuyu sil"
        content
            .contextMenu {
                Button { showEdit = true } label: { Label("Düzenle", systemImage: "pencil") }
                Menu {
                    ForEach(AppointmentStatus.allCases) { status in
                        Button {
                            Task { await setStatus(status) }
                        } label: {
                            if appt.map({ AppointmentStatus.from($0.status) }) == status {
                                Label(status.label, systemImage: "checkmark")
                            } else {
                                Text(status.label)
                            }
                        }
                    }
                } label: {
                    Label("Durumu değiştir", systemImage: "circle.badge.checkmark")
                }
                Divider()
                Button(role: .destructive) { confirmDelete = true } label: {
                    Label(deleteLabel, systemImage: isPackage ? "minus.circle" : "trash")
                }
            }
            .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                Button(role: .destructive) { confirmDelete = true } label: {
                    Label(deleteLabel, systemImage: isPackage ? "minus.circle" : "trash")
                }
                Button { showEdit = true } label: { Label("Düzenle", systemImage: "pencil") }
                    .tint(.gray)
            }
            .confirmationDialog(isPackage ? "Bu seans paketten çıkarılsın mı?" : "Randevu silinsin mi?",
                                isPresented: $confirmDelete, titleVisibility: .visible) {
                Button(deleteLabel, role: .destructive) {
                    guard let appt else { return }
                    Task { _ = await store.deleteAppointment(id: appt.id, revision: appt.revision) }
                }
                Button("Vazgeç", role: .cancel) {}
            } message: {
                if let appt, let customer = store.customer(appt.customerID) {
                    Text("\(customer.name) · \(Fmt.dateTime.string(from: appt.startsAt))")
                }
            }
            .sheet(isPresented: $showEdit) {
                EditAppointmentView(appointmentID: appointmentID)
            }
    }

    private func setStatus(_ status: AppointmentStatus) async {
        guard let appt, AppointmentStatus.from(appt.status) != status else { return }
        _ = await store.updateAppointment(id: appt.id, revision: appt.revision,
                                          customerID: appt.customerID, serviceID: appt.serviceID,
                                          startsAt: appt.startsAt, durationMin: appt.durationMin,
                                          status: status, note: appt.note)
    }
}

private struct ErrorAlertModifier: ViewModifier {
    @Bindable var store: AppStore

    func body(content: Content) -> some View {
        content.alert("Hata", isPresented: Binding(
            get: { store.errorMessage != nil },
            set: { if !$0 { store.errorMessage = nil } }
        )) {
            Button("Tamam", role: .cancel) { store.errorMessage = nil }
        } message: {
            Text(store.errorMessage ?? "")
        }
    }
}
