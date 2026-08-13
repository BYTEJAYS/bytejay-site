"""
Build an original stylised bee, modelled to match the art direction of the
reference: one rounded capsule body (~1.63:1), two paddle wings splayed in a V
on the top-rear, sculpted minimal face, tiny leg nubs.

Palette taken from the decoded reference texture:
  body #FFFF40   black markings #000000   wings #FFFFFF

Units: body semi-axis Y = 1.0 (length axis). Forward = -Y. Up = +Z.

Run with:  blender --background --factory-startup --python tools/bee/build_bee.py
Writes:    assets/models/bee.blend
"""
import bpy, os, sys, math, bmesh
from mathutils import Vector

# repo root, two levels up from tools/bee/
HERE = os.path.dirname(os.path.abspath(sys.argv[sys.argv.index("--python") + 1]))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BLEND_OUT = os.path.join(ROOT, "assets", "models", "bee.blend")

BODY_LEN = 1.0            # semi-axis along Y
BODY_RAD = 0.612          # semi-axis along X and Z (0.097/0.159 from reference)

YELLOW = (1.0, 0.965, 0.180, 1.0)   # ~#FFF62E, reference #FFFF40 warmed slightly
BLACK  = (0.020, 0.020, 0.022, 1.0)
WHITE  = (0.905, 0.925, 0.975, 1.0)   # faintly cool, so wings read on a cream page

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene


def srgb_to_linear(c):
    out = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c[:3]]
    return (*out, 1.0)


def new_mat(name, color, roughness=0.62):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = srgb_to_linear(color)
    b.inputs["Roughness"].default_value = roughness
    if "Metallic" in b.inputs:
        b.inputs["Metallic"].default_value = 0.0
    return m


mat_black = new_mat("Bee_Black", BLACK, roughness=0.44)
mat_white = new_mat("Bee_Wing", WHITE, roughness=0.28)


def striped_body_material():
    """Yellow body with two black bands, driven procedurally off object-space Y
    so no UV unwrapping is needed."""
    m = bpy.data.materials.new("Bee_Body")
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    bsdf.inputs["Roughness"].default_value = 0.58
    if "Metallic" in bsdf.inputs:
        bsdf.inputs["Metallic"].default_value = 0.0

    texco = nt.nodes.new("ShaderNodeTexCoord"); texco.location = (-900, 0)
    sep = nt.nodes.new("ShaderNodeSeparateXYZ"); sep.location = (-700, 0)
    nt.links.new(texco.outputs["Object"], sep.inputs["Vector"])

    # remap Y from [-BODY_LEN, +BODY_LEN] to [0,1]; 0 = face end, 1 = tail
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.location = (-520, 0)
    mr.inputs["From Min"].default_value = -BODY_LEN
    mr.inputs["From Max"].default_value = BODY_LEN
    mr.inputs["To Min"].default_value = 0.0
    mr.inputs["To Max"].default_value = 1.0
    nt.links.new(sep.outputs["Y"], mr.inputs["Value"])

    ramp = nt.nodes.new("ShaderNodeValToRGB"); ramp.location = (-330, 0)
    cr = ramp.color_ramp
    cr.interpolation = 'CONSTANT'
    # yellow / black band / yellow / black band / yellow tail
    stops = [(0.0, YELLOW), (0.46, BLACK), (0.60, YELLOW), (0.745, BLACK), (0.875, YELLOW)]
    while len(cr.elements) > 1:
        cr.elements.remove(cr.elements[-1])
    cr.elements[0].position = stops[0][0]
    cr.elements[0].color = srgb_to_linear(stops[0][1])
    for pos, col in stops[1:]:
        cr.elements.new(pos).color = srgb_to_linear(col)
    nt.links.new(mr.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    return m


mat_body = striped_body_material()


def add_sphere(name, loc, scale, segments=48, rings=24):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=segments, ring_count=rings,
                                         radius=1.0, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = scale
    for p in ob.data.polygons:
        p.use_smooth = True
    return ob


# ---- body -------------------------------------------------------------
body = add_sphere("Bee_Body", (0, 0, 0), (BODY_RAD, BODY_LEN, BODY_RAD), 64, 32)
body.data.materials.append(mat_body)
bm = bmesh.new(); bm.from_mesh(body.data)
for v in bm.verts:
    t = (v.co.y + 1.0) / 2.0            # 0 front .. 1 tail
    if t > 0.55:                         # taper the abdomen
        k = (t - 0.55) / 0.45
        f = 1.0 - 0.22 * (k ** 1.6)
        v.co.x *= f; v.co.z *= f
    if t < 0.24:                         # fuller cheeks at the face end
        k = (0.24 - t) / 0.24
        f = 1.0 + 0.06 * (k ** 1.4)
        v.co.x *= f; v.co.z *= f
bm.to_mesh(body.data); bm.free()
sub = body.modifiers.new("Subdiv", 'SUBSURF'); sub.levels = 2; sub.render_levels = 2

parts = [body]

# ---- face: two eye dots + a small mouth ------------------------------
for side in (-1, 1):
    e = add_sphere(f"Bee_Eye_{'L' if side < 0 else 'R'}",
                   (side * 0.335, -0.700, 0.115), (0.115, 0.085, 0.140), 32, 18)
    e.data.materials.append(mat_black)
    parts.append(e)

mouth = add_sphere("Bee_Mouth", (0, -0.930, -0.090), (0.140, 0.060, 0.052), 32, 16)
mouth.data.materials.append(mat_black)
parts.append(mouth)

# ---- antennae: stalk from base->tip, ball on the end ------------------
def add_antenna(side):
    base = Vector((side * 0.20, -0.640, 0.520))
    tip = Vector((side * 0.360, -0.880, 0.960))
    d = tip - base
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.030, depth=d.length,
                                        location=(base + d / 2))
    a = bpy.context.active_object
    a.name = f"Bee_Antenna_{'L' if side < 0 else 'R'}"
    a.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
    for p in a.data.polygons:
        p.use_smooth = True
    a.data.materials.append(mat_black)
    ball = add_sphere(f"Bee_AntennaTip_{'L' if side < 0 else 'R'}", tip,
                      (0.070, 0.070, 0.070), 20, 12)
    ball.data.materials.append(mat_black)
    return [a, ball]


