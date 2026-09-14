import React from "react";
import { AbsoluteFill } from "remotion";
import { theme } from "./theme";
import type { Product } from "./products";
import { Backdrop } from "./ProductFilm";

/**
 * The hero still used as each project's vision image.
 * Rendered as a single frame, so nothing here animates.
 */
export const VisionStill: React.FC<{ product: Product }> = ({ product: p }) => (
  <AbsoluteFill style={{ fontFamily: theme.font }}>
    <Backdrop accent={p.accent} accentSoft={p.accentSoft} />

    <AbsoluteFill style={{ padding: "112px 132px", justifyContent: "space-between" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div
          style={{
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: p.accentSoft,
            fontWeight: 600,
          }}
        >
          Microsoft Global Hackathon 2026
        </div>
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: theme.inkFaint,
            fontWeight: 600,
          }}
        >
          Hack for Agents in the Enterprise
        </div>
      </div>

      <div>
        <div
          style={{
            fontSize: 112,
            lineHeight: 1.02,
            fontWeight: 700,
            color: theme.ink,
            letterSpacing: -3,
            maxWidth: 1500,
          }}
        >
          {p.name}
        </div>
        <div
          style={{
            width: 156,
            height: 4,
            background: p.accent,
            borderRadius: 2,
            margin: "40px 0 36px",
          }}
        />
        <div
          style={{
            fontSize: 34,
            lineHeight: 1.45,
            color: theme.inkSoft,
            maxWidth: 1400,
          }}
        >
          {p.tagline}
        </div>
      </div>

      <div style={{ display: "flex", gap: 26 }}>
        {p.beats.map((b, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              border: `2px solid ${theme.rule}`,
              borderTop: `3px solid ${p.accent}`,
              borderRadius: 14,
              padding: "26px 28px 30px",
              background: "rgba(10,8,28,0.55)",
            }}
          >
            <div
              style={{
                fontFamily: theme.mono,
                fontSize: 17,
                color: p.accent,
                fontWeight: 700,
                marginBottom: 14,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </div>
            <div
              style={{
                fontSize: 27,
                lineHeight: 1.25,
                color: theme.ink,
                fontWeight: 600,
                letterSpacing: -0.4,
              }}
            >
              {b.label}
            </div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  </AbsoluteFill>
);
