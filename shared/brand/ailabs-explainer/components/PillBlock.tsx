import React from "react";
import { seededUnit, Tone, useTheme } from "../theme";
import { Pill } from "./Pill";

export type PillBlockProps = {
  /** Number of skeleton lines. 2 reads as a heading + subhead, 4-5 as a paragraph. */
  lines: number;
  /** Width of a full line. Individual lines are jittered under this. */
  width: number;
  height?: number;
  tone?: Tone;
  /** Vertical gap between lines. */
  gap?: number;
  /**
   * How ragged the right edge is, 0-1. 0.28 means lines land between 72% and 100%
   * of `width`, which is roughly what justified-off body copy does.
   */
  jitter?: number;
  /** Changes the ragged pattern without changing anything else. */
  seed?: number;
  /**
   * The last line of a paragraph is always short. Set false for lists, where every
   * row is its own thought and a short last line reads as a mistake.
   */
  shortLast?: boolean;
  from?: number;
  /** Frames between consecutive lines appearing. Reads as the paragraph typing itself. */
  stagger?: number;
  duration?: number;
  style?: React.CSSProperties;
};

/**
 * A paragraph of pills. Widths are jittered from a seeded hash so the block reads
 * as real ragged text instead of a stack of identical bars -- and so the same block
 * renders identically on every frame and every render thread.
 */
export const PillBlock: React.FC<PillBlockProps> = ({
  lines,
  width,
  height,
  tone = "dim",
  gap = 14,
  jitter = 0.28,
  seed = 1,
  shortLast = true,
  from,
  stagger = 3,
  duration = 10,
  style,
}) => {
  const t = useTheme();
  const h = height ?? t.pillHeight;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap, ...style }}>
      {Array.from({ length: lines }, (_, i) => {
        const isLast = i === lines - 1;
        const r = seededUnit(seed * 1013 + i);
        // Last line gets its own narrower band (35-70%) so it always terminates
        // the paragraph visually rather than accidentally being the longest line.
        const frac = shortLast && isLast ? 0.35 + r * 0.35 : 1 - r * jitter;
        return (
          <Pill
            key={i}
            width={Math.round(width * frac)}
            height={h}
            tone={tone}
            from={from === undefined ? undefined : from + i * stagger}
            duration={duration}
          />
        );
      })}
    </div>
  );
};
