"""
Render the bee's wing-flap cycle to transparent frames, then pack them into a
single horizontal sprite sheet.

Output: bee-sprite.png  (FRAMES x TILE wide, TILE tall)
"""
import bpy, os, sys, math, mathutils
import numpy as np
from mathutils import Vector

# repo root, two levels up from tools/bee/
HERE = os.path.dirname(os.path.abspath(sys.argv[sys.argv.index("--python") + 1]))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
BLEND_IN = os.path.join(ROOT, "assets", "models", "bee.blend")
SPRITE_OUT = os.path.join(ROOT, "assets", "images", "bee-sprite.webp")
FRAMES = 10
TILE = 256
SWEEP = math.radians(30)          # peak wing sweep either side of rest
WING_LEN = 1.10
WING_ATTACH = Vector((0.150, 0.075, 0.505))
REST_DIR = Vector((0.44, 0.50, 0.75)).normalized()   # right wing rest direction

frames_dir = os.path.join(ROOT, "tools", "bee", "_frames")
os.makedirs(frames_dir, exist_ok=True)

bpy.ops.wm.open_mainfile(filepath=BLEND_IN)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = TILE
scene.render.resolution_y = TILE
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.film_transparent = True          # transparent background

# --- lighting: soft studio, matching the reference's matte clay look ----
world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (0.90, 0.90, 0.92, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 0.85

# keep the bright yellow from going washed-out or muddy at small sizes
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'


def aim(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat('-Z', 'Y').to_euler()


key = bpy.data.lights.new("Key", 'AREA'); key.energy = 190; key.size = 4.0
ko = bpy.data.objects.new("Key", key); scene.collection.objects.link(ko)
ko.location = (-2.6, -3.4, 3.2); aim(ko, (0, 0, 0.2))

fill = bpy.data.lights.new("Fill", 'AREA'); fill.energy = 75; fill.size = 5.0
fo = bpy.data.objects.new("Fill", fill); scene.collection.objects.link(fo)
fo.location = (3.0, -2.2, 0.4); aim(fo, (0, 0, 0.2))

# --- camera: 3/4 view, bee facing right ---------------------------------
cam_data = bpy.data.cameras.new("Cam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 2.95
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
TARGET = Vector((0, 0, 0.22))
cam.location = TARGET + Vector((-0.78, -1.0, 0.30)).normalized() * 10
aim(cam, TARGET)

wings = {}
for side, name in ((-1, "Bee_Wing_L"), (1, "Bee_Wing_R")):
    wings[side] = bpy.data.objects[name]


def pose_wings(phase):
    """phase 0..1 through one flap cycle."""
    ang = SWEEP * math.sin(phase * 2 * math.pi)
    for side, w in wings.items():
        d = Vector((side * REST_DIR.x, REST_DIR.y, REST_DIR.z))
        # rotate the span direction about the body's long axis (Y) => up/down flap
        d = d.copy()
        d.rotate(mathutils.Matrix.Rotation(ang * side, 4, 'Y'))
        d.normalize()
        w.rotation_euler = d.to_track_quat('Y', 'Z').to_euler()
        attach = Vector((side * WING_ATTACH.x, WING_ATTACH.y, WING_ATTACH.z))
        w.location = attach + d * (WING_LEN / 2)


paths = []
for f in range(FRAMES):
    pose_wings(f / FRAMES)
    p = os.path.join(frames_dir, f"frame_{f:02d}.png")
    scene.render.filepath = p
    bpy.ops.render.render(write_still=True)
    paths.append(p)
    print("FRAME", f)

# --- load frames, crop the shared dead space, pack into one sheet -------
tiles = []
for p in paths:
    img = bpy.data.images.load(p)
    tiles.append(np.array(img.pixels[:], dtype=np.float32).reshape(TILE, TILE, 4))
    bpy.data.images.remove(img)

# union of all frames' non-transparent area, so every frame stays registered
alpha_union = np.max(np.stack([t[:, :, 3] for t in tiles]), axis=0)
rows = np.where(alpha_union.max(axis=1) > 0.004)[0]
cols = np.where(alpha_union.max(axis=0) > 0.004)[0]
pad = 4
r0, r1 = max(0, rows[0] - pad), min(TILE, rows[-1] + 1 + pad)
c0, c1 = max(0, cols[0] - pad), min(TILE, cols[-1] + 1 + pad)
CH, CW = r1 - r0, c1 - c0
print("CROP rows", r0, r1, "cols", c0, c1, "->", CW, "x", CH)

sheet = np.zeros((CH, CW * FRAMES, 4), dtype=np.float32)
for i, t in enumerate(tiles):
    sheet[:, i * CW:(i + 1) * CW, :] = t[r0:r1, c0:c1, :]

TILE_W, TILE_H = CW, CH
out = bpy.data.images.new("BeeSheet", width=CW * FRAMES, height=CH, alpha=True)
out.pixels = sheet.reshape(-1)
out.alpha_mode = 'STRAIGHT'
out_path = os.path.splitext(SPRITE_OUT)[0] + ".png"
out.file_format = 'PNG'
out.filepath_raw = out_path
out.save()

# WebP too - same pixels, far smaller for smooth-shaded art
try:
    webp_path = SPRITE_OUT
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.quality = 92
    out.save_render(filepath=webp_path, scene=scene)
    print("WEBP", webp_path, os.path.getsize(webp_path), "bytes")
except Exception as e:
    print("WEBP_FAILED", e)
print("SHEET", out_path, CW * FRAMES, "x", CH, "| frames:", FRAMES, "| tile:", CW, "x", CH)
