import React from "react";
import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { theme } from "./theme";
import type { Product } from "./products";

/** Slow drifting field of light. Deterministic: driven only by frame. */
export const Backdrop: React.FC<{ accent: string; accentSoft: string }> = ({
  accent,
  accentSoft,
}) => {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 220) * 6;
  const drift2 = Math.cos(frame / 300) * 5;

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg0 }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at ${28 + drift}% ${18 + drift2}%, ${theme.bg2} 0%, ${theme.bg1} 42%, ${theme.bg0} 78%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 46% at ${74 - drift}% ${76 + drift2}%, ${accent}22 0%, transparent 68%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(38% 38% at ${18 + drift2}% ${72 - drift}%, ${accentSoft}14 0%, transparent 70%)`,
        }}
      />
      {/* fine grid, keeps large flat areas from banding */}
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${theme.rule}1A 1px, transparent 1px), linear-gradient(90deg, ${theme.rule}1A 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          maskImage:
            "radial-gradient(80% 70% at 50% 45%, rgba(0,0,0,0.85) 0%, transparent 76%)",
          WebkitMaskImage:
            "radial-gradient(80% 70% at 50% 45%, rgba(0,0,0,0.85) 0%, transparent 76%)",
        }}
      />
      <AbsoluteFill
        style={{
          boxShadow: "inset 0 0 340px rgba(0,0,0,0.72)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Rises and fades in on a spring, then holds. */
export const Rise: React.FC<{
  delay?: number;
  children: React.ReactNode;
  distance?: number;
}> = ({ delay = 0, children, distance = 26 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200, mass: 0.7 },
    durationInFrames: 34,
  });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${(1 - s) * distance}px)`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
};

/** A hairline that draws itself left to right. */
export const Rule: React.FC<{ delay?: number; color: string; width?: number }> = ({
  delay = 0,
  color,
  width = 132,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 30], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ width: w, height: 3, background: color, borderRadius: 2 }} />;
};

/** Fades the whole scene out over its last `tail` frames, so cuts never pop. */
export const SceneFade: React.FC<{
  durationInFrames: number;
  children: React.ReactNode;
  tail?: number;
}> = ({ durationInFrames, children, tail = 18 }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 10, durationInFrames - tail, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const PAD = 168;

export const TitleScene: React.FC<{ p: Product; durationInFrames: number }> = ({
  p,
  durationInFrames,
}) => (
  <SceneFade durationInFrames={durationInFrames}>
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: `0 ${PAD}px`,
        fontFamily: theme.font,
      }}
    >
      <Rise delay={0}>
        <div
          style={{
            fontSize: 21,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: p.accentSoft,
            fontWeight: 600,
            marginBottom: 30,
          }}
        >
          Microsoft Global Hackathon 2026
        </div>
      </Rise>
      <Rise delay={10}>
        <div
          style={{
            fontSize: 104,
            lineHeight: 1.04,
            fontWeight: 700,
            color: theme.ink,
            letterSpacing: -2.5,
            marginBottom: 34,
          }}
        >
          {p.name}
        </div>
      </Rise>
      <Rise delay={22}>
        <Rule delay={22} color={p.accent} />
      </Rise>
      <Rise delay={34}>
        <div
          style={{
            marginTop: 34,
            fontSize: 34,
            lineHeight: 1.45,
            color: theme.inkSoft,
            maxWidth: 1240,
            fontWeight: 400,
          }}
        >
          {p.tagline}
        </div>
      </Rise>
    </AbsoluteFill>
  </SceneFade>
);

export const ProblemScene: React.FC<{ p: Product; durationInFrames: number }> = ({
  p,
  durationInFrames,
}) => (
  <SceneFade durationInFrames={durationInFrames}>
    <AbsoluteFill
      style={{
        justifyContent: "center",
        padding: `0 ${PAD}px`,
        fontFamily: theme.font,
      }}
    >
      <Rise delay={0}>
        <div
          style={{
            fontSize: 20,
            letterSpacing: 5,
            textTransform: "uppercase",
            color: p.accentSoft,
            fontWeight: 600,
            marginBottom: 44,
          }}
        >
          The problem
        </div>
      </Rise>
      {p.problem.map((line, i) => (
        <Rise key={i} delay={12 + i * 26}>
          <div
            style={{
              fontSize: 62,
              lineHeight: 1.28,
              color: i === 0 ? theme.ink : p.accentSoft,
              fontWeight: 600,
              letterSpacing: -1.2,
              maxWidth: 1420,
              marginBottom: 26,
            }}
          >
            {line}
          </div>
        </Rise>
      ))}
    </AbsoluteFill>
  </SceneFade>
);

