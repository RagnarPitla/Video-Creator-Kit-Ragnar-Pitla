#!/usr/bin/env python3
"""Edit decision list for In Our AI Era - Ep. Local Models (Scout Local).

Layouts
  ANIM_FULL  animation full frame (it carries its own DOS chrome)
  DUO        both hosts side by side
  SOLO_R     Ragnar full
  SOLO_T     Tina full
  DEMO       hosts stacked left, screen share right
  ANIM_DUO   hosts stacked left, animation (chrome cropped) right

Animation scene offsets come from the TransitionSeries in
src/InOurAiEra.tsx: 13 scenes, 12-frame linear transitions that overlap,
so start[i] = start[i-1] + dur[i-1] - 12. Values below are the safe
interior of each scene, clear of the crossfades.
"""

END = 1808.1

ANIM = {
    "boot":        (0.0,  4.6),
    "title":       (5.0,  9.2),
    "gguf":        (9.6,  16.8),
    "pipeline":    (17.2, 24.4),
    "huggingface": (24.8, 31.0),
    "openweights": (31.4, 38.6),
    "quote":       (39.0, 44.2),
    "scoutdemo":   (44.6, 52.8),
    "whylocal":    (53.2, 62.4),
    "speed":       (62.8, 70.0),
    "parameters":  (70.4, 77.6),
    "takeaways":   (78.0, 86.2),
    "outro":       (86.6, 92.2),
}

# (start, layout, anim_start_or_None, note)
CUTS = [
    # ---- ACT 1: concepts. Screen is frozen on an idle window until 7:00,
    #      so nothing here uses DEMO.
    (0.0,    "ANIM_DUO",  0.0,  "cold open: boot + title, both hosts on screen from frame one"),
    (9.6,    "DUO",       None, "0:09 both - topic set up"),
    (20.5,   "SOLO_T",    None, "0:21 Tina - excited, asks for concept of the week"),
    (45.5,   "DUO",       None, "0:45 handover"),
    (50.0,   "ANIM_DUO",  9.6,  "0:50 GGUF card - 'a standard called GGUF'"),
    (57.5,   "SOLO_R",    None, "0:57 Ragnar explains the format"),
    (68.0,   "ANIM_DUO",  17.2, "1:08 pipeline card - quantize + package in one step"),
    (80.0,   "SOLO_R",    None, "1:20 Ragnar continues"),
    (100.5,  "ANIM_DUO",  24.8, "1:41 Hugging Face card - 'models available on Hugging Face'"),
    (112.0,  "SOLO_R",    None, "1:52 works on Windows and Mac"),
    (130.0,  "DUO",       None, "2:10 'how do you run it'"),
    (140.5,  "SOLO_T",    None, "2:21 Tina - Hugging Face is GitHub for models"),
    (170.5,  "SOLO_R",    None, "2:51 4 GB to 300 GB, pick your size"),
    (194.0,  "DUO",       None, "3:14 runs without much GPU"),
    (208.5,  "SOLO_T",    None, "3:29 Tina - Microsoft open letter"),
    (222.0,  "ANIM_DUO",  31.4, "3:42 open vs closed weights card"),
    (238.0,  "SOLO_T",    None, "3:58 Tina - weights are public, proprietary is a black box"),
    (321.0,  "DUO",       None, "5:21 Ragnar - 'we will have them in Foundry'"),
    (337.0,  "SOLO_T",    None, "5:37 Tina - has only used frontier models, wants the demo"),
    (384.0,  "DUO",       None, "6:24 'let us jump into our demo'"),

    # ---- ACT 2: the demo.
    (405.0,  "SOLO_R",    None, "6:45 Scout internal, all the models we get"),
    (425.5,  "ANIM_DUO",  39.0, "7:05 Satya quote card - the line that started this"),
    (441.0,  "SOLO_R",    None, "7:21 using Scout for basic things"),
    (470.0,  "ANIM_DUO",  70.4, "7:50 parameters card - 'Qwen 2.5 14 billion parameter'"),
    (484.0,  "ANIM_DUO",  44.6, "8:04 scout demo card - llama-server command"),
    (504.0,  "DEMO",      None, "8:24 live: ask the local model about GGUF"),
    (667.0,  "DUO",       None, "11:07 Tina - one model or many?"),
    (686.0,  "DEMO",      None, "11:26 live: model picking, 7B vs 20B, Gemma, llama.cpp folder"),
    (825.0,  "DUO",       None, "13:45 Tina - why run it locally at all?"),
    (848.0,  "ANIM_DUO",  53.2, "14:08 why local card - privacy answer"),
    (862.0,  "DEMO",      None, "14:22 live: personal transactions file, taxes, offline"),
    (1039.0, "DEMO",      None, "17:19 live: web search, system prompt, MCP, RAG"),
    (1150.0, "SOLO_T",    None, "19:10 Tina summarises the benefits"),
    (1259.0, "ANIM_DUO",  62.8, "20:59 speed card - the latency question"),
    (1274.0, "DEMO",      None, "21:14 live: 19s, 57 tok/s, the HTML build"),
    (1437.0, "SOLO_T",    None, "23:57 Tina - plan with a smart model, execute with a small one"),
    (1476.0, "SOLO_R",    None, "24:36 quality, model churn, systems that must last"),

    # ---- ACT 3: wrap.
    (1591.0, "SOLO_T",    None, "26:31 Tina - AI as a companion"),
    (1630.0, "SOLO_R",    None, "27:10 memory, sovereignty, personal data"),
    (1675.0, "SOLO_T",    None, "27:55 Tina - ran out of tokens on day one"),
    (1706.0, "DEMO",      None, "28:26 results dashboard: 4 models ready, 67.9 tok/s, $0 per call"),
    (1754.0, "SOLO_T",    None, "29:14 Tina - link the tutorials below"),
    (1777.0, "DUO",       None, "29:37 Ragnar wraps, thanks for watching"),
    (1794.0, "ANIM_FULL", 78.0, "29:54 takeaways + outro card over the goodbyes"),
]


