import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Connector,
  Pill,
  useTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S07 -- the pivot. Frames 3135-3338 (204).
 *
 * Local cue frames: the-shift 0 | stop-source 113
 *
 * Two words, one struck and one promoted. `source` is on screen at the cut;
 * `artifact` arrives under it; at `stop-source` the strike draws through
 * `source` and the accent lands on `artifact` and stays there.
 */

const WORD = 82;

const Word: React.FC<{
  text: string;
  accent: boolean;
  dim: boolean;
  strike: number;
  /** Entrance opacity. `artifact` must not be legible before it is named. */
  enter?: number;
}> = ({ text, accent, dim, strike, enter = 1 }) => {
  const t = useTheme();
  return (
    <div style={{ position: "relative", display: "inline-block", opacity: enter }}>
      <div
        style={{
          fontFamily: t.mono,
          fontSize: WORD,
          lineHeight: 1,
          fontWeight: 500,
          letterSpacing: 1,
          color: accent ? t.accent : dim ? t.pillDim : t.pillBright,
          whiteSpace: "pre",
        }}
      >
        {text}
      </div>
      {strike > 0 ? (
        <div
          style={{
            position: "absolute",
            left: -8,
            top: 41,
            height: 5,
            width: `calc(${strike * 100}% + 16px)`,
            borderRadius: 3,
            backgroundColor: t.pillDim,
          }}
        />
      ) : null}
    </div>
  );
};

export const S07: React.FC = () => {
  const frame = useCurrentFrame();
  const strike = interpolate(frame, [113, 131], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const promoted = frame >= 118;
  // The word was rendered unconditionally, so the shot's payoff sat on screen
  // 113 frames -- 3.8s -- before the sentence reached it. It now arrives with
  // the connector, which is what this file's own header comment claimed.
  const arrive = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <Canvas padding={140} drift driftScale={1.02} driftPx={{ x: -6, y: -8 }}>
      <div style={{ position: "relative", width: 900, height: 480 }}>
        <Connector
          from={{ x: 450, y: 132 }}
          to={{ x: 450, y: 268 }}
          fromFrame={26}
          duration={22}
          curvature={0}
        />

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 40,
            width: 900,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Word text="source" accent={false} dim={promoted} strike={strike} />
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            top: 286,
            width: 900,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 26,
          }}
        >
          <Word text="artifact" accent={promoted} dim={!promoted} strike={0} enter={arrive} />
          <Pill width={promoted ? 300 : 0} height={5} tone="accent" from={124} duration={18} />
        </div>

        <div style={{ position: "absolute", left: 0, top: 428, width: 900, display: "flex", justifyContent: "center" }}>
          <Callout tone="dim" fontSize={24} from={150}>
            check what came out
          </Callout>
        </div>
      </div>
    </Canvas>
  );
};
