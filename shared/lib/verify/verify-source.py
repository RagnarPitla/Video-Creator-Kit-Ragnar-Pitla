#!/usr/bin/env python3
"""Verify a rebuilt camera source against the original it must replace.

Three independent checks, because each catches what the others miss:

  1. BLACK SCAN -- ffmpeg's blackdetect over the whole file, in one
     decode pass. Sampling every N seconds is not good enough: a gap
     shorter than the step falls between probes and the file passes.
     This check exists because a Descript export arrived with 19.5s of
     black in it, which the duration, the frame count and the audio
     alignment all reported as perfectly healthy.

  2. COARSE ALIGNMENT -- static-frame correlation at large offsets.
     Discriminates the failure that actually happens when splicing:
     a whole-file shift of seconds, from a wrong sign or a missed trim.

  3. FINE ALIGNMENT -- motion-signature correlation at sub-second offsets.
     Static frames are useless here: a person sitting still scores ~0.999
     against themselves half a second later, so a static-frame test at
     this scale reads noise in the third decimal. Differencing two frames
     0.2s apart leaves only what moved, which is distinctive.

     CAVEAT: if the rebuilt source was frame-rate converted (e.g. 28.583
     -> 30fps), duplicated frames distort the motion map and drag the peak
     off centre by a frame or so. That reads as a timing error and is not
     one. Confirm any offset this check reports against measure-offset.py,
     which correlates audio and resolves to a few milliseconds.

Usage: verify-source.py REBUILT ORIGINAL [--probes N]
"""
import argparse, io, subprocess, sys
import numpy as np
from PIL import Image

COARSE = [-14.2, -1.0, -0.5, 0.0, 0.5, 1.0, 14.2]
FINE = [round(-0.4 + 0.1 * i, 1) for i in range(9)]
MOTION_DT = 0.2


def grab(path, t, size=(160, 90)):
    """One frame as a float32 greyscale array, or None if it cannot be read."""
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-ss", f"{t:.3f}", "-i", path,
         "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"],
        capture_output=True).stdout
    if not out:
        return None
    # Resize is mandatory, not cosmetic: the rebuilt source and the
    # original are different resolutions, and comparing them at native
    # size raises a broadcast error rather than a wrong answer.
    im = Image.open(io.BytesIO(out)).convert("L").resize(size)
    return np.asarray(im, dtype=np.float32)


def norm(a):
    return (a - a.mean()) / (a.std() + 1e-6)


def motion(path, t):
    """What moved between t and t+MOTION_DT, normalised. None if unreadable."""
    a, b = grab(path, t), grab(path, t + MOTION_DT)
    if a is None or b is None:
        return None
    d = np.abs(b - a)
    if d.std() < 1e-3:
        return None
    return norm(d)


def corr(a, b):
    return float((a * b).mean()) if a is not None and b is not None else float("nan")


def scan_black(path):
    """Every black interval in the file, via one blackdetect decode pass."""
    print(f"\n[1] BLACK SCAN  ({path.split('/')[-1]}, full decode)")
    p = subprocess.run(
        ["ffmpeg", "-v", "info", "-i", path,
         "-vf", "blackdetect=d=0.2:pix_th=0.10", "-an", "-f", "null", "-"],
        capture_output=True, text=True)
    hits = [l for l in p.stderr.splitlines() if "black_start" in l]
    if hits:
        print(f"    {len(hits)} black interval(s) -- source is NOT usable as-is:")
        for h in hits[:20]:
            print("      " + h.split("]", 1)[-1].strip())
    else:
        print("    none -- no black anywhere in the file")
    return not hits


def align(new, old, probes, offsets, mode):
    """Peak must land on 0.0 at every probe, and must be a real peak."""
    label = {"static": "[2] COARSE ALIGNMENT (static frames)",
             "motion": "[3] FINE ALIGNMENT (motion signature)"}[mode]
    print(f"\n{label}")
    print(f"{'t':>7} | " + " ".join(f"{o:>+6.2f}" for o in offsets) + " |  peak   margin")
    print("-" * (12 + 7 * len(offsets) + 16))
    bad = 0
    for t in probes:
        ref = norm(grab(new, t)) if mode == "static" else motion(new, t)
        if ref is None:
            print(f"{t:>7.0f} | (no usable signal in rebuilt source -- skipped)")
            continue
        scores = []
        for o in offsets:
            cmp_ = norm(grab(old, t + o)) if mode == "static" else motion(old, t + o)
            scores.append(corr(ref, cmp_))
        if np.all(np.isnan(scores)):
            print(f"{t:>7.0f} | (no usable signal in original -- skipped)")
            continue
        order = np.argsort(np.nan_to_num(scores, nan=-9))[::-1]
        peak = offsets[order[0]]
        # Margin over the best offset that is not adjacent to the peak: a
        # sharp peak means the score is telling us something.
        rivals = [scores[i] for i in order[1:]
                  if abs(offsets[i] - peak) > 0.15 and not np.isnan(scores[i])]
        margin = scores[order[0]] - max(rivals) if rivals else float("nan")
        ok = peak == 0.0
        bad += not ok
        print(f"{t:>7.0f} | " + " ".join(f"{s:>6.3f}" for s in scores) +
              f" | {peak:>+5.2f} {margin:>7.3f} {'' if ok else '  <-- OFF'}")
    print(f"    off-centre peaks: {bad}")
    return bad == 0


def main():
    p = argparse.ArgumentParser()
    p.add_argument("new")
    p.add_argument("old")
    p.add_argument("--probes", type=int, default=12)
    a = p.parse_args()

    dur = float(subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration",
         "-of", "csv=p=0", a.new], capture_output=True, text=True).stdout.strip())
    print(f"rebuilt : {a.new}")
    print(f"original: {a.old}")
    print(f"duration: {dur:.2f}s")

    # Keep probes clear of both ends so +/-14.2s stays inside both files.
    lo, hi = 20.0, dur - 20.0
    probes = [lo + (hi - lo) * i / (a.probes - 1) for i in range(a.probes)]

    ok_black = scan_black(a.new)
    ok_coarse = align(a.new, a.old, probes, COARSE, "static")
    ok_fine = align(a.new, a.old, probes, FINE, "motion")

    print("\n" + "=" * 60)
    for name, ok in (("black scan", ok_black),
                     ("coarse alignment", ok_coarse),
                     ("fine alignment", ok_fine)):
        print(f"  {name:20s} {'PASS' if ok else 'FAIL'}")
    allok = ok_black and ok_coarse and ok_fine
    print("=" * 60)
    print("VERDICT:", "PASS" if allok else "FAIL")
    sys.exit(0 if allok else 1)


if __name__ == "__main__":
    main()
