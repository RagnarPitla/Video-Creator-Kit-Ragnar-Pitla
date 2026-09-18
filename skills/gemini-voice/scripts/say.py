#!/usr/bin/env python3
"""
say.py - text to speech through the Gemini API, from anywhere.

    gemini-say "Some words." -o out.wav
    gemini-say --script narration.json -o vo.wav --timeline
    gemini-say --list-voices
    gemini-say --doctor

Everything in this file that looks like a strange decision was measured against
the live API rather than assumed. The measurements are dated because they will
expire.

--------------------------------------------------------------------------
USE generate_content, NOT interactions.create          (measured 2026-09-04)
--------------------------------------------------------------------------
They are metered separately and they do not fail together. On 2026-09-04 at
15:20 local, on the same key and the same model, models.generate_content
returned 60046 bytes of audio while interactions.create returned 429 with
"limit: 10" - the daily bucket, already spent. An earlier script in this
family was built on interactions.create and is simply dead on days like that
one. If generate_content ever starts failing, try the other before concluding
the key is out of quota; the reverse case is just as likely.

--------------------------------------------------------------------------
PASS THE KEY EXPLICITLY                                (measured 2026-09-04)
--------------------------------------------------------------------------
genai.Client() with no argument reads GOOGLE_API_KEY, then GEMINI_API_KEY,
from the environment. This machine has BOTH set, to a DIFFERENT key, and the
SDK announces which one it picked in a line most people read as noise:

    Both GOOGLE_API_KEY and GEMINI_API_KEY are set. Using GOOGLE_API_KEY.

A default client therefore authenticates as somebody else, spends somebody
else's quota, and nothing in the audio says so. Proven by passing a
deliberately invalid key and getting 401 rather than a silent success.

--------------------------------------------------------------------------
THE MODEL TRUNCATES SILENTLY                           (measured 2026-09-04)
--------------------------------------------------------------------------
Asked for a 26-word paragraph, the Sulafat voice returned 11 words. It stopped
after the first sentence and returned valid audio of a valid sentence. Nothing
in the response says it is incomplete: no error, no flag, no short-read.

Duration alone nearly misses it - it showed up only as 5.68 words/sec against
a 2.3-3.1 cluster, which is the kind of outlier you talk yourself out of. The
only check that proves the audio says the script is a transcript of the audio,
so --gate takes one and compares it to the script word by word. It is on by
default. Turning it off makes this tool fast and untrustworthy.

--------------------------------------------------------------------------
THE 429 RETRY HINT, AND WHAT "limit: 10" ACTUALLY MEANS  (measured 2026-09-04)
--------------------------------------------------------------------------
Two buckets, distinguishable only by the limit field. "limit: 3" is the
per-minute bucket and the ~40s retry hint is true of it. "limit: 10" is
labelled per-day, and this is where an earlier version of this tool got it
wrong in BOTH directions: first by retrying it for three minutes, then by
concluding it meant "come back tomorrow" and abandoning Gemini for the day.

Neither is right. Observed on one key inside 25 minutes:

    15:20  2.5-flash  generate_content    OK, 60046 bytes
    15:22  2.5-flash  interactions.create 429 limit:10
    15:30  2.5-flash  generate_content    429 limit:10
    15:32  3.1-flash  generate_content    OK, four beats
    15:40  3.1-flash  generate_content    429 limit:10
    15:45  2.5-flash  generate_content    OK again

2.5-flash refused at 15:30 and served at 15:45. That is not a daily counter.
Treat "limit: 10" as a short refill worth waiting out, and use the other model
in the meantime - the two are metered separately.

--------------------------------------------------------------------------
READ THE SAMPLE RATE OFF THE RESPONSE                  (measured 2026-09-04)
--------------------------------------------------------------------------
The two TTS models do not spell the mime type the same way:
    audio/L16;codec=pcm;rate=24000        (gemini-2.5-flash-preview-tts)
    audio/l16; rate=24000; channels=1     (gemini-3.1-flash-tts-preview)
Hardcoding 24000 works today and produces chipmunk audio the day it changes.

--------------------------------------------------------------------------
BATCH, AND CACHE WHAT COMES BACK
--------------------------------------------------------------------------
Ten requests a day is not many. A script of 26 beats cannot be one request per
beat. Beats are grouped (--batch, default 8) and every group is cached on disk
under a hash of its text plus voice plus model plus style, so an interrupted
run resumes instead of restarting and a re-run costs nothing.

--------------------------------------------------------------------------
SPLIT BY WORDS, NOT BY SILENCE
--------------------------------------------------------------------------
Recovering beat boundaries from a batched render by cutting at the longest
pauses fails, because beats contain full stops of their own and an internal
sentence break competes with a real boundary. The transcript is already being
taken for the truncation gate, so --timeline reuses its word timings and
matches them to the script with difflib. difflib rather than a positional
walk: one dropped or hallucinated word shifts every later boundary otherwise.
Silence splitting survives only as a fallback for when whisper is missing.
"""

