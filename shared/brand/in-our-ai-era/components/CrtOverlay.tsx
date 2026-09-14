import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTheme } from "../theme";

/**
 * Persistent CRT treatment: scanlines, a slow roll bar, phosphor flicker and a
 * vignette. Rendered once at the top of the video so scene transitions happen
 * underneath the glass instead of on top of it.
 */
export const CrtOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const s = t.scanRgb;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, rgba(${s},0.07) 0px, rgba(${s},0.07) 2px, rgba(${s},0) 2px, rgba(${s},0) 5px)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(${s},0.05), rgba(${s},0) 45%, rgba(${s},0.05))`,
          top: ((frame * 4) % 1600) - 400,
          height: 400,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: t.flicker,
          opacity: interpolate(
            frame % 11,
            [0, 3, 5, 8, 11],
            [0.006, 0.022, 0.004, 0.018, 0.006],
          ),
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: t.vignette,
        }}
      />
    </AbsoluteFill>
  );
};
