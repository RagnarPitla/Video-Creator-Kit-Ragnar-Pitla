# Ghosted interface, and the review loop that kept missing it

How a defect survived seventeen versions of the Project Mia film, what actually
caused it, and the change to the review loop that would have caught it on day
one. Written up because both halves generalise to any film that puts real
product recordings on screen.

Source: Project Mia vision film, V17 to V17B, 2026-08-31.
Code: `shared/lib/remotion/cleanUI.tsx`, `shared/lib/remotion/QcReel.tsx`,
`shared/lib/video-gates/qc-verify.mjs`.

---

## 1. The report

Ragnar, on the delivered V17 final, with a screenshot arrowed at the bottom-left
of one frame:

> Could you ask your agent to remove all the text and faded bars from the UI parts?

Then, when the first reply treated it as one frame:

> not just one frame on the bottom we had lots of others

And later:

> it is in all places where we have actual Project Mia screenshots like 22 seconds too

He was right three times. The first read was too narrow, and the correction is
the useful part of this document.

## 2. Do not fix the frame you were shown

The arrow pointed at one cluster in one shot. The instinct is to fix that
cluster. Doing so would have shipped a V17B that was still wrong at 0:22, 0:26,
0:40, 1:53 and everywhere else.

What found the real scope was cheap and took two minutes: crop the same
horizontal band out of every shot of that type and stack the crops into one
tall sheet.

```bash
for f in 500 590 660 710 770 840 1200 1380 1540 2150 4300; do
  ffmpeg -v error -y -i film.mp4 \
    -vf "select=eq(n\,$f),crop=1920:400:0:640,scale=760:158,\
drawtext=text='f$f':x=6:y=6:fontsize=22:fontcolor=red" \
    -frames:v 1 band-$f.png
done
ffmpeg -v error -y -i band-500.png ... -filter_complex "vstack=inputs=11" bands.png
```

Eleven crops on one sheet answered "is this one shot or all of them" instantly.
`shared/lib/verify/stills.sh` does the tiling; the band crop is the addition.

**Label every tile with its frame number.** An unlabelled contact sheet tells
you a problem exists but not where, and you end up re-deriving the mapping by
hand.

**Do not judge severity from a downscaled band.** These tiles are scaled to
0.395, which softens type and makes crisp content look faded. Two shots were
initially recorded as defective on the strength of a band tile and turned out
to be fine at full size. The sheet is for *locating*, the full frame is for
*judging*. Always confirm on a full-resolution frame before changing anything.

## 3. There were two causes, not one

The sheet showed the artefact in fifteen places. They did not have one cause,
and a single fix would have addressed about two thirds of it.

### Cause A - the caption wash, on the eleven recorded shots

`ProductClip` dissolved the bottom of every screen recording into the paper so
the caption had somewhere to sit:

```
linear-gradient(180deg,
  rgba(238,243,248,0)    62%,
  rgba(238,243,248,0.94) 88%,
  rgba(238,243,248,1)   100%)
```

Alpha crosses 0.29 at 70 percent and 0.47 at 75 percent, so everything between
roughly y=700 and y=970 renders at partial opacity. Where the recording has
content down there - the intake screen's placeholder bars, the environment tile
grid, a progress bar - it comes through half-erased. Nothing is wrong with the
recording; the film is smearing it.

The same wash also painted over the shot label at `bottom: 152`, which sits at
y=890 to 928 where alpha is about 0.95. That is why "MIA CONSOLE" was a ghost in
every single product shot. The label was drawn before the gradient in DOM order,
so it was being erased by the film's own furniture. Nobody had noticed in
seventeen versions.

**Fix.** End the picture on a defined edge instead of dissolving it:

```
linear-gradient(180deg,
  rgba(238,243,248,0) ${plateTop - 24}px,
  rgba(238,243,248,1) ${plateTop}px,
  rgba(238,243,248,1) 100%)
```

Three things matter about this:

- **The plate is fully opaque for the whole shot.** Fading it in with the
  caption would restore the ghosted interface for the 26 frames of the fade -
  the exact thing being removed, just briefly.
