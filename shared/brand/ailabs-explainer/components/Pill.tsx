import React from "react";
import { useCurrentFrame } from "remotion";
import { Tone, toneColor, useTheme } from "../theme";
import { entranceFade } from "../motion";

export type PillProps = {
  /** Pixels, or any CSS length. A pill's width is the only thing that says "how much text". */
  width: number | string;
  /** Measured 14-18px on 1080p. Defaults to the theme's 16. */
  height?: number;
  tone?: Tone;
  /** Corner radius. Defaults to the theme's 7px, which is what makes a bar read as a text line. */
  radius?: number;
  /** Frame at which the reveal starts. Omit for a pill that is simply always there. */
  from?: number;
  /** Reveal length in frames. 10 frames (~0.33s) is the reference's feel. */
  duration?: number;
  style?: React.CSSProperties;
};

/**
 * The skeleton text primitive. Content in this style is never spelled out -- a
 * heading is a bright pill and a line of body copy is a dim one. That is why the
 * reference reads as calm at 227 wpm: there is almost nothing on screen to read.
 *
 * The reveal grows from the left rather than fading, because text is written left
 * to right and the eye accepts the growth as "a line appearing" without noticing
 * an animation happened.
 */
export const Pill: React.FC<PillProps> = ({
  width,
  height,
  tone = "dim",
  radius,
  from,
  duration = 10,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const h = height ?? t.pillHeight;

  // Decelerating: the pill arrives rather than stopping dead.
  const p = entranceFade(frame, from, duration);

  return (
    <div
      style={{
        width,
        height: h,
        borderRadius: radius ?? t.radiusPill,
        backgroundColor: toneColor(t, tone),
        // scaleX rather than animating `width` so the browser never reflows,
        // which keeps the reveal frame-exact under Remotion's parallel rendering.
        transform: `scaleX(${p})`,
        transformOrigin: "left center",
        flexShrink: 0,
        ...style,
      }}
    />
  );
};
