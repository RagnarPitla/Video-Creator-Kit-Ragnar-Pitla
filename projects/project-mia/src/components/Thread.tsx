import React from 'react';
import {buildPath, type Pt} from '../lib/path';

/**
 * The cyan intelligence thread. It is the connective motif of the whole film:
 * a precise light-trace that draws itself through the frame and gathers
 * disconnected work into one coordinated flow.
 */
export const Thread: React.FC<{
  points: Pt[];
  head: number;
  leadLength?: number;
  width?: number;
  trailOpacity?: number;
  showHead?: boolean;
  glowId?: string;
}> = ({
  points,
  head,
  leadLength = 0.16,
  width = 5,
  trailOpacity = 0.5,
  showHead = true,
  glowId = 'thread-glow',
}) => {
  const path = buildPath(points);
  const total = path.length;
  const clamped = Math.min(Math.max(head, 0), 1);
  const headLen = clamped * total;
  const leadStart = Math.max(0, headLen - leadLength * total);
  const tip = path.at(clamped);

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="14" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={path.d}
        fill="none"
        stroke="#1EC3BD"
        strokeWidth={width * 3.2}
        strokeLinecap="round"
        strokeOpacity={0.13}
        strokeDasharray={`0 0 ${headLen} ${total}`}
        style={{filter: `blur(16px)`}}
      />

      <path
        d={path.d}
        fill="none"
        stroke="#1EC3BD"
        strokeWidth={width}
        strokeLinecap="round"
        strokeOpacity={trailOpacity}
        strokeDasharray={`0 0 ${headLen} ${total}`}
      />

      <path
        d={path.d}
        fill="none"
        stroke="#3FE3DC"
        strokeWidth={width * 1.15}
        strokeLinecap="round"
        strokeOpacity={0.95}
        strokeDasharray={`0 ${leadStart} ${headLen - leadStart} ${total}`}
        style={{filter: `url(#${glowId})`}}
      />

      {showHead && clamped > 0.001 && clamped < 0.999 ? (
        <g transform={`translate(${tip.x} ${tip.y})`}>
          <circle r={26} fill="#1EC3BD" opacity={0.16} style={{filter: 'blur(10px)'}} />
          <circle r={9} fill="#5BEDE6" opacity={0.55} style={{filter: 'blur(4px)'}} />
          <circle r={4.4} fill="#FFFFFF" />
        </g>
      ) : null}
    </svg>
  );
};
