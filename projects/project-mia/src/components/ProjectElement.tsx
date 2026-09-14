import React from 'react';

export type ElementKind = 'person' | 'document' | 'step' | 'decision' | 'data';

const Glyph: React.FC<{kind: ElementKind; color: string}> = ({kind, color}) => {
  if (kind === 'person') {
    return (
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="14" r="6.4" stroke={color} strokeWidth={2.2} />
        <path
          d="M8.6 32.5c0-6.1 5.1-10.2 11.4-10.2s11.4 4.1 11.4 10.2"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (kind === 'document') {
    return (
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
        <path
          d="M11 6.5h11.6L30 14v19.5H11z"
          stroke={color}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path d="M22.4 6.6V14H30" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
        <path d="M15.6 21h9.2M15.6 26.4h9.2" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === 'step') {
    return (
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
        <rect x="6.5" y="12" width="15" height="16" rx="2.6" stroke={color} strokeWidth={2.2} />
        <path d="M24.5 20h9" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
        <path
          d="M29.6 16.2 33.6 20l-4 3.8"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (kind === 'decision') {
    return (
      <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
        <path
          d="M20 6.4 33.6 20 20 33.6 6.4 20z"
          stroke={color}
          strokeWidth={2.2}
          strokeLinejoin="round"
        />
        <path
          d="M15.4 20.2l3.4 3.4 6-6.6"
          stroke={color}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" fill="none">
      <ellipse cx="20" cy="11" rx="11.6" ry="4.6" stroke={color} strokeWidth={2.2} />
      <path d="M8.4 11v18c0 2.5 5.2 4.6 11.6 4.6s11.6-2.1 11.6-4.6V11" stroke={color} strokeWidth={2.2} />
      <path d="M8.4 20c0 2.6 5.2 4.6 11.6 4.6S31.6 22.6 31.6 20" stroke={color} strokeWidth={2.2} />
    </svg>
  );
};

/**
 * A single unit of project work rendered as a Fluent surface card.
 * `bound` runs 0 to 1 as the thread captures the element.
 */
export const ProjectElement: React.FC<{
  kind: ElementKind;
  label?: string;
  size?: number;
  bound?: number;
  opacity?: number;
}> = ({kind, label, size = 104, bound = 0, opacity = 1}) => {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: '#FFFFFF',
        border: '1px solid #E4E9EF',
        boxShadow: `0 ${size * 0.14}px ${size * 0.34}px rgba(24, 46, 72, 0.13), 0 0 0 ${
          bound * 3
        }px rgba(30, 195, 189, ${bound * 0.55})`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size * 0.05,
        opacity,
        position: 'relative',
      }}
    >
      <div style={{transform: `scale(${size / 104})`, display: 'flex'}}>
        <Glyph kind={kind} color={bound > 0.5 ? '#1EC3BD' : '#5C6B7C'} />
      </div>
      {label ? (
        <div
          style={{
            fontFamily: 'Segoe UI',
            fontWeight: 400,
            fontSize: size * 0.125,
            letterSpacing: '0.02em',
            color: '#64717F',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
};
