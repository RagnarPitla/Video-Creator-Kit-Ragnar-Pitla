#!/usr/bin/env python3
"""Measure the sources before deciding anything about the edit.

Writes energy.json (RMS envelopes) and speech.json (speaker turns). speech.json
is the backbone of the whole edit: it drives both the cut decisions and the
on-screen active-speaker highlight.

The important output is the crosstalk report. If the mics are isolated, speaker
detection is exact and everything downstream is trustworthy. If they bleed, it
is a guess and you must hand-check the result. Do not skip reading that number.
"""
import json, os, subprocess, sys, math, wave, array

HERE = os.path.dirname(os.path.abspath(__file__))
WIN = 0.25          # envelope resolution in seconds
SPEECH_DB = -55.0   # threshold; verify it sits in a histogram valley


def sh(cmd):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True).stdout.strip()


def load_cfg(root):
    with open(os.path.join(root, "show.json")) as f:
        return json.load(f)


def probe(path):
    out = sh(f'ffprobe -v error -show_entries format=duration '
             f'-show_entries stream=codec_type,width,height,r_frame_rate,channels '
             f'-of json {json.dumps(path)}')
    d = json.loads(out)
    v = next((s for s in d["streams"] if s["codec_type"] == "video"), {})
    a = next((s for s in d["streams"] if s["codec_type"] == "audio"), {})
    return {"dur": float(d["format"]["duration"]),
            "w": v.get("width"), "h": v.get("height"),
            "fps": v.get("r_frame_rate"), "ch": a.get("channels")}


def envelope(src, dur):
    """RMS envelope in dBFS at WIN resolution, via a decoded 8 kHz mono wav."""
    tmp = "/tmp/_env.wav"
    subprocess.run(f'ffmpeg -v error -y -i {json.dumps(src)} -ac 1 -ar 8000 '
                   f'-c:a pcm_s16le {tmp}', shell=True, check=True)
    with wave.open(tmp) as w:
        n, sr = w.getnframes(), w.getframerate()
        pcm = array.array("h"); pcm.frombytes(w.readframes(n))
    step, out = int(sr * WIN), []
    for i in range(0, len(pcm) - step + 1, step):
        chunk = pcm[i:i + step]
        s = sum(v * v for v in chunk) / len(chunk)
        out.append(round(20 * math.log10(math.sqrt(s) / 32768.0), 2) if s > 0 else -120.0)
    os.remove(tmp)
    return out


def crosstalk(env, keys):
    """For each host, the mean level of the OTHER track while this host is loud.
    Isolated mics give a huge gap. Bleeding mics give a small one."""
    print("\n=== MIC ISOLATION ===")
    verdict = "isolated"
    for me in keys:
        others = [k for k in keys if k != me]
        loud = [i for i, v in enumerate(env[me]) if v > -30]
        if not loud:
            print(f"  {me}: never above -30 dB, cannot judge"); verdict = "unknown"; continue
        for o in others:
            vals = [env[o][i] for i in loud if i < len(env[o])]
            m = sum(vals) / len(vals)
            gap = -30 - m
            flag = "ISOLATED" if m < -80 else ("BLEED" if m > -55 else "MARGINAL")
            if flag != "ISOLATED":
                verdict = "bleed" if flag == "BLEED" else "marginal"
            print(f"  while {me} is loud, {o} averages {m:8.1f} dB  (gap {gap:5.1f})  {flag}")
    print(f"  verdict: {verdict}")
    if verdict != "isolated":
        print("  !! Speaker detection will be approximate. Hand-check speech.json\n"
              "     before trusting any cut built from it.")
    return verdict


def histogram(env, keys):
    """The speech threshold should land in a valley. Print the shape so you can
    confirm it rather than inheriting a number that worked on someone else's mic."""
    print("\n=== LEVEL HISTOGRAM (confirm the threshold sits in the valley) ===")
    for k in keys:
        buckets = {}
        for v in env[k]:
            b = int(v // 10) * 10
            buckets[b] = buckets.get(b, 0) + 1
        print(f"  {k}:")
        for b in sorted(buckets):
            bar = "#" * max(1, int(60 * buckets[b] / len(env[k])))
            mark = "  <-- threshold" if b <= SPEECH_DB < b + 10 else ""
            print(f"    {b:5d} dB {bar}{mark}")


def turns(env, min_gap=0.75, min_len=0.5):
    """Threshold the envelope into speech turns, bridging short gaps so a normal
    breath inside a sentence does not split it into two turns."""
    on, out = None, []
    for i, v in enumerate(env):
        t = i * WIN
        if v > SPEECH_DB and on is None:
            on = t
        elif v <= SPEECH_DB and on is not None:
            if out and on - out[-1][1] <= min_gap:
                out[-1][1] = t
            elif t - on >= min_len:
                out.append([on, t])
            on = None
    if on is not None:
        out.append([on, len(env) * WIN])
    return [[round(a, 2), round(b, 2)] for a, b in out]


def scan_screen(path, dur, root, every=10):
    """Sample the screen recording so you can LOOK at it. A change metric alone
    will call a static results dashboard idle, and that dashboard is often the
    entire point of the episode."""
    d = os.path.join(root, "scan"); os.makedirs(d, exist_ok=True)
    t = 0
    while t < dur:
        subprocess.run(f'ffmpeg -v error -ss {t} -i {json.dumps(path)} -frames:v 1 '
                       f'-vf scale=480:-1 -y {d}/t{int(t):05d}.png', shell=True)
        t += every
    n = len(os.listdir(d))
    print(f"\n=== SCREEN SCAN ===\n  {n} samples in {d}")
    print("  Open these. Judge relevance by content, not by how much moves.")


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    cfg = load_cfg(root)
    keys = [h["key"] for h in cfg["hosts"]]

    print("=== SOURCES ===")
    info = {}
    for h in cfg["hosts"]:
        p = os.path.join(root, h["file"]); info[h["key"]] = probe(p)
        i = info[h["key"]]
        print(f"  {h['key']:6s} {i['w']}x{i['h']} {i['fps']} {i['ch']}ch {i['dur']:.3f}s")
    if cfg.get("screen"):
        s = probe(os.path.join(root, cfg["screen"])); info["screen"] = s
        print(f"  screen {s['w']}x{s['h']} {s['fps']} {s['dur']:.3f}s")

    durs = [v["dur"] for v in info.values()]
    spread = max(durs) - min(durs)
    print(f"  duration spread: {spread:.3f}s", end="")
    print("  OK" if spread < 0.5 else "  !! sources may not be synced - fix before continuing")

    env = {}
    for h in cfg["hosts"]:
        env[h["key"]] = envelope(os.path.join(root, h["file"]), info[h["key"]]["dur"])
        print(f"  envelope {h['key']}: {len(env[h['key']])} windows")

    crosstalk(env, keys)
    histogram(env, keys)

    sp = {k: turns(env[k]) for k in keys}
    total = sum(v["dur"] for v in info.values()) / len(info)
    print("\n=== SPEAKER SPLIT ===")
    for k in keys:
        t = sum(b - a for a, b in sp[k])
        print(f"  {k:6s} {len(sp[k]):4d} turns  {t/60:6.1f} min  {100*t/total:5.1f}%")

    json.dump(env, open(os.path.join(root, "energy.json"), "w"))
    json.dump(sp, open(os.path.join(root, "speech.json"), "w"), indent=1)
    print("\nwrote energy.json, speech.json")

    if cfg.get("screen"):
        scan_screen(os.path.join(root, cfg["screen"]), info["screen"]["dur"], root)


if __name__ == "__main__":
    main()
