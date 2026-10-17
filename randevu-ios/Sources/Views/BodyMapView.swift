import SwiftUI
import SceneKit

/// Rotatable 3D body with `selected` regions highlighted. Tapping a region calls `onToggle`;
/// nil = read-only (rotation still works, taps are ignored). The corner button opens it full screen.
/// `sessionTotal` non-nil = show session prices (consultation, `sessionPrice` per region) under the full-screen model.
struct BodyMapView: View {
    let selected: Set<String>
    var sessionPrice: Decimal? = nil
    var sessionTotal: Int? = nil
    var onToggle: ((String) -> Void)? = nil

    @State private var camera = CameraRequest(back: false, token: 0)
    @State private var expanded = false

    var body: some View {
        if let mesh = BodyModel.mesh {
            VStack(spacing: 8) {
                BodySceneView(mesh: mesh, selected: selected, onToggle: onToggle, camera: camera)
                    .frame(height: 360)
                    .overlay(alignment: .topTrailing) {
                        Button { expanded = true } label: {
                            Image(systemName: "arrow.up.left.and.arrow.down.right")
                        }
                        .buttonStyle(.bordered)
                        .accessibilityLabel("Tam ekran")
                    }
                SideButtons(camera: $camera)
                if onToggle != nil {
                    Text("Bölgeyi seçmek için dokunun, çevirmek için sürükleyin")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
            // Content is rebuilt from this view's `selected`, so taps in full screen show up live.
            .fullScreenCover(isPresented: $expanded) {
                BodyMapFullScreen(mesh: mesh, selected: selected, sessionPrice: sessionPrice, sessionTotal: sessionTotal, onToggle: onToggle)
            }
        } else {
            Text("3D model yüklenemedi").foregroundStyle(.secondary)
        }
    }
}

/// Full-screen 3D body plus the chosen regions (removable when editable) in a short list under it.
private struct BodyMapFullScreen: View {
    @Environment(\.dismiss) private var dismiss
    let mesh: BodyModel.Mesh
    let selected: Set<String>
    let sessionPrice: Decimal?
    let sessionTotal: Int?
    let onToggle: ((String) -> Void)?

    @State private var camera = CameraRequest(back: false, token: 0)

    var body: some View {
        NavigationStack {
            VStack(spacing: 8) {
                BodySceneView(mesh: mesh, selected: selected, onToggle: onToggle, camera: camera)
                SideButtons(camera: $camera)
                if selected.isEmpty {
                    Text("Bölge seçilmedi").font(.caption).foregroundStyle(.secondary)
                    BodyRegionRows(keys: selected, sessionPrice: sessionPrice, sessionTotal: sessionTotal)
                } else {
                    // Capped height keeps the model large; the list scrolls.
                    List {
                        BodyRegionRows(keys: selected, sessionPrice: sessionPrice, sessionTotal: sessionTotal, onRemove: onToggle)
                    }
                    .listStyle(.plain)
                    .frame(maxHeight: 240)
                }
            }
            .padding(.bottom, 8)
            .navigationTitle("Bölgeler")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button(onToggle == nil ? "Kapat" : "Bitti") { dismiss() }
                }
            }
        }
    }
}

/// Front/back camera buttons.
private struct SideButtons: View {
    @Binding var camera: CameraRequest

    var body: some View {
        HStack {
            // Bordered style keeps the two buttons separately tappable inside a Form row.
            Button("Ön") { camera = CameraRequest(back: false, token: camera.token + 1) }
            Button("Arka") { camera = CameraRequest(back: true, token: camera.token + 1) }
        }
        .buttonStyle(.bordered)
    }
}

/// Editable "Bölgeler" rows: the 3D picker plus the chosen regions (each removable) and their prices.
struct BodyRegionPicker: View {
    @Binding var selection: Set<String>
    let sessionPrice: Decimal?
    let sessionTotal: Int