- **The feather is 24px.** Long enough not to alias, short enough that no line
  of interface type is legible inside it. A 250px ramp is a smear; a 24px ramp
  is an edge.
- **It gives back more clean picture, not less.** The old wash started dimming
  at 62 percent. The plate leaves everything above 82 percent untouched.

**A hard cut through a row of tiles is fine. A smear through it is not.** The
frame ending mid-grid reads as a crop, which is ordinary film grammar. Do not
contort the framing to avoid it.

### Cause B - a scrim that was never strong enough, on the drawn scenes

`Artifact` put `rgba(24,29,40,0.30)` and `blur(2px)` behind its document card.
At 30 percent over a light interface you can still read the left nav, the task
rows behind the card, and the "Wave completion / 3 of 21 complete" progress bar.
Combined with the grade's `edgeBlur` it produced exactly what the report said:
text and faded bars.

**Fix.** `rgba(238,243,248,0.93)` and `blur(18px)` - a light frosted field in
the film's own paper colour. The white card keeps separation through its
shadow. A stronger *dark* scrim also kills the text but drops a heavy block into
an otherwise light film.

### The general shape

> A partially-visible interface always reads as a rendering fault. Either show
> it or do not. There is no acceptable middle setting.

Both fixes are the same move: replace a soft ramp with a decision.

## 4. One switch, not fifteen edits

The wrong way to apply this is clip by clip as each site is reported. That was
already proven on this film - the V17 white-flash fix had been applied piecemeal
across earlier sessions and three clips were found in three different
half-fixed states, each looking done.

Threading a prop through eleven call sites and seven scene components has the
same problem plus one worse property: a shot added next month silently misses
it.

So the switch is a context, set once per cut:

```tsx
export const CleanUIContext = React.createContext(false);
export const useCleanUI = () => React.useContext(CleanUIContext);
```

`makeProductCut` wraps the film in a provider driven by `cut.cleanUI`, and
`ProductClip` and `Artifact` read it. Adding a product shot to a clean cut gets
the treatment automatically. Off by default, so already-approved cuts keep
rendering exactly as approved.

Per-shot escape hatch where the content demands it: `plateTop` overrides the
default 872, in **unscaled content coordinates**. Measure the override off a
full-resolution still - do not guess it.

## 4a. The first fix failed, for two reasons worth knowing

The first clean-UI render went back with the ghosting still visible. Ragnar's
reply was the right question: "do you want to rerender instead of trying to
remove?" The removal approach was correct. The implementation had two
independent bugs, each sufficient on its own.

**A feather is a band of partial opacity.** The plate was drawn with a 24px
feathered edge, because a hard line looked crude in the abstract. But partial
opacity through a row of text is the exact defect being fixed - 24px instead of
250px is the same smear at one tenth the width, and at 1080p a 24px band is two
full lines of small UI type. `PLATE_FEATHER` is now 0. A hard cut through a row
of tiles reads as a crop and is fine. A smear through it never is.

**A fixed mask line under a moving picture.** `ProductClip` scales the recording
about the frame centre from `zoomFrom` to `push`, so a row authored at unscaled
`y` is drawn at `540 + (y - 540) * scale`. The intake shot pushes 1.12 to 1.26,
which sweeps content roughly 32px downward over 90 frames. A stationary plate
line is therefore *guaranteed* to catch a row eventually. The plate now applies
the same transform as the picture:

```tsx
const plateY = 540 + (plateTop - 540) * scale;
```

Note the ordering. Tracking is polish; the hard edge is the guarantee. The
recording itself also animates - the intake dropdown opens and pushes rows down
- so no amount of tracking can promise a gap opens where you put the line. Only
`feather: 0` promises that whatever the line lands on is either fully shown or
fully gone.

Probe the first, middle and last frame of any shot you set `plateTop` on.
Solving only the middle frame is the same mistake as fixing only the frame you
were shown.

