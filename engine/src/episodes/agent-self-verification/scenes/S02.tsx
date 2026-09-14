import React from "react";
import {
  Callout,
  Canvas,
  Card,
  Connector,
  Pill,
  ailabsTheme,
} from "../../../../../shared/brand/ailabs-explainer";

/**
 * S02 -- what self-verification is. Frames 699-1098 (400).
 *
 * Local cue frames: self-verification 0 | every-agent 224
 *
 * A diamond loop, clockwise: agent -> task -> work -> check -> agent. The last
 * edge is the one that closes the circuit back onto the agent, so it is the one
 * wearing the accent (`shots.json`: "the loop edge closing back on the agent").
 *
 * Every edge runs between a horizontal edge-midpoint and a vertical one, never
 * between two points that share an axis. `Connector` puts both control points on
 * the horizontal midline, so an axis-aligned pair degenerates to a straight line;
 * a diagonal pair gives the flowchart S-curve the style is built on.
 */

const BOX = { w: 1400, h: 600 };

const NodeCard: React.FC<{
  cx: number;
  cy: number;
  w: number;
  h: number;
  from: number;
}> = ({ cx, cy, w, h, from }) => (
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
          gap: 12,
        }}
      >
        <Pill width={Math.round(w * 0.44)} height={14} tone="bright" from={from + 4} />
        <Pill width={Math.round(w * 0.28)} height={11} tone="dim" from={from + 8} />
      </div>
    </Card>
  </div>
);

const Label: React.FC<{ x: number; y: number; from: number; children: string }> = ({
  x,
  y,
  from,
  children,
}) => (
  <div style={{ position: "absolute", left: x, top: y }}>
    <Callout tone="dim" fontSize={22} from={from}>
      {children}
    </Callout>
  </div>
);

export const S02: React.FC = () => (
  <Canvas padding={110} drift driftScale={1.02} driftPx={{ x: -10, y: -6 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 44 }}>
      <div style={{ position: "relative", width: BOX.w, height: BOX.h }}>
        {/* Edges first so the node cards paint over their own endpoints. */}
        <Connector from={{ x: 870, y: 76 }} to={{ x: 1130, y: 248 }} fromFrame={10} duration={16} />
        <Connector from={{ x: 1130, y: 352 }} to={{ x: 826, y: 506 }} fromFrame={50} duration={16} />
        <Connector from={{ x: 574, y: 506 }} to={{ x: 270, y: 352 }} fromFrame={90} duration={16} />
        <Connector
          from={{ x: 270, y: 248 }}
          to={{ x: 530, y: 76 }}
          color={ailabsTheme.accent}
          width={4}
          fromFrame={132}
          duration={30}
        />

        {/* The agent is on screen at the cut. Everything else arrives around it. */}
        <NodeCard cx={700} cy={76} w={340} h={132} from={0} />
        <NodeCard cx={1130} cy={300} w={252} h={104} from={22} />
        <NodeCard cx={700} cy={506} w={252} h={104} from={62} />
        <NodeCard cx={270} cy={300} w={252} h={104} from={102} />

        {/* Side labels on the two nodes whose connectors leave top and bottom
            centre. Putting them under the card would have laid the word straight
            over the outgoing edge, which the first still probe showed. */}
        <Label x={668} y={156} from={6}>
          agent
        </Label>
        <Label x={1274} y={289} from={28}>
          task
        </Label>
        <Label x={672} y={570} from={68}>
          work
        </Label>
        <Label x={60} y={289} from={108}>
          check
        </Label>
      </div>

      {/* every-agent @ 224: the same closed loop, three more times, unnamed. */}
      <div style={{ display: "flex", gap: 44 }}>
        {[0, 1, 2].map((i) => (
          <Card key={i} tone="surfaceAlt" width={330} height={84} padding={22} from={224 + i * 16}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, height: "100%" }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 26,
                  border: `2px solid ${ailabsTheme.connector}`,
                  flexShrink: 0,
                }}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <Pill width={168} height={12} tone="bright" from={232 + i * 16} />
                <Pill width={112} height={10} tone="dim" from={238 + i * 16} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  </Canvas>
);
