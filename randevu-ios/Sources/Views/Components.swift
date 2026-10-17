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
