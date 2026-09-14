import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import type { QuoteSceneProps } from "../episode";
import { useTheme } from "../theme";

export const Quote: React.FC<QuoteSceneProps> = ({
  lines,
  highlightLine,
  attribution,
  gloss,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const totalCharacters = lines.reduce((total, line) => total + line.length, 0);
  const fontSize = totalCharacters > 100 ? 70 : totalCharacters > 70 ? 84 : 98;

  return (
    <SceneShell>
      <Interactive.Div
        name="Quote mark"
        style={{
          fontFamily: "Press Start TwoP",
          fontSize: 82,
          color: theme.magenta,
          marginTop: "auto",
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {'"'}
      </Interactive.Div>

      <Interactive.Div
        name="Quote"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 8,
          marginTop: 6,
        }}
      >
        {lines.map((line, index) => (
          <div
            key={line}
            style={{
              fontFamily: "VTThreeTwoThree",
              fontSize,
              lineHeight: 1.08,
              color: highlightLine === index ? theme.paper : theme.ink,
              backgroundColor:
                highlightLine === index ? theme.ink : "transparent",
              paddingLeft: highlightLine === index ? 14 : 0,
              paddingRight: highlightLine === index ? 14 : 0,
              opacity: interpolate(
                frame,
                [14 + index * 18, 28 + index * 18],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                },
              ),
            }}
          >
            {line}
          </div>
        ))}
      </Interactive.Div>

      <Interactive.Div
        name="Attribution"
        style={{
          fontFamily: "Press Start TwoP",
          fontSize: 30,
          color: theme.blue,
          marginTop: 36,
          opacity: interpolate(frame, [82, 100], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
          translate: interpolate(frame, [82, 104], ["-24px 0px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {attribution}
      </Interactive.Div>

      {gloss ? (
        <Interactive.Div
          name="Gloss"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 52,
            lineHeight: 1.2,
            color: theme.teal,
            marginTop: "auto",
            opacity: interpolate(frame, [120, 140], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {gloss}
        </Interactive.Div>
      ) : null}
    </SceneShell>
  );
};