from __future__ import annotations

import argparse
import base64
import difflib
import hashlib
import json
import os
import re
import sys
import time
import wave
from pathlib import Path

KEY_FILE = Path.home() / ".config" / "gemini" / "api-key"
KEY_ENV = "GEMINI_TTS_KEY"

MODEL = "gemini-2.5-flash-preview-tts"
FALLBACK_MODEL = "gemini-3.1-flash-tts-preview"
VOICE = "Sulafat"
WHISPER = "mlx-community/whisper-large-v3-turbo"

# Voices the API accepts. Names only; the API rejects anything else with 400.
VOICES = [
    "Zephyr", "Puck", "Charon", "Kore", "Fenrir", "Leda", "Orus", "Aoede",
    "Callirrhoe", "Autonoe", "Enceladus", "Iapetus", "Umbriel", "Algieba",
    "Despina", "Erinome", "Algenib", "Rasalgethi", "Laomedeia", "Achernar",
    "Alnilam", "Schedar", "Gacrux", "Pulcherrima", "Achird", "Zubenelgenubi",
    "Vindemiatrix", "Sadachbia", "Sadaltager", "Sulafat",
]

MIN_INTERVAL_S = 21.0     # the free per-minute bucket is 3 requests
MAX_RETRIES = 4

TRIM_DB = -42.0           # relative to the clip's own peak
TRIM_PAD_S = 0.025        # keep consonants on the front of a word
SPLIT_SIL_DB = -45.0
SPLIT_MIN_SIL_S = 0.18

DEFAULT_GAP_S = 0.35
COVERAGE_MIN = 0.90       # share of script words that must appear in the audio

_last_call = [0.0]


class QuotaExhausted(RuntimeError):
    pass


# ---------------------------------------------------------------- key + client

def api_key(explicit: str | None = None) -> str:
    """Env override first, then the 600-mode file. Never a literal in this repo."""
    if explicit:
        return explicit.strip()
    env = os.environ.get(KEY_ENV, "").strip()
    if env:
        return env
    if KEY_FILE.is_file():
        key = KEY_FILE.read_text().strip()
        if key:
            return key
    sys.exit(
        f"No API key.\n"
        f"  Put it in {KEY_FILE} (chmod 600), or set {KEY_ENV}.\n"
        f"  It is deliberately not stored inside the skill: skills get synced,\n"
        f"  shared and screenshotted, and a key in one is a key in all of those."
    )


def client(key: str):
    from google import genai
    return genai.Client(api_key=key)


# ---------------------------------------------------------------- rate limiting

def throttled(fn, *a, model_hint: str = "", **kw):
    """Pace against the per-minute bucket; give up at once on the daily one."""
    for attempt in range(MAX_RETRIES):
        wait = MIN_INTERVAL_S - (time.monotonic() - _last_call[0])
        if wait > 0:
            time.sleep(wait)
        _last_call[0] = time.monotonic()
        try:
            return fn(*a, **kw)
        except Exception as exc:
            msg = str(exc)
            if "429" not in msg and "RESOURCE_EXHAUSTED" not in msg:
                raise
            limit = re.search(r"limit:?\s*'?(\d+)", msg)
            if limit and int(limit.group(1)) >= 10:
                other = FALLBACK_MODEL if model_hint != FALLBACK_MODEL else MODEL
                raise QuotaExhausted(
                    f"Quota refused for {model_hint or 'this model'} (limit: {limit.group(1)}).\n"
                    "  The field says 'per day', and it is not a flat daily cap: measured on\n"
                    "  2026-09-04, the same model refused at 15:30, served at 15:45, and\n"
                    "  refused again on the next request. It refills a request at a time over\n"
                    "  minutes, so a long script is best resumed in passes rather than waited\n"
                    "  out in one go. Size is NOT the variable - a 1-beat request was refused\n"
                    "  in the same minute an 8-beat one was, so batching smaller does not help.\n"
                    f"  Meanwhile --model {other} is a separate bucket and may be live now.\n"
                    "  Completed groups are cached, so re-running later resumes\n"
                    "  rather than restarting."
                ) from exc
            hint = re.search(r"retry in ([\d.]+)s", msg)
            delay = float(hint.group(1)) + 1.0 if hint else MIN_INTERVAL_S
            print(f"    per-minute limit, waiting {delay:.0f}s "
                  f"(attempt {attempt + 1}/{MAX_RETRIES})", flush=True)
            time.sleep(delay)
            _last_call[0] = time.monotonic()
    raise QuotaExhausted(f"still rate limited after {MAX_RETRIES} attempts")


