import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import {
  Callout,
  Canvas,
  Card,
  Connector,
  Pill,
  PillBlock,
  ailabsTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S04 -- the mechanism. Frames 1336-1881 (546).
 *
 * Local cue frames: mechanism 0 | same-model 41 | absence 340
 *
 * One source node fans to `work` and `check`, so both inherit the same model.
 * At `absence` a fourth region appears -- the failure modes the agent never
 * imagined -- and the edge that should reach it starts drawing and never
 * arrives. Nothing connects to it, which is exactly the claim: no check is
 * written for a failure that was never modelled, and that gap looks like a pass.
 *
 * The accent stays on the source node for the whole shot (`shots.json`), because
 * the source is the single thing every branch of the argument comes out of.
 */

const BOX = { w: 1500, h: 700 };

/** The edge toward the unmodelled region. It grows, and it stops well short. */
const Reach: React.FC = () => {
  const frame = useCurrentFrame();
  const h = interpolate(frame, [352, 520], [0, 132], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  if (h <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: 749,
        top: 158,
        width: 0,
        height: h,
        borderLeft: `2px dashed ${ailabsTheme.pillDim}`,
      }}
    />
  );
};

const Node: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  from: number;
  accent?: boolean;
}> = ({ cx, cy, w, h, from, accent = false }) => (
  <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2 }}>
    <Card width={w} height={h} padding={0} from={from}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
        }}
      >
        <Pill
          width={Math.round(w * 0.44)}
          height={18}
          tone={accent ? "accent" : "bright"}
          from={from + 4}
        />
        <Pill width={Math.round(w * 0.28)} height={12} tone="dim" from={from + 8} />
      </div>
    </Card>
  </div>
);

export const S04: React.FC = () => (
  <Canvas padding={120} drift driftScale={1.02} driftPx={{ x: -10, y: -6 }}>
    <div style={{ position: "relative", width: BOX.w, height: BOX.h }}>
      <Connector from={{ x: 750, y: 155 }} to={{ x: 380, y: 340 }} fromFrame={46} duration={18} />
      <Connector from={{ x: 750, y: 155 }} to={{ x: 1120, y: 340 }} fromFrame={76} duration={18} />
      {/* absence @ 340: the edge that reaches for the fourth region and never
          lands. Drawn by hand rather than with `Connector`, because a pair of
          endpoints that share an axis degenerates to a straight line there and
          the half-drawn result read as a stray tick in the first still probe. */}
      <Reach />

      {/* The source is on screen at the cut; the branches come out of it. */}
      <Node cx={750} cy={80} w={430} h={150} from={0} accent />
      <Node cx={380} cy={400} w={300} h={120} from={62} />
      <Node cx={1120} cy={400} w={300} h={120} from={92} />

      {/* Beside the card, not under it: two connectors leave the bottom edge and
          a label placed there is struck through by both. */}
      <div style={{ position: "absolute", left: 429, top: 68 }}>
        <Callout tone="dim" fontSize={24} from={8}>
          source
        </Callout>
      </div>
      <div style={{ position: "absolute", left: 355, top: 472 }}>
        <Callout tone="dim" fontSize={24} from={68}>
          work
        </Callout>
      </div>
      <div style={{ position: "absolute", left: 1088, top: 472 }}>
        <Callout tone="dim" fontSize={24} from={98}>
          check
        </Callout>
      </div>

      {/* The region nothing points at. */}
      <div style={{ position: "absolute", left: 750 - 330, top: 545 }}>
        <Card
          tone="surfaceAlt"
          width={660}
          height={140}
          padding={26}
          from={344}
          style={{ border: `2px dashed ${ailabsTheme.connector}` }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 26, height: "100%" }}>
            <PillBlock lines={2} width={320} height={11} gap={12} seed={5} from={356} />
            <div style={{ flex: 1 }} />
            <Callout tone="dim" fontSize={24} from={372}>
              never imagined
            </Callout>
          </div>
        </Card>
      </div>
    </div>
  </Canvas>
);