MIN_SEG = 3.5


def _turns(who, lo, hi, minlen):
    """Speaker turns of at least minlen seconds inside [lo, hi)."""
    import json
    sp = json.load(open("speech.json"))[who]
    out = []
    for a, b in sp:
        a, b = max(a, lo), min(b, hi)
        if b - a >= minlen:
            out.append((a, b))
    return out


def reaction_cuts(segs):
    """Break up single-layout stretches by cutting to DUO whenever the other
    host talks. Two jobs: stop a 160-second demo feeling like a voiceover, and
    never hold on one face while the other person is the one speaking.

    minlen is deliberately above backchannel length. "Okay", "thank you" and
    "mm-hmm" run about a second; cutting to those produces a flash in and out
    that reads worse than simply staying on the speaker. Only a real turn
    earns a cut."""
    rules = [
        # layout,  min seg dur, other host, min turn, min kept, min new piece
        ("DEMO",   70.0, "tina", 3.0, 6.0, 3.5),
        ("SOLO_R",  0.0, "tina", 1.8, 2.5, 2.2),
        ("SOLO_T",  0.0, "rag",  1.8, 2.5, 2.2),
    ]
    out = []
    for s in segs:
        rule = next((r for r in rules if r[0] == s["layout"] and s["dur"] > r[1]), None)
        if not rule:
            out.append(s)
            continue
        _, _, who, minlen, minkeep, minpiece = rule
        cuts = _turns(who, s["start"], s["end"], minlen)
        pos, pieces = s["start"], []
        for a, b in cuts:
            a, b = max(s["start"], a - 0.3), min(s["end"], b + 0.3)
            if b - a < minpiece or a < pos:
                continue
            if b - a < MIN_SEG:
                # A cut this short reads as a flash. The two-shot is always a
                # safe frame to sit on, so hold it to the floor rather than
                # dropping the cut and leaving the wrong face on screen.
                b = min(s["end"], a + MIN_SEG)
            if a - pos < minkeep:
                # The turn opens on (or nearly on) the segment boundary. Emitting
                # the leading sliver would be a sub-second flash of the wrong
                # face, so hand it to the DUO instead of skipping the cut - this
                # is exactly the case that produced the 0:42 complaint.
                a = pos
            else:
                pieces.append((pos, a, s["layout"], s["anim"], s["note"]))
            pieces.append((a, b, "DUO", None, s["note"] + " [both: other host talks]"))
            pos = b
        if s["end"] - pos >= minkeep or not pieces:
            pieces.append((pos, s["end"], s["layout"], s["anim"], s["note"]))
        elif pieces:
            a, _, L, A, N = pieces[-1]
            pieces[-1] = (a, s["end"], L, A, N)
        for a, b, L, A, N in pieces:
            out.append({"start": a, "end": b, "dur": b - a,
                        "layout": L, "anim": A, "note": N})
    return merge_adjacent(out)


def merge_adjacent(segs):
    """Coalesce back-to-back DUO segments. Without this a reaction cut landing
    on the boundary of an existing DUO produces two touching DUO shots, which
    renders as an invisible cut but costs an encode and shows up as a phantom
    entry in the shot list. Restricted to DUO on purpose: fusing two long DEMO
    blocks would be visually identical but needlessly re-renders minutes of
    footage that V1 already has on disk."""
    out = []
    for s in segs:
        p = out[-1] if out else None
        if p and p["layout"] == s["layout"] == "DUO" \
                and abs(p["end"] - s["start"]) < 1e-6:
            p["end"], p["dur"] = s["end"], s["end"] - p["start"]
        else:
            out.append(dict(s))
    return out


def build(refine=True):
    segs = []
    for i, (start, layout, anim, note) in enumerate(CUTS):
        end = CUTS[i + 1][0] if i + 1 < len(CUTS) else END
        segs.append({"start": start, "end": end, "dur": end - start,
                     "layout": layout, "anim": anim, "note": note})
    if refine:
        segs = reaction_cuts(segs)
    for i, s in enumerate(segs):
        s["i"] = i
        for k in ("start", "end", "dur"):
            s[k] = round(s[k], 3)
    return segs


if __name__ == "__main__":
    import json, sys
    segs = build()
    bad = [s for s in segs if s["dur"] < 3.0]
    for s in segs:
        if s["anim"] is not None:
            need = s["dur"]
            have = max(e - a for a, e in ANIM.values())
            if need > 92.2 - s["anim"]:
                bad.append(s)
    json.dump(segs, open("edl.json", "w"), indent=1)
    total = sum(s["dur"] for s in segs)
    print(f"{len(segs)} segments, {total:.1f}s ({total/60:.1f} min)")
    from collections import Counter
    for k, v in Counter(s["layout"] for s in segs).most_common():
        secs = sum(s["dur"] for s in segs if s["layout"] == k)
        print(f"  {k:10s} {v:2d} cuts  {secs:6.1f}s  {secs/total*100:4.1f}%")
    if bad:
        print("\nPROBLEM SEGMENTS:")
        for s in bad:
            print(" ", s["i"], s["layout"], s["dur"], s["note"])
        sys.exit(1)
