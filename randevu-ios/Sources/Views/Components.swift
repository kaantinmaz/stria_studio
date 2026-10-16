import SwiftUI

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
