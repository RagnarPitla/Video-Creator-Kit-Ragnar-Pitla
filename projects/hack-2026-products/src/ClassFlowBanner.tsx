import React from "react";
import { AbsoluteFill } from "remotion";

/**
 * ClassFlow Copilot banner.
 *
 * Follows the sky/cloud landing-page reference: open blue sky, a heavy rounded
 * headline, and floating white pill tags. Deliberately not the dark enterprise
 * banner the other six products use - the audience here is a K-8 classroom.
 *
 * Single frame. Nothing animates.
 */

const ROUND =
  '"Arial Rounded MT Bold", "SF Pro Rounded", "Avenir Next", "Helvetica Neue", sans-serif';
const HAND = '"Bradley Hand", "Chalkboard SE", "Comic Sans MS", cursive';

const C = {
  skyTop: "#6EA8F0",
  skyMid: "#9DC4F7",
  skyLow: "#D8E8FC",
  ink: "#0C1226",
  inkSoft: "#4A5878",
  mint: "#1FBF8F",
  sun: "#FFB020",
};

type Puff = { x: number; y: number; r: number; o?: number };

/** A cloud is a cluster of blurred white circles. Coordinates are absolute. */
const Cloud: React.FC<{ puffs: Puff[]; blur?: number }> = ({ puffs, blur = 26 }) => (
  <div style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)` }}>
    {puffs.map((p, i) => (
      <div
        key={i}
        style={{
          position: "absolute",
          left: p.x - p.r,
          top: p.y - p.r,
          width: p.r * 2,
          height: p.r * 2,
          borderRadius: 999,
          background: "#FFFFFF",
          opacity: p.o ?? 1,
        }}
      />
    ))}
  </div>
);

const Pill: React.FC<{ label: string; x: number; y: number; rot: number }> = ({
  label,
  x,
  y,
  rot,
}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `rotate(${rot}deg)`,
      background: "#FFFFFF",
      borderRadius: 999,
      padding: "20px 40px",
      fontFamily: ROUND,
      fontSize: 34,
      color: C.ink,
      boxShadow: "0 18px 40px rgba(20,50,110,0.18)",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </div>
);

/** Small graded worksheet, tucked into the cloud bank so the banner says what the product does. */
const MiniSheet: React.FC = () => (
  <div
    style={{
      position: "absolute",
      right: 108,
      bottom: 74,
      width: 430,
      background: "#FFFFFF",
      borderRadius: 22,
      padding: "26px 30px 30px",
      boxShadow: "0 40px 80px rgba(20,50,110,0.26)",
      transform: "rotate(-5deg)",
    }}
  >
    <div
      style={{
        fontFamily: ROUND,
        fontSize: 24,
        color: C.inkSoft,
        borderBottom: "2px solid #E6EDF8",
        paddingBottom: 14,
        marginBottom: 16,
      }}
    >
      Fractions &middot; Grade 5
    </div>
    {[
      { a: "1/2 + 1/4 = 3/4", ok: true },
      { a: "24 + 18 = 32", ok: false },
    ].map((r, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 0",
        }}
      >
        <div style={{ fontFamily: HAND, fontSize: 34, color: "#1F3A93", flex: 1 }}>
          {r.a}
        </div>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 999,
            flexShrink: 0,
            background: r.ok ? `${C.mint}22` : `${C.sun}26`,
            color: r.ok ? C.mint : C.sun,
            fontFamily: ROUND,
            fontSize: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {r.ok ? "\u2713" : "\u25B3"}
        </div>
      </div>
    ))}
    <div
      style={{
        marginTop: 14,
        fontFamily: ROUND,
        fontSize: 21,
        color: C.inkSoft,
        lineHeight: 1.35,
      }}
    >
      <span style={{ color: C.sun }}>7 of 24</span> missed this. Regrouping.
    </div>
  </div>
);

export const ClassFlowBanner: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `linear-gradient(180deg, ${C.skyTop} 0%, ${C.skyMid} 46%, ${C.skyLow} 78%, #F2F8FF 100%)`,
      overflow: "hidden",
    }}
  >
    {/* corner cloud banks */}
    <Cloud
      puffs={[
        { x: 60, y: 200, r: 150 },
        { x: 220, y: 150, r: 120 },
        { x: 330, y: 235, r: 105 },
        { x: 150, y: 300, r: 130 },
        { x: -40, y: 300, r: 140 },
      ]}
    />
    <Cloud
      puffs={[
        { x: 1880, y: 175, r: 150 },
        { x: 1720, y: 135, r: 115 },
        { x: 1610, y: 220, r: 100 },
        { x: 1800, y: 285, r: 130 },
      ]}
    />
    {/* bottom bank */}
    <Cloud
      blur={34}
      puffs={[
        { x: 120, y: 1010, r: 210 },
        { x: 420, y: 1050, r: 190 },
        { x: 720, y: 1005, r: 205 },
        { x: 1040, y: 1055, r: 195 },
        { x: 1360, y: 1010, r: 210 },
        { x: 1680, y: 1050, r: 200 },
        { x: 1900, y: 1015, r: 190 },
      ]}
    />

    {/* centred stack */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 196,
      }}
    >
      {/* line-art emblem */}
      <svg width={104} height={104} viewBox="0 0 104 104" fill="none">
        <circle cx="52" cy="52" r="42" stroke="#FFFFFF" strokeWidth="3.5" />
        <ellipse cx="52" cy="52" rx="20" ry="42" stroke="#FFFFFF" strokeWidth="3.5" />
        <circle cx="52" cy="52" r="6" fill="#FFFFFF" />
      </svg>

      <div
        style={{
          marginTop: 40,
          fontFamily: ROUND,
          fontSize: 156,
          lineHeight: 1,
          color: C.ink,
          letterSpacing: -3,
          textAlign: "center",
        }}
      >
        ClassFlow Copilot
      </div>

      <div
        style={{
          marginTop: 30,
          fontFamily: ROUND,
          fontSize: 40,
          lineHeight: 1.35,
          color: "#283A5E",
          textAlign: "center",
          maxWidth: 1500,
        }}
      >
        Photograph the worksheets. Get the grades,
        <br />
        the gaps behind them, and practice for each student.
      </div>
    </div>

    {/* Pills stay clear of the worksheet card, which owns the lower right. */}
    <Pill label="#Handwriting" x={126} y={640} rot={-7} />
    <Pill label="#Math" x={188} y={786} rot={5} />
    <Pill label="#Grading" x={452} y={716} rot={-3} />
    <Pill label="#K-8" x={806} y={848} rot={4} />
    <Pill label="#Practice" x={1494} y={534} rot={6} />

    <MiniSheet />

    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 44,
        textAlign: "center",
        fontFamily: ROUND,
        fontSize: 27,
        color: "#41527A",
      }}
    >
      The teacher owns every grade. AI does the repetitive part.
    </div>
  </AbsoluteFill>
);
