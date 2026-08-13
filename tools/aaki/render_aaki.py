"""
Render Aaki — the dancing cat — from the supplied .blend to a sprite grid.

The rig, mesh and action are renamed to Aaki, then the 155-frame dance is
sampled down to a 6x5 grid of transparent frames the site can step through in
CSS/JS. Same approach as the bee sprite: no 3D runtime on the page.

    blender --background /path/to/КОТЭ.blend --python tools/aaki/render_aaki.py

The .blend itself is not kept in this repo — it is third-party artwork, so
point this at wherever you keep it. Writes assets/images/aaki-sprite.webp.
"""
import bpy, os, math
import numpy as np

import sys
# repo root, two levels up from tools/aaki/
HERE = os.path.dirname(os.path.abspath(sys.argv[sys.argv.index("--python") + 1]))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
SCRATCH = os.path.join(ROOT, "assets", "images")
FRAMES_DIR = os.path.join(ROOT, "tools", "aaki", "_frames")
COLS, ROWS = 6, 5
N = COLS * ROWS                 # 30 sampled frames
TILE = 320                      # render size per frame before cropping

os.makedirs(FRAMES_DIR, exist_ok=True)
scene = bpy.context.scene

# ---- name everything Aaki ------------------------------------------------
renames = []
for ob in bpy.data.objects:
    if ob.type == 'ARMATURE':
        renames.append((ob.name, 'Aaki_Rig')); ob.name = 'Aaki_Rig'
    elif ob.type == 'MESH':
        # the big retopo mesh is her body; the small circles are her features
        new = 'Aaki_Body' if len(ob.data.vertices) > 500 else f'Aaki_Part_{len(renames)}'
        renames.append((ob.name, new)); ob.name = new
for act in bpy.data.actions:
    if act.name == 'dance':
        renames.append((act.name, 'Aaki_Dance')); act.name = 'Aaki_Dance'
print("RENAMED:", renames)

# ---- render settings -----------------------------------------------------
scene.render.resolution_x = TILE
scene.render.resolution_y = TILE
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
# the file ships with compositor nodes that paint a background back in, which
# defeats film_transparent — bypass them and drop the world contribution
scene.render.use_compositing = False
scene.render.use_sequencer = False
scene.use_nodes = False
if scene.world and scene.world.use_nodes:
    for node in scene.world.node_tree.nodes:
        if node.type == 'BACKGROUND':
            node.inputs[1].default_value = 0.0
# the file ships set to video output, which restricts the format enum
if hasattr(scene.render.image_settings, 'media_type'):
    scene.render.image_settings.media_type = 'IMAGE'
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
if hasattr(scene.eevee, 'taa_render_samples'):
    scene.eevee.taa_render_samples = 24

# The 155-frame action is five repeats of one ~31-frame cycle, so sampling the
# whole range captured each pose five times. Take a single cycle instead.
CYCLE = 31
start = scene.frame_start
step = CYCLE / N
picks = [int(round(start + i * step)) for i in range(N)]
print("FRAME_RANGE", scene.frame_start, scene.frame_end,
      "-> one cycle of", CYCLE, "sampled at", len(picks), "frames:", picks)

paths = []
for i, f in enumerate(picks):
    scene.frame_set(f)
    p = os.path.join(FRAMES_DIR, f"f{i:03d}.png")
    scene.render.filepath = p
    bpy.ops.render.render(write_still=True)
    paths.append(p)
    if i % 6 == 0:
        print("FRAME", i, "of", len(picks))

# ---- crop to the union of all frames, then pack the grid -----------------
tiles = []
for p in paths:
    img = bpy.data.images.load(p)
    tiles.append(np.array(img.pixels[:], dtype=np.float32).reshape(TILE, TILE, 4))
    bpy.data.images.remove(img)

alpha_union = np.max(np.stack([t[:, :, 3] for t in tiles]), axis=0)
rows_nz = np.where(alpha_union.max(axis=1) > 0.004)[0]
cols_nz = np.where(alpha_union.max(axis=0) > 0.004)[0]
pad = 4
r0, r1 = max(0, rows_nz[0] - pad), min(TILE, rows_nz[-1] + 1 + pad)
c0, c1 = max(0, cols_nz[0] - pad), min(TILE, cols_nz[-1] + 1 + pad)
CH, CW = r1 - r0, c1 - c0
print("CROP", CW, "x", CH)

sheet = np.zeros((CH * ROWS, CW * COLS, 4), dtype=np.float32)
for i, t in enumerate(tiles):
    r, c = divmod(i, COLS)
    # numpy rows run bottom-up in Blender pixel space, so fill rows in reverse
    rr = ROWS - 1 - r
    sheet[rr * CH:(rr + 1) * CH, c * CW:(c + 1) * CW, :] = t[r0:r1, c0:c1, :]

out = bpy.data.images.new("AakiSheet", width=CW * COLS, height=CH * ROWS, alpha=True)
out.pixels = sheet.reshape(-1)
out.alpha_mode = 'STRAIGHT'

png = os.path.join(SCRATCH, "aaki-sprite.png")
out.file_format = 'PNG'
out.filepath_raw = png
out.save()
print("PNG", png, os.path.getsize(png))

try:
    webp = os.path.join(SCRATCH, "aaki-sprite.webp")
    scene.render.image_settings.file_format = 'WEBP'
    scene.render.image_settings.color_mode = 'RGBA'
    scene.render.image_settings.quality = 70
    out.save_render(filepath=webp, scene=scene)
    print("WEBP", webp, os.path.getsize(webp))
except Exception as e:
    print("WEBP_FAILED", e)

print("SHEET", CW * COLS, "x", CH * ROWS, "| grid", COLS, "x", ROWS, "| tile", CW, "x", CH)
