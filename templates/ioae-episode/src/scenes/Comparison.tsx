import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneHeading } from "../components/SceneHeading";
import { SceneShell } from "../components/SceneShell";
import type { ComparisonSceneProps } from "../episode";
import { themeColor, type ThemeColorName, useTheme } from "../theme";

const ComparisonPanel: React.FC<{
  title: string;
  accent: ThemeColorName;
  lines: string[];
  startFrame: number;
  from: string;
}> = ({ title, accent, lines, startFrame, from }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <div
      style={{
        flex: 1,
        border: `8px double ${theme.ink}`,
        backgroundColor: theme.paper,
        display: "flex",
        flexDirection: "column",
        opacity: interpolate(frame, [startFrame, startFrame + 14], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }),
        translate: interpolate(
          frame,
          [startFrame, startFrame + 22],
          [from, "0px 0px"],
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
          backgroundColor: themeColor(theme, accent),
          color: theme.paper,
          fontFamily: "Press Start TwoP",
          fontSize: 28,
          lineHeight: 1.25,
          padding: "20px 22px",
          textAlign: "center",
        }}
      >
        {title}
      </div>
      <div
        style={{
          padding: 28,
          fontFamily: "VTThreeTwoThree",
          fontSize: 50,
          lineHeight: 1.42,
          color: theme.ink,
        }}
      >
        {lines.map((line, index) => (
          <div
            key={line}
            style={{
              opacity: interpolate(
                frame,
                [startFrame + 20 + index * 12, startFrame + 32 + index * 12],
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
      </div>
    </div>
  );
};

export const Comparison: React.FC<ComparisonSceneProps> = ({
  heading,
  left,
  right,
  footer,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      <SceneHeading text={heading} fontSize={44} />
      <Interactive.Div
        name="Comparison"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 44,
          marginTop: 34,
          flex: 1,
        }}
      >
        <ComparisonPanel
          title={left.title}
          accent={left.accent}
          lines={left.lines}
          startFrame={18}
          from="-60px 0px"
        />
        <ComparisonPanel
          title={right.title}
          accent={right.accent}
          lines={right.lines}
          startFrame={30}
          from="60px 0px"
        />
      </Interactive.Div>
      {footer ? (
        <Interactive.Div
          name="Footer"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 46,
            lineHeight: 1.2,
            color: theme.blue,
            marginTop: 22,
            opacity: interpolate(frame, [176, 194], [0, 1], {
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
