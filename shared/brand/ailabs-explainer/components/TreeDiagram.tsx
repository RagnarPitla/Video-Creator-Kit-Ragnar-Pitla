import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";
import { entranceSpring } from "../motion";
import { ConnectorPath, Point } from "./Connector";

export type TreeLevelSize = { w: number; h: number };

export type TreeDiagramProps = {
  /** Number of levels including the root. 3 reproduces the reference at 5:40. */
  depth?: number;
  /** Children per non-leaf node. 3 gives the reference's 1 / 3 / 9. */
  branching?: number;
  /**
   * Node box per level. Defaults are measured off the reference frame at 1080p:
   * 445x115 root, 298x92 mid, 148x62 leaf. Levels past the end reuse the last entry.
   */
  levelSize?: TreeLevelSize[];
  /** Vertical space between a parent's bottom edge and its children's top edge. Measured ~191px. */
  rowGap?: number;
  /** Gap between leaves that share a parent. Measured 19px. */
  leafGap?: number;
  /** Extra gap added between sibling subtrees, on top of `leafGap`. Measured 57px. */
  groupGap?: number;
  /**
   * Id of the ONE node wearing the accent, e.g. `"l0n0"` for the root or `"l2n4"`
   * for the middle leaf. Ids are `l{level}n{indexWithinLevel}`.
   *
   * Deliberately a single string, not an array. Two accented nodes means the viewer
   * has to choose where to look, which is the exact failure this style avoids.
   */
  highlight?: string;
  from?: number;
  /** Frames between one level appearing and the next. The top-down wave. */
  levelStagger?: number;
  /** Frames between siblings within a level. */
  nodeStagger?: number;
  /** Frames a connector takes to draw on. It finishes just as its child node lands. */
  connectorDuration?: number;
  curvature?: number;
  style?: React.CSSProperties;
};

const DEFAULT_SIZES: TreeLevelSize[] = [
  { w: 445, h: 115 },
  { w: 298, h: 92 },
  { w: 148, h: 62 },
];

type LaidOutNode = {
  id: string;
  level: number;
  indexInLevel: number;
  x: number;
  y: number;
  w: number;
  h: number;
  parent?: LaidOutNode;
};

/**
 * The hero motif: an abstract hierarchy of skeleton cards joined by thin curved
 * connectors, on a mostly-black frame.
 *
 * Layout is bottom-up -- leaves are packed left to right, then every parent centres
 * itself on the span of its children. That is what makes an irregular tree still
 * look composed, and it is why the defaults land the leftmost leaf at x=160 exactly
 * like the reference frame.
 */
