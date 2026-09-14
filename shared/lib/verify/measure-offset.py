#!/usr/bin/env python3
"""Measure the exact time offset between two recordings of the same take.

Video motion correlation resolves offsets no finer than a frame, and on a
talking head it barely resolves at all. Audio does far better, provided you
correlate the log-energy ENVELOPE rather than the waveform: Descript's
Studio Sound rewrites the waveform while preserving timing, so a
sample-level correlation of a processed export against its original scores
near zero and reads as a mismatch.

Reports speech coverage next to every score, because a correlation computed
over two stretches of silence looks like a confident answer and means
nothing.

Usage: measure-offset.py A B --centre -14.20 --span 0.40
"""
import argparse, subprocess, sys
import numpy as np

SR = 16000
HOP = 0.005          # 5 ms envelope hop -> 5 ms raw resolution
WIN = 0.025
SILENCE_DB = -55.0   # below this a frame carries no speech


def pcm(path):
    """Whole file as mono float32 at SR."""
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-map", "a:0", "-ac", "1",
         "-ar", str(SR), "-f", "f32le", "-"],
        capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


def envelope(x):
    """Log-energy envelope, plus a mask of which frames carry speech."""
    hop, win = int(HOP * SR), int(WIN * SR)
    n = (len(x) - win) // hop
    frames = np.lib.stride_tricks.as_strided(
        x, shape=(n, win), strides=(x.strides[0] * hop, x.strides[0]))
    rms = np.sqrt((frames.astype(np.float64) ** 2).mean(axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    return db, db > SILENCE_DB


def main():
    p = argparse.ArgumentParser()
    p.add_argument("a")
    p.add_argument("b")
    p.add_argument("--centre", type=float, required=True,
                   help="expected offset of B relative to A, seconds")
    p.add_argument("--span", type=float, default=0.40)
    args = p.parse_args()

    ea, ma = envelope(pcm(args.a))
    eb, mb = envelope(pcm(args.b))
    print(f"A: {len(ea)} frames ({len(ea)*HOP:.1f}s), speech {100*ma.mean():.1f}%")
    print(f"B: {len(eb)} frames ({len(eb)*HOP:.1f}s), speech {100*mb.mean():.1f}%")

    lags = np.arange(int(round((args.centre - args.span) / HOP)),
                     int(round((args.centre + args.span) / HOP)) + 1)
    scores, cover = [], []
    for lag in lags:
        # B[i] is compared against A[i + lag]
        lo = max(0, -lag)
        hi = min(len(eb), len(ea) - lag)
        u, v = eb[lo:hi], ea[lo + lag:hi + lag]
        live = mb[lo:hi] | ma[lo + lag:hi + lag]
        u, v = u[live], v[live]
        cover.append(live.mean())
        if len(u) < 100:
            scores.append(np.nan)
            continue
        u = (u - u.mean()) / (u.std() + 1e-9)
        v = (v - v.mean()) / (v.std() + 1e-9)
        scores.append(float((u * v).mean()))

    scores = np.array(scores)
    k = int(np.nanargmax(scores))
    peak = lags[k] * HOP

    # Parabolic interpolation across the peak resolves below the hop.
    if 0 < k < len(scores) - 1:
        y0, y1, y2 = scores[k - 1], scores[k], scores[k + 1]
        denom = y0 - 2 * y1 + y2
        adj = 0.5 * (y0 - y2) / denom if denom != 0 else 0.0
        refined = peak + adj * HOP
    else:
        refined = peak

    print(f"\n{'offset':>9} {'corr':>8} {'speech%':>8}")
    for i in range(max(0, k - 6), min(len(lags), k + 7)):
        mark = "  <== peak" if i == k else ""
        print(f"{lags[i]*HOP:>9.3f} {scores[i]:>8.4f} {100*cover[i]:>7.1f}%{mark}")

    print(f"\nbest offset      : {peak:+.3f}s  (corr {scores[k]:.4f})")
    print(f"sub-hop refined  : {refined:+.3f}s")
    print(f"vs assumed centre: {refined - args.centre:+.3f}s "
          f"({(refined - args.centre)*30:+.2f} frames at 30fps)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
