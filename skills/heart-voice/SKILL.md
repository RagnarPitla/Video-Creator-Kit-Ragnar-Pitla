---
name: heart-voice
description: >-
  Generate free, local Kokoro Heart narration. Use when the user says "use Heart",
  "heart voice", "narrate this script locally", "free voiceover", or "no paid APIs",
  or a new video needs narration without a different requested speaker. Do not use
  for Ragnar's explicitly requested own voice, another named voice, music,
  transcription-only work, or replacing supplied audio without a request.
---

# Heart voice

Use Kokoro's `af_heart` preset for new video narration unless the user requests a
different speaker. This changes the spoken narrator, not Ragnar's writing style.
Keep supplied recordings and existing cuts unless the user asks for a replacement.

## Start with the shared runner

Use the existing shared runtime and helper described in
[the local handoff](references/usage.md). Verify the installed imports, then run
doctor with cached-model offline mode. Doctor can bootstrap a missing environment;
do not enter that setup branch while narrating a production.

Do not install another runtime inside the current project. If doctor fails, report
its exact missing dependency or asset. Do not substitute Chatterbox, a system voice,
another Kokoro preset or a paid service.

## Generate a versioned take

1. Save the spoken text as ordered segments in a UTF-8 JSON file. Exclude headings,
   stage directions, citations and Markdown. Give every segment a unique ID using
   only letters, digits, hyphens and underscores.
2. Choose an absolute output directory that does not exist. The existing helper
   can overwrite outputs; it does not enforce this guard for you. Never rerun into
   a completed directory or clear it to make a retry work.
3. Set `HEART_VOICE=af_heart` explicitly and use `heart-voice script` with offline
   flags. The input shape and exact invocation are in the local handoff. There is
   no `generate` subcommand on this shared helper.
4. Require a successful exit, every expected WAV, and the manifest. Check
   `voice=af_heart`, the exact segment IDs, positive measured durations and audible
   signal. Check the spoken words. The legacy manifest does not record model
   hashes; preserve separate runtime/model evidence when the video pipeline
   supports it. A preview or copied label is not proof of a new synthesis.
5. Hand the audio and manifest to the video pipeline. Rebuild timings, captions and
   scene boundaries from this take before rendering. Never reuse another voice's
   timestamps or assume its words-per-minute rate.

The runner performs local synthesis. No API key, paid endpoint or voice reference
belongs in this workflow. Model downloads during setup are separate from speech
generation; do not send the script to a hosted synthesizer.

## When another voice is asked for

Heart stays the default. If the user names a different speaker or a language other
than English, set `HEART_VOICE` to one of the 54 Kokoro presets; the voice name
carries its own language, so nothing else changes. `heart-voice voices` lists them.
Setup caches only `af_heart`, so the first run of any other preset downloads it.

This is not permission to switch voices on your own. A different preset needs an
explicit request, same as any other narrator change.

## Keep the personal-voice boundary

"Write in Ragnar's style" is an editorial instruction, not permission to imitate
his spoken voice. If the user explicitly requests his own voice, use the existing
authorized personal-voice workflow instead. Preserve its recording consent,
credential permissions and spending approval. A saved reference or working key
does not grant those permissions.

## Completion

Return the versioned audio path, duration and manifest. If producing a video too,
finish and inspect the encoded cut; audio generation alone does not finish it.
Do not claim another machine is configured merely because it has this skill file.
