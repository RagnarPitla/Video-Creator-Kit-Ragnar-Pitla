import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";
import { Card } from "./Card";

export type TerminalProps = {
  /** Path shown before the command. Dim, because nobody is meant to read it. */
  prompt?: string;
  /** The command. This is one of the rare places real words are allowed. */
  command: string;
  /** Lines printed under the command, revealed one at a time after typing finishes. */
  outputs?: string[];
  width?: number | string;
  height?: number | string;
  from?: number;
  /** Frames to wait after the panel lands before typing starts. */
  typeDelay?: number;
  /** Characters per second. 22 is fast enough to feel like a person, slow enough to read. */
  cps?: number;
  /** Frames between output lines appearing. */
  outputStagger?: number;
  fontSize?: number;
  /** Show three traffic lights on the panel. Off by default -- the reference's terminal is chromeless. */
  chrome?: boolean;
  style?: React.CSSProperties;
};

/**
 * Fake terminal. Real recordings of a terminal are better when you have one (see
 * ScreenRec), but a synthetic one is deterministic, renders at any resolution, and
 * lets you type a command that does not exist yet.
 *
 * The typewriter is derived from the frame number, never from a timer, so scrubbing
 * backwards in Remotion Studio untypes the command exactly.
 */
export const Terminal: React.FC<TerminalProps> = ({
  prompt = "~/project",
  command,
  outputs = [],
  width = 1100,
  height,
  from = 0,
  typeDelay = 14,
  cps = 22,
  outputStagger = 12,
  fontSize = 30,
  chrome = false,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const typeStart = from + typeDelay;
  const framesPerChar = fps / cps;
  const typed = Math.max(
    0,
    Math.min(command.length, Math.floor((frame - typeStart) / framesPerChar)),
  );
  const doneTypingAt = typeStart + command.length * framesPerChar;

  // 1s period: 15 frames on, 15 off at 30fps. Any faster reads as an error state.
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <Card
      tone="surfaceAlt"
      width={width}
      height={height}
      padding={0}
      from={from}
      style={{ overflow: "hidden", ...style }}
    >
      {chrome ? (
        <div
          style={{
            height: 46,
            backgroundColor: t.surface,
            display: "flex",
            alignItems: "center",
            paddingLeft: 22,
            gap: 12,
          }}
        >
          {[t.trafficRed, t.trafficYellow, t.trafficGreen].map((c) => (
            <div key={c} style={{ width: 13, height: 13, borderRadius: 13, backgroundColor: c }} />
          ))}
        </div>
      ) : null}

      <div
        style={{
          padding: 40,
          fontFamily: t.mono,
          fontSize,
          lineHeight: 1.7,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ color: t.pillDim, fontWeight: 400 }}>{prompt}</div>

        <div style={{ display: "flex", alignItems: "baseline" }}>
          <span style={{ color: t.pillDim, marginRight: "0.6em" }}>{">"}</span>
          <span style={{ color: t.pillBright, fontWeight: 500, whiteSpace: "pre" }}>
            {command.slice(0, typed)}
          </span>
          <span
            style={{
              display: "inline-block",
              width: fontSize * 0.55,
              height: fontSize,
              marginLeft: 2,
              transform: "translateY(4px)",
              backgroundColor: t.accent,
              // The caret is the one accent in a terminal shot: it marks where the
              // narration is, and it costs almost nothing against the 2% budget.
              opacity: cursorOn ? 1 : 0,
            }}
          />
        </div>

        {outputs.map((line, i) => {
          const at = doneTypingAt + 10 + i * outputStagger;
          return (
            <div
              key={i}
              style={{
                color: t.pillDim,
                whiteSpace: "pre",
                opacity: frame >= at ? 1 : 0,
                marginTop: i === 0 ? fontSize * 0.5 : 0,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
