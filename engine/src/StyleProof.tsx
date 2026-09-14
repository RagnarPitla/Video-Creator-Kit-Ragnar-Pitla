import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SkeletonScene } from "./scenes/SkeletonScene";
import { BrowserScene } from "./scenes/BrowserScene";
import { TreeScene } from "./scenes/TreeScene";
import { GatesScene } from "./scenes/GatesScene";
import { ParallelScene } from "./scenes/ParallelScene";
import { ScreenRecScene } from "./scenes/ScreenRecScene";

/**
 * Six holds over 40s. The reference averages 4.7 cuts per minute with seven holds
 * over 20s; a proof sheet that has to touch twelve components in 40s cannot hit that
 * rate, so the tree gets a full 12s hold to demonstrate the behaviour the rate is
 * really about -- a single shot carrying the narration while the accent moves inside it.
 *
 * Frame budget: 180 / 210 / 360 / 180 / 150 / 120 = 1200.
 */
const SHOTS = [
  { at: 0, len: 180, Component: SkeletonScene },
  { at: 180, len: 210, Component: BrowserScene },
  { at: 390, len: 360, Component: TreeScene },
  { at: 750, len: 180, Component: GatesScene },
  { at: 930, len: 150, Component: ParallelScene },
  { at: 1080, len: 120, Component: ScreenRecScene },
] as const;

export const StyleProof: React.FC = () => (
  // Painted black under everything so a one-frame gap between shots can never
  // flash white, which would be the single loudest possible style violation.
  //
  // The shots abut exactly (0-179, 180-389, ...), but abutting is not sufficient:
  // an incoming scene whose outermost element animates in from opacity 0 renders a
  // uniform frame on its own local frame 0, and the black underlay makes it a black
  // flash rather than a white one. That shipped four times here. The fix lives in
  // the library -- see `motion.ts` -- and `scripts/blank-frames.mjs` is the gate
  // that stops it coming back:
  //
  //   node scripts/blank-frames.mjs out/style-proof.mp4 --allow-head 5
  //
  // The allowed head is SkeletonScene's deliberate fade up from black over frames
  // 0-3. Every other boundary must be non-empty on its first frame.
  <AbsoluteFill style={{ backgroundColor: "#0D0D0D" }}>
    {SHOTS.map(({ at, len, Component }) => (
      <Sequence key={at} from={at} durationInFrames={len}>
        <Component />
      </Sequence>
    ))}
  </AbsoluteFill>
);
