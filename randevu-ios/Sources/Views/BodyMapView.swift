import SwiftUI
import SceneKit

/// Rotatable 3D body with `selected` regions highlighted. Tapping a region calls `onToggle`;
/// nil = read-only (rotation still works, taps are ignored).
struct BodyMapView: View {
    let selected: Set<String>
    var onToggle: ((String) -> Void)? = nil

    @State private var camera = CameraRequest(back: false, token: 0)

    var body: some View {
        if let mesh = BodyModel.mesh {
            VStack(spacing: 8) {
                BodySceneView(mesh: mesh, selected: selected, onToggle: onToggle, camera: camera)
                    .frame(height: 360)
                HStack {
                    // Bordered style keeps the two buttons separately tappable inside a Form row.
                    Button("Ön") { camera = CameraRequest(back: false, token: camera.token + 1) }
                    Button("Arka") { camera = CameraRequest(back: true, token: camera.token + 1) }
                }
                .buttonStyle(.bordered)
                if onToggle != nil {
                    Text("Bölgeyi seçmek için dokunun, çevirmek için sürükleyin")
                        .font(.caption).foregroundStyle(.secondary)
                }
            }
        } else {
            Text("3D model yüklenemedi").foregroundStyle(.secondary)
        }
    }
}

/// Editable "Bölgeler" rows: the 3D picker plus the chosen regions, each removable.
struct BodyRegionPicker: View {
    @Binding var selection: Set<String>

    var body: some View {
        BodyMapView(selected: selection) { key in
            if selection.contains(key) { selection.remove(key) } else { selection.insert(key) }
        }
        ForEach(BodyRegion.ordered(selection)) { region in
            HStack {
                Text(region.label)
                Spacer()
                Button { selection.remove(region.key) } label: {
                    Image(systemName: "xmark.circle.fill").foregroundStyle(.secondary)
                }
                .buttonStyle(.borderless)
            }
        }
    }
}

/// Read-only highlight plus the region labels.
struct BodyRegionSummary: View {
    let keys: [String]

    var body: some View {
        BodyMapView(selected: Set(keys))
        Text(BodyRegion.ordered(keys).map(\.label).joined(separator: ", "))
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
        let accent = UIColor(named: "AccentColor") ?? .tintColor
        for (key, material) in zip(mesh.keys, c.materials) {
            material.diffuse.contents = selected.contains(key) ? accent : Self.skin
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
