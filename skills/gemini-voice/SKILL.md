---
name: gemini-voice
description: Synthesise speech with the Gemini TTS API using Ragnar's own key, from any directory. Use when a video, reel or demo needs a narration track, when a script needs auditioning in several voices before committing, when a local TTS model is too slow or unavailable, or when a narration file needs per-beat timings to cut visuals against. Also use when Gemini TTS has already returned audio and it needs checking, because it truncates silently and returns valid audio of a shorter script.
verified_on: 2026-09-04
provenance: "Building the narration for the agent-sprawl reel, where the first Gemini take returned 11 words of a 26-word paragraph, reported no error, and would have shipped."
---

Gemini will read a script for you in about thirty seconds. It will also, without
warning, read half of it and hand you a clean audio file of the half. Everything
below exists because of that second sentence.

## Run it

```
gemini-say "Ship it." -o ship.wav
gemini-say --script narration.json -o vo.wav --timeline
gemini-say --script n.json -o vo.wav --voice Alnilam --style "Calm, unhurried."
gemini-say --doctor
gemini-say --list-voices
```

`gemini-say` is on PATH at `~/.local/bin/gemini-say`, so it works from any
directory. It finds an interpreter that actually has `google-genai` installed
rather than trusting whichever `python3` comes first.

The script lives at `~/.copilot/skills/gemini-voice/scripts/say.py`.

## The key

Read from `$GEMINI_TTS_KEY` first, then `~/.config/gemini/api-key` (mode 600).

**It is deliberately not stored in this skill.** Skills get synced between
machines, shared, pasted into issues and screenshotted during demos. A key in a
skill file is a key in all of those. The file at a fixed absolute path gives you
the thing you actually wanted - never typing it again, from any directory -
without that. `gemini-say --doctor` tells you if it is missing or wrongly moded.

Set it up once:

```
mkdir -p ~/.config/gemini
printf '%s' 'YOUR_KEY' > ~/.config/gemini/api-key
chmod 600 ~/.config/gemini/api-key
```

**Pass the key explicitly, always.** `genai.Client()` with no argument reads
`GOOGLE_API_KEY` then `GEMINI_API_KEY` from the environment. This machine has
both set, to a *different* key, and the SDK announces its choice in a line that
reads like noise: `Both GOOGLE_API_KEY and GEMINI_API_KEY are set. Using
GOOGLE_API_KEY.` A default client authenticates as somebody else and spends
somebody else's quota, and nothing in the audio says so.

## Quota: two buckets, and "limit: 10" is not a day

Free tier. Measured 2026-09-04:

| model | limit field | note |
|---|---|---|
| `gemini-2.5-flash-preview-tts` | 10 | default |
| `gemini-3.1-flash-tts-preview` | 10 | **separate bucket** - falls back independently |
| `gemini-2.5-pro-preview-tts` | 0 | not on free tier at all |

A 26-beat script cannot be one request per beat. Beats are grouped (`--batch`,
default 8) into one request each and split back apart afterwards, and every
group is cached under a hash of its text, voice, model and style. An interrupted
run resumes. A re-run is free.

**Two buckets, told apart only by the limit field.** `limit: 3` is per-minute
and the "retry in ~40s" hint is true of it. `limit: 10` is labelled per-day, and
an earlier version of this tool got that wrong twice: first by retrying it for
three minutes, then by reading it as "come back tomorrow" and abandoning Gemini
for the rest of the day. Observed on one key inside 25 minutes:

```
15:20  2.5-flash  generate_content     OK, 60046 bytes
15:22  2.5-flash  interactions.create  429 limit:10
15:30  2.5-flash  generate_content     429 limit:10
15:32  3.1-flash  generate_content     OK, four beats
15:40  3.1-flash  generate_content     429 limit:10
15:45  2.5-flash  generate_content     OK again
```

2.5-flash refused at 15:30 and served at 15:45. **That is not a daily counter.**
Wait a few minutes and use the other model meanwhile. `say.py` stops immediately
on `limit: 10` rather than burning retries, and names the other bucket.

**Use `generate_content`, not `interactions.create`.** Line 2 against line 1
above: same key, same model, two minutes apart, opposite results. They are
metered separately and do not fail together. If one starts failing, try the
other before concluding the key is dry.

## The gate is the point

Asked for a 26-word paragraph, the Sulafat voice returned 11 words. It stopped
after the first sentence and returned valid audio of a valid sentence. No error,
no flag, no short read. **Duration alone nearly misses this** - it showed up only
as 5.68 words/sec against a 2.3-3.1 cluster, the kind of outlier you talk
yourself out of at 1am.

The only check that proves the audio says the script is a transcript of the
audio. `say.py` takes one with `mlx-whisper`, matches it to the script with
difflib, and fails below 90% word coverage. It runs by default. `--no-gate`
makes the tool fast and untrustworthy.

The gate is known to discriminate, not just known to pass. Three controls on the
same 39-word take:

| control | coverage | gate |
|---|---|---|
| true script vs full audio | 100.0% | pass, correctly |
| inflated script vs full audio | 58.2% | fail, correctly |
| true script vs physically truncated audio | 33.3% | fail, correctly |

If the gate fails, **delete the cache directory** before re-running or it will
serve the bad take straight back from disk.

## Script format

Three shapes, so existing narration files work unchanged:

```json
{"beats": ["one", "two"]}

{"voice": "Sulafat", "style": "Calm.", "gap": 0.35,
 "beats": [{"say": "one", "gapAfter": 0.7}, {"say": "two"}]}

{"scenes": [{"id": "s1", "beats": [{"say": "one"}]}]}
```

A bare JSON list of strings also works. `--timeline` writes
`<out>.timeline.json` with per-beat `start`/`end`/`dur`, which is what you cut
visuals against.

**Gaps are inserted deliberately.** The model pads each utterance with a
variable amount of near-silence. Concatenating raw groups gives pauses of
whatever length it felt like, which makes any pacing figure fiction. Every group
is trimmed to its speech and the gaps are put back at the length you asked for.

**Beat boundaries come from words, not silence.** Splitting a batched render at
the longest pauses fails, because beats contain full stops of their own and an
internal sentence break competes with a real boundary. The transcript is already
being taken for the gate, so the split reuses its word timings. difflib rather
than a positional walk: one dropped or hallucinated word would otherwise shift
every boundary after it. Silence splitting survives only as a fallback for when
whisper is missing.

## Reading the sample rate

Off the response, never hardcoded. The two models do not spell the mime type the
same way:

```
audio/L16;codec=pcm;rate=24000        gemini-2.5-flash-preview-tts
audio/l16; rate=24000; channels=1     gemini-3.1-flash-tts-preview
```

Hardcoding 24000 works today and produces chipmunk audio the day it changes.

## When not to use this

The quota is real and every re-take spends a request. For iterating on a read -
trying voices, adjusting phrasing, re-recording a beat twenty times - use a local
model instead. Chatterbox on MPS runs about 2.3x realtime with no quota at all,
and it is what the agent-sprawl reel's shipped narration was made with after a
Gemini 429 was misread as "spent for the day". Gemini is for when you want a
specific voice, or a fast first take, or a second opinion on how a line lands.

Gemini samples, so identical text gives different audio on different runs. Cache
what you like or you will not get it back.

## Voices

Thirty, listed by `gemini-say --list-voices`. Default `Sulafat`. The API rejects
anything not on the list with a 400, so `say.py` checks the name before spending
a request on it.
