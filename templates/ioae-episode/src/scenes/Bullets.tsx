import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneHeading } from "../components/SceneHeading";
import { SceneShell } from "../components/SceneShell";
import { Sprite } from "../components/Sprite";
import type { BulletsSceneProps } from "../episode";
import { useTheme } from "../theme";

export const Bullets: React.FC<BulletsSceneProps> = ({
  eyebrow,
  heading,
  lead,
  bullets,
  footer,
  sprite,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      {eyebrow ? (
        <Interactive.Div
          name="Eyebrow"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 44,
            letterSpacing: 3,
            color: theme.magenta,
            marginBottom: 14,
            opacity: interpolate(frame, [0, 10], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {eyebrow}
        </Interactive.Div>
      ) : null}
      <SceneHeading text={heading} fontSize={46} />
      {lead ? (
        <Interactive.Div
          name="Lead"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 56,
            color: theme.blue,
            marginTop: 26,
            opacity: interpolate(frame, [18, 32], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {lead}
        </Interactive.Div>
      ) : null}

      <Interactive.Div
        name="Bullet layout"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 60,
          marginTop: 30,
          flex: 1,
        }}
      >
        <Interactive.Div
          name="Bullets"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 22,
            flex: 1,
          }}
        >
          {bullets.map((bullet, index) => {
            const start = 38 + index * 24;
            return (
              <div
                key={bullet}
                style={{
                  display: "flex",
                  gap: 22,
                  fontFamily: "VTThreeTwoThree",
                  fontSize: 60,
                  lineHeight: 1.22,
                  color: theme.ink,
                  opacity: interpolate(frame, [start, start + 12], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: interpolate(
                    frame,
                    [start, start + 18],
                    ["-34px 0px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                    },
                  ),
                }}
              >
                <span style={{ color: theme.green }}>{">>"}</span>
                <span>{bullet}</span>
              </div>
            );
          })}
        </Interactive.Div>

        {sprite ? (
          <Interactive.Div
            name="Bullet sprite"
            style={{
              opacity: interpolate(frame, [52, 70], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <Sprite
              name={sprite}
              pixel={17}
              startFrame={54}
              framesPerRow={1.1}
            />
          </Interactive.Div>
        ) : null}
      </Interactive.Div>

      {footer ? (
        <Interactive.Div
          name="Footer"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 50,
            color: theme.teal,
            opacity: interpolate(frame, [146, 166], [0, 1], {
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
