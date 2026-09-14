#!/usr/bin/env python3
"""Carry rendered segments forward into a revised edit.

THE HAZARD THIS EXISTS TO PREVENT: changing the cut list renumbers every
segment after the change. Reusing rendered files by index after that assembles
the wrong footage in the wrong order, and the result plays back without any
error at all - it is simply a different, broken edit. Nothing downstream will
catch it. The frame count still matches. The gate still passes.

So match by content. A segment is the same segment if its start, end, layout
and animation offset are unchanged. Everything else must be re-rendered.

Usage:
  revise.py <root>            after editing edl.py and rebuilding edl.json

Expects the PREVIOUS edl.json saved as edl-prev.json. Prints the indices that
still need rendering, which you pass straight to render.py.
"""
import json, os, shutil, sys


def key(s):
    return (round(s["start"], 2), round(s["end"], 2), s["layout"], s["anim"])


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    prev_p = os.path.join(root, "edl-prev.json")
    if not os.path.exists(prev_p):
        raise SystemExit("no edl-prev.json - copy the approved edl.json to it "
                         "BEFORE rebuilding, or there is nothing to reuse")
    prev = json.load(open(prev_p))
    cur = json.load(open(os.path.join(root, "edl.json")))
    for i, s in enumerate(prev):
        s["i"] = i
    for i, s in enumerate(cur):
        s["i"] = i
        s["dur"] = round(s["end"] - s["start"], 2)
    json.dump(cur, open(os.path.join(root, "edl.json"), "w"), indent=1)

    segdir = os.path.join(root, "seg")
    olddir = os.path.join(root, "seg-prev")
    if os.path.isdir(segdir) and not os.path.isdir(olddir):
        shutil.move(segdir, olddir)
    os.makedirs(segdir, exist_ok=True)

    old = {key(s): s["i"] for s in prev}
    reuse, todo, missing = 0, [], []
    for s in cur:
        src = old.get(key(s))
        if src is None:
            todo.append(s["i"]); continue
        p = os.path.join(olddir, f"s{src:03d}.mp4")
        if not os.path.exists(p):
            missing.append(s["i"]); todo.append(s["i"]); continue
        shutil.copy2(p, os.path.join(segdir, f"s{s['i']:03d}.mp4"))
        reuse += 1

    print(f"{len(cur)} segments: {reuse} reused, {len(todo)} to render")
    if missing:
        print(f"  ({len(missing)} matched the previous cut but had no file on disk)")
    print("\nchanged shots:")
    for s in cur:
        if s["i"] in todo:
            m, x = divmod(int(s["start"]), 60)
            print(f"  #{s['i']:02d} {m:02d}:{x:02d} {s['layout']:9s} "
                  f"{s['dur']:6.2f}s  {s['note'][:50]}")
    print("\nnext:  render.py <root> " + " ".join(map(str, todo)))


if __name__ == "__main__":
    main()
