import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Pill,
  ailabsTheme,
  entranceFade,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S08 -- the hero. Frames 3339-3774 (436). One cue, `why-artifact`, 430 frames
 * long, so elements are timed off the sentence rather than off a cue boundary:
 *
 *   0-90    "the agent's mental model is already in the source"
 *   90-190  "so anything derived from the source inherits the blind spot"
 *   190-300 "but the artifact -- the rendered file, the built binary, the output"
 *   300-380 "has properties nobody reasoned about"
 *   380-430 "and those properties are measurable"
 *
 * Both cards, and both card labels, are on screen at the cut. Only the contents
 * animate in. The first pass scheduled the `artifact` label at 196 and drew the
 * divider unconditionally, so for six seconds the right card was a bare surface
 * with a rule across it and no name -- it read as a panel still loading rather
 * than as a container waiting to be filled. A divider is chrome, not content: it
 * now arrives just ahead of the pills it separates.
 *
 * The accent moves with the sentence and is on exactly one thing at a time:
 *   10-126   the model, in the source
 *   128-188  the check derived from it
 *   192-292  the artifact, as a whole
 *   296-end  the properties nobody reasoned about  (the shots.json target)
 */

const CARD_W = 800;
const CARD_H = 660;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Kept in the layout at all times so nothing shifts when it inks; only its
 * opacity is scheduled. Returning null instead would move everything below it
 * by 26px on the frame it appears.
 */
const Divider: React.FC<{ from: number }> = ({ from }) => (
  <div
    style={{
      height: 2,
      width: "100%",
      backgroundColor: ailabsTheme.connector,
      opacity: 0.55 * entranceFade(useCurrentFrame(), from, 14),
    }}
  />
);

/** Accent copies of a pill column, laid over the greyscale originals. */
const AccentPills: React.FC<{
  widths: number[];
  height: number;
  gap: number;
  opacity: number;
}> = ({ widths, height, gap, opacity }) =>
  opacity <= 0 ? null : (
    <div style={{ position: "absolute", left: 0, top: 0, opacity }}>
      {widths.map((w, i) => (
        <div
          key={w}
          style={{
            position: "absolute",
            left: 0,
            top: i * (height + gap),
            width: w,
            height,
            borderRadius: ailabsTheme.radiusPill,
            backgroundColor: ailabsTheme.accent,
          }}
        />
      ))}
    </div>
  );

/**
 * The dashed hole inside the derived check. Everything about it is frame-gated:
 * an unconditionally drawn element sits on screen from the shot's first frame
 * through to its cue, which is the exact failure `docs/authoring-traps.md`
 * records against a `progress={1}` counter.
 */
const BlindSpot: React.FC = () => {
  const frame = useCurrentFrame();
  const p = entranceFade(frame, 132, 18);
  if (p <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 26,
        top: 164,
        width: 660,
        height: 64,
        borderRadius: 8,
        border: `2px dashed ${ailabsTheme.connector}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: 18,
        boxSizing: "border-box",
        opacity: p,
      }}
    >
      <Callout tone="dim" fontSize={21} from={148}>
        blind spot
      </Callout>
    </div>
  );
};

/**
 * The tick beside `measurable` has to be gated too. Left unconditional it is a
 * 22x2 dash sitting on screen for 386 frames before the word it belongs to --
 * which is precisely what the first still probe at frame 3700 showed.
 */
const Measurable: React.FC = () => {
  const p = entranceFade(useCurrentFrame(), 386, 12);
  if (p <= 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, opacity: p }}>
      <div style={{ width: 22, height: 2, backgroundColor: ailabsTheme.connector }} />
      <Callout tone="dim" fontSize={24} from={386}>
        measurable
      </Callout>
    </div>
  );
};

export const S08: React.FC = () => {
  const frame = useCurrentFrame();

  const aModel = interpolate(frame, [10, 24, 112, 126], [0, 1, 1, 0], clamp);
  const aCheck = interpolate(frame, [128, 142, 176, 188], [0, 1, 1, 0], clamp);
  const aArtifact = interpolate(frame, [192, 206, 280, 292], [0, 1, 1, 0], clamp);

  return (
    <Canvas padding={110} drift driftScale={1.018} driftPx={{ x: -10, y: -6 }}>
      <div style={{ position: "relative", width: 1660, height: CARD_H }}>
        {/* Derivation runs left card -> right card only in the argument, never on
            screen: the point is that the artifact is NOT derived from the model.
            The one drawn edge is inside the source card, model -> check. */}
        <div style={{ position: "absolute", left: 0, top: 0 }}>
          <Card width={CARD_W} height={CARD_H} padding={44} from={0}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
              <Callout tone="dim" fontSize={26} from={6}>
                source
              </Callout>

              <div style={{ position: "relative" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {[620, 560, 600, 500].map((w, i) => (
                    <Pill key={w} width={w} height={16} tone="bright" from={12 + i * 12} />
                  ))}
                </div>
                <AccentPills widths={[620, 560]} height={16} gap={18} opacity={aModel} />
              </div>

              <div style={{ height: 8 }} />
              <Divider from={86} />

              <div style={{ position: "relative" }}>
                <Card tone="surfaceAlt" width={712} height={252} padding={26} from={96}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <Callout tone="dim" fontSize={22} from={104}>
                      check
                    </Callout>
                    <div style={{ position: "relative" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[520, 430, 470].map((w, i) => (
                          <Pill key={w} width={w} height={13} tone="dim" from={112 + i * 10} />
                        ))}
                      </div>
                      <AccentPills widths={[520, 430, 470]} height={13} gap={16} opacity={aCheck} />
                    </div>
                  </div>
                </Card>

                {/* The blind spot the check inherits, drawn as a hole in it.
                    Gated through `entranceFade` so it cannot sit on screen from
                    the shot's first frame -- see docs/authoring-traps.md. */}
                <BlindSpot />
              </div>
            </div>
          </Card>
        </div>

        <div style={{ position: "absolute", left: 860, top: 0 }}>
          <Card width={CARD_W} height={CARD_H} padding={44} from={0}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24, height: "100%" }}>
              <Callout tone="dim" fontSize={26} from={6}>
                artifact
              </Callout>

              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[600, 540, 580, 470].map((w, i) => (
                  <Pill key={w} width={w} height={16} tone="dim" from={204 + i * 14} />
                ))}
              </div>

              <div style={{ height: 8 }} />
              <Divider from={286} />

              {/* properties nobody reasoned about -- the accent of the shot. */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingTop: 10 }}>
                {[480, 420, 510].map((w, i) => (
                  <Pill key={w} width={w} height={16} tone="accent" from={296 + i * 16} />
                ))}
              </div>

              <div style={{ flex: 1 }} />
              <Measurable />
            </div>
          </Card>
        </div>

        {/* "but the artifact -- the rendered file, the built binary, the output":
            the whole card is the subject for that clause, so the accent rings it
            and then hands over to the three pills inside it at 296. */}
        {aArtifact > 0 ? (
          <div
            style={{
              position: "absolute",
              left: 860,
              top: 0,
              width: CARD_W,
              height: CARD_H,
              borderRadius: ailabsTheme.radiusCard,
              border: `3px solid ${ailabsTheme.accent}`,
              boxSizing: "border-box",
              opacity: aArtifact,
            }}
          />
        ) : null}
      </div>
    </Canvas>
  );
};