**Measure rows, do not estimate them.** Run PIL over a full-resolution still and
take min-luma per row across the card's x-range. On the intake shot that gave
dropdown items ending at 711, "Industry" at 749-764, its placeholder at 792-807
and the next row at 849 - close enough together that a 40px error picks a
different answer. It also exposed a real conflict: the left panel's empty-state
row sits at content y=756, overlapping the right column's Industry field, so no
line keeps one and drops the other. That is a content decision, not a geometry
one. Take it deliberately and write down what it costs.

## 5. The review loop was the real defect

The film is 4608 frames. A full render is about 23 minutes. That is slow enough
that review happens once instead of five times, and it is why this survived so
long - and why the V17 white flashes survived four rounds that each sampled a
narrow window because looking at everything was too expensive.

**The fix is a QC reel.** Play a short window around every cut boundary, plus
any frames named explicitly, at half resolution. Roughly 35 marks at 16 frames
is 560 frames at 960x540 - a minute and a half instead of 23.

Boundaries are derived from the cut, never hand-listed:

```tsx
export const cutBoundaries = (cut: Cut): number[] => { /* prologue, slots, sub-shots */ };
```

Hand-listing is how a new shot gets forgotten. Boundaries matter because that is
where this film breaks: every V17 white flash was at one.

**Keep the mark list in one module, imported by both the composition and the
verifier.** This was got wrong here. `Root.tsx` held the hand-picked mid-shot
marks and the mark-file generator held its own copy; the copy went stale at 9
entries against Root's 20, so the generated file described 35 marks while the
rendered reel contained 46. Every comparison after that would have been against
the wrong frame, and the gate would have reported green while checking nothing.
Caught only because 46 marks times a 16-frame span is a 736-frame reel and the
arithmetic did not come out.

Cross-check the two whenever the marks change: `marks * span` must equal the
reel's frame count.

Seeking is a negative `Sequence` offset. The reel composition stays at
1920x1080 - the film's layout is in absolute pixels and cannot be rendered into
a smaller canvas - and the size reduction comes from Remotion's `--scale=0.5` at
render time.

### Never CSS-scale a film that uses backdrop-filter

The first working reel was built by wrapping the film in `transform:
scale(0.5)`. It rendered, it played, and every frame showed a mirrored, doubled
ghost of the card. It looked like a defect in the film.

Chrome resolves `backdrop-filter` against the **nearest transformed ancestor**,
not the viewport. `FilmGrade`'s edge blur is a radial-masked `backdropFilter`,
so the CSS wrapper made it sample the wrong region and paint a reflection.
Anything in the compositing family - `backdrop-filter`, `mix-blend-mode`,
`position: fixed` - changes meaning under a transformed ancestor.

Use `--scale`, which is a rasterisation setting and does not touch the layout
tree. Not a wrapper.

**The gate caught this.** `qc-verify` failed 37 of 46 marks at around 25 dB on
the real reel, having previously been proven on synthetic ones. A gate that has
only ever been proven against defects you injected yourself is a gate you are
still guessing about.

### The reel is a proxy, so prove it is faithful

A reel that silently shows the wrong frame is worse than no reel: it looks like
a plausible film and gets trusted. An off-by-one in the seek, a stale prologue
offset, or a clipped scale would all do that.

`qc-verify.mjs` compares each mark against the same frame of the full render.
Resampling differs - Chrome's CSS scale against ffmpeg's - so the match is never
bit-exact, and a fixed "looks high enough" threshold would be a guess dressed as
a gate.

**So every mark is also compared against a frame it should not match**, and the
gate is the *separation* between the two:

```bash
node shared/lib/video-gates/qc-verify.mjs \
  --reel reel.mp4 --film film.mp4 --marks 0,282,432,522 --span 16
```

A reel showing a constant frame, or the wrong frame, or nothing, fails the
separation test even where a bare threshold would pass it. This is the same
principle as measuring a precondition outside an isolation mechanism before
trusting a check inside it: a comparison with no control passes when the thing
it measures is entirely absent.

