import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { useTheme } from "../../../../shared/brand/ailabs-explainer";

/**
 * Film-local primitives for `AgentWorks`.
 *
 * The `ailabs-explainer` library covers the shapes this style is made of. What it
 * has no vocabulary for is the one thing this film is about: a verdict that is
 * green or red. `Pill`/`Callout` are deliberately limited to bright / dim /
 * accent so the accent budget cannot leak, and that restriction is right for a
 * product explainer and wrong for a film whose subject is a test result.
 *
 * So `verdict` is the single sanctioned extension, it uses the traffic colours the
 * theme already carries for browser chrome, and it is the only place in this film
 * where a fourth and fifth colour appear. VISION.md section 7 rule 3 requires at
 * least one genuinely red frame; script.md section 7 requires it to be exactly one
 * moment ("everything green until then, then red once, then never again").
 */

export type Verdict = "pass" | "fail" | "fired" | "none";

export const useVerdictColor = (v: Verdict): string => {
  const t = useTheme();
  return v === "pass" ? t.trafficGreen : v === "fail" ? t.trafficRed : v === "fired" ? t.accent : t.pillBright;
};

/**
 * Reveal ramp, and the reason every animation in this film goes through it.
 *
 * `interpolate(frame, [0, n], [0, 1])` is 0 on frame 0. If a shot's only content
 * is scheduled that way, the shot's first frame is the bare background - a blank
 * flash at the cut. `contrast.mjs` scores that as a transient luma dip and fails
 * the file, and the eye reads it as a stutter long before the gate does.
 *
 * So `from <= 0` means "already there when we cut to it", not "start animating
 * now". Every shot in `scenes.tsx` anchors at least one element at `from={0}`.
 */
export const reveal = (frame: number, from: number, dur = 12): number =>
  from <= 0
    ? 1
    : interpolate(frame, [from, from + dur], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      });

/** Small uppercase section label. One per frame, top left of the content well. */
export const Kicker: React.FC<{ children: React.ReactNode; from?: number }> = ({ children, from = 0 }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = reveal(frame, from, 10);
  return (
    <div
      style={{
        fontFamily: t.mono,
        fontSize: 22,
        letterSpacing: 3.2,
        textTransform: "uppercase",
        color: t.accent,
        opacity: p,
        marginBottom: 26,
      }}
    >
      {children}
    </div>
  );
};

/**
 * A line of real text that reveals by fading rather than typing.
 *
 * `rise` is 10px and the ease is out-cubic, matching `entranceFade` in the
 * library, so a line here and a `Pill` scheduled on the same frame land together.
 */
