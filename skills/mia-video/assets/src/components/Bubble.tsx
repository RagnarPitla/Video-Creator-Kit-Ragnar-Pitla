import React from 'react';

/**
 * A Fluent surface used for requirements, findings and montage vignettes.
 */
export const Bubble: React.FC<{
  width: number;
  title?: string;
  body?: string;
  accent?: boolean;
  padding?: number;
  children?: React.ReactNode;
}> = ({width, title, body, accent = false, padding = 34, children}) => {
  return (
    <div
      style={{
        width,
        borderRadius: 28,
        background: '#FFFFFF',
        border: accent ? '2px solid #1EC3BD' : '1px solid #E4E9EF',
        boxShadow: '0 22px 54px rgba(24, 46, 72, 0.16)',
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
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
