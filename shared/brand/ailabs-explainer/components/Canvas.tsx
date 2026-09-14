import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ailabsTheme, Theme, ThemeContext } from "../theme";
import "../fonts";

export type CanvasProps = {
  children: React.ReactNode;
  /** Override the theme for a subtree. Defaults to `ailabsTheme`. */
  theme?: Theme;
  /**
   * Use `bgDeep` instead of `bg`. Reserved for shots whose subject is a punched-in
   * screen recording -- the reference drops the background a stop so the recording's
   * own black does not read as a lighter rectangle floating on the canvas.
   */
  deep?: boolean;
  /**
   * Slow continuous camera drift. This is what lets one shot carry 30s of narration
   * without cutting. Kept deliberately tiny: the reference encodes at 222 kbps
   * because most of the frame is byte-identical between frames, and a large drift
   * would put motion residuals on every macroblock and destroy that.
   */
  drift?: boolean;
  /** Scale at the end of the drift. 1.025 is ~0.08%/frame over 30s -- sub-pixel. */
  driftScale?: number;
  /** Pixels of translation over the whole scene. Direction is fixed, never a wobble. */
  driftPx?: { x: number; y: number };
  /** Padding around the content well. Large negative space is a hard style rule. */
  padding?: number;
};

/**
 * Root scene shell: flat background, one theme provider, optional camera drift,
 * children centred inside a generously padded well.
 *
 * Every other component in this library assumes it is somewhere inside a Canvas,
 * because that is where `useTheme()` gets its value from.
 */
export const Canvas: React.FC<CanvasProps> = ({
  children,
  theme = ailabsTheme,
  deep = false,
  drift = true,
  driftScale = 1.025,
  driftPx = { x: -14, y: -8 },
  padding = 120,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Linear, not eased. An eased drift has an acceleration the eye can read as a
  // move; a linear one at this amplitude reads as "the camera is alive" and nothing more.
  const p = durationInFrames > 1 ? frame / (durationInFrames - 1) : 0;
  const scale = drift ? interpolate(p, [0, 1], [1, driftScale]) : 1;
  const tx = drift ? interpolate(p, [0, 1], [0, driftPx.x]) : 0;
  const ty = drift ? interpolate(p, [0, 1], [0, driftPx.y]) : 0;

  return (
    <ThemeContext.Provider value={theme}>
      <AbsoluteFill style={{ backgroundColor: deep ? theme.bgDeep : theme.bg }}>
        <AbsoluteFill
          style={{
            transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
            // Scaling about the centre keeps the composition's optical centre put.
            transformOrigin: "center center",
          }}
        >
          <AbsoluteFill
            style={{
              padding,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: theme.mono,
            }}
          >
            {children}
          </AbsoluteFill>
        </AbsoluteFill>
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
