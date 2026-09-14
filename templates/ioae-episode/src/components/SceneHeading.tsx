import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { headingPaint, useTheme } from "../theme";

export const SceneHeading: React.FC<{
  text: string;
  fontSize?: number;
  lineHeight?: number;
}> = ({ text, fontSize = 48, lineHeight = 1.25 }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <Interactive.Div
      name="Heading"
      style={{
        fontFamily: "Press Start TwoP",
        fontSize,
        lineHeight,
        ...headingPaint(theme),
        opacity: interpolate(frame, [0, 12], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(frame, [0, 18], ["-30px 0px", "0px 0px"], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
      }}
    >
      {text}
    </Interactive.Div>
  );
};