# ---------------------------------------------------------------- synthesis

def synth(cl, text: str, voice: str, model: str, style: str):
    """One request. Returns (int16 mono numpy array, sample rate)."""
    import numpy as np
    from google.genai import types

    # The rule keeps the direction out of the read. Without an explicit
    # boundary the model sometimes speaks the stage direction aloud.
    prompt = f"{style}\n---\n{text}" if style else text

    resp = throttled(
        cl.models.generate_content,
        model_hint=model,
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice)
                )
            ),
        ),
    )
    part = resp.candidates[0].content.parts[0].inline_data
    if part is None or not part.data:
        raise RuntimeError("no audio in response")

    raw = base64.b64decode(part.data) if isinstance(part.data, str) else part.data
    mime = part.mime_type or ""
    m = re.search(r"rate=(\d+)", mime)
    sr = int(m.group(1)) if m else 24000
    ch = int(c.group(1)) if (c := re.search(r"channels=(\d+)", mime)) else 1

    pcm = np.frombuffer(raw, dtype="<i2")
    if ch > 1:
        pcm = pcm.reshape(-1, ch).mean(axis=1).astype("<i2")
    return pcm, sr


# ---------------------------------------------------------------- audio helpers

def norm_words(s: str) -> list[str]:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9 ]", " ", s.lower())).split()


def trim(pcm, sr: int):
    """Strip the model's variable near-silent padding, keeping consonants."""
    import numpy as np
    peak = float(np.abs(pcm).max()) if pcm.size else 0.0
    if peak <= 0:
        return pcm
    floor = peak * (10.0 ** (TRIM_DB / 20.0))
    loud = np.nonzero(np.abs(pcm) > floor)[0]
    if loud.size == 0:
        return pcm
    pad = int(TRIM_PAD_S * sr)
    return pcm[max(0, loud[0] - pad): min(pcm.size, loud[-1] + pad)]


def silence_runs(pcm, sr: int):
    import numpy as np
    peak = float(np.abs(pcm).max()) if pcm.size else 0.0
    if peak <= 0:
        return []
    floor = peak * (10.0 ** (SPLIT_SIL_DB / 20.0))
    win = max(1, int(0.02 * sr))
    env = np.convolve(np.abs(pcm).astype(np.float32), np.ones(win) / win, mode="same")
    quiet = env <= floor
    runs, start = [], None
    for i, q in enumerate(quiet):
        if q and start is None:
            start = i
        elif not q and start is not None:
            runs.append((start, i))
            start = None
    if start is not None:
        runs.append((start, len(quiet)))
    return [r for r in runs if (r[1] - r[0]) / sr >= SPLIT_MIN_SIL_S]


def split_on_silence(pcm, sr: int, n: int):
    """Fallback only. Cuts at the n-1 longest internal pauses."""
    if n <= 1:
        return [pcm]
    runs = [r for r in silence_runs(pcm, sr) if r[0] > 0 and r[1] < pcm.size]
    if len(runs) < n - 1:
        return None
    chosen = sorted(sorted(runs, key=lambda r: r[0] - r[1])[: n - 1])
    parts, prev = [], 0
    for a, b in chosen:
        mid = (a + b) // 2
        parts.append(pcm[prev:mid])
        prev = mid
    parts.append(pcm[prev:])
    return parts