for side in (-1, 1):
    parts += add_antenna(side)

# ---- legs: tiny nubs underneath ---------------------------------------
for i, y in enumerate((-0.30, 0.06, 0.40)):
    for side in (-1, 1):
        l = add_sphere(f"Bee_Leg_{i}_{'L' if side < 0 else 'R'}",
                       (side * 0.185, y, -0.520), (0.045, 0.062, 0.090), 16, 10)
        l.data.materials.append(mat_black)
        parts.append(l)

# ---- wings: rounded paddles splayed up / out / back -------------------
WING_LEN = 1.10
WING_ATTACH = Vector((0.150, 0.075, 0.505))   # x is mirrored per side
wings = []
for side in (-1, 1):
    w = add_sphere(f"Bee_Wing_{'L' if side < 0 else 'R'}", (0, 0, 0),
                   (1.0, 1.0, 1.0), 44, 22)
    w.data.materials.append(mat_white)
    # keep the sphere's own round caps (so the tip stays rounded, not pointed)
    # and only narrow the root end
    bm = bmesh.new(); bm.from_mesh(w.data)
    for v in bm.verts:
        t = (v.co.y + 1.0) / 2.0                       # 0 root .. 1 tip
        taper = 0.52 + 0.48 * min(1.0, t / 0.62)       # narrow root, full tip
        v.co.x *= taper
        v.co.z *= taper
    bm.to_mesh(w.data); bm.free()
    w.scale = (0.285, WING_LEN / 2, 0.062)
    w.modifiers.new("Subdiv", 'SUBSURF').levels = 1

    # root sits on the top-rear of the thorax; paddle points up / out / back
    d = Vector((side * 0.44, 0.50, 0.75)).normalized()
    w.rotation_euler = d.to_track_quat('Y', 'Z').to_euler()
    attach = Vector((side * WING_ATTACH.x, WING_ATTACH.y, WING_ATTACH.z))
    w.location = attach + d * (WING_LEN / 2)
    wings.append(w)
parts += wings

# ---- group under an empty so the whole bee can be posed as one -------
bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0, 0))
root = bpy.context.active_object
root.name = "Bee_Root"
for ob in parts:
    ob.parent = root
    ob.matrix_parent_inverse = root.matrix_world.inverted()

scene["bee_wings"] = [w.name for w in wings]

os.makedirs(os.path.dirname(BLEND_OUT), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=BLEND_OUT)
print("SAVED", BLEND_OUT, "| parts:", len(parts))