Separation alone is not enough, though. Proven against a reel deliberately
shifted by 40 frames, separation caught only 1 mark of 6 - a neighbouring frame
of the same shot still separates cleanly from a control 90 frames away. So the
gate has three layers:

| Layer | Catches | Caught on the +40 test |
|---|---|---|
| Separation vs a control 90 frames away, floor 6 dB | gross failure, constant or blank reel | 1 of 6 |
| Near-neighbour: must match its own frame better than one span away | small local error | 2 of 6 |
| Argmax alignment probe, searching +/- span at `step` | systematic offset | decisive, named "SEEK OFF BY -14" |

The alignment probe is the one that matters for a seek bug, because a seek
offset cannot be present at one mark and absent at the next.

### Three bugs found inside the gate by running it

Each passed `node --check`, and each would have made the gate silently useless.

1. **`execFileSync` returns stdout only, and ffmpeg writes filter stats to
   stderr.** The psnr helper read an empty string and threw. Shell testing hid
   it because `2>&1 | grep` had already merged the streams. Use `spawnSync` and
   read both.
2. **`-ss t` returns the first frame with pts >= t**, so `(N + 0.5) / fps` lands
   on frame N+1. Verified: it matched the neighbour at `inf` and the intended
   frame at only 42.7 dB - a number that reads as a healthy match, so the
   off-by-one would never announce itself. `max(0, (N - 0.25) / fps)` is
   bit-exact at frames 0, 500, 1540 and 3400. It is also about 9s per grab
   faster than `select=eq(n,N)`, which decodes from frame 0.
3. **The temp dir was deleted before the align block ran**, so the failure
   surfaced as ffmpeg not opening its *output* file.

Test a gate in both directions before you trust its verdict: it must pass a
known-good input and fail a known-bad one. A gate that has only ever returned
green has not been tested.

### What the reel does not cover

Audio, total duration, drift against narration, and anything that needs watching
a shot play out. Those need the full file. **The reel is the iteration loop; the
full render is still the final gate.**

## 6. Operating rule

Full-film renders only for the final gate, or when Ragnar asks for a version.
Everything before that is the reel. Turning a 23-minute check into 90 seconds is
the difference between iterating twice and iterating ten times, and iteration
count is what actually found this defect.

## 7. Checklist

- [ ] Band-crop every shot of the affected type and stack them before deciding scope.
- [ ] Label each tile with its frame number.
- [ ] Confirm on a full-resolution frame before changing anything.
- [ ] Ask whether there is more than one cause.
- [ ] Apply the fix through one switch, not per call site.
- [ ] Probe first, middle and last frame of any shot with a per-shot override.
- [ ] Mask edges hard - a feather is the artefact at a narrower width.
- [ ] Make any mask track the transform of the picture it sits on.
- [ ] Render the QC reel with `--scale`, never a CSS transform.
- [ ] Check `marks * span == reel frame count` before trusting a verify run.
- [ ] Render the QC reel, not the film.
- [ ] Run `qc-verify.mjs` before reviewing from the reel.
- [ ] Full render plus `gate.sh` and full-range `contrast.mjs` for the final gate.

## 8. The resolution: stop drawing on the recording

Three attempts, two wrong, recorded because both wrong ones looked correct in
the markup.

1. **A caption plate with a feather.** A feather is partial opacity by another
   name, so the ghosting survived inside it.
2. **A hard-edged plate tracking the picture's scale.** It did remove the wash -
   measured at one shot, content above the cut went from a minimum luma of 230
   to 219, ie crisper. But a full-width crop at one shared line takes the
   clutter *and* the rest of the card. The reviewer reads that as the render
   having failed: "why are we missing those pieces". A 20-mark sweep also found
   it landing mid-glyph on seven other shots, because one line cannot suit
   eleven different layouts.
3. **Draw nothing on the recording.** What shipped.

### The actual cause

It was never one layer. A product shot carried four:

