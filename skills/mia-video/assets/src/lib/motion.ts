import {Easing, spring} from 'remotion';

/**
 * Shared easing vocabulary for the V2 pass.
 *
 * V1 leaned on a single symmetric curve everywhere, which is what made the
 * motion feel mechanical: every move accelerated and decelerated the same way,
 * so nothing had weight. These are chosen so arrivals decelerate hard and
 * departures leave quickly.
 */
export const EASE = {
  /** Fast start, long settle. Arrivals, reveals, anything that lands. */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** Snappier than `out`, less tail. Small UI-scale moves. */
  swift: Easing.bezier(0.22, 0.9, 0.28, 1),
  /** Eased both ends, weighted late. Camera moves. */
  inOut: Easing.bezier(0.45, 0, 0.15, 1),
  /** Almost linear with soft ends. Long continuous travel that must not pulse. */
  drift: Easing.bezier(0.4, 0, 0.3, 1),
};

/** Deterministic 0..1 hash. Same input always gives the same value. */
export const rand = (i: number, salt = 0): number => {
  const x = Math.sin(i * 127.1 + salt * 311.7 + 0.5) * 43758.5453;
  return x - Math.floor(x);
};

/** Deterministic value in a range. */
export const range = (i: number, salt: number, min: number, max: number): number =>
  min + rand(i, salt) * (max - min);

/**
 * A spring that overshoots slightly before settling.
 *
 * V1 used damping 200, which is critically damped: the element glides to its
 * target and stops dead. Real objects with mass overrun a little and come
 * back, and that single detail is most of what reads as "realistic".
 */
export const settle = (opts: {
  frame: number;
  fps: number;
  start: number;
  duration?: number;
  bounce?: number;
}): number => {
  const {frame, fps, start, duration = 42, bounce = 12} = opts;
  return spring({
    frame: frame - start,
    fps,
    config: {damping: bounce, mass: 0.82, stiffness: 108},
    durationInFrames: duration,
  });
};

/**
 * Continuous low-frequency camera float.
 *
 * Layered sines at incommensurate rates so the loop never visibly repeats.
 * A frame that is perfectly still reads as a freeze, which is a large part of
 * why V1 felt like waiting even while things were technically animating.
 */
export const cameraDrift = (seconds: number, amp = 1) => ({
  x: (Math.sin(seconds * 0.31) * 7 + Math.sin(seconds * 0.73 + 1.7) * 3.4) * amp,
  y: (Math.cos(seconds * 0.26 + 0.9) * 5.2 + Math.sin(seconds * 0.61 + 3.1) * 2.6) * amp,
});

/**
 * Organic float for an untethered object. Three frequencies per axis so two
 * elements sharing a phase still never move in lockstep.
 */
export const floatAt = (
  seconds: number,
  seed: number,
  ampX: number,
  ampY: number,
  speed = 1,
) => {
  const p = rand(seed, 3) * Math.PI * 2;
  const q = rand(seed, 7) * Math.PI * 2;
  const t = seconds * speed;
  return {
    x: (Math.sin(t * 0.62 + p) * 0.7 + Math.sin(t * 1.13 + q) * 0.3) * ampX,
    y: (Math.cos(t * 0.51 + q) * 0.68 + Math.cos(t * 0.94 + p) * 0.32) * ampY,
    rot: Math.sin(t * 0.44 + p) * 0.6 + Math.sin(t * 0.81 + q) * 0.4,
  };
};
