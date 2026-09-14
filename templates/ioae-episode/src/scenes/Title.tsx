import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { Sprite } from "../components/Sprite";
import { TypeLine } from "../components/TypeLine";
import type { EpisodeConfig, TitleSceneProps } from "../episode";
import { headingPaint, useTheme } from "../theme";

export const Title: React.FC<{
  episode: EpisodeConfig;
  props: TitleSceneProps;
}> = ({ episode, props }) => {
  const frame = useCurrentFrame();
  const theme = useTheme();

  return (
    <SceneShell>
      <Interactive.Div
        name="Title card"
        style={{
          border: `8px double ${theme.ink}`,
          padding: 48,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          backgroundColor: theme.paper,
          marginTop: "auto",
          marginBottom: "auto",
          scale: interpolate(frame, [0, 18], [0.94, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Interactive.Div
          name="Eyebrow"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 38,
            letterSpacing: 3,
            color: theme.teal,
          }}
        >
          {props.eyebrow}
        </Interactive.Div>

        <Interactive.Div
          name="Wordmark"
          style={{
            fontFamily: "Press Start TwoP",
            fontSize: 88,
            lineHeight: 1.2,
          }}
        >
          <TypeLine
            text={episode.brand}
            startFrame={12}
            cps={16}
            cursor
            paint={headingPaint(theme)}
          />
        </Interactive.Div>

        <Interactive.Div
          name="Rule"
          style={{
            height: 6,
            backgroundColor: theme.ink,
            width: interpolate(frame, [34, 54], ["0%", "100%"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        />

        <Interactive.Div
          name="Episode title"
          style={{
            fontFamily: "Press Start TwoP",
            fontSize: episode.title.length > 38 ? 32 : 38,
            lineHeight: 1.5,
            color: theme.magenta,
            opacity: interpolate(frame, [54, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
          }}
        >
          {episode.episodeLabel} {episode.title}
          {episode.subtitle ? (
            <div style={{ color: theme.teal }}>{episode.subtitle}</div>
          ) : null}
        </Interactive.Div>

        <Interactive.Div
          name="Hosts and sprite"
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginTop: 8,
          }}
        >
          <Interactive.Div
            name="Hosts"
            style={{
              fontFamily: "VTThreeTwoThree",
              fontSize: 58,
              color: theme.ink,
              opacity: interpolate(frame, [96, 112], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
              translate: interpolate(
                frame,
                [96, 118],
                ["-24px 0px", "0px 0px"],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                },
              ),
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

          {props.sprite ? (
            <Sprite
              name={props.sprite}
              pixel={12}
              startFrame={104}
              framesPerRow={1.1}
            />
          ) : null}
        </Interactive.Div>
      </Interactive.Div>
    </SceneShell>
  );
};
