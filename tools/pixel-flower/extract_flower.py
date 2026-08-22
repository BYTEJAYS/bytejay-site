"""
Rebuild the pixel-art bouquet from its reference screenshot.

The reference is already pixel art, but it had been resampled, so its blocks
were no longer flat colour and its edges were soft. Rather than trace it by
hand, this recovers the ORIGINAL grid and re-renders it crisply.

Finding the grid is the whole trick. Within-block colour variance is not a
usable score — it always falls as blocks get smaller, so it just picks the
minimum size. Instead this histograms where strong colour transitions land
modulo a candidate block size: on the true size the transitions pile up on the
block boundaries. That gave 41.5% concentration at 19px versus ~16% for every
neighbour, which is unambiguous.

The other trap is deciding which cells are artwork. Keying on saturation drops
the dark brown flower centre, because brown that dark is barely saturated — the
centre came out as a white hole. So this asks "is this the canvas?" instead:
the paper is near-white and the faint grid is a pale grey, and anything
meaningfully darker or more colourful is art.

    python3 tools/pixel-flower/extract_flower.py ~/Desktop/museflower.png
"""
import collections
import sys

from PIL import Image

BLOCK = 19                 # measured, see above
ORIGIN_X, ORIGIN_Y = 52, 14
SCALE = 14                 # output device-px per art pixel
OUT = "assets/images/pixel-flower"


def is_art(p):
    r, g, b = p
    mx, mn = max(p), min(p)
    if mx >= 232 and (mx - mn) <= 14:
        return False       # paper
    if mx >= 222 and (mx - mn) <= 8:
        return False       # grid line
    return (mx - mn) > 26 or mx < 215


def main(path):
    src = Image.open(path).convert("RGB")
    px = src.load()
    W, H = src.size
    cols = (W - ORIGIN_X) // BLOCK
    rows = (H - ORIGIN_Y) // BLOCK

    grid = Image.new("RGBA", (cols, rows), (0, 0, 0, 0))
    out = grid.load()
    for cy in range(rows):
        for cx in range(cols):
            x0, y0 = ORIGIN_X + cx * BLOCK, ORIGIN_Y + cy * BLOCK
            votes = collections.Counter()
            art = tot = 0
            for dy in range(3, BLOCK - 2, 2):
                for dx in range(3, BLOCK - 2, 2):
                    x, y = x0 + dx, y0 + dy
                    if 0 <= x < W and 0 <= y < H:
                        p = px[x, y]
                        tot += 1
                        if is_art(p):
                            art += 1
                            votes[(p[0] // 6 * 6, p[1] // 6 * 6, p[2] // 6 * 6)] += 1
            # A low coverage bar keeps thin diagonal leaves from breaking into
            # scattered dots; the modal colour keeps each cell flat.
            if tot and art / tot > 0.42 and votes:
                out[cx, cy] = (*votes.most_common(1)[0][0], 255)

    grid = grid.crop(grid.getbbox())
    big = grid.resize((grid.width * SCALE, grid.height * SCALE), Image.NEAREST)
    big.save(OUT + ".png")
    big.save(OUT + ".webp", "WEBP", quality=92, method=6, lossless=True)
    print(f"grid {grid.width}x{grid.height} -> {big.size} written to {OUT}.webp")


main(sys.argv[1] if len(sys.argv) > 1 else "~/Desktop/museflower.png")
