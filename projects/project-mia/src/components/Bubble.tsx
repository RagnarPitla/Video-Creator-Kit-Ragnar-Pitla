import React from 'react';

/**
 * A Fluent surface used for requirements, findings and montage vignettes.
 *
 * Review note 7 added the tail. In the requirements workshop these cards are
 * things people in the room said, so they read as speech rather than as
 * floating labels. Other scenes keep tail="none" and are unchanged.
 */
export const Bubble: React.FC<{
  width: number;
  title?: string;
  body?: string;
  accent?: boolean;
  padding?: number;
  tail?: 'none' | 'speech' | 'thought';
  /** Horizontal position of the tail, 0 = left edge, 1 = right edge. */
  tailX?: number;
  children?: React.ReactNode;
}> = ({
  width,
  title,
  body,
  accent = false,
  padding = 34,
  tail = 'none',
  tailX = 0.5,
  children,
}) => {
  const line = accent ? '#1EC3BD' : '#E4E9EF';
  const lineW = accent ? 2 : 1;
  // Keep the tail clear of the 28px corner radius at either end.
  const tx = Math.min(0.86, Math.max(0.14, tailX)) * width;

  return (
    <div
      style={{
        position: 'relative',
        width,
        borderRadius: 28,
        background: '#FFFFFF',
        border: `${lineW}px solid ${line}`,
        boxShadow: '0 22px 54px rgba(24, 46, 72, 0.16)',
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {tail === 'speech' ? (
        <svg
          width={54}
          height={34}
          viewBox="0 0 54 34"
          style={{
            position: 'absolute',
            left: tx - 27,
            top: '100%',
            marginTop: -lineW,
            overflow: 'visible',
          }}
        >
          <path
            d="M3 1 L27 31 L51 1"
            fill="#FFFFFF"
            stroke={line}
            strokeWidth={lineW}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Paint out the seam where the tail meets the card's own border. */}
          <path
            d="M4 1 L50 1"
            stroke="#FFFFFF"
            strokeWidth={lineW + 2.4}
            strokeLinecap="butt"
          />
        </svg>
      ) : null}
      {tail === 'thought' ? (
        <svg
          width={60}
          height={54}
          viewBox="0 0 60 54"
          style={{
            position: 'absolute',
            left: tx - 30,
            top: '100%',
            marginTop: 6,
            overflow: 'visible',
          }}
        >
          <circle cx="34" cy="12" r="11" fill="#FFFFFF" stroke={line} strokeWidth={lineW} />
          <circle cx="20" cy="32" r="7.5" fill="#FFFFFF" stroke={line} strokeWidth={lineW} />
          <circle cx="10" cy="46" r="4.5" fill="#FFFFFF" stroke={line} strokeWidth={lineW} />
        </svg>
      ) : null}
      {title ? (
        <div
          style={{
            fontFamily: 'Segoe UI',
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: accent ? '#1EC3BD' : '#7C8899',
          }}
        >
          {title}
        </div>
      ) : null}
      {body ? (
        <div
          style={{
            fontFamily: 'Segoe UI',
            fontWeight: 350,
            fontSize: 46,
            lineHeight: 1.24,
            letterSpacing: '-0.006em',
            color: '#34383F',
          }}
        >
          {body}
        </div>
      ) : null}
      {children}
    </div>
  );
};