| Layer | Effect |
|---|---|
| `linear-gradient(180deg, transparent 62%, paper 100%)` | veils everything below y=670 at a rising opacity |
| `radial-gradient(... rgba(22,30,44,0.14) 100%)` | darkens the corners by up to 14% |
| A status chip | the film's label, over the picture |
| The caption | the narration line, over the picture |

The wash is the one that draws the complaint, because it does not remove
anything - it *half*-removes it. A progress bar becomes a faded bar; a status
line becomes ghosted text. The reviewer's words were "text and faded bars", and
that is literally what a 38%-tall alpha ramp produces.

### The fix as a switch, not a number

Add a `fit` prop and gate every drawn layer on it, so a shot cannot be
half-converted:

```tsx
{fit ? null : <Vignette/>}
{plate && !fit ? <Plate/> : null}
{label && !plate && !fit ? <Chip/> : null}
{caption && !fit ? <Caption/> : null}
```

`fit: {cx, cy, h, w?}` is in the recording's own pixels. One scale factor drives
both axes so a region can never be stretched. Without `w` the region's height
sets the scale and it covers the frame; with `w` it is contained and the film's
paper fills the rest.

### If clutter must go, patch it - measured

```tsx
patches={[{x: 444, y: 716, w: 419, h: 172, fill: 'rgb(230,226,235)'}]}
```

Drawn inside the same transformed box as the video, so it stays locked to the
pixels it was measured against however the shot pushes. Every number measured
off a full-resolution still:

- **Find the real edges.** A first attempt spanned x 452-880. The panel's
  divider is at x=866, so it painted 14px over the neighbouring column and
  showed as a vertical seam.
- **Find the real rows.** Scan minimum luma per row across the panel's x-range.
  Content occupied 752-851, so 716-888 clears it at both ends.
- **Sample the fill.** Flat `rgb(230,226,235)` at every sample, so a solid cover
  leaves no step. A gradient panel needs a different approach.
- **Do not patch a moving layout.** Measured at 3.3s, 8.1s and 10.5s, one clip's
  panel sat in three different places and its fill went lavender to near-white.
  A fixed rectangle would drift off the thing it is hiding. Leave it.

### Checklist additions

- [ ] Enumerate *everything* the component draws over a recording before
      blaming one layer. Grep for `gradient`, `maskImage`, and any absolutely
      positioned sibling of the video.
- [ ] Never fix a local artefact with a global instrument. Clutter is local.
- [ ] A blanket switch such as `cleanUI` that turns a crop on for every shot at
      once will land mid-glyph on most of them. Default it off.
- [ ] Ask whether the caption needs to be over the picture at all. Usually the
      honest answer is no.
- [ ] Probe first, middle and last frame of a converted shot - the push moves
      the framing.

## 9. Picking an in-point in a screen recording

A screen recording is not uniformly usable. One that pages between documents
spends real time on transitions: a white page, sometimes with nothing on it but
a mouse cursor.

On the V20 cut two of five in-points landed on exactly that. A still from the
middle of each shot looked correct, so the error survived the first check and
was only caught when a contact sheet put all four new shots side by side and
one tile was blank.

Measuring dark-pixel fraction at one-second intervals across the recording
found one of the two sources blank from 6s to 40s - a 34-second hole in a
88-second capture.

Two rules follow.

**Score the recording before you cut it.** Downscale each candidate second to
240x135, count pixels below luma 200, and treat anything under 3% as a
transition rather than a page. It costs one ffmpeg call per sample.

**Probe the first and last frame of every shot, not the middle.** The middle is
the frame most likely to be fine. A shot that starts blank and resolves is
still a shot that starts blank, and that is what the viewer sees on the cut.

Both checks are cheap and neither is optional. The cost of skipping them is a
22-minute render that has to be thrown away.

## 10. Real footage is not automatically better than a drawn scene

A vision film wants product footage because footage is proof. That argument has
a limit, and the limit is legibility.

A 1920x1080 browser capture of a dense form - a project intake screen, a scope
picker, a file list - fills the frame with text at roughly 12px. On a
projector or in a LinkedIn player nobody reads it. The viewer registers
"a busy grey screen", which is worse than a drawn scene that says one thing,
because it costs the same five seconds and lands nothing.

