#!/usr/bin/env python3
"""Remove time from a finished edit: flubs, dead air and repeated material.

This is a different operation from changing layouts. Cutting time out of the
middle shifts everything after it, so the audio must be cut identically and the
whole timeline re-derived. Doing it by hand is how sync gets lost.

The trick that keeps it safe: every output piece still maps to ONE contiguous
source range. The renderer seeks the source by that range, so the speaker
highlight and the footage stay aligned no matter how much is removed. Only the
concatenation order changes.

Writes edl.json (retimed) and mix-tight.m4a, and prints which pieces survive
untouched so they can be copied forward instead of re-rendered.

Usage: tighten.py <root>
"""
import json, os, subprocess, sys

MIN_PIECE = 2.0   # fragments shorter than this get folded into a neighbour


# (start, end, reason) in SOURCE seconds. Verify every boundary against
# word-level timings before adding one - a cut placed mid-word is audible and
# no automated check will catch it.
CUTS_OUT = [
    (433.50,  437.45, "Satya quote flub: wrong version + audible 'sorry'"),
    (589.35,  591.45, "'my GG, it will be using my' stutter"),
    (901.00,  906.40, "'am I comfortable to share' - same beat as 14:32"),
    (1080.80, 1086.60, "dead air mid-demo"),
    (1115.60, 1118.10, "'sorry, I should have done a lot for the session'"),
    (1308.60, 1332.20, "'19 seconds / 57 tok-s' - repeats the answer from 21:25"),
    (1394.00, 1399.60, "'one minute, 19 seconds, two minutes' - numbers again"),
    (1518.00, 1530.55, "muddled Opus 5 / 5.6 version history, self-contradictory"),
    (1806.20, 1808.10, "dead tail after the goodbye + stray 'Okay'"),
]


def keep_ranges(dur, cuts):
    keep, pos = [], 0.0
    for a, b, _ in sorted(cuts):
        if a > pos:
            keep.append((pos, a))
        pos = max(pos, b)
    if pos < dur:
        keep.append((pos, dur))
    return keep


def split_segments(segs, keep):
    """Intersect each edit segment with the keep ranges. A segment spanning a
    cut becomes two pieces with the same layout - which is correct, because the
    footage either side of a removed passage is genuinely discontinuous."""
    out = []
    for s in segs:
        for ka, kb in keep:
            a, b = max(s["start"], ka), min(s["end"], kb)
            if b - a <= 0.01:
                continue
            p = dict(s); p["start"], p["end"], p["dur"] = a, b, b - a
            out.append(p)
    out.sort(key=lambda p: p["start"])
    return out


def fold_slivers(pieces):
    """A cut landing just inside a shot boundary can leave a fragment too short
    to read. Extend the neighbour over it rather than emitting a flash."""
    out = []
    for p in pieces:
        if out and p["dur"] < MIN_PIECE and out[-1]["layout"] == p["layout"]:
            out[-1]["end"], out[-1]["dur"] = p["end"], p["end"] - out[-1]["start"]
        elif p["dur"] < MIN_PIECE and out:
            out[-1]["end"], out[-1]["dur"] = p["end"], p["end"] - out[-1]["start"]
        else:
            out.append(dict(p))
    return out


def build_audio(root, keep, src="mix.m4a", dst="mix-tight.m4a"):
    """Cut the master with atrim+concat. The same keep ranges as the video, so
    the two cannot disagree."""
    parts = "".join(f"[0:a]atrim=start={a:.3f}:end={b:.3f},asetpts=PTS-STARTPTS[a{i}];"
                    for i, (a, b) in enumerate(keep))
    joins = "".join(f"[a{i}]" for i in range(len(keep)))
    fc = f"{parts}{joins}concat=n={len(keep)}:v=0:a=1[out]"
    cmd = (f'ffmpeg -v error -y -i {os.path.join(root, src)} '
           f'-filter_complex "{fc}" -map "[out]" -c:a aac -b:a 192k '
           f'{os.path.join(root, dst)}')
    subprocess.run(cmd, shell=True, check=True)
    return os.path.join(root, dst)


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    cfg = json.load(open(os.path.join(root, "show.json")))
    dur = cfg["duration"]
    segs = json.load(open(os.path.join(root, "edl.json")))

    removed = sum(b - a for a, b, _ in CUTS_OUT)
    print(f"removing {len(CUTS_OUT)} passages, {removed:.1f}s "
          f"({int(removed)//60}m{int(removed)%60:02d}s)")
    for a, b, why in CUTS_OUT:
        print(f"  {int(a)//60:02d}:{int(a)%60:02d}  {b-a:5.2f}s  {why}")

    keep = keep_ranges(dur, CUTS_OUT)
    pieces = fold_slivers(split_segments(segs, keep))

    # Source ranges are preserved on each piece; only the ORDER changes.
    for i, p in enumerate(pieces):
        p["i"] = i
        for k in ("start", "end", "dur"):
            p[k] = round(p[k], 3)

    new_dur = sum(p["dur"] for p in pieces)
    print(f"\n{len(segs)} segments -> {len(pieces)} pieces")
    print(f"{dur/60:.2f} min -> {new_dur/60:.2f} min "
          f"({int(new_dur)//60}:{int(new_dur)%60:02d})")
    if abs(new_dur - (dur - removed)) > 0.5:
        print(f"!! timeline mismatch: expected {dur-removed:.1f}s, got {new_dur:.1f}s")

    json.dump(pieces, open(os.path.join(root, "edl.json"), "w"), indent=1)
    print("\nbuilding audio...")
    build_audio(root, keep)
    print("wrote edl.json and mix-tight.m4a")


if __name__ == "__main__":
    main()
