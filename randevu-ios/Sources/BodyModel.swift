import Foundation
import SceneKit

/// Body areas for camouflage make-up; keys are stored on the appointment as `body_regions`.
/// "_r"/"_l" = the customer's own right/left.
struct BodyRegion: Identifiable, Hashable {
    let key: String
    let label: String
    var id: String { key }

    static let all: [BodyRegion] = [
        .init(key: "forehead", label: "Alın"),
        .init(key: "nose", label: "Burun"),
        .init(key: "cheek_r", label: "Sağ yanak"),
        .init(key: "cheek_l", label: "Sol yanak"),
        .init(key: "lips_chin", label: "Dudak ve çene"),
        .init(key: "scalp", label: "Saçlı deri / baş arkası"),
        .init(key: "neck_front", label: "Boyun ön"),
        .init(key: "neck_back", label: "Ense"),
        .init(key: "shoulder_r", label: "Sağ omuz"),
        .init(key: "shoulder_l", label: "Sol omuz"),
        .init(key: "chest_r", label: "Sağ göğüs"),
        .init(key: "chest_l", label: "Sol göğüs"),
        .init(key: "abdomen_r", label: "Karın sağ"),
        .init(key: "abdomen_l", label: "Karın sol"),
        .init(key: "upper_back_r", label: "Sırt üst sağ"),
        .init(key: "upper_back_l", label: "Sırt üst sol"),
        .init(key: "lower_back_r", label: "Bel sağ"),
        .init(key: "lower_back_l", label: "Bel sol"),
        .init(key: "buttock_r", label: "Sağ kalça"),
        .init(key: "buttock_l", label: "Sol kalça"),
        .init(key: "upper_arm_r", label: "Sağ üst kol"),
        .init(key: "upper_arm_l", label: "Sol üst kol"),
        .init(key: "forearm_r", label: "Sağ ön kol"),
        .init(key: "forearm_l", label: "Sol ön kol"),
        .init(key: "hand_r", label: "Sağ el"),
        .init(key: "hand_l", label: "Sol el"),
        .init(key: "thigh_front_r", label: "Sağ uyluk ön"),
        .init(key: "thigh_front_l", label: "Sol uyluk ön"),
        .init(key: "thigh_inner_r", label: "Sağ uyluk iç"),
        .init(key: "thigh_inner_l", label: "Sol uyluk iç"),
        .init(key: "thigh_back_r", label: "Sağ uyluk arka"),
        .init(key: "thigh_back_l", label: "Sol uyluk arka"),
        .init(key: "shin_r", label: "Sağ bacak ön (kaval)"),
        .init(key: "shin_l", label: "Sol bacak ön (kaval)"),
        .init(key: "leg_inner_r", label: "Sağ bacak iç (alt)"),
        .init(key: "leg_inner_l", label: "Sol bacak iç (alt)"),
        .init(key: "calf_r", label: "Sağ baldır"),
        .init(key: "calf_l", label: "Sol baldır"),
        .init(key: "foot_r", label: "Sağ ayak"),
        .init(key: "foot_l", label: "Sol ayak"),
    ]

    /// Known regions among `keys`, in the canonical order above (unknown keys are skipped).
    static func ordered(_ keys: some Sequence<String>) -> [BodyRegion] {
        let set = Set(keys)
        return all.filter { set.contains($0.key) }
    }

    /// Key without the side suffix: "leg_inner_r" / "leg_inner_l" → "leg_inner".
    static func pairBase(_ key: String) -> String {
        key.hasSuffix("_r") || key.hasSuffix("_l") ? String(key.dropLast(2)) : key
    }

    /// Regions that are billed: a right/left pair counts once (owner rule).
    static func pricedCount(_ keys: some Sequence<String>) -> Int {
        Set(keys.map(pairBase)).count
    }
}

/// Region-split human mesh from Resources/BodyModel.bin (built by tools/build_body_model.py).
/// One geometry element per region, so a hit test's `geometryIndex` indexes `keys`.
enum BodyModel {
    struct Mesh {
        let sources: [SCNGeometrySource]
        let elements: [SCNGeometryElement]
        let keys: [String]
    }

    /// Parsed once; nil only if the bundled file is missing or malformed.
    static let mesh: Mesh? = load(from: Bundle.main.url(forResource: "BodyModel", withExtension: "bin"))

    static func load(from url: URL?) -> Mesh? {
        guard let url, let data = try? Data(contentsOf: url) else { return nil }
        var r = Reader(data: data)
        guard r.bytes(4) == Data("BODY".utf8), r.u32() == 1, let n = r.u32(),
              let positions = r.bytes(n * 12), let normals = r.bytes(n * 12), let count = r.u32() else { return nil }
        var keys: [String] = [], elements: [SCNGeometryElement] = []
        for _ in 0..<count {
            guard let keyLen = r.u32(), let keyData = r.bytes(keyLen), let key = String(data: keyData, encoding: .utf8),
                  let indexCount = r.u32(), let indices = r.bytes(indexCount * 2) else { return nil }
            keys.append(key)
            elements.append(SCNGeometryElement(data: indices, primitiveType: .triangles,
                                               primitiveCount: indexCount / 3, bytesPerIndex: 2))
        }
        func source(_ d: Data, _ semantic: SCNGeometrySource.Semantic) -> SCNGeometrySource {
            SCNGeometrySource(data: d, semantic: semantic, vectorCount: n, usesFloatComponents: true,
                              componentsPerVector: 3, bytesPerComponent: 4, dataOffset: 0, dataStride: 12)
        }
        return Mesh(sources: [source(positions, .vertex), source(normals, .normal)], elements: elements, keys: keys)
    }

    private struct Reader {
        let data: Data
        var offset = 0

        mutating func bytes(_ count: Int) -> Data? {
            guard count >= 0, offset + count <= data.count else { return nil }
            defer { offset += count }
            return data.subdata(in: offset..<offset + count)
        }

        mutating func u32() -> Int? {
            bytes(4).map { Int(UInt32(littleEndian: $0.withUnsafeBytes { $0.loadUnaligned(as: UInt32.self) })) }
        }
    }
}
