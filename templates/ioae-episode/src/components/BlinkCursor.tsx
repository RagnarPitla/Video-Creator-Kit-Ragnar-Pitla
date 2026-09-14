import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";

export const BlinkCursor: React.FC<{
  color?: string;
  fontSize?: number;
}> = ({ color, fontSize = 56 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const { fps } = useVideoConfig();
  const half = Math.round(fps / 2);

  return (
    <span
      style={{
        fontFamily: "VTThreeTwoThree",
        fontSize,
        color: color ?? theme.ink,
        opacity: frame % (half * 2) < half ? 1 : 0,
      }}
    >
      {"\u2588"}
    </span>
  );
};
