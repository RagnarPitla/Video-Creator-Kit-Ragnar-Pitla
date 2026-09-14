import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneHeading } from "../components/SceneHeading";
import { SceneShell } from "../components/SceneShell";
import { Sprite } from "../components/Sprite";
import type { StepsSceneProps } from "../episode";
import { useTheme } from "../theme";

export const Steps: React.FC<StepsSceneProps> = ({
  heading,
  steps,
  footer,
  sprite,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      <SceneHeading text={heading} fontSize={48} />
      <Interactive.Div
        name="Steps and sprite"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 50,
          marginTop: 38,
          flex: 1,
        }}
      >
        <Interactive.Div
          name="Steps"
          style={{ display: "flex", flexDirection: "column", gap: 20, flex: 1 }}
        >
          {steps.map((step, index) => {
            const start = 24 + index * 24;
            return (
              <div
                key={`${step.label}-${step.text}`}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 28,
                  opacity: interpolate(frame, [start, start + 12], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  }),
                  translate: interpolate(
                    frame,
                    [start, start + 18],
                    ["-46px 0px", "0px 0px"],
                    {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                    },
                  ),
                }}
              >
                <div
                  style={{
                    backgroundColor: theme.ink,
                    color: theme.paper,
                    fontFamily: "Press Start TwoP",
                    fontSize: 32,
                    padding: "15px 17px",
                  }}
                >
                  {step.label}
                </div>
                <div
                  style={{
                    fontFamily: "VTThreeTwoThree",
                    fontSize: 60,
                    lineHeight: 1.18,
                    color: theme.ink,
                  }}
                >
                  {step.text}
                </div>
              </div>
            );
          })}
        </Interactive.Div>

        {sprite ? (
          <Interactive.Div
            name="Steps sprite"
            style={{
              opacity: interpolate(frame, [52, 70], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              rotate: interpolate(frame, [52, 82], ["-6deg", "0deg"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.spring({ damping: 200 }),
              }),
            }}
          >
            <Sprite
              name={sprite}
              pixel={17}
              startFrame={54}
              framesPerRow={1.2}
            />
          </Interactive.Div>
        ) : null}
      </Interactive.Div>

      {footer ? (
        <Interactive.Div
          name="Footer"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 52,
            color: theme.green,
            opacity: interpolate(frame, [166, 186], [0, 1], {
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
