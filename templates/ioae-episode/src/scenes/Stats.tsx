import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneHeading } from "../components/SceneHeading";
import { SceneShell } from "../components/SceneShell";
import type { StatsSceneProps } from "../episode";
import { themeColor, useTheme } from "../theme";

export const Stats: React.FC<StatsSceneProps> = ({
  heading,
  subhead,
  columns,
  items,
  footer,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      <SceneHeading text={heading} fontSize={46} />
      {subhead ? (
        <Interactive.Div
          name="Subhead"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 46,
            color: theme.grey,
            marginTop: 16,
            opacity: interpolate(frame, [10, 26], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {subhead}
        </Interactive.Div>
      ) : null}

      {columns ? (
        <Interactive.Div
          name="Column labels"
          style={{
            display: "grid",
            gridTemplateColumns: "560px 210px 280px 1fr",
            gap: 22,
            fontFamily: "VTThreeTwoThree",
            fontSize: 38,
            color: theme.grey,
            marginTop: 28,
            opacity: interpolate(frame, [16, 30], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          <div>{columns.label}</div>
          <div>{columns.value}</div>
          <div>{columns.detail}</div>
          <div />
        </Interactive.Div>
      ) : null}

      <Interactive.Div
        name="Stats"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 24,
          marginTop: columns ? 18 : 34,
        }}
      >
        {items.map((item, index) => {
          const start = 30 + index * 28;
          const meter = Math.max(0, Math.min(100, item.meter));
          return (
            <div
              key={`${item.label}-${item.value}`}
              style={{
                display: "grid",
                gridTemplateColumns: "560px 210px 280px 1fr",
                gap: 22,
                alignItems: "center",
                fontFamily: "VTThreeTwoThree",
                fontSize: 52,
                color: theme.ink,
                opacity: interpolate(frame, [start, start + 12], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              <div>{item.label}</div>
              <div style={{ color: theme.blue }}>{item.value}</div>
              <div style={{ color: themeColor(theme, item.accent) }}>
                {item.detail}
              </div>
              <div
                style={{
                  height: 44,
                  border: `4px solid ${theme.ink}`,
                  padding: 5,
                }}
              >
                <div
                  style={{
                    height: 26,
                    backgroundColor: themeColor(theme, item.accent),
                    width: interpolate(
                      frame,
                      [start + 10, start + 44],
                      ["0%", `${meter}%`],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                      },
                    ),
                  }}
                />
              </div>
            </div>
          );
        })}
      </Interactive.Div>

      {footer ? (
        <Interactive.Div
          name="Footer"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 54,
            lineHeight: 1.25,
            color: theme.ink,
            marginTop: "auto",
            opacity: interpolate(frame, [166, 186], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            translate: interpolate(frame, [166, 190], ["0px 22px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          {footer}
        </Interactive.Div>
      ) : null}
    </SceneShell>
  );
};
