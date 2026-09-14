import React from "react";
import { useCurrentFrame } from "remotion";
import { Tone, toneColor, useTheme } from "../theme";
import { entranceFade } from "../motion";

export type CalloutProps = {
  /** The literal words. Keep it to a measurement or a name: `10 min`, `gates.md`. */
  children: React.ReactNode;
  tone?: Tone;
  fontSize?: number;
  /**
   * Wrap it in a rounded surface chip. Use when the callout floats over a busy area;
   * bare text is better on black.
   */
  boxed?: boolean;
  /** Absolute placement inside the nearest positioned ancestor. Omit to lay out inline. */
  x?: number;
  y?: number;
  from?: number;
  duration?: number;
  /** Pixels the label rises through as it fades in. */
  rise?: number;
  style?: React.CSSProperties;
};

/**
 * The small monospace label for the rare case where the literal word is the point.
 *
 * Everything else in this style is a grey pill. A Callout is the exception you spend
 * sparingly: the reference shows real text maybe a dozen times in thirteen minutes,
 * which is exactly why `3h 41m` lands when it appears.
 */
export const Callout: React.FC<CalloutProps> = ({
  children,
  tone = "bright",
  fontSize = 28,
  boxed = false,
  x,
  y,
  from,
  duration = 12,
  rise = 8,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const p = entranceFade(frame, from, duration);

  const positioned = x !== undefined || y !== undefined;

  return (
    <div
      style={{
        position: positioned ? "absolute" : "relative",
        left: x,
        top: y,
        fontFamily: t.mono,
        fontSize,
        fontWeight: 500,
        // Lowercase is enforced here rather than left to the caller, because one
        // capitalised callout is enough to make the whole frame look like a slide.
        textTransform: "lowercase",
        letterSpacing: 0.2,
        color: toneColor(t, tone),
        opacity: p,
        transform: `translateY(${(1 - p) * rise}px)`,
        ...(boxed
          ? {
              backgroundColor: t.surface,
              padding: `${Math.round(fontSize * 0.42)}px ${Math.round(fontSize * 0.8)}px`,
              borderRadius: 999,
            }
          : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
};
