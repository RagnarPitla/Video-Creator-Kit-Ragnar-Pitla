#!/usr/bin/env python3
"""Build the frame chrome and name plates as PNGs with alpha.

Drawn once as images rather than as ffmpeg drawtext filters, because a filter
graph that also renders text is far slower per segment and much harder to
inspect. These are static; render them once and overlay them.

Two plate sizes per host: full for DUO and SOLO, small for the DEMO and
ANIM_DUO left column.

Usage: gfx.py <root>
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

W, H = 1920, 1080
TOP, BOT = 64, 56

HEAD_CANDIDATES = [
    "/Library/Fonts/PressStart2P-Regular.ttf",
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
]
BODY_CANDIDATES = [
    "/Library/Fonts/IBMPlexMono-Regular.ttf",
    "/System/Library/Fonts/Menlo.ttc",
]


def font(cands, size):
    for p in cands:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def chrome(cfg, out):
    """Top and bottom bars. Transparent in the middle so footage shows through."""
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    bar = cfg.get("bar_color", "#0b3a8f")
    d.rectangle([0, 0, W, TOP], fill=bar)
    d.rectangle([0, H - BOT, W, H], fill=bar)

    fh, fb = font(HEAD_CANDIDATES, 20), font(BODY_CANDIDATES, 24)
    d.text((24, TOP // 2), cfg["brand"], font=fh, fill="#ffffff", anchor="lm")
    t = cfg["title"]
    d.text((W - 24, TOP // 2), t, font=fb, fill="#cfe0ff", anchor="rm")
    if cfg.get("footer_left"):
        d.text((24, H - BOT // 2), cfg["footer_left"], font=fb,
               fill="#ffffff", anchor="lm")
    if cfg.get("footer_right"):
        d.text((W - 24, H - BOT // 2), cfg["footer_right"], font=fb,
               fill="#7fb0ff", anchor="rm")
    im.save(out)
    return im


def plate(name, colour, out, small=False):
    """Name plate: a solid chip with the host name knocked out in black."""
    fs = 14 if small else 18
    f = font(HEAD_CANDIDATES, fs)
    pad = 6 if small else 9
    tmp = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    box = tmp.textbbox((0, 0), name, font=f)
    w, h = box[2] - box[0] + pad * 2, box[3] - box[1] + pad * 2
    im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, w, h], fill=colour)
    d.text((pad - box[0], pad - box[1]), name, font=f, fill="#000000")
    im.save(out)


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    cfg = json.load(open(os.path.join(root, "show.json")))
    g = os.path.join(root, "gfx")
    os.makedirs(g, exist_ok=True)

    chrome(cfg, os.path.join(g, "chrome.png"))
    print("  chrome.png")
    for h in cfg["hosts"]:
        plate(h["name"], h["color"], os.path.join(g, f"nm-{h['key']}.png"))
        plate(h["name"], h["color"], os.path.join(g, f"nm-{h['key']}-s.png"), small=True)
        print(f"  nm-{h['key']}.png  nm-{h['key']}-s.png")
    print(f"\nwrote {g}")
    print("Open chrome.png over a sample frame before rendering 40 segments "
          "with the wrong title on them.")


if __name__ == "__main__":
    main()
