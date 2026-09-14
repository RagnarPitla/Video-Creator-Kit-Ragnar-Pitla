---
name: youtube-notes
description: >-
  Turn one or many YouTube links into structured Markdown notes in Ragnar's
  voice, automatically organized into folders by the YouTuber/channel name.
  Fetches the real transcript with yt-dlp (no API key needed) and summarizes
  with whatever agent CLI is installed (Claude, Copilot, Codex) or an Anthropic
  API key — falling back to an extractive summary so a note is ALWAYS produced.
  Use whenever the user pastes a YouTube URL, a list of URLs, a playlist, or a
  channel and wants notes, a summary, key takeaways, or a transcript. Triggers:
  "youtube notes", "summarize this video", "summarize these videos", "notes from
  this video", "transcript to summary", "turn this playlist into notes",
  "notegpt", "save notes for these links", "what does this video say".
---

# YouTube Notes

Turn YouTube links into notes — in your voice, filed by channel. This is the
portable engine behind **YouTube Notes Studio**. It runs anywhere `node` and
`yt-dlp` are available, with no npm dependencies.

## When to use this

Use this skill the moment the user gives you a YouTube link (or several) and
wants anything note-like: a summary, key takeaways, a transcript, study notes,
or "process this playlist." One link or a hundred — same flow.

## How it works (do this)

The engine is a single command. Prefer the global `yt-notes` command; if it
isn't on PATH, call the bundled engine directly with `node`.

```bash
# Preferred (installed by install-skills.sh -> ~/.local/bin/yt-notes):
yt-notes "<url1>" "<url2>" ...

# Fallback — run the engine bundled inside this skill folder:
node "<THIS_SKILL_DIR>/engine/bin/yt-notes.js" "<url1>" "<url2>" ...
```

`<THIS_SKILL_DIR>` is the directory containing this SKILL.md (it has an
`engine/` subfolder). Resolve it from the skill's own path.

### Common invocations

```bash
# One video
yt-notes "https://youtu.be/dQw4w9WgXcQ"

# A list (also accepts a file or stdin)
yt-notes --file links.txt
pbpaste | yt-notes

# Choose a style and where to save
yt-notes --style executive --out "~/Documents/YouTube Notes" "<url>"

# A whole playlist or channel, summarized with a specific model
yt-notes --provider claude --model sonnet "https://www.youtube.com/playlist?list=..."

# Check the environment first (what's installed, which summarizer will run)
yt-notes --doctor
```

### Useful flags

| Flag | Meaning |
|---|---|
| `--style` | `ragnar` (default), `executive`, `detailed`, `bullets`, `study` |
| `--provider` | `auto`, `claude`, `copilot`, `codex`, `anthropic-api`, `extractive` |
| `--model` | model override (e.g. `sonnet`) |
| `--out <dir>` | output folder (default `~/Documents/YouTube Notes`) |
| `--language <code>` | preferred caption language (default `en`) |
| `--concurrency <n>` | videos in parallel (default 2) |
| `--whisper` | transcribe audio when a video has no captions |
| `--no-transcript` / `--no-mindmap` | trim the note |
| `--json` | print a machine-readable run manifest |

## What you should do as the agent

1. Extract every YouTube URL from the user's message (videos, playlists,
   channels, Shorts — all fine). If they pasted prose, pull the links out.
2. Run `yt-notes` with those links. Pass `--style` if the user asked for a
   particular shape (e.g. "executive summary" → `--style executive`).
3. Stream/report progress. When done, tell the user:
   - how many notes were created (and any that had no transcript),
   - the output folder, and
   - the per-channel folders the notes landed in.
4. If `--doctor` shows no summarizer is logged in, the engine still produces an
   **extractive** note. Mention that and how to enable a better one
   (sign in to a CLI or set `ANTHROPIC_API_KEY`).

## Output

```
<outputDir>/
  _library.md                 ← index of every channel
  <Channel Name>/
    _index.md                 ← that channel's notes
    <date>-<title>.md         ← one note per video
```

Each note has: frontmatter, a metadata header, a structured summary in Ragnar's
voice (TL;DR, key takeaways, the argument with timestamps, quotes, "My Take",
open questions, a Mermaid mind map), and the full transcript in a collapsible
block.

## Requirements

- `node` (18+) and `yt-dlp` on PATH (`brew install yt-dlp`).
- A summarizer is optional: Claude/Copilot/Codex CLI or `ANTHROPIC_API_KEY`.
  Without one, you still get a usable extractive note.

## Notes

- Faithful by design: factual sections reflect only what the video says;
  opinions live only in the "My Take" section.
- Idempotent: re-running the same link updates that video's note instead of
  duplicating it.
