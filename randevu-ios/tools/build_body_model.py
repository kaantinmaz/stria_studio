#!/usr/bin/env python3
"""Builds Resources/BodyModel.bin from the MakeHuman base mesh (CC0), split into body regions.

Usage: python3 tools/build_body_model.py   (from randevu-ios/)

Mesh conventions: +Y up, faces +Z, model's own left is +X. Region suffix _r/_l is the
customer's own right/left, so x < 0 -> "_r", x >= 0 -> "_l".

Output (little-endian): b"BODY", u32 version, u32 vertexCount, f32 xyz * n positions,
f32 xyz * n normals, u32 regionCount, then per region: u32 keyLength, utf8 key,
u32 indexCount, u16 indices.
"""
import math
import os
import struct

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "makehuman-base.obj")
OUT = os.path.join(HERE, "..", "Resources", "BodyModel.bin")

# Same order as BodyRegion.all in the app.
REGIONS = [
    "forehead", "nose", "cheek_r", "cheek_l", "lips_chin", "scalp",
    "neck_front", "neck_back",
    "chest_r", "chest_l", "abdomen_r", "abdomen_l",
    "upper_back_r", "upper_back_l", "lower_back_r", "lower_back_l",
    "buttock_r", "buttock_l",
    "upper_arm_r", "upper_arm_l", "forearm_r", "forearm_l", "hand_r", "hand_l",
    "thigh_front_r", "thigh_front_l", "thigh_back_r", "thigh_back_l",
    "shin_r", "shin_l", "calf_r", "calf_l", "foot_r", "foot_l",
]


def parse_obj(path):
    verts, groups, group = [], {}, None
    with open(path) as f:
        for line in f:
            if line.startswith("v "):
                verts.append(tuple(float(v) for v in line.split()[1:4]))
            elif line.startswith("g "):
                group = line.split()[1]
                groups.setdefault(group, [])
            elif line.startswith("f "):
                groups[group].append([int(t.split("/")[0]) - 1 for t in line.split()[1:]])
    return verts, groups


def sub(a, b): return (a[0] - b[0], a[1] - b[1], a[2] - b[2])
def dot(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
def cross(a, b): return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])
def length(a): return math.sqrt(dot(a, a))


def seg_param(p, a, b):
    """Unclamped position of p along a->b (0 at a, 1 at b)."""
    d = sub(b, a)
    return dot(sub(p, a), d) / dot(d, d)


def seg_dist(p, a, b):
    t = max(0.0, min(1.0, seg_param(p, a, b)))
    d = sub(b, a)
    return length(sub(p, (a[0] + d[0] * t, a[1] + d[1] * t, a[2] + d[2] * t)))


def lerp(y, table):
    """Piecewise-linear lookup in [(y, value), ...] sorted by y (clamped at the ends)."""
    if y <= table[0][0]:
        return table[0][1]
    for (y0, v0), (y1, v1) in zip(table, table[1:]):
        if y <= y1:
            return v0 + (v1 - v0) * (y - y0) / (y1 - y0)
    return table[-1][1]


def mid_z_profile(points, lo, hi, step=0.2):
    """[(y, (minZ + maxZ) / 2)] of a vertex set, per horizontal slab."""
    table, y = [], lo
    while y <= hi:
        zs = [p[2] for p in points if abs(p[1] - y) < step / 2]
        if zs:
            table.append((y, (min(zs) + max(zs)) / 2))
        y += step
    return table