On the V21 cut three slots were handed back to drawn animation for exactly this
reason. The comparison that settled it was six frames from each version at the
same timestamps, stacked side by side. Two of the six were identical; three
were a legible animation against an illegible screenshot; one was a judgement
call. That sheet took two ffmpeg calls and made the decision obvious.

The test to apply before choosing a capture:

**Can you read the thing the shot is about, at the size the shot will be
watched?** If the answer needs a zoom, either frame the region with `fit` or
use a drawn scene. Do not ship the full-bleed capture and hope.

Captures that survive the test share a shape: a console task view with large
headings, colour, and a short list. Captures that fail share a shape too: a
form with many small labelled fields, or a spreadsheet.

Related: alternate the register. V20 ran three dense document pages back to
back across fifteen seconds and read as one long grey block even though each
page was individually fine. V21 alternates document, console, document,
console, board over the same span with the same footage sources.

## 11. Renaming a product inside a film

Two findings, one of them uncomfortable.

### A source grep cannot see all the on-screen text

The rename sweep searched for the old name inside quoted strings, which is
where most copy lives. It found nineteen and missed two, both of them JSX text
nodes rather than string literals:

```
    >
      Mia
    </div>
```

and a paragraph whose text wrapped across two source lines, so the name sat on
a line that contained no quote and no tag.

A string-literal pattern cannot match either. It is not a weak pattern, it is
the wrong instrument - it is searching a different population from the one that
reaches the screen.

**Gate the rendered frames, not the source.** Extract one frame per second and
OCR it:

```
ffmpeg -i film.mp4 -vf fps=1 /tmp/ocr/f%04d.png
for f in /tmp/ocr/f*.png; do tesseract "$f" - --psm 11; done | grep -i oldname
```

That is what caught both. It answers the actual question - does the old name
appear on screen - rather than a proxy for it.

### Some of the name is not yours to change

The film's own drawing accounted for 55 seconds of the old name. The product
recordings accounted for 34 more, and no edit to the film touches those. The
capture shows the browser chrome, the app title, the agent's greeting text,
an environment name, and in one shot a schema identifier inside the product's
own output.

Say this plainly and early, with timestamps. The options are to re-record the
product after it is renamed, to reframe the shots so the chrome falls outside
the crop, or to replace them with drawn scenes. Painting over them is not an
option, for the reasons in sections 1 to 8.

Measure it before proposing anything: the same one-frame-per-second OCR sweep,
sorted into "we drew this" and "the product drew this", gives the exact
seconds and makes the conversation concrete instead of speculative.

### The source grep is wrong in the other direction too

Having been burned by the under-reporting, the obvious correction is to widen
the pattern: strip comments, match the bare word anywhere, and fix everything
it returns. That produced 61 hits, and four of them looked like real drawn
text. Two were.

The other two lived in components the cut never mounts. `S07Continuity.tsx`
exports two variants, `S07Threads` and `S07Roster`; the film's slot resolves to
a third file entirely, `S07Handshake.tsx`. And the paragraph in
`ConsoleScenes.tsx` belongs to `SceneMigrationMap`, which the cut replaces with
two product clips. Both edits were harmless, but neither was a fix, and filing
them as fixes would have inflated the count and hidden how much was really
wrong.

So the source grep under-reports on JSX text nodes and over-reports on
unmounted components. It is useful for finding candidates and useless as a
verdict.

**The rendered frame is the only artefact that answers the question.** When a
source hit and the OCR disagree, resolve it by extracting the frame and looking
at the pixels - the OCR line at `t=84s` read `STILL RUNNING ACTIVATE`, which is
what proved the roster variant was not in the cut. Crop the region and view it;
a 900x300 crop settles in one look what an hour of reading the slot graph does
not.

Do not delete the unmounted duplicates to make the grep clean. Rename them.
They are live in other cuts, and a cut is one line away from selecting them.
