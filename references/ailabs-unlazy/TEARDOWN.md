# Teardown: AI LABS "unlazy" video

Reference video for the `ailabs-explainer` style. Everything below is measured from the
file or quoted from the video description. Where something is a guess, it says so.

- Source file: `Y2b-Animation-Video-Agent/Clipto AI Video Downloader ... .mp4`
- YouTube: `https://www.youtube.com/watch?v=c47uqR7XB_c`
- Channel: [AI LABS](https://www.youtube.com/@AILABS-393)
- Subject repo: `https://github.com/Leonxlnx/unlazy` (cloned to `references/unlazy-repo/`)
- Assets here: `frames/` (78 stills at 10s), `analysis/` (contact sheets), `transcript/`

---

## 1. Container facts

| Property | Value |
|---|---|
| Runtime | 777.2s (12:57) |
| Resolution | 1920x1080 |
| Frame rate | 30000/1001 (29.97) |
| Video codec | H.264 High, yuv420p, bt709 |
| **Video bitrate** | **222 kbps** |
| Audio | AAC-LC, 44.1 kHz, stereo |

The bitrate is the tell. 222 kbps for 13 minutes of 1080p is absurdly low, and it is a
direct consequence of the art direction: flat near-black background, flat fills, no
gradients, no film grain, no camera noise. Large areas of the frame are byte-identical
between frames, so H.264 spends almost nothing on them.

Treat 222 kbps as a **style conformance check**. If our render lands at 3 Mbps, we have
added texture, noise or gradients that this style does not have.

---

## 2. Pacing

2942 words over 12.95 minutes. Chapter boundaries are the ones in the video description.

| Chapter | Start | Duration | Words | WPM |
|---|---:|---:|---:|---:|
| Intro | 0:00 | 48s | 168 | 210 |
| What Unlazy is | 0:48 | 59s | 215 | 219 |
| Why agents get lazy | 1:47 | 159s | 616 | 232 |
| Sponsor | 4:26 | 60s | 202 | 202 |
| The tree | 5:26 | 222s | 861 | 233 |
| Install | 9:08 | 79s | 298 | 226 |
| The fix | 10:27 | 150s | 582 | 233 |
| **Overall** | | **777s** | **2942** | **227** |

Three things worth copying:

1. **227 wpm is fast.** For comparison, the jam-studio reference set runs 143 to 188 wpm.
   This is roughly 1.3x that. The narration never pauses for effect.
2. **The explainer sections are the fastest part** (232 to 233 wpm), not the intro. That
   inverts the usual advice. It works because the animation is carrying the explanation
   and the voice is only labelling it. If our visuals are weaker, this rate will not hold.
3. **The sponsor read is the slowest section** (202 wpm) and it is the only place the
   pace drops. Deliberate. It reads as a different register.

Planning rate for our scripts: **225 wpm**, then measure the real audio and correct.

## 3. Audio

| Metric | Value | Reading |
|---|---|---|
| Integrated loudness | -21.2 LUFS | Quiet. YouTube normalises to about -14 LUFS |
| Loudness range (LRA) | 3.9 LU | Very narrow |

LRA of 3.9 LU means heavy compression and essentially no dynamic music bed fighting the
voice. The voice sits in a narrow band and never gets out of the way.

The narration is a synthetic voice. Two supporting observations: the auto-captions
transcribe two audible inhales as `[snorts]` at 1:47 and 9:08, which is a TTS breath
artefact landing on a section boundary, and the word-level pacing has no natural
variation across a 13 minute read. Not proven, but the evidence points one way.

---

## 4. The visual system

This is the part worth stealing. It is two layers and nothing else.

### Layer A: synthetic wireframe animation

Everything conceptual is drawn as an abstract, greyed-out UI. Never real text where a
grey pill will do.

**Palette** (sampled from frames, not eyeballed):

| Role | Hex | Notes |
|---|---|---|
| Background | `#0D0D0D` | 77% of the diagram frames |
| Background (screen-rec sections) | `#030303` | Near-pure black |
| Surface / card | `#2C3439` | Cool dark slate, the only "material" |
| Surface alt | `#1A1F21` | Recessed panels |
| Text pill (bright) | `#8A9199` | Stands for a heading |
| Text pill (dim) | `#5A6169` | Stands for body copy |
| **Accent** | **`#CE6F57`** | Terracotta. This is Anthropic's clay. |
| Connector | `#6B7280` at ~2px | Thin bezier curves |

Exactly **one** accent colour, used at maybe 2% coverage. It marks the one thing the
narrator is talking about right now. Everything else is greyscale. When the accent moves,
your eye moves. That is the whole trick.

The only other saturated colour in the entire video is the red/yellow/green traffic-light
dots on the fake browser chrome.

**The skeleton vocabulary.** Content is never spelled out. It is represented by:

- rounded pills (radius ~7px, height 14 to 18px) standing in for lines of text
- rounded rectangles (radius 10 to 14px) standing in for cards, panels, nodes
- a fake browser window: title bar, 3 dots, a monospace `localhost:3000` URL
- thin curved connectors between nodes, drawn on rather than cut to

Real words appear only when the word itself is the point: `unlazy`, `gates.md`,
`the checkout page loads`, `10 min`, `3h 40m`. Everything else is a grey pill. This is
why the video reads as calm at 227 wpm. There is almost nothing to read.

**Typography.** Monospace throughout for anything real, lowercase, small relative to the
frame. Looks like SF Mono / JetBrains Mono. No display type, no big bold headlines, no
kinetic text.

**Composition.** Large negative space. Elements float in the middle 60% of a black frame.
The tree diagram at 5:40 uses maybe 45% of the canvas and the rest is black.

### Layer B: real screen recordings, punched in hard

Terminal and VS Code footage is real, but it is never shown at 100%. It is scaled to
roughly 200 to 300% and framed on the exact region being discussed, with a slow drift.
See `analysis/motifs/m_560s.jpg`: the terminal is blown up until `npx skills add
Leonxlnx/unlazy` is about 40px tall.

The recording sits on the same black background with rounded corners, so the two layers
share one canvas.

The practical rule: **if a viewer has to squint at a real UI, the shot is wrong.** Zoom
until the thing being named fills the frame.

### Transitions

Measured with ffmpeg scene detection at threshold 0.2:

| Metric | Value |
|---|---|
| Hard cuts | 61 |
| Cuts per minute | 4.7 |
| Median gap | 4.7s |
| Mean gap | 12.6s |
| Gaps over 20s | 7 |

Median 4.7s against a mean of 12.6s is the interesting bit. The distribution is bimodal:
short bursts of quick changes (mostly the sponsor segment and the install walkthrough)
separated by **seven long continuous animated holds of 20s+**.

Those long holds are the diagram sequences. Nothing cuts. Elements animate in, connectors
draw, the accent moves from node to node, the camera drifts. One shot can carry 30 seconds
of narration. That is the opposite of the fast-cut B-roll style most AI channels use, and
it is why the video feels expensive.

---

## 5. Narrative structure

The script follows a repeatable seven-beat shape:

1. **Cold open on a problem the viewer already feels** (0:00). "They never take ownership
   of that task, and this is why we always have to review the agent's output." No intro
   card, no channel bumper, no "hey guys". The problem is stated in the first sentence.
2. **Credentialled reveal** (0:18). Not "here is a tool" but "GitHub's number one trending
   author, the person who also made the taste skill". Borrowed authority does the selling.
3. **Promise the twist early** (0:30). "After running it ourselves, we came across a huge
   problem with how slow it was, and we found a way to fix that." The payoff is announced
   in the first 30 seconds so the viewer stays for it.
4. **Mechanism of the problem before the solution** (1:47 to 4:26). Nearly three minutes
   on *why* agents get lazy, with the context-window explanation, before any product.
   Two named failure modes: "tells you it's done when it isn't" and "shrinks the job
   without telling you".
5. **Kill the prior art** (3:25). Ralph loop, Claude's goal command, their own loops. Each
   gets a specific named flaw. This makes the new thing feel necessary rather than novel.
6. **Mechanism of the solution** (5:26 to 9:08). The tree, the depth number, solo vs
   orchestrated, the gates file, the evidence line. Longest chapter.
7. **The honest failure and the fix** (10:27). "That session ran for around 3 to 4 hours
   and there was just a login page." Then the fix, then the result. This is the most
   valuable structural move in the video: admitting the tool underperformed buys more
   credibility than any amount of praise, and the fix is the channel's own contribution.

Two monetisation beats are welded in: a mid-roll sponsor at 4:26 placed exactly on the
problem/solution seam, and a community pitch at 12:10 gated on "the version we used".

---

## 6. The channel formula

Six videos from the Hermes Agent playlist (`PLjUMAIGgDkklIqEbzFeIihV9GSACYNdgm`),
durations pulled with `yt-dlp --flat-playlist`:

| Duration | Title |
|---:|---|
| 11:54 | Hermes Agent Skills That Make It 10x More Powerful |
| 13:08 | Use This To Make The Hermes Agent Basically Free |
| 11:28 | 19 Hidden Features To Unlock The True Potential Of Your Hermes Agent Setup |
| 13:21 | Loop Engineering Totally 10x Hermes agents |
| 11:48 | 6 Insane Hermes Agent Use Cases That You Need Right Now |
| 13:42 | Hermes Agent under Claude Code Is Insane |

Runtime is tightly controlled: every video lands between 11:28 and 13:42, and our
reference at 12:57 sits in the middle. That is a deliberate target, not a coincidence.
It is the mid-roll-ad window.

The title pattern is `[authority or number] + [named tool] + [superlative outcome]`:

- Borrowed authority: "GitHub's #1 Trending Author's", "under Claude Code"
- A hard number: "19 Hidden Features", "6 Insane Use Cases", "10x"
- A superlative closer: "Is Insane", "True Potential", "You Need Right Now"

Every title names a specific tool. None of them are about a concept in the abstract.
That is the retrieval strategy: people search the tool name, not the idea.

Worth noting for our version: this formula works for their channel, and the runtime
target exists to serve mid-roll ads. Neither of those is our constraint. We copy the
craft, not the length or the clickbait register.

## 7. What to copy, what to change

**Copy:**

- One accent colour on greyscale, moving to mark the subject
- Grey pills instead of real text
- Long continuous animated holds instead of cuts
- Punch real recordings in until the named thing is unmissable
- Problem mechanism before solution
- Kill the prior art by name
- Admit where it broke

**Change for our version:**

- 13 minutes is long. Target 5 to 6.
- Drop the sponsor beat entirely.
- The Anthropic clay accent is theirs by association. Pick our own accent.
- Their narration is TTS at a flat 227 wpm. Ragnar's voice is the differentiator, so
  225 wpm is the ceiling, not the target.

---

## 8. Reproducibility

Commands used, so this can be re-run on any new reference:

```bash
# container facts
ffprobe -v error -show_format -show_streams -of json IN.mp4

# stills every 10s
ffmpeg -i IN.mp4 -vf "fps=1/10,scale=640:-1" -q:v 4 frames/t_%03d.jpg

# scene cuts (note: -v error suppresses showinfo, use metadata=print)
ffmpeg -i IN.mp4 -filter_complex "select='gt(scene,0.2)',metadata=print:file=scenes.txt" \
  -an -f null -

# loudness
ffmpeg -i IN.mp4 -af ebur128=framelog=quiet -f null -

# transcript
yt-dlp --skip-download --write-auto-sub --sub-lang en --write-description URL
```