def main():
    verts, groups = parse_obj(SRC)
    joint = {}
    for name, faces in groups.items():
        if name.startswith("joint-"):
            ids = {i for f in faces for i in f}
            joint[name[6:]] = tuple(sum(verts[i][a] for i in ids) / len(ids) for a in range(3))

    # Keep only the skin, compact vertices, triangulate quads.
    body = groups["body"]
    remap = {}
    for f in body:
        for i in f:
            remap.setdefault(i, len(remap))
    pos = [None] * len(remap)
    for old, new in remap.items():
        pos[new] = verts[old]
    # Faces stay whole (quads) for classification, so region edges don't zig-zag across quad diagonals.
    polys = [[remap[i] for i in f] for f in body]
    tris = [(f[0], f[i], f[i + 1]) for f in polys for i in range(1, len(f) - 1)]
    assert len(pos) < 65536

    # Area-weighted smooth normals.
    nrm = [[0.0, 0.0, 0.0] for _ in pos]
    for t in tris:
        n = cross(sub(pos[t[1]], pos[t[0]]), sub(pos[t[2]], pos[t[0]]))
        for i in t:
            for a in range(3):
                nrm[i][a] += n[a]
    nrm = [tuple(c / (length(n) or 1.0) for c in n) for n in nrm]

    J = joint
    # Front/back split lines: mid-depth of the torso (|x| < 0.9) and of each leg, per height.
    torso_mid = mid_z_profile([p for p in pos if abs(p[0]) < 0.9 and -0.6 < p[1] < 6.0], -0.6, 6.0)
    leg_mid = {s: mid_z_profile([p for p in pos if (p[0] > 0.25 if s == "l" else p[0] < -0.25) and p[1] < -0.4],
                                -7.4, -0.4) for s in "lr"}

    def classify(p):
        x, y, z = p
        s = "l" if x >= 0 else "r"
        ax = abs(x)

        # Head: above the jaw line (lower at the chin, higher at the nape).
        jaw = 6.62 + (6.08 - 6.62) * max(0.0, min(1.0, (z + 0.2) / 0.9))
        if y > jaw and ax < 1.0:
            hairline = 7.98
            face = z > 0.62 - 0.25 * max(0.0, ax - 0.45) and y < hairline and not (ax > 0.62 and z < 0.9)
            if face or (y < 6.85 and z > 0.05):  # second term: jaw angle below the ear
                if y > 7.47:
                    return "forehead"
                if ax < 0.2 and y > 6.95 and z > 1.3:
                    return "nose"
                if y <= 6.95 and ax < 0.36:
                    return "lips_chin"
                return "cheek_" + s
            return "scalp"

        # Neck: column around the cervical axis, above the clavicles / C7.
        neck_bottom = 5.42 + (5.78 - 5.42) * max(0.0, min(1.0, (0.6 - z) / 1.0))
        if y > neck_bottom and math.hypot(x, z - 0.18) < 0.9 and ax < 0.62:
            return "neck_front" if z > 0.18 else "neck_back"

        # Arms: outside the torso and close to the shoulder-elbow-wrist-fingertip chain.
        # Beyond |x| 2.4 nothing but arm/hand exists at that height.
        S, E, W = J[f"{s}-shoulder"], J[f"{s}-elbow"], J[f"{s}-hand"]
        arm_dist = min(seg_dist(p, S, E), seg_dist(p, E, W))
        if ax > 1.2 and y > 1.0 and (arm_dist < 0.78 or ax > 2.4):
            if seg_param(p, S, E) < 1.0:
                return "upper_arm_" + s
            if seg_param(p, E, W) < 1.0:
                return "forearm_" + s
            return "hand_" + s

        front = z > lerp(y, torso_mid)
        # Legs: below the groin crease (front) / gluteal fold (back).
        crease = -0.15 + 0.55 * min(ax, 1.9)
        fold = -0.55
        if y < (crease if front else fold):
            if y < -7.3:
                return "foot_" + s
            leg_front = z > lerp(y, leg_mid[s])
            if y > J[f"{s}-knee"][1]:
                return ("thigh_front_" if leg_front else "thigh_back_") + s
            return ("shin_" if leg_front else "calf_") + s

        if front:
            return ("chest_" if y > 3.25 else "abdomen_") + s
        if y > 3.1:
            return "upper_back_" + s
        if y > 1.25:
            return "lower_back_" + s
        return "buttock_" + s

    by_region = {k: [] for k in REGIONS}
    for f in polys:
        c = tuple(sum(pos[i][a] for i in f) / len(f) for a in range(3))
        by_region[classify(c)] += [(f[0], f[i], f[i + 1]) for i in range(1, len(f) - 1)]

    print(f"{len(pos)} vertices, {len(tris)} triangles")
    print(f"{'region':<15}{'tris':>6}   bbox min .. max")
    for k in REGIONS:
        ts = by_region[k]
        assert ts, f"region {k} has no triangles"
        vs = [pos[i] for t in ts for i in t]
        lo = [min(v[a] for v in vs) for a in range(3)]
        hi = [max(v[a] for v in vs) for a in range(3)]
        print(f"{k:<15}{len(ts):>6}   ({lo[0]:6.2f},{lo[1]:6.2f},{lo[2]:6.2f}) .. ({hi[0]:6.2f},{hi[1]:6.2f},{hi[2]:6.2f})")

    with open(OUT, "wb") as f:
        f.write(b"BODY" + struct.pack("<II", 1, len(pos)))
        f.write(struct.pack(f"<{3 * len(pos)}f", *[c for p in pos for c in p]))
        f.write(struct.pack(f"<{3 * len(nrm)}f", *[c for n in nrm for c in n]))
        f.write(struct.pack("<I", len(REGIONS)))
        for k in REGIONS:
            key = k.encode()
            idx = [i for t in by_region[k] for i in t]
            f.write(struct.pack("<I", len(key)) + key + struct.pack(f"<I{len(idx)}H", len(idx), *idx))
    print(f"wrote {os.path.relpath(OUT)} ({os.path.getsize(OUT) // 1024} KB)")


if __name__ == "__main__":
    main()
