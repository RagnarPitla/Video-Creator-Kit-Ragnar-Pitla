#!/usr/bin/env python3
"""Turn a hand-written cut table into a resolved edit decision list.

Two halves. CUTS is per-episode and is the only thing you edit. The refinement
pass below is universal and encodes the rules that stop an edit looking wrong:

  - never hold on one host while the other is the one talking
  - but never cut to backchannel ("okay", "mm-hmm") - that reads as a glitch
  - never emit a shot too short to register
  - break up very long single-layout stretches so they do not feel like a
    voiceover over a screen recording

Writes edl.json. Prints a layout breakdown, a coverage check and any shot that
looks too short, so problems surface here rather than after a long render.

Usage: edl.py <root>
"""
import json, os, sys

MIN_SEG = 3.5       # shortest shot that reads as a decision rather than a glitch
BACKCHANNEL = 1.8   # a turn shorter than this is "okay"/"mm-hmm" - do not cut to it
LEAD = 0.3          # cut this long before the turn starts, so the shot is up first


# ---------------------------------------------------------------------------
# PER-EPISODE. Everything above this line stays the same between episodes.
# ---------------------------------------------------------------------------
# (start_seconds, layout, anim_offset_or_None, note)
#
# Layouts: DUO, SOLO_A, SOLO_B, DEMO, ANIM_DUO, ANIM_FULL
# anim_offset is where to start reading the animation, in seconds. Pick offsets
# from the SAFE INTERIOR of a scene, clear of its crossfades, or the cutaway
# opens on a half-faded frame.
#
# Open the episode in ANIM_DUO, not ANIM_FULL. A cold open with no people in it
# looks like a corporate bumper. The hosts are the show.

CUTS = [
    (0.0, "ANIM_DUO", 0.0, "cold open: title card, both hosts visible"),
    # ... one row per cut ...
]

END = None          # episode length in seconds; None = read from show.json
ANIM = {}           # optional: {"scene_name": (start, end)} safe interiors
# ---------------------------------------------------------------------------


def _turns(root, who, lo, hi, minlen):
    sp = json.load(open(os.path.join(root, "speech.json")))[who]
    out = []
    for a, b in sp:
        a, b = max(a, lo), min(b, hi)
        if b - a >= minlen:
            out.append((a, b))
    return out


def refine(root, segs, keys):
    """Cut to the two-shot whenever the person on screen is not the person
    talking, and break up very long stretches.

    The threshold on how long a solo shot must be before the rule applies is
    ZERO on purpose. An earlier version only guarded shots over 45 seconds, and
    a 25-second shot held on one host for four seconds while the other one was
    mid-sentence. Length has nothing to do with whether the wrong face is up."""
    A, B = keys
    rules = [
        # layout,  min seg dur, other host, min turn,     min kept, min new shot
        ("DEMO",         70.0,  B,          3.0,          6.0,      MIN_SEG),
        ("SOLO_A",        0.0,  B,          BACKCHANNEL,  2.5,      2.2),
        ("SOLO_B",        0.0,  A,          BACKCHANNEL,  2.5,      2.2),
    ]
    out = []
    for s in segs:
        rule = next((r for r in rules
                     if r[0] == s["layout"] and s["dur"] > r[1]), None)
        if not rule:
            out.append(s); continue
        _, _, who, minlen, minkeep, minshot = rule
        pos, pieces = s["start"], []
        for a, b in _turns(root, who, s["start"], s["end"], minlen):
            a, b = max(s["start"], a - LEAD), min(s["end"], b + LEAD)
            if b - a < minshot or a < pos:
                continue
            if b - a < MIN_SEG:
                # Hold the two-shot to the floor rather than dropping the cut.
                # Sitting on a two-shot slightly too long is invisible; a
                # 2-second flash is not.
                b = min(s["end"], a + MIN_SEG)
            if a - pos < minkeep:
                # The turn opens on or near the shot boundary, so the leading
                # sliver would be a sub-second flash of the wrong face. Hand it
                # to the two-shot instead of skipping the cut entirely - this is
                # the case that produced the complaint.
                a = pos
            else:
                pieces.append((pos, a, s["layout"], s["anim"], s["note"]))
            pieces.append((a, b, "DUO", None, s["note"] + " [both: other host talks]"))
            pos = b
        if s["end"] - pos >= minkeep or not pieces:
            pieces.append((pos, s["end"], s["layout"], s["anim"], s["note"]))
        elif pieces:
            a, _, L, An, N = pieces[-1]
            pieces[-1] = (a, s["end"], L, An, N)
        for a, b, L, An, N in pieces:
            out.append({"start": a, "end": b, "dur": b - a,
                        "layout": L, "anim": An, "note": N})
    return merge_duo(out)


