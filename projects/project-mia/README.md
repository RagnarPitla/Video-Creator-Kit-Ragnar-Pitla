# Project Mia - vision film

A 153.6s (4608 frame) Microsoft-house-style vision film for Project Mia, the
agentic platform that helps customers install and migrate Dynamics 365 faster.
Seventeen versions. This is the reference implementation for the `mia-video`
skill and the `film-director` agent.

## What is here and what is not

| | Where |
|---|---|
| Scene source, cuts, components | `src/` (in this folder) |
| Narration text and timing | `transcript/` (in this folder) |
| Narration audio, product screen recordings, fonts | **not copied** - 35MB, see below |
| Finished renders | **not copied** - 2.3GB, see below |

Working directory: `~/Desktop/Mia-video/mia-remotion`
Delivered finals: `~/Desktop/Mia-video/renders/v17`

The audio and footage are deliberately not in the kit. They are 35MB of
customer-specific screen recordings and a narration track for one film, so they
would not be reused by another project and would dominate the kit's size. The
brand SVGs, which **are** reusable, live in `shared/brand/d365`.

## Reading the source

`src/MiaCuts.tsx` is the file that matters. It defines every version as a
spread of the one before it, so the diff between two versions is readable:

```
v13Base -> v14Base -> v15Base -> v16Base -> v17
```

Each named object overrides only the slots that changed. `src/MiaFilm.tsx`
holds the slot table - the frame number and duration of every scene, which is
the authority for where a shot starts and ends. `src/film-copy.ts` holds all
on-screen text in one place, so copy can be reviewed without reading scene code.

## The two defects worth knowing about

Both were present for several versions and passed every check at the time.

**White flashes between clips.** Remotion sequences do not overlap, so a clip's
fade-out plays *before* the next clip's fade-in and the picture dips through
blank paper. Fifteen boundaries were affected, seven of them long enough to see.
Fixed by setting `fadeInFrames={0} fadeOutFrames={0}` on adjacent clips.

They survived because the contrast gate had only ever been run over narrow
ranges. See `docs/verification-gates.md`.

**The fifteenth product tile clipped by the frame edge.** The opening row is
scaled by a continuous push and slid by a path drift, so a tile parked at the
end of the range finished bisected. Fixed by pulling `DOCK_TO` from 0.855 to
0.80 in `src/scenes/S01Opening.tsx`.

## Known residual

Seven boundaries still dip for 1 to 2 frames (33-66ms) at transitions between
drawn scenes: f1563, f2232, f2326-2327, f3129-3130, f3304, f3480-3481, f3930.
Clearing them means changing entrance behaviour in seven separate scene
components rather than setting a prop. The visible flashes are gone; these are
at the edge of perception. Present in every version.

## Rebuilding

```bash
cd ~/Desktop/Mia-video/mia-remotion
npx remotion render Mia-Film-V17-Final <abs-path>.mp4 --concurrency=5
bash shared/lib/verify/gate.sh <file> --fps 30 --expect-frames 4608
node shared/lib/video-gates/contrast.mjs <file>
```

Roughly 23 minutes for the pair at concurrency 5 on an M-series laptop. Never
pipe a render to `head` - SIGPIPE kills it.
