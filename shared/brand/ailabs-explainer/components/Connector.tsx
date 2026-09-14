import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { useTheme } from "../theme";

export type Point = { x: number; y: number };

/**
 * Cubic bezier from `a` to `b` whose tangents are vertical at both ends.
 *
 * Both control points sit on the horizontal midline between the two nodes, which
 * produces the flowchart curve in the reference at 5:40: the line leaves the parent
 * straight down, sweeps sideways, and enters the child straight down again. A
 * straight diagonal would read as a graph edge; this reads as a hierarchy.
 *
 * @param curvature 0 = a straight line, 0.5 = the reference's shape, 1 = a hard elbow.
 */
export const connectorPath = (a: Point, b: Point, curvature = 0.5): string => {
  const dy = (b.y - a.y) * curvature;
  return `M ${a.x} ${a.y} C ${a.x} ${a.y + dy}, ${b.x} ${b.y - dy}, ${b.x} ${b.y}`;
};

export type ConnectorGeometry = {
  from: Point;
  to: Point;
  curvature?: number;
  color?: string;
  width?: number;
  /** Frame the draw-on starts. Omit for a connector that is already drawn. */
  fromFrame?: number;
  /** Frames the draw-on takes. 14 (~0.47s) matches the reference's unhurried draw. */
  duration?: number;
};

/**
 * The bare `<path>`. Use this when you are already inside an `<svg>` and want many
 * connectors in one element (TreeDiagram does exactly that).
 */
export const ConnectorPath: React.FC<ConnectorGeometry> = ({
  from,
  to,
  curvature = 0.5,
  color,
  width,
  fromFrame,
  duration = 14,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const p =
    fromFrame === undefined
      ? 1
      : interpolate(frame, [fromFrame, fromFrame + duration], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.inOut(Easing.quad),
        });

  return (
    <path
      d={connectorPath(from, to, curvature)}
      fill="none"
      stroke={color ?? t.connector}
      strokeWidth={width ?? t.connectorWidth}
      strokeLinecap="round"
      // pathLength normalises the curve to 1 user unit so the dash maths needs no
      // DOM measurement. getTotalLength() would be non-deterministic across
      // Remotion's render threads; this is pure arithmetic.
      pathLength={1}
      strokeDasharray={1}
      strokeDashoffset={1 - p}
    />
  );
};

/**
 * A standalone connector that paints its own full-bleed SVG layer. Coordinates are
 * plain pixels in the nearest positioned ancestor's box, so you can hand it the same
 * numbers you used to place the elements it joins.
 *
 * Use this when connecting two hand-placed things; use ConnectorPath inside a diagram.
 */
export const Connector: React.FC<ConnectorGeometry> = (props) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <svg width="100%" height="100%" style={{ overflow: "visible" }}>
      <ConnectorPath {...props} />
    </svg>
  </AbsoluteFill>
);
