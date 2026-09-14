#!/usr/bin/env python3
"""Transcribe each host separately, so cutaways can be placed on topic.

Two failure modes are handled here because both are silent - they produce a
plausible-looking transcript that is wrong.

1. TIMESTAMP DRIFT ON LONG INPUTS. Whisper-family models lose sync partway
   through a long file. The middle of the episode comes back nearly empty and
   one late minute holds an implausible pile of segments. Nothing errors. The
   fix is to chunk and offset. The check is a density histogram: real
   conversation is roughly even, so a hole followed by a spike is the tell.

2. HALLUCINATION OVER SILENCE. Asked to transcribe silence, the model invents
   dialogue - often a stock phrase repeated. Cross-filter every segment against
   the energy envelope and drop anything mostly below the speech threshold.
   On the reference episode this removed about 40% of segments.

Usage: transcribe.py <root> [chunk_seconds]
Requires mlx-whisper (Apple silicon) or openai-whisper. Writes transcript.json.
"""
import json, os, subprocess, sys, tempfile

CHUNK = 300.0        # 5 minutes. Do NOT raise this to "save time".
SPEECH_DB = -55.0
WIN = 0.25
KEEP = 0.45          # fraction of a segment that must be above threshold


def load_model():
    try:
        import mlx_whisper
        return ("mlx", mlx_whisper)
    except ImportError:
        pass
    try:
        import whisper
        return ("openai", whisper.load_model("small.en"))
    except ImportError:
        raise SystemExit("install mlx-whisper (Apple silicon) or openai-whisper")


def transcribe_chunk(kind, model, path):
    if kind == "mlx":
        r = model.transcribe(path, language="en",
                             path_or_hf_repo="mlx-community/whisper-small.en-mlx")
    else:
        r = model.transcribe(path, language="en")
    return r["segments"]


def voiced(env, a, b):
    """Fraction of [a,b) above the speech threshold."""
    i, j = int(a / WIN), max(int(b / WIN), int(a / WIN) + 1)
    w = env[i:j]
    return sum(1 for v in w if v > SPEECH_DB) / len(w) if w else 0.0


def density(segs, dur, bucket=120):
    """Real conversation fills every bucket. A hole then a spike means the
    timestamps drifted and the transcript cannot be trusted."""
    n = int(dur // bucket) + 1
    b = [0] * n
    for s in segs:
        k = int(s[0] // bucket)
        if k < n:
            b[k] += 1
    return b


def main():
    root = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
    chunk = float(sys.argv[2]) if len(sys.argv) > 2 else CHUNK
    cfg = json.load(open(os.path.join(root, "show.json")))
    env = json.load(open(os.path.join(root, "energy.json")))
    dur = cfg["duration"]
    kind, model = load_model()
    print(f"backend: {kind}, chunking at {chunk:.0f}s")

    out = {}
    for h in cfg["hosts"]:
        src, key = os.path.join(root, h["file"]), h["key"]
        segs, t = [], 0.0
        while t < dur:
            with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as f:
                tmp = f.name
            subprocess.run(f'ffmpeg -v error -y -ss {t} -t {chunk} -i "{src}" '
                           f'-ac 1 -ar 16000 {tmp}', shell=True, check=True)
            for s in transcribe_chunk(kind, model, tmp):
                segs.append([round(s["start"] + t, 2), round(s["end"] + t, 2),
                             s["text"].strip()])
            os.remove(tmp)
            print(f"  {key} {t:6.0f}s -> {len(segs):4d} segments", flush=True)
            t += chunk

        raw = len(segs)
        segs = [s for s in segs if voiced(env[key], s[0], s[1]) >= KEEP]
        print(f"  {key}: dropped {raw-len(segs)} of {raw} as hallucinated silence")

        d = density(segs, dur)
        holes = [i for i, v in enumerate(d) if v == 0]
        print(f"  {key} density per 2 min: {d}")
        if holes:
            print(f"  !! EMPTY BUCKETS at {holes} - timestamps likely drifted.")
            print(f"     Re-run with a smaller chunk before trusting this.")
        out[key] = segs

    json.dump(out, open(os.path.join(root, "transcript.json"), "w"), indent=1)
    merged = sorted(((s[0], k, s[2]) for k in out for s in out[k]))
    with open(os.path.join(root, "transcript.txt"), "w") as f:
        for t0, k, txt in merged:
            m, x = divmod(int(t0), 60)
            f.write(f"[{m:02d}:{x:02d}] {k.upper()}: {txt}\n")
    print(f"\nwrote transcript.json and transcript.txt ({len(merged)} segments)")


if __name__ == "__main__":
    main()
