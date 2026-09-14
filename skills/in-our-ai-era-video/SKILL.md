---
name: in-our-ai-era-video
description: |
  Build and maintain episode videos for the "In Our AI Era" podcast in its established 90s DOS
  house style. Use when asked to make the next In Our AI Era episode video, when adding or
  retiming a scene in an existing episode project, when a heading overflows or wraps in a
  render, when text or a sprite vanishes into the background in the colour cut, when the two
  cuts drift apart visually, when the rendered length stops matching the timeline after a scene
  change, or when host credits or the episode title line need updating. Covers the shared theme
  system, the paper and colour cuts, the layout maths and the still-render verification loop.
  Not for scaffolding an unrelated Remotion project (use remotion-create), not for the full
  research-to-script-to-publish pipeline (use ragnar-video-studio), and not for static episode
  artwork, thumbnails or illustrations (use in-our-ai-era-visuals).
metadata:
  tags: remotion, video, podcast, in-our-ai-era, ragnar, dos, retro
---

# In Our AI Era - episode video house style

The show is a two-host podcast (**Tina and Ragnar**) about applied AI. Each episode gets a
short animated companion video in a 90s DOS aesthetic. The look is already decided. Your job
on a new episode is to pour new content into an existing visual system, not to redesign it.

Reference implementation: `~/Desktop/rbuild-ai/in-our-ai-era-video/`. Read its `README.md`
before changing anything - it carries the per-project numbers this skill deliberately does not.

## The invariants

Do not renegotiate these without being asked:

- A persistent DOS application shell: status bar pinned top carrying the show name, episode
  line and a fake path; function-key strip pinned bottom with an ASCII progress meter that
  fills to 100% across the runtime.
- A CRT pass over everything: scanlines, a slow roll bar, phosphor flicker.
- Three fonts only. A blocky pixel face for headings, a tall terminal face for body, a clean
  mono for code-ish lines.
- Text arrives by typing on, character by character. Headings punch in. Sprites reveal one
  row at a time. Nothing simply appears.
- Hand-authored square pixel sprites from character maps, not images.
- Every episode ships **two cuts** from one set of scenes: a paper cut (white ground, dark
  ink) and a colour cut (black ground, saturated accents, gradient headings).

The chrome and the CRT pass live above the scene timeline so they stay fixed while scenes
transition underneath. A consequence that looks like a bug and is not: individual scene
compositions render without the bars, so they look top-heavy when previewed alone.

## The rule that breaks everything

**Never write a colour literal into a scene file.** Add the colour to the theme type and give
it a value in *both* themes.

Two cuts share one set of scenes because a theme object is passed down through context. A hex
typed directly into a scene silently survives into the colour cut, and you get black text on a
black ground - which no typecheck and no lint will catch. It only shows up if a human looks at
the right frame.

After any scene edit, run this. It must return nothing:

```bash
grep -rnE "#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\(|[\"'](white|black|red|blue|green|yellow|cyan|magenta|gray|grey|orange|purple)[\"']" src/scenes/
```

Match only *quoted* colour words. A bare word-boundary match on `green` also matches the theme
reference `t.green` and floods you with false positives.

Scanlines and the vignette break under inversion too, so both are theme fields, not constants.
Scanline colour must flip from dark-on-light to light-on-dark. Set the colour cut's vignette to
none: a falloff that reads as gentle CRT bloom on white turns into mud around bright sprites on
black.

## Gradient headings: which ones, and which must never

The colour cut's signature is a clipped linear gradient running through the heading text, so
the gradient shows through the blocky letterforms and each pixel of a heading shifts colour.
Implement it as a background gradient with background-clip on the text and a transparent
foreground - not as per-character coloured spans, which fights the typewriter animation.

**Exclude every inverse-video panel.** Some scenes deliberately invert - light block, dark
text - as a rhythmic accent. Applying the gradient there replaces the solid block with
transparent text and destroys the effect.

The reliable tell is that their text colour is the *paper* colour, not the ink colour. Before
any bulk heading edit, list them and exclude them by hand. Do not eyeball this:

```bash
grep -rn "color: t.paper" src/scenes/
```

Short headings get a compressed slice of the gradient and read as near-single-colour. That is
acceptable. Do not special-case it.

### The gradient and the typewriter fight each other

`background-clip: text` only clips to glyphs painted in the element's *own* background box. The
typewriter component paints its visible characters in an absolutely positioned child so the
layout does not shift as text arrives. That child sits outside the parent's background box but
still inherits `color: transparent`, so the heading renders as nothing at all. Solid black on
black, no error, no failed typecheck.

Put the paint on the element that actually paints the glyphs, not on an ancestor. Give that
element the full line width, or the gradient rescales to the typed-so-far text and the colours
crawl as each character lands.

This only bites headings that both carry the gradient *and* type on. A heading with plain text
children is unaffected, which is exactly why it survives a casual still check: the other
headings look fine and the broken one looks like empty space rather than a bug.

## Frame arithmetic is manual

The composition's total duration is **the sum of the scene durations minus (number of
transitions x transition length)**, because adjacent scenes overlap during a transition.