export const BeatScene: React.FC<{
  p: Product;
  index: number;
  durationInFrames: number;
}> = ({ p, index, durationInFrames }) => {
  const beat = p.beats[index];
  return (
    <SceneFade durationInFrames={durationInFrames}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: `0 ${PAD}px`,
          fontFamily: theme.font,
        }}
      >
        <Rise delay={0}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 22,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                fontFamily: theme.mono,
                fontSize: 20,
                color: p.accent,
                border: `2px solid ${p.accent}66`,
                borderRadius: 999,
                padding: "8px 20px",
                fontWeight: 600,
              }}
            >
              {String(index + 1).padStart(2, "0")} / 03
            </div>
            <div
              style={{
                height: 2,
                flex: 1,
                background: `linear-gradient(90deg, ${p.accent}55, transparent)`,
              }}
            />
          </div>
        </Rise>
        <Rise delay={12}>
          <div
            style={{
              fontSize: 74,
              lineHeight: 1.1,
              color: theme.ink,
              fontWeight: 700,
              letterSpacing: -1.8,
              marginBottom: 34,
            }}
          >
            {beat.label}
          </div>
        </Rise>
        <Rise delay={26}>
          <div
            style={{
              fontSize: 33,
              lineHeight: 1.55,
              color: theme.inkSoft,
              maxWidth: 1330,
            }}
          >
            {beat.body}
          </div>
        </Rise>
      </AbsoluteFill>
    </SceneFade>
  );
};

export const CloseScene: React.FC<{ p: Product; durationInFrames: number }> = ({
  p,
  durationInFrames,
}) => (
  <SceneFade durationInFrames={durationInFrames} tail={26}>
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        padding: `0 ${PAD}px`,
        fontFamily: theme.font,
        textAlign: "center",
      }}
    >
      <Rise delay={4}>
        <div
          style={{
            fontSize: 66,
            lineHeight: 1.3,
            color: theme.ink,
            fontWeight: 700,
            letterSpacing: -1.6,
            maxWidth: 1420,
          }}
        >
          {p.close}
        </div>
      </Rise>
      <div style={{ height: 46 }} />
      <Rise delay={30}>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Rule delay={30} color={p.accent} width={168} />
        </div>
      </Rise>
      <Rise delay={42}>
        <div
          style={{
            marginTop: 40,
            fontSize: 29,
            color: theme.inkFaint,
            letterSpacing: 3,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {p.name}
        </div>
      </Rise>
    </AbsoluteFill>
  </SceneFade>
);

/** The per-product film. Shot lengths tile the composition exactly. */
export const ProductFilm: React.FC<{ product: Product }> = ({ product }) => {
  const shots = [
    { c: TitleScene, len: 210, props: {} },
    { c: ProblemScene, len: 300, props: {} },
    { c: BeatScene, len: 270, props: { index: 0 } },
    { c: BeatScene, len: 270, props: { index: 1 } },
    { c: BeatScene, len: 270, props: { index: 2 } },
    { c: CloseScene, len: 240, props: {} },
  ];

  let at = 0;
  return (
    <AbsoluteFill>
      <Backdrop accent={product.accent} accentSoft={product.accentSoft} />
      {shots.map((s, i) => {
        const from = at;
        at += s.len;
        const C = s.c as React.FC<Record<string, unknown>>;
        return (
          <Sequence key={i} from={from} durationInFrames={s.len}>
            <C p={product} durationInFrames={s.len} {...s.props} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

/** Total of the shot lengths above. Exported so Root cannot disagree with the cut. */
export const FILM_FRAMES = 210 + 300 + 270 + 270 + 270 + 240;
