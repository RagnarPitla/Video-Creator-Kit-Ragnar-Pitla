import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { useTheme } from "../theme";
import { entranceSpring } from "../motion";

export type BrowserChromeProps = {
  children?: React.ReactNode;
  /** Measured 1440x848 in the reference at 1080p. */
  width?: number;
  height?: number;
  /**
   * Shown in the address field. Rendered monospace with everything after the first
   * colon dimmed, which is how the reference draws `localhost:3000`.
   */
  url?: string;
  /** Title bar height. Measured at 70px against a 1440px-wide window. */
  chromeHeight?: number;
  /** Padding inside the content slot. */
  contentPadding?: number;
  from?: number;
  style?: React.CSSProperties;
};

/**
 * The fake browser window: title bar, three traffic lights, a monospace URL in a
 * recessed field, and a content slot.
 *
 * This is a signature motif -- it is the one place the style is allowed more than
 * one saturated colour, because the red/yellow/green dots are the only other
 * chroma in the entire reference video. Keep the content inside it skeleton pills;
 * the window is the frame, not the subject.
 */
export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  children,
  width = 1440,
  height = 848,
  url = "localhost:3000",
  chromeHeight = 70,
  contentPadding = 60,
  from,
  style,
}) => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const s = entranceSpring(frame, fps, from, { damping: 200, mass: 0.7 });
  const opacity = interpolate(s, [0, 0.6], [0, 1], { extrapolateRight: "clamp" });

  const colonAt = url.indexOf(":");
  const head = colonAt === -1 ? url : url.slice(0, colonAt);
  const tail = colonAt === -1 ? "" : url.slice(colonAt);

  // Dots scale with the chrome bar so the window still reads correctly at half size.
  const dot = Math.round(chromeHeight * 0.23);
  const urlFontSize = Math.round(chromeHeight * 0.3);

  return (
    <div
      style={{
        width,
        height,
        borderRadius: t.radiusCard,
        overflow: "hidden",
        backgroundColor: t.surfaceAlt,
        display: "flex",
        flexDirection: "column",
        opacity,
        transform: `translateY(${(1 - s) * 18}px) scale(${interpolate(s, [0, 1], [0.97, 1])})`,
        ...style,
      }}
    >
      <div
        style={{
          height: chromeHeight,
          flexShrink: 0,
          backgroundColor: t.surface,
          display: "flex",
          alignItems: "center",
          paddingLeft: Math.round(chromeHeight * 0.48),
          paddingRight: Math.round(chromeHeight * 0.48),
          position: "relative",
        }}
      >
        <div style={{ display: "flex", gap: Math.round(dot * 0.85) }}>
          {[t.trafficRed, t.trafficYellow, t.trafficGreen].map((c) => (
            <div key={c} style={{ width: dot, height: dot, borderRadius: dot, backgroundColor: c }} />
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: Math.round(width * 0.476),
            height: Math.round(chromeHeight * 0.54),
            borderRadius: 8,
            backgroundColor: t.surfaceAlt,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontFamily: t.mono,
            fontSize: urlFontSize,
          }}
        >
          {/* Drawn rather than typed: a padlock glyph varies by platform font. */}
          <LockGlyph size={Math.round(urlFontSize * 0.8)} color={t.pillDim} />
          <span style={{ color: t.pillBright }}>{head}</span>
          <span style={{ color: t.pillDim, marginLeft: -10 }}>{tail}</span>
        </div>
      </div>

      <div style={{ flex: 1, padding: contentPadding, position: "relative", overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

const LockGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
    <rect x="3.5" y="7" width="9" height="7" rx="1.5" stroke={color} strokeWidth="1.4" />
    <path d="M5.6 7V5.2a2.4 2.4 0 0 1 4.8 0V7" stroke={color} strokeWidth="1.4" />
  </svg>
);
