"""
Render the pink lily to a transparent image for the hero tag.

A single textured mesh — no outline hull and no animation, so this is one
still frame lit softly and cropped to its alpha.

    blender --background --factory-startup --python tools/lily/render_lily.py
"""
import bpy, os, sys, math
import numpy as np
from mathutils import Vector

# repo root, two levels up from tools/lily/
HERE = os.path.dirname(os.path.abspath(sys.argv[sys.argv.index("--python") + 1]))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
# the .glb is third-party artwork and is not kept in this repo
GLB = os.environ.get("LILY_GLB", os.path.expanduser("~/Downloads/pink_lily.glb"))
SCRATCH = os.path.join(ROOT, "assets", "images")

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
scene = bpy.context.scene

scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = 1200
scene.render.resolution_y = 1200
scene.render.film_transparent = True
if hasattr(scene.render.image_settings, 'media_type'):
    scene.render.image_settings.media_type = 'IMAGE'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
if hasattr(scene.eevee, 'taa_render_samples'):
    scene.eevee.taa_render_samples = 64

for m in bpy.data.materials:
    print("MATERIAL", m.name)



world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs[0].default_value = (1, 1, 1, 1)
world.node_tree.nodes["Background"].inputs[1].default_value = 1.05

meshes = [o for o in bpy.data.objects if o.type == 'MESH']
mins = Vector((1e9,) * 3); maxs = Vector((-1e9,) * 3)
for o in meshes:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c)
        for i in range(3):
            mins[i] = min(mins[i], w[i]); maxs[i] = max(maxs[i], w[i])
center = (mins + maxs) / 2
size = max(maxs - mins)
print("BOUNDS", [round(v, 3) for v in mins], [round(v, 3) for v in maxs], "size", round(size, 3))

key = bpy.data.lights.new("Key", 'SUN'); key.energy = 3.2
ko = bpy.data.objects.new("Key", key); scene.collection.objects.link(ko)
ko.rotation_euler = Vector((-0.5, -0.85, 0.62)).to_track_quat('-Z', 'Y').to_euler()

fill = bpy.data.lights.new("Fill", 'SUN'); fill.energy = 1.4
fo = bpy.data.objects.new("Fill", fill); scene.collection.objects.link(fo)
fo.rotation_euler = Vector((0.9, -0.6, 0.25)).to_track_quat('-Z', 'Y').to_euler()

cam_data = bpy.data.cameras.new("Cam")
cam_data.type = 'ORTHO'
cam_data.ortho_scale = size * 1.22
cam_data.clip_start = size * 0.01
cam_data.clip_end = size * 40          # default 100 would clip a large model away
cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam)
scene.camera = cam
d = Vector((0.45, -1.0, 0.22)).normalized()      # gentle three-quarter view
cam.location = center + d * size * 10
cam.rotation_euler = (center - cam.location).to_track_quat('-Z', 'Y').to_euler()

raw = os.path.join(SCRATCH, "lily-raw.png")
scene.render.filepath = raw
bpy.ops.render.render(write_still=True)
print("RENDERED", raw)

img = bpy.data.images.load(raw)
w, h = img.size
px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
a = px[:, :, 3]
rows = np.where(a.max(axis=1) > 0.004)[0]
cols = np.where(a.max(axis=0) > 0.004)[0]
pad = 6
r0, r1 = max(0, rows[0] - pad), min(h, rows[-1] + 1 + pad)
c0, c1 = max(0, cols[0] - pad), min(w, cols[-1] + 1 + pad)
crop = px[r0:r1, c0:c1, :]
CH, CW = crop.shape[0], crop.shape[1]
print("CROP", CW, "x", CH)

out = bpy.data.images.new("Lily", width=CW, height=CH, alpha=True)
out.pixels = crop.reshape(-1)
out.alpha_mode = 'STRAIGHT'
out.file_format = 'PNG'
png = os.path.join(SCRATCH, "pink-lily.png")
out.filepath_raw = png
out.save()
print("PNG", png, os.path.getsize(png))

scene.render.image_settings.file_format = 'WEBP'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.quality = 80
webp = os.path.join(SCRATCH, "pink-lily.webp")
out.save_render(filepath=webp, scene=scene)
print("WEBP", webp, os.path.getsize(webp))
