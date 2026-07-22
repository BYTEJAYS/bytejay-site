from pathlib import Path
from PIL import Image

frames_dir=Path('/private/tmp/bytejay-faller-frames')
paths=sorted(frames_dir.glob('frame_*.png'))[:121]
if len(paths)!=121:raise RuntimeError(f'Expected 121 frames, found {len(paths)}')
# Frame 121 is the same pose as frame 1. Omitting it removes the loop hitch.
frames=[Image.open(p).convert('RGB') for p in paths[:-1]]
out=Path(__file__).resolve().parents[1]/'assets'/'models'/'journey-faller.webp'
frames[0].save(out,format='WEBP',save_all=True,append_images=frames[1:],duration=17,loop=0,quality=90,method=6,minimize_size=True)
print(f'{out} ({out.stat().st_size} bytes)')
