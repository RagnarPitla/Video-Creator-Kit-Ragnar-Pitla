import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneHeading } from "../components/SceneHeading";
import { SceneShell } from "../components/SceneShell";
import { TypeLine } from "../components/TypeLine";
import type { TerminalSceneProps } from "../episode";
import { themeColor, useTheme } from "../theme";

export const Terminal: React.FC<TerminalSceneProps> = ({
  heading,
  lines,
  wiring,
  badges,
  footer,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      <SceneHeading text={heading} fontSize={44} />
      <Interactive.Div
        name="Terminal"
        style={{
          backgroundColor: theme.ink,
          color: theme.paper,
          fontFamily: "VTThreeTwoThree",
          fontSize: 46,
          lineHeight: 1.34,
          padding: 28,
          marginTop: 28,
          opacity: interpolate(frame, [16, 28], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {lines.map((line, index) => (
          <TypeLine
            key={line.text}
            text={line.text}
            startFrame={26 + index * 24}
            cps={80}
            cursor={index === 0}
            style={{
              color: line.tone ? themeColor(theme, line.tone) : theme.paper,
            }}
          />
        ))}
      </Interactive.Div>

      {wiring ? (
        <Interactive.Div
          name="Wiring"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 60,
            color: theme.blue,
            marginTop: 28,
            opacity: interpolate(frame, [96, 112], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [96, 118], ["-30px 0px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          {wiring}
        </Interactive.Div>
      ) : null}

      {badges?.length ? (
        <Interactive.Div
          name="Badges"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 20,
            marginTop: 26,
            flexWrap: "wrap",
          }}
        >
          {badges.map((badge, index) => {
            const start = 126 + index * 12;
            return (
              <div
                key={badge}
                style={{
                  border: `4px solid ${theme.ink}`,
                  fontFamily: "VTThreeTwoThree",
                  fontSize: 42,
                  color: theme.green,
                  padding: "7px 18px",
                  opacity: interpolate(frame, [start, start + 10], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  scale: interpolate(frame, [start, start + 16], [0.8, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.spring({ damping: 200 }),
                    output: "perceptual-scale",
                  }),
                }}
              >
                {badge}
              </div>
            );
          })}
        </Interactive.Div>
      ) : null}

      {footer ? (
        <Interactive.Div
          name="Footer"
          style={{
            fontFamily: "Press Start TwoP",
            fontSize: 30,
            color: theme.magenta,
            marginTop: "auto",
            opacity: interpolate(frame, [184, 204], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {footer}
        </Interactive.Div>
      ) : null}
    </SceneShell>
  );
};
