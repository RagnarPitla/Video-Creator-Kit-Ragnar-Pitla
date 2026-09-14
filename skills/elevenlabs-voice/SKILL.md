---
name: elevenlabs-voice
description: Produce requested audio with a user-confirmed saved ElevenLabs voice. Use when the user says "11Labs", "ElevenLabs", "read this in my voice", "replace this narration with my voice", asks for text-to-speech or speech-to-speech in their saved voice, or hits authentication, missing-permission, quota, or voice-discovery failures while making that audio. Do not use for general ElevenLabs or API questions, Gemini voice work, voice cloning, or video rendering.
---

# ElevenLabs voice

Use this skill for one job: make audio the user explicitly requested with a
saved voice they confirmed they own or may use.

Loading this skill does not authorize a paid request. Run `tts` or `sts` only
after the user asks for that audio. Pass `--confirm-paid-request` only for that
request.

## Reuse the existing credentials

A new project or agent on the same Mac account does not need a separate API
key. Use the helper's secure loader, not a manual credential lookup:

- It checks `ELEVENLABS_API_KEY` first.
- If that variable is unset or blank on macOS, it reads the existing Keychain
  item with service `rbuild-elevenlabs` and account equal to the current macOS
  username.
- It keeps the key in process memory and passes it to the official SDK.

To use this Mac's saved key consistently, prefix the launcher with
`env -u ELEVENLABS_API_KEY`. This prevents an inherited environment value from
overriding Keychain for that command only; it does not change the parent shell.
Do not remove a user-requested environment override silently. The unprefixed
helper still supports that explicit alternative.

Run `doctor` through the launcher below. If it reports `credential=OK`, reuse
that credential; do not ask the user to paste or save the key again. Read each
result separately: a `voice_config` failure does not mean the key is missing.
For `missing_key`, direct the user to `save-key` in a private TTY. Resolve
Keychain access errors before replacing an existing key.
For a voice-config error other than `voice_not_configured`, stop and report
the exact code. Do not delete or rewrite private configuration to bypass it.

Reuse the user-confirmed voice through the helper's private configuration.
If none is configured, follow the voice-selection step below; do not substitute
a documentation voice. Another computer or OS account needs its own secure
setup. Never copy the key or private voice configuration into this skill.

## Hard boundaries

- Never clone a voice, upload training samples, publish audio, or change account
  permissions.
- Never use a stock, documentation, guessed, or metadata-only voice as "my
  voice."
- Keep the API key in process memory. Use `ELEVENLABS_API_KEY` or the secure
  loader in `references/setup.md`. Never put it in arguments, dotenv files,
  skills, logs, transcripts, receipts, reports, or a repository.
- Preserve every source script and audio take. Require absolute, versioned
  output and receipt paths. Never overwrite either file.
- Do not retry a paid request automatically. A failed stream must leave no
  completed-looking audio and no receipt.
- Do not render or retime video. Hand that work to the existing video engine.

## Command

On this Mac, use the installed launcher with the process-scoped prefix. It
selects the private Python environment, so no project activation is needed:

```text
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" doctor
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" voices
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" configure-voice
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" models --capability sts
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" status --mode sts --model <model-id>
```

On another installation without that launcher, follow `references/setup.md`.
Use a Python interpreter satisfying `<skill-dir>/requirements.txt` to run
`<skill-dir>/scripts/elevenlabs_voice.py` with the same subcommands. Do not use
the Mac Keychain prefix when the user explicitly configured an environment key.

Generation requires a configured voice, a current preflight, and explicit
versioned paths:

```text
env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" tts \
  --script /absolute/path/script.txt \
  --output /absolute/path/narration-v001.mp3 \
  --receipt /absolute/path/narration-v001.receipt.json \
  --model <model-id> --output-format <sdk-format> \
  --purpose audition --confirm-paid-request

env -u ELEVENLABS_API_KEY "$HOME/.local/bin/elevenlabs-voice" sts \
  --audio /absolute/path/source-take.wav \
  --output /absolute/path/voice-candidate-v001.mp3 \
  --receipt /absolute/path/voice-candidate-v001.receipt.json \
  --model <voice-conversion-model-id> --output-format <sdk-format> \
  --purpose candidate --confirm-paid-request
```

Do not place script text or a voice ID in the command line.

Example user request, not standing authorization:

> Use elevenlabs-voice to narrate [absolute script path] in my saved voice.
> Reuse the existing secure setup and save a new audio version in [output directory].

For a self-contained handoff, provide `references/agent-guide.html`. It
documents the shared launcher, same-account boundary, copyable commands, and
failure handling. It contains no API key or personal voice identifier.

## Workflow

1. Run `doctor`. Fix local key, SDK, config, or `ffprobe` failures first.
2. Run `status` with the intended model. It checks current model capability,
   subscription counters, voice discovery, and configured-voice access without
   generating audio.
3. If no voice is configured, run `voices`, then `configure-voice` in a TTY.
   The user must select the voice and confirm ownership or authorization.
4. Prefer a short, separately versioned audition before a long request. Never
   call a failed long request again without checking whether the provider
   charged it or returned usable audio.
5. Generate a versioned candidate. The helper disables SDK retries, streams to
   a hidden partial file, probes the encoded audio with `ffprobe`, then links
   the complete output and receipt into place without overwrite.
6. Treat speech-to-speech as a timing candidate, not a frame-exact promise.
   Before reusing picture or captions, compare the new take to the script with
   ASR and measure beat or word boundaries. The helper marks that gate
   `NOT RUN`; another tool must supply the evidence.
7. Hand required picture, caption, or timeline changes to RBuild or the current
   video engine. Do not copy its renderer or narration caches into this skill.

## Diagnosis

A `401` with provider status `missing_permissions` is a scope failure. It is
not proof that the key is invalid or that the voice does not exist. The helper
prints only a safe status and known permission identifier, never the response
body.

Generation permission cannot be proven without attempting the paid endpoint.
If that attempt fails, stop. Fix the key scope or account limit before a new
versioned request.

See `references/setup.md` for private setup, exit codes, verified SDK details,
and official sources.
