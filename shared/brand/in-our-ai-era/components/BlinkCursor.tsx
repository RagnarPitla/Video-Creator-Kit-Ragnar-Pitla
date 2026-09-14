import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";

/**
 * A DOS block cursor that blinks roughly twice per second.
 */
export const BlinkCursor: React.FC<{
  color?: string;
  fontSize?: number;
}> = ({ color, fontSize = 56 }) => {
  const frame = useCurrentFrame();
  const t = useTheme();
  const { fps } = useVideoConfig();
  const half = Math.round(fps / 2);

  return (
    <span
      style={{
        fontFamily: "VTThreeTwoThree",
        fontSize,
        color: color ?? t.ink,
        opacity: frame % (half * 2) < half ? 1 : 0,
      }}
    >
      {"\u2588"}
    </span>
  );
};
