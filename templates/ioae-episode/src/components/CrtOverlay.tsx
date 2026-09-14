import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { useTheme } from "../theme";

export const CrtOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const scanRgb = theme.scanRgb;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(to bottom, rgba(${scanRgb},0.07) 0px, rgba(${scanRgb},0.07) 2px, rgba(${scanRgb},0) 2px, rgba(${scanRgb},0) 5px)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(${scanRgb},0.05), rgba(${scanRgb},0) 45%, rgba(${scanRgb},0.05))`,
          top: ((frame * 4) % 1600) - 400,
          height: 400,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundColor: theme.flicker,
          opacity: interpolate(
            frame % 11,
            [0, 3, 5, 8, 11],
            [0.006, 0.022, 0.004, 0.018, 0.006],
          ),
        }}
      />
      <AbsoluteFill style={{ boxShadow: theme.vignette }} />
    </AbsoluteFill>
  );
};