def merge_duo(segs):
    """Coalesce touching DUO shots. A reaction cut landing on the edge of an
    existing DUO otherwise produces two adjacent identical shots: an invisible
    cut that still costs an encode and clutters the shot list.

    Restricted to DUO deliberately. Fusing two long DEMO blocks would look the
    same but needlessly re-renders minutes of footage already on disk."""
    out = []
    for s in segs:
        p = out[-1] if out else None
        if p and p["layout"] == s["layout"] == "DUO" \
                and abs(p["end"] - s["start"]) < 1e-6:
            p["end"], p["dur"] = s["end"], s["end"] - p["start"]
        else:
            out.append(dict(s))
    return out


def build(root, cuts=CUTS, end=END, do_refine=True):
    cfg = json.load(open(os.path.join(root, "show.json")))
    keys = [h["key"] for h in cfg["hosts"]]
    if end is None:
        end = cfg["duration"]
    segs = []
    for i, (start, layout, anim, note) in enumerate(cuts):
        e = cuts[i + 1][0] if i + 1 < len(cuts) else end
        segs.append({"start": start, "end": e, "dur": e - start,
                     "layout": layout, "anim": anim, "note": note})
    if do_refine:
        segs = refine(root, segs, keys)
    for i, s in enumerate(segs):
        s["i"] = i
        for k in ("start", "end", "dur"):
            s[k] = round(s[k], 3)
    return segs


def report(root, segs):
    total = sum(s["dur"] for s in segs)
    print(f"{len(segs)} segments, {total:.1f}s ({total/60:.1f} min)")
    by = {}
    for s in segs:
        d, n = by.get(s["layout"], (0, 0))
        by[s["layout"]] = (d + s["dur"], n + 1)
    for L, (d, n) in sorted(by.items(), key=lambda kv: -kv[1][0]):
        print(f"  {L:9s} {n:3d} cuts {d:7.1f}s {100*d/total:5.1f}%")

    gaps = [(a["end"], b["start"]) for a, b in zip(segs, segs[1:])
            if abs(a["end"] - b["start"]) > 1e-6]
    if gaps:
        print("\n!! GAPS / OVERLAPS:", gaps[:5])

    short = [s for s in segs if s["dur"] < 3.0]
    if short:
        print("\nSHOTS UNDER 3s (these will read as glitches):")
        for s in short:
            print(f"  {s['i']:3d} {s['layout']} {s['dur']:.1f}s {s['note'][:48]}")

    # A shot that outruns the animation shows a frozen last frame.
    sp = json.load(open(os.path.join(root, "speech.json")))
    wrong = 0.0
    A, B = [h["key"] for h in json.load(open(os.path.join(root, "show.json")))["hosts"]]
    for s in segs:
        if s["layout"] not in ("SOLO_A", "SOLO_B"):
            continue
        other = B if s["layout"] == "SOLO_A" else A
        for a, b in sp[other]:
            d = min(b, s["end"]) - max(a, s["start"])
            if d >= 1.0:
                wrong += d
    print(f"\nwrong-face time remaining: {wrong:.1f}s "
          f"(backchannel only, under {BACKCHANNEL}s each, is expected and correct)")


if __name__ == "__main__":
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    segs = build(root)
    json.dump(segs, open(os.path.join(root, "edl.json"), "w"), indent=1)
    report(root, segs)