export const TreeDiagram: React.FC<TreeDiagramProps> = ({
  depth = 3,
  branching = 3,
  levelSize = DEFAULT_SIZES,
  rowGap = 191,
  leafGap = 19,
  groupGap = 57,
  highlight,
  from = 0,
  levelStagger = 26,
  nodeStagger = 5,
  connectorDuration = 16,
  curvature = 0.5,
  style,
}) => {
  const t = useTheme();

  const { nodes, width, height } = React.useMemo(() => {
    const sizeAt = (l: number) => levelSize[Math.min(l, levelSize.length - 1)];

    // Row tops, stacked from the top of the diagram box.
    const rowTop: number[] = [];
    let y = 0;
    for (let l = 0; l < depth; l++) {
      rowTop.push(y);
      y += sizeAt(l).h + rowGap;
    }
    const totalHeight = y - rowGap;

    const out: LaidOutNode[] = [];
    const perLevelCount = new Array(depth).fill(0);
    let cursor = 0;

    const place = (level: number): LaidOutNode => {
      const { w, h } = sizeAt(level);
      const isLeaf = level === depth - 1;

      let cx: number;
      let children: LaidOutNode[] = [];

      if (isLeaf) {
        cx = cursor + w / 2;
        cursor += w + leafGap;
      } else {
        // Children are packed first, then this node centres on their span. Doing it
        // in this order is what keeps an uneven tree looking balanced.
        children = Array.from({ length: branching }, () => place(level + 1));
        cursor += groupGap;
        cx = (children[0].x + children[children.length - 1].x) / 2;
      }

      const node: LaidOutNode = {
        id: `l${level}n${perLevelCount[level]}`,
        level,
        indexInLevel: perLevelCount[level],
        x: cx,
        y: rowTop[level] + h / 2,
        w,
        h,
      };
      perLevelCount[level] += 1;
      children.forEach((c) => (c.parent = node));
      out.push(node);
      return node;
    };

    place(0);
    // Measure the real extent from the placed nodes rather than from the cursor.
    // The cursor always trails past the last leaf by a gap, and the arithmetic to
    // unwind that breaks on a single-node tree.
    const left = Math.min(...out.map((n) => n.x - n.w / 2));
    const right = Math.max(...out.map((n) => n.x + n.w / 2));
    const totalWidth = right - left;
    // Shift so the diagram box starts at x=0 regardless of where the cursor began.
    out.forEach((n) => (n.x -= left));

    // Ids were assigned in post-order, so re-index per level left to right.
    const byLevel = new Map<number, LaidOutNode[]>();
    out.forEach((n) => {
      const arr = byLevel.get(n.level) ?? [];
      arr.push(n);
      byLevel.set(n.level, arr);
    });
    byLevel.forEach((arr, level) => {
      arr
        .sort((a, b) => a.x - b.x)
        .forEach((n, i) => {
          n.indexInLevel = i;
          n.id = `l${level}n${i}`;
        });
    });

    return { nodes: out, width: totalWidth, height: totalHeight };
  }, [depth, branching, levelSize, rowGap, leafGap, groupGap]);

  const nodeDelay = (n: LaidOutNode) =>
    from + n.level * levelStagger + n.indexInLevel * nodeStagger;

  return (
    <div style={{ position: "relative", width, height, ...style }}>
      {/* One SVG for every connector: fewer layers, and the whole edge set shares
          a stacking context underneath the nodes. */}
      <svg
        width={width}
        height={height}
        style={{ position: "absolute", inset: 0, overflow: "visible" }}
      >
        {nodes
          .filter((n) => n.parent)
          .map((n) => {
            const p = n.parent as LaidOutNode;
            const a: Point = { x: p.x, y: p.y + p.h / 2 };
            const b: Point = { x: n.x, y: n.y - n.h / 2 };
            return (
              <ConnectorPath
                key={`c-${n.id}`}
                from={a}
                to={b}
                curvature={curvature}
                // The connector lands exactly as the child pops, so the eye reads
                // "the parent produced this" rather than "two things appeared".
                fromFrame={nodeDelay(n) - connectorDuration}
                duration={connectorDuration}
              />
            );
          })}
      </svg>

      {nodes.map((n) => (
        <TreeNode
          key={n.id}
          node={n}
          accent={highlight === n.id}
          from={nodeDelay(n)}
          radius={Math.min(14, Math.max(10, Math.round(n.h * 0.12)))}
          surface={t.surface}
        />
      ))}
    </div>
  );
};

const TreeNode: React.FC<{
  node: LaidOutNode;
  accent: boolean;
  from: number;
  radius: number;
  surface: string;
}> = ({ node, accent, from, radius, surface }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = entranceSpring(frame, fps, from);
  const opacity = interpolate(s, [0, 0.55], [0, 1], { extrapolateRight: "clamp" });

  // Pill proportions are constant fractions of the node box, measured across all
  // three levels of the reference frame: 0.44 wide for the heading line, 0.28 for
  // the body line. Holding the ratio is what makes a 148px leaf read as a small
  // version of the 445px root rather than a different component.
  const headW = Math.round(node.w * 0.44);
  const bodyW = Math.round(node.w * 0.28);
  const headH = Math.max(6, Math.round(node.h * 0.16));
  const bodyH = Math.max(5, Math.round(node.h * 0.13));

  return (
    <div
      style={{
        position: "absolute",
        left: node.x - node.w / 2,
        top: node.y - node.h / 2,
        width: node.w,
        height: node.h,
        borderRadius: radius,
        backgroundColor: surface,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: Math.max(5, Math.round(node.h * 0.1)),
        opacity,
        transform: `translateY(${(1 - s) * 12}px) scale(${interpolate(s, [0, 1], [0.94, 1])})`,
      }}
    >
      <div
        style={{
          width: headW,
          height: headH,
          borderRadius: t.radiusPill,
          backgroundColor: accent ? t.accent : t.pillBright,
        }}
      />
      <div
        style={{
          width: bodyW,
          height: bodyH,
          borderRadius: t.radiusPill,
          backgroundColor: t.pillDim,
        }}
      />
    </div>
  );
};