def write_wav(path: Path, pcm, sr: int) -> None:
    with wave.open(str(path), "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(pcm.astype("<i2").tobytes())


def read_wav(path: Path):
    import numpy as np
    with wave.open(str(path), "rb") as wf:
        sr = wf.getframerate()
        pcm = np.frombuffer(wf.readframes(wf.getnframes()), dtype="<i2")
    return pcm, sr


# ---------------------------------------------------------------- transcript

def transcribe(path: Path) -> list[dict]:
    """Word-level timings, or [] when whisper is unavailable."""
    try:
        import mlx_whisper
    except ImportError:
        return []
    res = mlx_whisper.transcribe(str(path), path_or_hf_repo=WHISPER, word_timestamps=True)
    out: list[dict] = []
    for seg in res.get("segments", []):
        for w in seg.get("words", []):
            tok = norm_words(w["word"])
            if tok:
                out.append({"w": tok[0], "start": float(w["start"]), "end": float(w["end"])})
    return out


def coverage_of(said: list[dict], texts: list[str]) -> float:
    expect = [w for t in texts for w in norm_words(t)]
    actual = [x["w"] for x in said]
    if not expect or not actual:
        return 0.0
    sm = difflib.SequenceMatcher(a=expect, b=actual, autojunk=False)
    return sum(b.size for b in sm.get_matching_blocks()) / len(expect)


def align_boundaries(said: list[dict], texts: list[str]):
    """
    End time of each text, in seconds, plus the share of script words found.

    difflib rather than a positional walk: a single dropped or hallucinated
    word would otherwise shift the timing of every beat after it.
    """
    expect, owner = [], []
    for i, t in enumerate(texts):
        for w in norm_words(t):
            expect.append(w)
            owner.append(i)
    actual = [x["w"] for x in said]
    if not expect or not actual:
        return None, 0.0

    matched: dict[int, int] = {}
    for a, b, size in difflib.SequenceMatcher(a=expect, b=actual, autojunk=False).get_matching_blocks():
        for k in range(size):
            matched[a + k] = b + k
    coverage = len(matched) / len(expect)

    ends = []
    for i in range(len(texts)):
        idxs = [matched[e] for e in range(len(expect)) if owner[e] == i and e in matched]
        if not idxs:
            return None, coverage
        ends.append(said[max(idxs)]["end"])
    for i in range(1, len(ends)):
        if ends[i] < ends[i - 1]:
            return None, coverage
    return ends, coverage


# ---------------------------------------------------------------- script input

def load_script(path: Path) -> dict:
    """
    Accepts three shapes, so existing narration files work unchanged:

        {"beats": ["one", "two"]}
        {"beats": [{"say": "one", "gapAfter": 0.6}]}
        {"scenes": [{"id": "s1", "beats": [...]}]}

    A bare JSON list of strings is also accepted.
    """
    data = json.loads(path.read_text())
    if isinstance(data, list):
        data = {"beats": data}

    beats: list[dict] = []
    if "scenes" in data:
        for sc in data["scenes"]:
            for b in sc.get("beats", []):
                row = {"say": b} if isinstance(b, str) else dict(b)
                row.setdefault("say", row.get("text", ""))
                row["scene"] = sc.get("id", "")
                beats.append(row)
    else:
        for b in data.get("beats", []):
            row = {"say": b} if isinstance(b, str) else dict(b)
            row.setdefault("say", row.get("text", ""))
            row.setdefault("scene", "")
            beats.append(row)

    beats = [b for b in beats if b["say"].strip()]
    if not beats:
        sys.exit(f"{path} has no beats with any text in them")
    return {
        "voice": data.get("voice"),
        "style": data.get("style", ""),
        "gap": float(data.get("gap", DEFAULT_GAP_S)),
        "beats": beats,
    }


# ---------------------------------------------------------------- doctor

def doctor(args) -> int:
    ok = True
    print("gemini-voice doctor\n")

    key = None
    src = None
    if os.environ.get(KEY_ENV, "").strip():
        key, src = os.environ[KEY_ENV].strip(), f"${KEY_ENV}"
    elif KEY_FILE.is_file() and KEY_FILE.read_text().strip():
        key, src = KEY_FILE.read_text().strip(), str(KEY_FILE)
        mode = oct(KEY_FILE.stat().st_mode & 0o777)
        if mode != "0o600":
            print(f"  [warn] {KEY_FILE} is mode {mode}, expected 0o600 - chmod 600 it")
    if key:
        print(f"  [ok]   key found via {src}  ({key[:6]}...{key[-4:]}, {len(key)} chars)")
    else:
        print(f"  [FAIL] no key in ${KEY_ENV} or {KEY_FILE}")
        ok = False

    for env in ("GOOGLE_API_KEY", "GEMINI_API_KEY"):
        if os.environ.get(env):
            same = key and os.environ[env].strip() == key
            print(f"  [{'ok' if same else 'warn'}]   ${env} is set and is "
                  f"{'the same key' if same else 'a DIFFERENT key - this is why say.py passes the key explicitly'}")

    for mod in ("google.genai", "numpy"):
        try:
            __import__(mod)
            print(f"  [ok]   {mod}")
        except ImportError:
            print(f"  [FAIL] {mod} missing - pip install google-genai numpy")
            ok = False
    try:
        __import__("mlx_whisper")
        print("  [ok]   mlx_whisper (truncation gate available)")
    except ImportError:
        print("  [warn] mlx_whisper missing - --gate cannot run, so silent "
              "truncation would ship undetected")

    if key and not args.offline:
        print("\n  live check (spends 1 of today's 10 requests):")
        try:
            cl = client(key)
            pcm, sr = synth(cl, "Doctor check.", VOICE, args.model, "")
            print(f"  [ok]   {args.model} returned {pcm.size} samples at {sr} Hz")
        except QuotaExhausted as e:
            print(f"  [warn] {args.model}: {str(e).splitlines()[0]}")
            print(f"         try --model {FALLBACK_MODEL} (separate bucket)")
        except Exception as e:
            print(f"  [FAIL] {args.model}: {str(e)[:180]}")
            ok = False

    print("\n" + ("all good" if ok else "problems above"))
    return 0 if ok else 1


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(
        description="Gemini text to speech, with a truncation gate.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""examples:
  gemini-say "Ship it." -o ship.wav
  gemini-say --script narration.json -o vo.wav --timeline
  gemini-say --script n.json -o vo.wav --voice Alnilam --style "Calm, unhurried."
  gemini-say --doctor
  gemini-say --list-voices
""",
    )
    ap.add_argument("text", nargs="?", help="text to speak; omit when using --script")
    ap.add_argument("--script", type=Path, help="JSON file of beats or scenes")
    ap.add_argument("-o", "--out", type=Path, default=Path("out.wav"))
    ap.add_argument("--voice", default=None, help=f"default {VOICE}")
    ap.add_argument("--model", default=MODEL)
    ap.add_argument("--style", default=None, help="stage direction, spoken by nobody")
    ap.add_argument("--batch", type=int, default=8, help="beats per request (default 8)")
    ap.add_argument("--gap", type=float, default=None, help=f"seconds between beats (default {DEFAULT_GAP_S})")
    ap.add_argument("--timeline", action="store_true", help="also write per-beat timings as JSON")
    ap.add_argument("--no-gate", dest="gate", action="store_false",
                    help="skip the transcript check (fast and untrustworthy)")
    ap.add_argument("--cache", type=Path, default=None, help="default <out>-cache/")
    ap.add_argument("--key", default=None, help="override the key file and env")
    ap.add_argument("--list-voices", action="store_true")
    ap.add_argument("--doctor", action="store_true")
    ap.add_argument("--offline", action="store_true", help="doctor: skip the live call")
    args = ap.parse_args()

    if args.list_voices:
        for i in range(0, len(VOICES), 4):
            print("  " + "".join(v.ljust(18) for v in VOICES[i:i + 4]))
        print(f"\n  default: {VOICE}")
        return 0

    if args.doctor:
        return doctor(args)

    if not args.text and not args.script:
        ap.error("give some text, or --script FILE")

    import numpy as np

    if args.script:
        spec = load_script(args.script)
    else:
        spec = {"voice": None, "style": "", "gap": DEFAULT_GAP_S,
                "beats": [{"say": args.text, "scene": ""}]}

    voice = args.voice or spec["voice"] or VOICE
    if voice not in VOICES:
        sys.exit(f"unknown voice {voice!r}. --list-voices to see the {len(VOICES)} the API accepts.")
    style = args.style if args.style is not None else spec["style"]
    gap = args.gap if args.gap is not None else spec["gap"]

    beats = spec["beats"]
    texts = [b["say"] for b in beats]
    out = args.out
    out.parent.mkdir(parents=True, exist_ok=True)
    cache = args.cache or out.with_name(out.stem + "-cache")
    cache.mkdir(parents=True, exist_ok=True)

    groups = [list(range(i, min(i + args.batch, len(beats))))
              for i in range(0, len(beats), args.batch)]
    print(f"{len(beats)} beat(s) in {len(groups)} request(s)  voice={voice}  model={args.model}")

    cl = None
    rendered: list[tuple[list[int], Path]] = []
    for gi, idxs in enumerate(groups):
        joined = " ".join(texts[i] for i in idxs)
        h = hashlib.sha256("\x1f".join(
            [joined, voice, args.model, style]).encode()).hexdigest()[:16]
        wav = cache / f"g{gi:02d}-{h}.wav"
        if wav.is_file():
            print(f"  group {gi + 1}/{len(groups)}  cached")
        else:
            print(f"  group {gi + 1}/{len(groups)}  synthesising {len(idxs)} beat(s)...", flush=True)
            if cl is None:
                cl = client(api_key(args.key))
            try:
                pcm, sr = synth(cl, joined, voice, args.model, style)
            except QuotaExhausted as e:
                print(f"\n{e}", file=sys.stderr)
                return 2
            write_wav(wav, trim(pcm, sr), sr)
        rendered.append((idxs, wav))

    # Assemble, inserting the gaps deliberately rather than keeping whatever
    # padding the model felt like producing.
    chunks, sr, timeline, cursor = [], None, [], 0.0
    for idxs, wav in rendered:
        pcm, this_sr = read_wav(wav)
        sr = sr or this_sr
        if this_sr != sr:
            sys.exit(f"{wav} is {this_sr} Hz but the run started at {sr} Hz - "
                     f"clear {cache} and re-render")

        group_texts = [texts[i] for i in idxs]
        ends = None
        if len(idxs) > 1:
            said = transcribe(wav)
            if said:
                ends, cov = align_boundaries(said, group_texts)
                if ends is None:
                    print(f"    {wav.name}: could not align ({cov:.0%} of words found), "
                          f"falling back to silence split")
            parts = None
            if ends:
                bounds = [0] + [int(round(e * sr)) for e in ends[:-1]] + [pcm.size]
                parts = [pcm[bounds[i]:bounds[i + 1]] for i in range(len(idxs))]
            if parts is None:
                parts = split_on_silence(pcm, sr, len(idxs))
            if parts is None:
                print(f"    {wav.name}: cannot split into {len(idxs)} beats; "
                      f"keeping the group whole (timeline will be coarse)")
                parts = [pcm] + [pcm[:0]] * (len(idxs) - 1)
        else:
            parts = [pcm]

        for i, part in zip(idxs, parts):
            part = trim(part, sr)
            dur = part.size / sr
            timeline.append({
                "i": i, "scene": beats[i].get("scene", ""), "say": texts[i],
                "start": round(cursor, 4), "end": round(cursor + dur, 4),
                "dur": round(dur, 4),
            })
            chunks.append(part)
            cursor += dur
            g = float(beats[i].get("gapAfter", gap))
            if i != len(beats) - 1 and g > 0:
                chunks.append(np.zeros(int(round(g * sr)), dtype="<i2"))
                cursor += g

    write_wav(out, np.concatenate(chunks), sr)
    total = cursor
    words = sum(len(norm_words(t)) for t in texts)
    print(f"\nwrote {out}  {total:.2f}s  {sr} Hz  "
          f"{words} words = {words / total * 60:.1f} wpm" if total else f"\nwrote {out}")

    if args.timeline:
        tp = out.with_suffix(".timeline.json")
        tp.write_text(json.dumps(
            {"sr": sr, "duration": round(total, 4), "voice": voice,
             "model": args.model, "beats": timeline}, indent=2))
        print(f"wrote {tp}")

    # The gate runs on the finished file, because that is the artifact that
    # ships. Gating the groups instead would miss an assembly mistake.
    if args.gate:
        said = transcribe(out)
        if not said:
            print("\ngate: SKIPPED - mlx_whisper is not installed, so silent "
                  "truncation would go undetected. pip install mlx-whisper")
            return 0
        # Whisper loops on trailing silence: discard anything it timestamps
        # past the end of the file, or it invents repeats that are not there.
        said = [w for w in said if w["start"] <= total + 0.05]
        cov = coverage_of(said, texts)
        heard = len(said)
        print(f"\ngate: {cov:.1%} of {words} script words found in the audio "
              f"({heard} words heard)")
        if cov < COVERAGE_MIN:
            print(f"gate: FAIL - below {COVERAGE_MIN:.0%}. The model most likely "
                  f"truncated. Re-run with a smaller --batch, or a different "
                  f"--voice; delete {cache} first or it will serve the bad take "
                  f"back from disk.", file=sys.stderr)
            return 1
        print("gate: clean")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        sys.exit(130)
