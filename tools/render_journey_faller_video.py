import bpy, math, os
from mathutils import Vector, Quaternion

root=bpy.data.objects.get('Rig Root');spine=bpy.data.objects.get('Spine')
neck=bpy.data.objects.get('Neck')
ls=bpy.data.objects.get('Left Shoulder');rs=bpy.data.objects.get('Right Shoulder')
lh=bpy.data.objects.get('Left Hip');rh=bpy.data.objects.get('Right Hip')
le=bpy.data.objects.get('Left Elbow');re=bpy.data.objects.get('Right Elbow')
lw=bpy.data.objects.get('Left Wrist');rw=bpy.data.objects.get('Right Wrist')
lk=bpy.data.objects.get('Left Knee');rk=bpy.data.objects.get('Right Knee')
la=bpy.data.objects.get('Left Ankle');ra=bpy.data.objects.get('Right Ankle')
rigs=[o for o in (root,spine,neck,ls,rs,lh,rh,le,re,lw,rw,lk,rk,la,ra) if o]
for o in rigs:o.animation_data_clear()
# Keep both arms slightly camera-side so neither palm disappears into the coat.
ls.location.y=-.11;rs.location.y=-.13

# Compound angular momentum: yaw around the vertical axis, pitch around the
# horizontal axis and a smaller screen-facing roll. Every full-axis component
# returns to its starting pose at frame 121, keeping the loop completely seamless.
horizontal_axis=Vector((1,0,0));screen_axis=Vector((0,1,0));vertical_axis=Vector((0,0,1))
start=Quaternion(horizontal_axis,.20) @ Quaternion(vertical_axis,-.24)
frames=121
for f in range(1,frames+1):
    p=(f-1)/(frames-1)*math.tau;s=math.sin(p);c=math.cos(p);s2=math.sin(p*2);c2=math.cos(p*2);gust=math.sin(p*3+.35)
    yaw=p+.14*s
    pitch=p+.11*s2
    roll=.34*s2+.08*math.sin(p*3)
    root.rotation_mode='QUATERNION'
    root.rotation_quaternion=Quaternion(vertical_axis,yaw) @ Quaternion(horizontal_axis,pitch) @ Quaternion(screen_axis,roll) @ start
    root.location=(.09*math.sin(p+.25),.045*c2,-.12*math.sin(p*2-.4))
    root.keyframe_insert('rotation_quaternion',frame=f);root.keyframe_insert('location',frame=f)
    # The torso leads; the neck and paired limbs answer at offset phases to mimic
    # inertia and air resistance instead of moving as one rigid object.
    spine.rotation_euler=(-.18+.15*math.sin(p*2+.4),.12*c,.10*s2);spine.keyframe_insert('rotation_euler',frame=f)
    neck.rotation_euler=(.10*math.sin(p+1.1),-.12*math.sin(p*2+.6),.14*math.sin(p-.45));neck.keyframe_insert('rotation_euler',frame=f)
    ls.rotation_euler=(-.88-.22*math.sin(p+.3)-.06*gust,.70+.11*c,-.38-.16*s2);ls.keyframe_insert('rotation_euler',frame=f)
    rs.rotation_euler=(-1.0+.23*math.sin(p+2.25)+.05*gust,-.72-.10*c,.43+.17*math.sin(p*2+1.1));rs.keyframe_insert('rotation_euler',frame=f)
    lh.rotation_euler=(-.96-.45*math.sin(p+1.0)-.11*gust,.17*c,-.38-.25*s2);lh.keyframe_insert('rotation_euler',frame=f)
    rh.rotation_euler=(1.12+.42*math.sin(p+3.25)+.10*gust,-.16*c,.42+.25*math.sin(p*2+2.0));rh.keyframe_insert('rotation_euler',frame=f)
    le.rotation_euler=(-.76-.34*math.sin(p*2+.8)-.09*gust,.19+.12*s,.10*c);le.keyframe_insert('rotation_euler',frame=f)
    re.rotation_euler=(-.72-.32*math.sin(p*2+2.1)+.08*gust,-.18-.11*s,-.09*c);re.keyframe_insert('rotation_euler',frame=f)
    lw.rotation_euler=(.18*math.sin(p*3+.4),.24*math.sin(p*2+1.2),.27*math.sin(p*3+2.0));lw.keyframe_insert('rotation_euler',frame=f)
    rw.rotation_euler=(-.17*math.sin(p*3+1.3),-.23*math.sin(p*2+2.4),-.25*math.sin(p*3+.7));rw.keyframe_insert('rotation_euler',frame=f)
    lk.rotation_euler=(.92+.55*math.sin(p*2+1.4)+.12*gust,.13*s,.08*c);lk.keyframe_insert('rotation_euler',frame=f)
    rk.rotation_euler=(-.84-.51*math.sin(p*2+2.8)-.11*gust,-.12*s,-.08*c);rk.keyframe_insert('rotation_euler',frame=f)
    la.rotation_euler=(.20*math.sin(p*3+1.8),.10*math.cos(p*2+.2),.28*math.sin(p*2+.7));la.keyframe_insert('rotation_euler',frame=f)
    ra.rotation_euler=(-.19*math.sin(p*3+.5),-.10*math.cos(p*2+1.1),-.27*math.sin(p*2+2.2));ra.keyframe_insert('rotation_euler',frame=f)

scene=bpy.context.scene;scene.frame_start=1;scene.frame_end=frames;scene.render.fps=60
scene.render.engine='BLENDER_EEVEE';scene.render.resolution_x=960;scene.render.resolution_y=640;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGB';scene.render.image_settings.color_depth='8'
scene.render.film_transparent=False
world=scene.world or bpy.data.worlds.new('Black World');scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs['Color'].default_value=(0,0,0,1);world.node_tree.nodes['Background'].inputs['Strength'].default_value=.08

def look_at(obj,point):obj.rotation_euler=(Vector(point)-obj.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(0,-7.45,.1));camera=bpy.context.object;camera.data.lens=56;look_at(camera,(0,0,.02));scene.camera=camera
bpy.ops.object.light_add(type='AREA',location=(-3,-4,5));key=bpy.context.object;key.data.energy=1180;key.data.shape='DISK';key.data.size=4.5;look_at(key,(0,0,0))
bpy.ops.object.light_add(type='AREA',location=(4,-2,1));fill=bpy.context.object;fill.data.energy=760;fill.data.color=(.32,.72,.62);fill.data.size=3.5;look_at(fill,(0,0,0))
bpy.ops.object.light_add(type='AREA',location=(0,2,4));rim=bpy.context.object;rim.data.energy=1020;rim.data.color=(1,.16,.045);rim.data.size=2.8;look_at(rim,(0,0,.3))

root_dir=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));frames_dir='/private/tmp/bytejay-faller-frames';os.makedirs(frames_dir,exist_ok=True)
preview_frame=os.environ.get('JOURNEY_PREVIEW_FRAME')
if preview_frame:
    for value in preview_frame.split(','):
        frame=int(value);scene.frame_set(frame);scene.render.filepath=os.path.join(frames_dir,'preview_%04d.png'%frame);bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath=os.path.join(frames_dir,'frame_')
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(root_dir,'assets','models','journey-faller-render.blend'))
    bpy.ops.render.render(animation=True)
