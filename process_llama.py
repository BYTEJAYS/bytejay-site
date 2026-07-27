"""Prepare the supplied llama screenshot and remove its background with rembg."""

from pathlib import Path

from PIL import Image
from rembg import new_session, remove


ROOT = Path(__file__).resolve().parent
SOURCE = Path("/Users/bytejay/Desktop/llama.jpeg")
INPUT = ROOT / "llama.png"
OUTPUT = ROOT / "llama-nobg.png"


def main() -> None:
    with Image.open(SOURCE) as screenshot:
        # Remove the phone/gallery chrome while preserving the complete white canvas.
        llama = screenshot.convert("RGB").crop((0, 188, 720, 1558))
        llama.save(INPUT, "PNG")

    with Image.open(INPUT) as image:
        # u2netp is the compact U2Net model: quick to install and ample for
        # this high-contrast, opaque voxel subject.
        cutout = remove(
            image,
            session=new_session("u2netp"),
            alpha_matting=True,
            alpha_matting_foreground_threshold=245,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=5,
        )
        alpha_box = cutout.getchannel("A").getbbox()
        if alpha_box:
            padding = 16
            left = max(0, alpha_box[0] - padding)
            top = max(0, alpha_box[1] - padding)
            right = min(cutout.width, alpha_box[2] + padding)
            bottom = min(cutout.height, alpha_box[3] + padding)
            cutout = cutout.crop((left, top, right, bottom))
        cutout.save(OUTPUT, "PNG")

    with Image.open(OUTPUT) as result:
        if result.mode != "RGBA":
            raise RuntimeError(f"Expected RGBA output, got {result.mode}")

    print(f"Saved transparent llama to {OUTPUT}")


if __name__ == "__main__":
    main()