    var body: some View {
        BodyMapView(selected: selection, sessionPrice: sessionPrice, sessionTotal: sessionTotal) { key in
            if selection.contains(key) { selection.remove(key) } else { selection.insert(key) }
        }
        BodyRegionRows(keys: selection, sessionPrice: sessionPrice, sessionTotal: sessionTotal) { selection.remove($0) }
    }
}

/// Read-only highlight plus the region labels.
struct BodyRegionSummary: View {
    let keys: [String]

    var body: some View {
        BodyMapView(selected: Set(keys))
        BodyRegionRows(keys: Set(keys), sessionPrice: nil, sessionTotal: nil)
    }
}

/// Chosen regions as Form/List rows: colour swatch (same as on the model) and label; with `sessionTotal`
/// also the per-region session price, the per-session sum and the package total.
struct BodyRegionRows: View {
    let keys: Set<String>
    let sessionPrice: Decimal?
    let sessionTotal: Int?
    var onRemove: ((String) -> Void)? = nil

    var body: some View {
        let colors = BodyRegion.colors(for: keys)
        let quote = sessionTotal.flatMap { total in
            sessionPrice.map { PriceQuote(unit: $0, regionCount: BodyRegion.pricedCount(keys), sessions: total) }
        }
        let regions = BodyRegion.ordered(keys)
        ForEach(Array(regions.enumerated()), id: \.element.id) { index, region in
            // The second side of a right/left pair shares the first side's price.
            let isPairedSecond = regions[..<index].contains { BodyRegion.pairBase($0.key) == BodyRegion.pairBase(region.key) }
            HStack {
                Circle().fill(Color(colors[region.key] ?? .clear)).frame(width: 12, height: 12)
                Text(region.label)
                Spacer()
                if let quote {
                    Text(isPairedSecond ? "karşılığıyla tek fiyat" : "\(Fmt.price(quote.unit)) / seans")
                        .font(.caption).foregroundStyle(.secondary)
                }
                if let onRemove {
                    Button { onRemove(region.key) } label: {
                        Image(systemName: "xmark.circle.fill").foregroundStyle(.secondary)
                    }
                    .buttonStyle(.borderless)
                    .accessibilityLabel("\(region.label) kaldır")
                }
            }
        }
        if let quote {
            if keys.isEmpty {
                Text("\(Fmt.price(quote.unit)) / seans, bölge başına — her seçilen bölge fiyatı çarpar")
                    .font(.caption).foregroundStyle(.secondary)
            } else {
                InfoRow(label: "Seans başı (\(quote.regions ?? 1) bölge × \(Fmt.price(quote.unit)))", value: Fmt.price(quote.perSession))
                InfoRow(label: "Toplam (\(quote.sessions) seans)", value: Fmt.price(quote.total))
            }
        } else if sessionTotal != nil {
            Text("Seans fiyatı Ayarlar'dan girilir").font(.caption).foregroundStyle(.secondary)
        }
    }
}

extension BodyRegion {
    /// Distinct highlight colours, cycled when more regions are chosen than there are colours.
    static let palette: [UIColor] = [
        0xE53935, 0x1E88E5, 0x43A047, 0x8E24AA, 0xFB8C00, 0x00ACC1, 0xD81B60,
        0x3949AB, 0xC0CA33, 0x6D4C41, 0x00897B, 0xFDD835, 0x5E35B1, 0x546E7A,
    ].map { UIColor(red: CGFloat($0 >> 16) / 255, green: CGFloat($0 >> 8 & 0xFF) / 255, blue: CGFloat($0 & 0xFF) / 255, alpha: 1) }

    /// Colour per selected key by its position in canonical order (stable while editing).
    static func colors(for keys: Set<String>) -> [String: UIColor] {
        Dictionary(uniqueKeysWithValues: ordered(keys).enumerated().map { ($1.key, palette[$0 % palette.count]) })
    }
}

/// Bump `token` to move the camera even when the side is unchanged (after the user rotated).
struct CameraRequest: Equatable {
    let back: Bool
    let token: Int
}

