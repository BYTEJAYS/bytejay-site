#!/usr/bin/env python3
"""
Generate neutral placeholder card images for the Projects showcase.

No filters or turbulence: eight of these are 3D-transformed every frame, and
an feTurbulence rasterises far too slowly to carry that.

These are stand-ins only — swap the `image` field in projects.json for real
artwork when it is ready, then re-run build_cards.py. Deliberately plain so
nobody mistakes one for finished work.

    python3 tools/projects/make_placeholders.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "assets" / "images" / "projects"
DATA = ROOT / "tools" / "projects" / "projects.json"

W, H = 880, 1100          # 4:5, matching the card aspect

# muted, cream-adjacent tones so the cards sit in the existing palette
TONES = [
    ("#e8e3da", "#cfc7ba"), ("#e4e6e3", "#c6ccc6"), ("#ece3dc", "#d6c6b8"),
    ("#e2e4e9", "#c3c8d2"), ("#eae6dc", "#d2cab6"), ("#e3e1e6", "#c7c3ce"),
    ("#e7e4dd", "#cdc7ba"), ("#e5e8e6", "#c8d0cb"),
]

SVG = """<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}" role="img" aria-label="Placeholder artwork">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="{a}"/>
      <stop offset="1" stop-color="{b}"/>
    </linearGradient>
  </defs>
  <rect width="{w}" height="{h}" fill="url(#g)"/>
  <g fill="none" stroke="#11111118" stroke-width="2">
    <circle cx="{cx}" cy="{cy}" r="{r1}"/><circle cx="{cx}" cy="{cy}" r="{r2}"/>
  </g>
  <text x="{cx}" y="{ty}" text-anchor="middle" font-family="Archivo, system-ui, sans-serif"
        font-size="{fs}" font-weight="800" fill="#11111124" letter-spacing="-2">{num}</text>
  <text x="{cx}" y="{ly}" text-anchor="middle" font-family="Archivo, system-ui, sans-serif"
        font-size="26" font-weight="700" fill="#11111138" letter-spacing="6">PLACEHOLDER</text>
</svg>
"""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    projects = json.loads(DATA.read_text())["projects"]
    written = []
    for i, _ in enumerate(projects, start=1):
        a, b = TONES[(i - 1) % len(TONES)]
        svg = SVG.format(w=W, h=H, a=a, b=b, cx=W // 2, cy=H // 2,
                         r1=W * 0.30, r2=W * 0.20,
                         ty=H // 2 + 60, fs=230, ly=H // 2 + 140, num=f"{i:02d}")
        path = OUT / f"placeholder-{i:02d}.svg"
        path.write_text(svg)
        written.append(path.name)
    print(f"wrote {len(written)} placeholders to {OUT.relative_to(ROOT)}")
    for name in written:
        print("  " + name)


if __name__ == "__main__":
    main()
