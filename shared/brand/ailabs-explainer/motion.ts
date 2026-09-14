import { Easing, interpolate, spring } from "remotion";

/**
 * Entrance timing shared by every component that takes a `from` prop.
 *
 * The rule both helpers enforce: **an entrance cannot begin before its shot's
 * first frame.** If `from` is undefined, or is at or before frame 0, the element
 * is already there and no animation runs.
 *
 * This is not a nicety. Remotion's `spring({frame: 0})` is exactly 0, and a fade
 * starting at frame 0 is exactly 0, so a component scheduled at `from={0}` renders
 * *nothing* on the first frame of its `<Sequence>`. In a composition of abutting
 * shots that is a single uniform frame at every boundary -- a 33ms black flash at
 * 30fps, which is fatal in a style whose whole premise is that it never hard-cuts.
 * Four of them shipped in StyleProof before `scripts/blank-frames.mjs` caught them.
 *
 * So: schedule an entrance at `from={0}` and you get the element present at the
 * cut. Fades and springs still work normally for anything scheduled at `from >= 1`.
 */

/** Springs used for entrances. Heavily damped -- these settle, they do not bounce. */
export const ENTRANCE_SPRING = { damping: 200, mass: 0.6 } as const;

export type SpringConfig = { damping: number; mass: number };

/**
 * Spring progress 0..1 for a container entrance (fade + rise + scale).
 * Returns 1 immediately when the entrance is not scheduled after the first frame.
 */
export const entranceSpring = (
  frame: number,
  fps: number,
  from: number | undefined,
  config: SpringConfig = ENTRANCE_SPRING,
): number => {
  if (from === undefined || from <= 0) return 1;
  return spring({ frame: frame - from, fps, config });
};

/**
 * Linear-in, eased-out progress 0..1 for a plain fade or a width reveal.
 * Returns 1 immediately when the entrance is not scheduled after the first frame.
 */
export const entranceFade = (
  frame: number,
  from: number | undefined,
  duration: number,
  easing: ((t: number) => number) | undefined = Easing.out(Easing.cubic),
): number => {
  if (from === undefined || from <= 0 || duration <= 0) return 1;
  return interpolate(frame, [from, from + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
};
