import React from 'react';

/**
 * A restrained human figure. `bust` is the seated back-view used around a
 * table, `standing` is the full figure used for arrivals and handshakes.
 */
export const Figure: React.FC<{
  variant?: 'standing' | 'bust';
  height?: number;
  tone?: string;
  flip?: boolean;
  opacity?: number;
}> = ({variant = 'standing', height = 320, tone = '#8D9BAA', flip = false, opacity = 1}) => {
  if (variant === 'bust') {
    const w = (height * 100) / 130;
    return (
      <svg
        width={w}
        height={height}
        viewBox="0 0 100 130"
        fill="none"
        style={{opacity, scale: flip ? '-1 1' : undefined, display: 'block'}}
      >
        <circle cx="50" cy="40" r="21" fill={tone} />
        <path d="M9 130C9 96 27 74 50 74s41 22 41 56z" fill={tone} />
      </svg>
    );
  }

  const w = (height * 100) / 244;
  return (
    <svg
      width={w}
      height={height}
      viewBox="0 0 100 244"
      fill="none"
      style={{opacity, scale: flip ? '-1 1' : undefined, display: 'block'}}
    >
      <circle cx="50" cy="24" r="17" fill={tone} />
      <path
        d="M50 46c-16 0-27 10-29 26l-6 60c-1 9 5 15 14 15h42c9 0 15-6 14-15l-6-60c-2-16-13-26-29-26z"
        fill={tone}
      />
      <rect x="29" y="145" width="16" height="94" rx="8" fill={tone} />
      <rect x="55" y="145" width="16" height="94" rx="8" fill={tone} />
    </svg>
  );
};