export const Line: React.FC<{
  children: React.ReactNode;
  from?: number;
  size?: number;
  color?: string;
  weight?: number;
  dim?: boolean;
  mono?: boolean;
  style?: React.CSSProperties;
}> = ({ children, from = 0, size = 34, color, weight = 400, dim = false, mono = true, style }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = reveal(frame, from);
  return (
    <div
      style={{
        fontFamily: mono ? t.mono : t.mono,
        fontSize: size,
        fontWeight: weight,
        color: color ?? (dim ? t.pillDim : t.pillBright),
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
        whiteSpace: "pre",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/**
 * The panel every drawn scene is built on.
 *
 * Not decoration, and not only house style. `contrast.mjs` scores a frame by luma
 * spread - 90th percentile minus 10th - and fails anything under 6 outright. A
 * drawn scene that is thin text on `#0D0D0D` puts well under 10% of the frame
 * above background, so both percentiles land on the background value and the
 * spread is zero. The film would fail its own gate for being tastefully sparse.
 *
 * A `surfaceAlt` panel across roughly half the frame fixes that by construction:
 * the 10th percentile stays on the canvas and the 90th sits on the panel. Measured
 * per shot in the still sweep rather than assumed.
 */
export const Stage: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
  align?: "center" | "flex-start";
  gap?: number;
  pad?: number;
}> = ({ children, width = 1580, height = 700, align = "flex-start", gap = 30, pad = 64 }) => {
  const t = useTheme();
  return (
    <div
      style={{
        width,
        height,
        boxSizing: "border-box",
        padding: pad,
        borderRadius: 18,
        backgroundColor: t.surfaceAlt,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: align,
        gap,
      }}
    >
      {children}
    </div>
  );
};

/**
 * The terminal used for every shell shot in the film.
 *
 * Deliberately not the library's `Terminal`: this one needs coloured output lines
 * and a fixed prompt that is byte-identical across shots. script.md section 6
 * hazard 4 requires the green suite at beat 1 and the red one at beat 13 to be
 * "the same suite in the same terminal" - different windows, fonts or working
 * directories turn a proof into a claim - so both come from this component with
 * the same `prompt` and the same `command`.
 */
export type ShellLine = { text: string; tone?: "dim" | "bright" | "accent" | "pass" | "fail"; from?: number };

export const Shell: React.FC<{
  prompt: string;
  command: string;
  lines: ShellLine[];
  width?: number;
  from?: number;
  fontSize?: number;
  /** Frames per character. The command types; the output does not. */
  cps?: number;
}> = ({ prompt, command, lines, width = 1380, from = 0, fontSize = 32, cps = 30 }) => {
  const t = useTheme();
  const frame = useCurrentFrame();

  const typeStart = Math.max(1, from + 6);
  const framesPerChar = 30 / cps;
  const typed = Math.max(0, Math.min(command.length, Math.floor((frame - typeStart) / framesPerChar)));
  // The cursor belongs to the prompt, so it goes away the moment the command has
  // been entered and output starts arriving. Leaving it blinking beside a finished
  // command next to its own results is a shell that never existed.
  const firstOutput = Math.min(...lines.map((l, i) => l.from ?? typeStart + command.length * framesPerChar + 8 + i * 6));
  const cursorOn = frame < firstOutput && Math.floor(frame / 15) % 2 === 0;

  const tone = (k: ShellLine["tone"]) =>
    k === "pass" ? t.trafficGreen : k === "fail" ? t.trafficRed : k === "accent" ? t.accent : k === "bright" ? t.pillBright : t.pillDim;

  const panel = reveal(frame, from, 10);

  return (
    <div
      style={{
        width,
        backgroundColor: t.bg,
        borderRadius: t.radiusCard,
        padding: "40px 46px",
        boxSizing: "border-box",
        fontFamily: t.mono,
        fontSize,
        lineHeight: 1.62,
        opacity: panel,
        transform: `translateY(${(1 - panel) * 12}px)`,
      }}
    >
      <div style={{ color: t.pillDim, fontSize: fontSize * 0.78 }}>{prompt}</div>
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span style={{ color: t.pillDim, marginRight: "0.6em" }}>$</span>
        <span style={{ color: t.pillBright, fontWeight: 500, whiteSpace: "pre" }}>{command.slice(0, typed)}</span>
        <span
          style={{
            display: "inline-block",
            width: fontSize * 0.5,
            height: fontSize * 0.92,
            marginLeft: 3,
            transform: "translateY(5px)",
            backgroundColor: t.accent,
            opacity: cursorOn ? 1 : 0,
          }}
        />
      </div>
      <div style={{ height: fontSize * 0.6 }} />
      {lines.map((l, i) => {
        const at = l.from ?? typeStart + command.length * framesPerChar + 8 + i * 6;
        const p = reveal(frame, at, 8);
        return (
          <div key={i} style={{ color: tone(l.tone), opacity: p, whiteSpace: "pre" }}>
            {l.text}
          </div>
        );
      })}
    </div>
  );
};

/**
 * A row of the form `<label>  ...............  <result>`.
 *
 * Half this film is a two-column argument - what was probed, and what the system
 * said back - so it is worth one component rather than nine ad-hoc flexboxes.
 */
export const ProbeRow: React.FC<{
  label: string;
  result: string;
  verdict?: Verdict;
  from?: number;
  width?: number;
  size?: number;
}> = ({ label, result, verdict = "none", from = 0, width = 1300, size = 36 }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const color =
    verdict === "pass" ? t.trafficGreen : verdict === "fail" ? t.trafficRed : verdict === "fired" ? t.accent : t.pillBright;
  const p = reveal(frame, from);
  return (
    <div
      style={{
        width,
        display: "flex",
        alignItems: "center",
        gap: 28,
        fontFamily: t.mono,
        fontSize: size,
        opacity: p,
        transform: `translateY(${(1 - p) * 10}px)`,
      }}
    >
      <span style={{ color: t.pillDim, whiteSpace: "pre" }}>{label}</span>
      <span style={{ flex: 1, height: 2, backgroundColor: t.surface }} />
      <span style={{ color, fontWeight: 500, whiteSpace: "pre" }}>{result}</span>
    </div>
  );
};

/** The film's verdict line: one short phrase, accent, under a two-row argument. */
export const Verdict: React.FC<{ children: React.ReactNode; from?: number; size?: number }> = ({
  children,
  from = 0,
  size = 40,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const p = reveal(frame, from, 14);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, opacity: p }}>
      <div style={{ width: interpolate(p, [0, 1], [0, 54]), height: 3, backgroundColor: t.accent }} />
      <div style={{ fontFamily: t.mono, fontSize: size, color: t.accent, fontWeight: 500 }}>{children}</div>
    </div>
  );
};

/**
 * A real recording or a real browser capture, framed and labelled.
 *
 * The label is the house-style requirement that a viewer can tell evidence from
 * drawing, and it is deliberately a short phrase: script.md section 6 forbids
 * on-screen prose competing with the narration, and three words over voice is the
 * documented safe limit.
 *
 * `sourceW`/`sourceH` are the true pixel size of the asset. The window is fitted
 * to that ratio rather than to 16:9, so nothing is ever cropped by an objectFit
 * the caller did not ask for - a cropped capture is how a table loses a row.
 */
export const Evidence: React.FC<{
  src: string;
  kind: "video" | "image";
  sourceW: number;
  sourceH: number;
  label: string;
  /** Max box the asset is fitted inside. */
  maxW?: number;
  maxH?: number;
  /** Continuous magnification over the shot. Kept tiny; this is a document, not a dolly. */
  push?: number;
  durationInFrames?: number;
  /**
   * Px of surfaceAlt matte drawn behind the media. Only needed when the asset is a
   * thin strip: `Evidence` paints bgDeep full-frame, so a short crop leaves ~84% of
   * the picture at luma 3 and the 90th-percentile luma that `contrast.mjs` measures
   * collapses into the black field. Measured, not guessed - see S22.
   */
  matte?: number;
}> = ({ src, kind, sourceW, sourceH, label, maxW = 1660, maxH = 850, push = 1.0, durationInFrames = 120, matte = 0 }) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const fit = Math.min(maxW / sourceW, maxH / sourceH);
  const w = Math.round(sourceW * fit);
  const h = Math.round(sourceH * fit);

  // No opacity fade at the boundary. Sequential Sequences do not overlap, so a
  // fade here would play against the previous shot's tail and dip the picture
  // through the background - the defect `contrast.mjs` exists to find.
  const scale = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [1, push], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: t.bgDeep, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
        <div
          style={{
            padding: matte,
            borderRadius: matte ? 14 + matte : 14,
            backgroundColor: matte ? t.surfaceAlt : "transparent",
          }}
        >
          <div
            style={{
              width: w,
              height: h,
              borderRadius: 14,
              overflow: "hidden",
              backgroundColor: "#FFFFFF",
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
          >
            {kind === "video" ? (
              <OffthreadVideo src={staticFile(src)} style={{ width: "100%", height: "100%", display: "block" }} muted />
            ) : (
              <Img src={staticFile(src)} style={{ width: "100%", height: "100%", display: "block" }} />
            )}
          </div>
        </div>
        <div
          style={{
            fontFamily: t.mono,
            fontSize: 22,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: t.pillDim,
            paddingLeft: 4,
          }}
        >
          {label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