private struct BodySceneView: UIViewRepresentable {
    let mesh: BodyModel.Mesh
    let selected: Set<String>
    let onToggle: ((String) -> Void)?
    let camera: CameraRequest

    private static let skin = UIColor(red: 0.91, green: 0.83, blue: 0.77, alpha: 1)

    func makeCoordinator() -> Coordinator { Coordinator(keys: mesh.keys) }

    func makeUIView(context: Context) -> SCNView {
        let c = context.coordinator
        let geometry = SCNGeometry(sources: mesh.sources, elements: mesh.elements)
        geometry.materials = mesh.keys.map { _ in
            let m = SCNMaterial()
            m.lightingModel = .lambert
            return m
        }
        c.materials = geometry.materials

        let scene = SCNScene()
        let body = SCNNode(geometry: geometry)
        scene.rootNode.addChildNode(body)
        let ambient = SCNNode()
        ambient.light = SCNLight()
        ambient.light?.type = .ambient
        ambient.light?.intensity = 500
        scene.rootNode.addChildNode(ambient)

        c.cameraNode.camera = SCNCamera()
        c.cameraNode.camera?.fieldOfView = 30
        // Key light rides on the camera so the side facing the viewer is always lit.
        let key = SCNNode()
        key.light = SCNLight()
        key.light?.type = .directional
        key.light?.intensity = 600
        c.cameraNode.addChildNode(key)
        scene.rootNode.addChildNode(c.cameraNode)

        let (lo, hi) = body.boundingBox
        c.center = SCNVector3((lo.x + hi.x) / 2, (lo.y + hi.y) / 2, (lo.z + hi.z) / 2)
        c.distance = (hi.y - lo.y) * 1.1 / (2 * tan(15 * .pi / 180))

        let view = SCNView()
        view.scene = scene
        view.backgroundColor = .clear
        view.antialiasingMode = .multisampling4X
        view.allowsCameraControl = true
        view.defaultCameraController.interactionMode = .orbitTurntable
        view.defaultCameraController.automaticTarget = false
        view.addGestureRecognizer(UITapGestureRecognizer(target: c, action: #selector(Coordinator.tapped(_:))))
        c.aim(view, back: false, animated: false)
        c.cameraToken = camera.token
        return view
    }

    func updateUIView(_ view: SCNView, context: Context) {
        let c = context.coordinator
        c.onToggle = onToggle
        let colors = BodyRegion.colors(for: selected)
        for (key, material) in zip(mesh.keys, c.materials) {
            material.diffuse.contents = colors[key] ?? Self.skin
        }
        if camera.token != c.cameraToken {
            c.cameraToken = camera.token
            c.aim(view, back: camera.back, animated: true)
        }
    }

    final class Coordinator: NSObject {
        let keys: [String]
        let cameraNode = SCNNode()
        var materials: [SCNMaterial] = []
        var onToggle: ((String) -> Void)?
        var center = SCNVector3Zero
        var distance: Float = 1
        var cameraToken = 0

        init(keys: [String]) { self.keys = keys }

        /// Front or back view of the whole body, orbiting around its centre.
        func aim(_ view: SCNView, back: Bool, animated: Bool) {
            view.pointOfView = cameraNode
            view.defaultCameraController.target = center
            SCNTransaction.begin()
            SCNTransaction.animationDuration = animated ? 0.3 : 0
            cameraNode.position = SCNVector3(center.x, center.y, center.z + (back ? -distance : distance))
            cameraNode.eulerAngles = SCNVector3(0, back ? Float.pi : 0, 0)
            SCNTransaction.commit()
        }

        @objc func tapped(_ gesture: UITapGestureRecognizer) {
            guard let onToggle, let view = gesture.view as? SCNView,
                  let hit = view.hitTest(gesture.location(in: view), options: nil).first,
                  keys.indices.contains(hit.geometryIndex) else { return }
            onToggle(keys[hit.geometryIndex])
        }
    }
}
