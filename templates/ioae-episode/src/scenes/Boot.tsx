import React from "react";
import { Easing, Interactive, interpolate, useCurrentFrame } from "remotion";
import { BlinkCursor } from "../components/BlinkCursor";
import { SceneShell } from "../components/SceneShell";
import { Sprite } from "../components/Sprite";
import { TypeLine } from "../components/TypeLine";
import type { BootSceneProps } from "../episode";
import { useTheme } from "../theme";

export const Boot: React.FC<BootSceneProps> = ({
  header,
  systemLines,
  memoryTest,
  detectedLines,
  finalLine,
  sprite,
}) => {
  const frame = useCurrentFrame();
  const theme = useTheme();
  const memoryStart = memoryTest?.startFrame ?? 34;
  const memoryEnd = memoryTest?.endFrame ?? 56;
  const memory = memoryTest
    ? Math.round(
        interpolate(frame, [memoryStart, memoryEnd], [0, memoryTest.totalKb], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        }) / 1024,
      ) * 1024
    : 0;
  const detectedStart = memoryEnd + 8;
  const finalStart = detectedStart + detectedLines.length * 14 + 12;

  return (
    <SceneShell>
      <Interactive.Div
        name="Boot layout"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 60,
        }}
      >
        <Interactive.Div
          name="Boot log"
          style={{
            fontFamily: "VTThreeTwoThree",
            fontSize: 50,
            lineHeight: 1.31,
            color: theme.ink,
            flex: 1,
          }}
        >
          <TypeLine text={header} startFrame={0} cps={70} />
          {systemLines.map((line, index) => (
            <TypeLine
              key={line}
              text={line}
              startFrame={14 + index * 14}
              cps={70}
            />
          ))}
          <div style={{ height: 20 }} />
          {memoryTest ? (
            <div style={{ whiteSpace: "pre" }}>
              {frame < memoryStart
                ? "\u00a0"
                : `${memoryTest.label} : ${memory}K`}
              {frame >= memoryEnd ? (memoryTest.okText ?? "") : ""}
            </div>
          ) : null}
          {detectedLines.map((line, index) => (
            <TypeLine
              key={line}
              text={line}
              startFrame={detectedStart + index * 14}
              cps={80}
            />
          ))}
          <div style={{ height: 20 }} />
          <div style={{ display: "flex" }}>
            <TypeLine text={finalLine} startFrame={finalStart} cps={60} />
            {frame > finalStart + 12 ? <BlinkCursor fontSize={50} /> : null}
          </div>
        </Interactive.Div>

        {sprite ? (
          <Interactive.Div
            name="Boot sprite"
            style={{
              opacity: interpolate(frame, [6, 22], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
              translate: interpolate(frame, [6, 26], ["0px 24px", "0px 0px"], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.bezier(0.16, 1, 0.3, 1),
              }),
            }}
          >
            <Sprite
              name={sprite}
              pixel={22}
              startFrame={8}
              framesPerRow={1.4}
            />
          </Interactive.Div>
        ) : null}
      </Interactive.Div>
    </SceneShell>
  );
};