Inserting a scene therefore changes the total twice: it adds the new scene's duration *and*
subtracts one more transition overlap. Forgetting the second half is the single most common
error here. Adding a scene of length D while shortening another by N changes the total by
`D - N - 12`, not `D - N`.

That total is written by hand in the composition registry, once per cut. Change any scene's
duration and it no longer matches. The failure is quiet: the video renders, and either the
last scene is cut off or the tail sits frozen.

Recompute and update every cut's registry entry in the same edit as any retiming. Then prove
it against the encoded file, which must equal the registry number exactly:

```bash
ffprobe -v error -count_frames -select_streams v:0 \
  -show_entries stream=nb_read_frames -of csv=p=0 out/<file>.mp4
```

## Scene numbers are labels, and they go stale

Scene files are numbered by position, but the numbers are internal. No viewer sees them.

When a request names "scene 9", resolve it to a component name and say which one you mean
before editing. After an insertion the number is ambiguous, and the wrong reading silently
edits the wrong scene.

Prefer inserting with a suffix over renumbering. Renumbering a mid-timeline insert cascades
through filenames, component names, imports, timeline order and every standalone composition
id, which breaks saved preview URLs, for zero visual change.

Transitions have exactly two presentations, fade and a from-left wipe, always 12 frames. Match
the surrounding rhythm and do not introduce a third.

## Retiming is not just changing the duration number

A scene's animation cues are absolute frame numbers inside that scene. Shorten the scene and
any cue scheduled past the new end silently never fires, or gets swallowed by the outgoing
transition, which begins 12 frames before the scene ends.

After shortening a scene, walk every cue in it and shift the late ones by the same amount.
Leave a reveal fully visible for a beat before the transition starts rather than ending on it.

## Text will overflow. Measure, do not estimate

The pixel heading face is roughly one em per character - unusually wide - so headings run out
of safe width fast. The terminal body face is far narrower, closer to four tenths of an em.

Do not trust either number, including these. **Render a still and measure the pixels.** Guessed
advance widths have caused overflow bugs in this project in both directions: headings wrapping
to two lines, and body text pointlessly shortened to fit a limit that was not real.

Scenes built from fixed-width columns - anything laying out labels against bars or figures -
are the fragile ones. Any text change inside those needs a width recheck, not a glance.

When a heading wraps, shorten the words before shrinking the type. The heading size is part of
the house style; the wording is not.

The exception: **copy the user supplied verbatim is not yours to shorten.** If exact wording
overflows, do not silently rewrite it. Set it on two lines, or ask which they want. Rewording
a user's chosen headline to fit a layout is the kind of change they find later and do not
expect.

## Verify by looking, and know the transition trap

Typecheck proves nothing about a video. Render stills at half scale and actually view them.

Before judging a frame that looks wrong, **work out which scene it lands in.** A frame inside a
transition window shows one scene at partial opacity fading into another, so text looks dim,
grey or half-missing. That is the transition working. Likewise a frame a few frames into a
scene shows a build-on animation still building - absent elements are not missing elements.

Compute the scene boundaries first, then sample mid-scene. When something genuinely looks off,
re-render outside the fade before investigating.

**Check both cuts at the same frame numbers.** A standalone scene composition inherits the
theme from its parent, so previewing one only ever proves the paper treatment. Colour-cut
breakage is invisible from there by construction.

Before shipping, extract frames from the encoded file, not the render pipeline. Sample the
title card, any scene you touched, and the final frame. This is the only check that proves
what will actually play, and it is a release gate, not a nicety.

## Host and title conventions

The hosts are **Tina and Ragnar**. Credit them on the title card and again on the outro.

Episode transcripts come from speech-to-text and reliably mangle "Ragnar" - "Aaron" is the
common corruption. Search the whole project for stray host names after importing any
transcript-derived copy, including inside body sentences, not just the credit lines.

The episode line appears in two places that must agree: the title card and the persistent
status bar. Change one and you have introduced a continuity error. When a qualifier makes the
title too long for the card, put it on a second line in a contrasting accent rather than
shrinking the type, and push back the timing of whatever animates next so the reveals do not
collide.

## If you are starting an episode from nothing

Copy the reference project. Do not scaffold fresh - you would rebuild the theme, the chrome,
the sprites and the typewriter for no gain.

After copying, update the episode line in **both** places it appears, replace the title card
and outro copy, and clear the previous episode's scene bodies. Ask for the new episode number,
title and script rather than carrying the old ones forward.

If you genuinely must scaffold: the Remotion generator cannot be driven non-interactively, but
it writes the template to disk before it fails, so let it fail and hand-write the manifest.
Pin every Remotion package to one version line explicitly, since core has run ahead of the
companion packages on a pre-release and mixing lines breaks the build. Font helper libraries
rewrite family names, so read back the exact family string the helper exports and use that
literal; a wrong name falls back to a system font silently.

## What this cannot do

- It does not write the episode. Bring a transcript or a script.
- It does not add narration. Renders carry a silent audio track; voice is laid over in an
  editor.
- It does not produce vertical or square cuts. The layout is built for 16:9 safe areas and
  reflowing it is real work, not a config change.
