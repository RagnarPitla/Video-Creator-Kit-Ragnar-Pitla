#!/usr/bin/env python3
"""
render_gif.py - turn an animated HTML page into a looping, LinkedIn-safe GIF.

How it works:
  1. Loads the HTML in headless Chromium at 2x scale (text stays crisp after quantization).
  2. Pauses every Web Animation / CSS animation on the page.
  3. Scrubs each animation's currentTime to an exact millisecond per frame and screenshots.
     -> Deterministic frames. No timing jitter, no dropped motion.
  4. Assembles frames with ffmpeg using a single global palette (flat design = tiny files).
  5. If the GIF is over the size budget it retries automatically with fewer colors,
     then fewer frames, then smaller dimensions.

Usage:
  python3 render_gif.py deck.html -o out.gif
  python3 render_gif.py deck.html -o out.gif --duration 7 --fps 12 --width 1080 --height 1350
  python3 render_gif.py deck.html --still 3.5 -o frame.png      # single frame preview

Notes:
  --duration must equal one full loop of your CSS animation cycle or the GIF will jump.
  LinkedIn feed GIFs: <= 5 MB and <= 400 frames, or LinkedIn freezes it on frame one.
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile

PAUSE_JS = """() => {
  document.getAnimations().forEach(a => { try { a.pause(); } catch (e) {} });
}"""

SEEK_JS = """(ms) => {
  document.getAnimations().forEach(a => {
    try {
      a.currentTime = ms;
    } catch (e) {}
  });
}"""


def capture_frames(html_path, out_dir, width, height, duration, fps, scale, still=None):
    from playwright.sync_api import sync_playwright

    url = "file://" + os.path.abspath(html_path)
    # Capture on the SECOND iteration. Elements with animation-delay are then in
    # steady state, so frame 0 and frame N-1 join seamlessly.
    offset = duration * 1000.0
    times = [offset + still * 1000.0] if still is not None else [
        offset + (i / fps) * 1000.0 for i in range(int(round(duration * fps)))
    ]

    paths = []
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--force-color-profile=srgb",
                                          "--disable-lcd-text"])
        page = browser.new_page(
            viewport={"width": width, "height": height},
            device_scale_factor=scale,
        )
        page.goto(url, wait_until="load")
        page.wait_for_timeout(400)
        page.evaluate("() => document.fonts.ready")
        page.wait_for_timeout(200)
        page.evaluate(PAUSE_JS)

        for i, ms in enumerate(times):
            page.evaluate(SEEK_JS, ms)
            fp = os.path.join(out_dir, f"f{i:04d}.png")
            page.screenshot(path=fp)
            paths.append(fp)
        browser.close()
    return paths


def build_gif(frame_dir, out_path, fps, width, height, colors, dither):
    palette = os.path.join(frame_dir, "palette.png")
    vf_scale = f"scale={width}:{height}:flags=lanczos"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
         "-i", os.path.join(frame_dir, "f%04d.png"),
         "-vf", f"{vf_scale},palettegen=max_colors={colors}:stats_mode=diff",
         palette], check=True)
    dither_arg = "bayer:bayer_scale=5" if dither else "none"
    subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-framerate", str(fps),
         "-i", os.path.join(frame_dir, "f%04d.png"), "-i", palette,
         "-lavfi", f"{vf_scale}[x];[x][1:v]paletteuse=dither={dither_arg}:diff_mode=rectangle",
         "-loop", "0", out_path], check=True)
    return os.path.getsize(out_path) / 1e6


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("html")
    ap.add_argument("-o", "--out", default="out.gif")
    ap.add_argument("--width", type=int, default=1080)
    ap.add_argument("--height", type=int, default=1350)
    ap.add_argument("--duration", type=float, default=6.0, help="seconds, one full loop")
    ap.add_argument("--fps", type=int, default=12)
    ap.add_argument("--scale", type=int, default=2, help="render supersample factor")
    ap.add_argument("--colors", type=int, default=128)
    ap.add_argument("--dither", action="store_true", help="on for gradients, off for flat design")
    ap.add_argument("--max-mb", type=float, default=4.6)
    ap.add_argument("--still", type=float, default=None, help="capture one PNG at time t (s)")
    ap.add_argument("--keep-frames", action="store_true")
    args = ap.parse_args()

    tmp = tempfile.mkdtemp(prefix="gifframes_")
    try:
        if args.still is not None:
            capture_frames(args.html, tmp, args.width, args.height,
                           args.duration, args.fps, args.scale, still=args.still)
            shutil.copy(os.path.join(tmp, "f0000.png"), args.out)
            print(f"still -> {args.out}")
            return

        n = int(round(args.duration * args.fps))
        if n > 400:
            sys.exit(f"{n} frames exceeds LinkedIn's 400-frame ceiling. Lower --fps or --duration.")
        print(f"capturing {n} frames at {args.fps} fps ({args.duration}s loop)...")
        capture_frames(args.html, tmp, args.width, args.height,
                       args.duration, args.fps, args.scale)

        w, h, colors, fps = args.width, args.height, args.colors, args.fps
        size = build_gif(tmp, args.out, fps, w, h, colors, args.dither)
        for colors_try in (96, 64, 48):
            if size <= args.max_mb:
                break
            colors = colors_try
            size = build_gif(tmp, args.out, fps, w, h, colors, args.dither)
        while size > args.max_mb and w > 720:
            w = int(w * 0.85) // 2 * 2
            h = int(h * 0.85) // 2 * 2
            size = build_gif(tmp, args.out, fps, w, h, colors, args.dither)

        print(f"{args.out}  {size:.2f} MB  {w}x{h}  {n} frames  {colors} colors")
        if size > args.max_mb:
            print("WARNING: still over budget. Cut motion area or shorten the loop.")
    finally:
        if args.keep_frames:
            print(f"frames kept in {tmp}")
        else:
            shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
