#!/usr/bin/env python3
"""
Turn raw project screenshots (off the Desktop) into card artwork at a fixed
880x1100 canvas — the size every project card in index.html is generated at
(see build_cards.py's CARD template), so nothing depends on a source photo's
native size or shape.

Two treatments, chosen per image by what's actually in it:

  cover  - straight fill-and-crop to 4:5. Used for full-bleed, roughly
           centered compositions (particle art, graphs) where a crop can't
           slice through anything that matters.

  pad    - "contain" the whole screenshot, uncropped, centered on a blurred,
           darkened copy of itself as a backdrop. Used for wide desktop UI
           screenshots (16:9-ish dashboards) where a 4:5 crop would cut a
           sidebar or a card in half. Nothing about the UI is ever trimmed;
           the backdrop just fills the leftover space instead of bars of
           flat color.

Three of the sources are full desktop screenshots that include the browser's
own title bar / tab strip / address bar at the top (macOS Chrome, ~242px at
this resolution — found by sampling pixel rows for the hard edge into the
page's own background). That strip is stripped before either treatment runs,
so no browser chrome ends up on a project card.

Run after editing SOURCES or the treatment table:

    python3 tools/projects/process_screenshots.py
    python3 tools/projects/build_cards.py
"""
import json
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT_DIR = ROOT / "assets" / "images" / "projects"
DATA = ROOT / "tools" / "projects" / "projects.json"
DESKTOP = pathlib.Path.home() / "Desktop"

CANVAS = (880, 1100)          # matches build_cards.py's hardcoded <img> attrs
CHROME_CROP = 242             # px of macOS Chrome UI to strip from these three

# repo -> (source filename on Desktop, top-crop px, treatment)
SOURCES = {
    "TRANSACTION-GRAPH-ENGINE": ("TGIE.png", CHROME_CROP, "pad"),
    "PERSONAL-REALITY-LAYER":   ("PERSONAL REALITY LAYER.png", 0, "cover"),
    "ascension":                ("ASCENSION.png", 0, "pad"),
    "PROCTOR_APP":              ("PROCTOR APP.png", CHROME_CROP, "pad"),
    "bling-blue-team":          ("BLING BLUE TEAM.png", 0, "cover"),
    "legacy":                   ("LEGACY.png", 0, "pad"),
    "constellation":            ("CONSTELLATION.png", CHROME_CROP, "pad"),
}


def cover_crop(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Scale to fully cover `size`, then centre-crop the overflow."""
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    im2 = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    left = (im2.width - tw) // 2
    top = (im2.height - th) // 2
    return im2.crop((left, top, left + tw, top + th))


def edge_color(im: Image.Image, rows: int = 4) -> tuple[int, int, int]:
    """Average colour of the image's own top and bottom strips — whatever
    background tone the screenshot already fades into at its edges."""
    top = im.crop((0, 0, im.width, rows))
    bottom = im.crop((0, im.height - rows, im.width, im.height))
    strip = Image.new("RGB", (im.width, rows * 2))
    strip.paste(top, (0, 0))
    strip.paste(bottom, (0, rows))
    small = strip.resize((1, 1), Image.BOX)
    return small.getpixel((0, 0))


def pad_contain(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    """Fit the whole image inside `size` with no cropping, centred on a flat
    fill sampled from the screenshot's own top/bottom edge tone. A blurred
    copy of a high-contrast UI (bright icon on near-black, etc.) smears into
    a visible blob at this size, so a solid, exactly-matching colour reads
    far cleaner than trying to fake a soft backdrop."""
    tw, th = size
    canvas = Image.new("RGB", size, edge_color(im))

    scale = min(tw / im.width, th / im.height)
    fg = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    canvas.paste(fg, ((tw - fg.width) // 2, (th - fg.height) // 2))
    return canvas


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    data = json.loads(DATA.read_text())
    by_repo = {p["repo"]: p for p in data["projects"]}

    for repo, (filename, crop_top, mode) in SOURCES.items():
        src = DESKTOP / filename
        if not src.exists():
            print(f"skip {repo}: {src} not found")
            continue
        im = Image.open(src).convert("RGB")
        if crop_top:
            im = im.crop((0, crop_top, im.width, im.height))

        out = cover_crop(im, CANVAS) if mode == "cover" else pad_contain(im, CANVAS)

        out_name = f"{repo.lower()}.webp"
        out_path = OUT_DIR / out_name
        out.save(out_path, "WEBP", quality=88, method=6)
        print(f"{repo:26} {mode:5} <- {filename}  ({im.width}x{im.height} src)  "
              f"-> {out_path.relative_to(ROOT)}  {out_path.stat().st_size // 1024}KB")

        if repo in by_repo:
            by_repo[repo]["image"] = f"assets/images/projects/{out_name}"

    DATA.write_text(json.dumps(data, indent=2) + "\n")
    print(f"\nupdated {DATA.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
