import bpy, math, os


def material(name, color, metal=0.0, rough=0.7, emission=None, strength=0.0):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metal
    bsdf.inputs["Roughness"].default_value = rough
    if emission:
        socket = bsdf.inputs.get("Emission Color") or bsdf.inputs.get("Emission")
        if socket:
            socket.default_value = (*emission, 1)
        strength_socket = bsdf.inputs.get("Emission Strength")
        if strength_socket:
            strength_socket.default_value = strength
    return mat


def parent_local(obj, parent, loc=(0, 0, 0), rot=(0, 0, 0)):
    obj.parent = parent
    obj.location = loc
    obj.rotation_euler = rot
    return obj


def empty(name, parent=None, loc=(0, 0, 0)):
    bpy.ops.object.empty_add(type="PLAIN_AXES", location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    if parent:
        parent_local(obj, parent, loc)
    else:
        obj.location = loc
    return obj


def cube(name, parent, loc, scale, mat, bevel=0.025, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = obj.modifiers.new("Soft low-poly edge", "BEVEL")
        mod.width = bevel
        mod.segments = 2
    obj.data.materials.append(mat)
    return parent_local(obj, parent, loc, rot)


def sphere(name, parent, loc, scale, mat):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12, ring_count=8, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.scale = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(mat)
    return parent_local(obj, parent, loc)


def cylinder(name, parent, loc, radius, depth, mat, vertices=12, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices, radius=radius, depth=depth, location=(0, 0, 0))
    obj = bpy.context.object
    obj.name = name
    obj.data.materials.append(mat)
    return parent_local(obj, parent, loc, rot)


def key(obj, frame, rotation):
    obj.rotation_euler = tuple(math.radians(value) for value in rotation)
    obj.keyframe_insert("rotation_euler", frame=frame)


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

# Palette and silhouette are taken directly from the traveler in the Journey world:
# soot-black clothing, an earthy wide-brim hat and a small warm face highlight.
coat = material("Journey coat", (0.018, 0.016, 0.013), rough=0.88)
coat_edge = material("Journey coat edges", (0.055, 0.046, 0.034), rough=0.82)
hat = material("Weathered brown hat", (0.20, 0.155, 0.09), rough=0.86)
hat_band = material("Dark hat band", (0.045, 0.035, 0.025), rough=0.9)
skin = material("Warm island light", (0.92, 0.58, 0.28), rough=0.65,
                emission=(0.9, 0.34, 0.08), strength=0.07)
lantern = material("Warm journey trim", (0.95, 0.28, 0.055), rough=0.55,
                   emission=(1.0, 0.12, 0.015), strength=0.12)
boot = material("Travel boots", (0.028, 0.023, 0.018), rough=0.95)

root = empty("Rig Root")
spine = empty("Spine", root, (0, 0, 0.02))

# Long rectangular body and tiny warm neck reproduce the readable silhouette used
# on the actual Journey page without importing the whole WebGL world.
cube("Traveler coat", spine, (0, 0, 0.25), (0.34, 0.20, 0.53), coat, 0.035)
cube("Coat shoulder cape", spine, (0, -0.035, 0.63), (0.43, 0.24, 0.105), coat_edge, 0.045)
cube("Coat front seam", spine, (0, -0.215, 0.18), (0.022, 0.012, 0.38), hat, 0.008)
cube("Coat hem", spine, (0, 0, -0.29), (0.36, 0.215, 0.065), coat_edge, 0.02)

neck = empty("Neck", spine, (0, 0, 0.72))
cylinder("Traveler neck", neck, (0, 0, 0.04), 0.105, 0.18, skin, vertices=12)
sphere("Traveler head", neck, (0, 0, 0.28), (0.245, 0.215, 0.265), skin)
cube("Shadowed face", neck, (0, -0.207, 0.27), (0.175, 0.018, 0.115), coat_edge, 0.018)

# The broad hat is the Journey avatar's strongest identifying feature.
cylinder("Wide hat brim", neck, (0, 0, 0.52), 0.49, 0.075, hat, vertices=24)
cylinder("Hat underside", neck, (0, 0, 0.485), 0.44, 0.035, hat_band, vertices=24)
cylinder("Hat crown", neck, (0, 0, 0.665), 0.275, 0.29, hat, vertices=14)
cylinder("Hat band", neck, (0, 0, 0.565), 0.288, 0.075, hat_band, vertices=14)

shoulders = []
hips = []
for side, label in [(-1, "Left"), (1, "Right")]:
    shoulder = empty(label + " Shoulder", spine, (side * 0.43, 0, 0.52))
    shoulders.append(shoulder)
    cube(label + " sleeve", shoulder, (0, 0, -0.27), (0.105, 0.15, 0.31), coat, 0.035)
    elbow = empty(label + " Elbow", shoulder, (0, 0, -0.56))
    cube(label + " forearm", elbow, (0, 0, -0.21), (0.09, 0.13, 0.23), coat_edge, 0.03)
    wrist = empty(label + " Wrist", elbow, (0, -0.01, -0.47))
    sphere(label + " hand", wrist, (0, 0, 0), (0.10, 0.105, 0.11), skin)
    cube(label + " warm cuff", wrist, (0, -0.125, 0.09), (0.075, 0.018, 0.07), lantern, 0.012)

    hip = empty(label + " Hip", spine, (side * 0.18, 0, -0.33))
    hips.append(hip)
    cube(label + " trouser", hip, (0, 0, -0.29), (0.115, 0.145, 0.33), coat, 0.03)
    knee = empty(label + " Knee", hip, (0, 0, -0.58))
    cube(label + " lower leg", knee, (0, 0, -0.25), (0.10, 0.13, 0.275), coat_edge, 0.025)
    ankle = empty(label + " Ankle", knee, (0, 0, -0.50))
    cube(label + " boot", ankle, (0, -0.08, -0.04), (0.14, 0.23, 0.12), boot, 0.045)

# These keys are retained in the source model/GLB for convenient previewing. The
# high-frame-rate WebP render script bakes the final seamless 120-frame tumble.
for frame, rotation in [(1, (28, -42, -54)), (16, (98, 12, -138)),
                        (31, (188, 55, -220)), (46, (286, 6, -310)),
                        (61, (388, -42, -414))]:
    key(root, frame, rotation)

for frame, rotation in [(1, (-7, 8, 5)), (16, (12, -13, -8)),
                        (31, (-15, 11, 10)), (46, (13, -9, -11)),
                        (61, (-7, 8, 5))]:
    key(spine, frame, rotation)

pose_sets = [
    (shoulders[0], [(1, (-38, 8, -42)), (16, (-116, 28, -22)), (31, (-58, -20, -80)), (46, (-140, 18, -34)), (61, (-38, 8, -42))]),
    (shoulders[1], [(1, (62, -12, 38)), (16, (24, -42, 88)), (31, (124, 16, 28)), (46, (48, -24, 104)), (61, (62, -12, 38))]),
    (hips[0], [(1, (-22, 8, -12)), (16, (-74, 18, 35)), (31, (-32, -14, -38)), (46, (-94, 12, 22)), (61, (-22, 8, -12))]),
    (hips[1], [(1, (38, -8, 18)), (16, (18, -28, -32)), (31, (82, 12, 34)), (46, (28, -18, -45)), (61, (38, -8, 18))]),
]
for rig, poses in pose_sets:
    for frame, rotation in poses:
        key(rig, frame, rotation)

scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 61
scene.render.fps = 30
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out_dir = os.path.join(root_dir, "assets", "models")
os.makedirs(out_dir, exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir, "journey-faller.blend"))
bpy.ops.export_scene.gltf(filepath=os.path.join(out_dir, "journey-faller.glb"), export_format="GLB",
                          export_animations=True, export_apply=True)
