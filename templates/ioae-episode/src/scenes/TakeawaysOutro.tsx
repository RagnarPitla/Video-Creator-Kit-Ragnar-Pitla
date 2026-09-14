import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { BlinkCursor } from "../components/BlinkCursor";
import { SceneHeading } from "../components/SceneHeading";
import { SceneShell } from "../components/SceneShell";
import { Sprite } from "../components/Sprite";
import type { EpisodeConfig, TakeawaysOutroSceneProps } from "../episode";
import { useTheme } from "../theme";

export const TakeawaysOutro: React.FC<{
  episode: EpisodeConfig;
  props: TakeawaysOutroSceneProps;
}> = ({ episode, props }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      <Interactive.Div
        name="Outro layout"
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 44,
          flex: 1,
        }}
      >
        <Interactive.Div
          name="Outro copy"
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <SceneHeading text={props.heading} fontSize={46} />
          <Interactive.Div
            name="Takeaways"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              marginTop: 26,
            }}
          >
            {props.items.map((item, index) => {
              const start = 20 + index * 22;
              return (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    gap: 18,
                    fontFamily: "VTThreeTwoThree",
                    fontSize: 50,
                    lineHeight: 1.12,
                    color: theme.ink,
                    opacity: interpolate(frame, [start, start + 12], [0, 1], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    }),
                    translate: interpolate(
                      frame,
                      [start, start + 18],
                      ["-30px 0px", "0px 0px"],
                      {
                        extrapolateLeft: "clamp",
                        extrapolateRight: "clamp",
                        easing: Easing.bezier(0.16, 1, 0.3, 1),
                      },
                    ),
                  }}
                >
                  <span style={{ color: theme.green }}>{props.marker}</span>
                  <span>{item}</span>
                </div>
              );
            })}
          </Interactive.Div>

          {props.closingQuote ? (
            <Interactive.Div
              name="Closing quote"
              style={{
                border: `6px double ${theme.ink}`,
                padding: 20,
                marginTop: 22,
                fontFamily: "VTThreeTwoThree",
                fontSize: 46,
                lineHeight: 1.15,
                color: theme.magenta,
                opacity: interpolate(frame, [92, 112], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {props.closingQuote}
            </Interactive.Div>
          ) : null}

          {props.next ? (
            <Interactive.Div
              name="Next"
              style={{
                fontFamily: "VTThreeTwoThree",
                fontSize: 44,
                color: theme.blue,
                marginTop: 20,
                opacity: interpolate(frame, [126, 144], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {props.next}
            </Interactive.Div>
          ) : null}

          {props.links?.length ? (
            <Interactive.Div
              name="Links"
              style={{
                fontFamily: "VTThreeTwoThree",
                fontSize: 40,
                color: theme.ink,
                marginTop: 10,
                opacity: interpolate(frame, [146, 164], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {props.links.join(" / ")}
            </Interactive.Div>
          ) : null}

          {props.cta ? (
            <Interactive.Div
              name="Call to action"
              style={{
                fontFamily: "VTThreeTwoThree",
                fontSize: 42,
                color: theme.green,
                marginTop: 10,
                opacity: interpolate(frame, [166, 184], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                }),
              }}
            >
              {props.cta}
            </Interactive.Div>
          ) : null}

          <Interactive.Div
            name="Hosts"
            style={{
              fontFamily: "Press Start TwoP",
              fontSize: 26,
              color: theme.magenta,
              marginTop: 16,
              opacity: interpolate(frame, [184, 202], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            {props.hostPrefix}{" "}
            {episode.hosts.map((host, index) => (
              <React.Fragment key={host.key}>
                {index > 0 ? " + " : ""}
                <span style={{ color: host.color }}>{host.name}</span>
              </React.Fragment>
            ))}
          </Interactive.Div>
        </Interactive.Div>

        {props.sprite ? (
          <Interactive.Div
            name="Outro sprite"
            style={{
              opacity: interpolate(frame, [12, 30], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            <Sprite
              name={props.sprite}
              pixel={18}
              startFrame={14}
              framesPerRow={1.2}
            />
          </Interactive.Div>
        ) : null}
      </Interactive.Div>

      <Interactive.Div
        name="Prompt"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          fontFamily: "VTThreeTwoThree",
          fontSize: 56,
          color: theme.ink,
          marginTop: 14,
          opacity: interpolate(frame, [206, 224], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span>{props.prompt}</span>
        <BlinkCursor fontSize={56} />
      </Interactive.Div>
    </SceneShell>
  );
};
