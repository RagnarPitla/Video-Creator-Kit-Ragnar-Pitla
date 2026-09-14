import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {EASE} from '../lib/motion';
import {buildPath, type Pt} from '../lib/path';

export type PulseSpec = {
  /** Frame the pulse leaves `from`. */
  start: number;
  /** Frames taken to travel to `to`. */
  duration: number;
  /** 0..1 along the path. Defaults to the full run. */
  from?: number;
  to?: number;
};

/**
 * Light pulses that run along an already-drawn thread.
 *
 * Once the thread finishes drawing it becomes a static line, and in V1 that
 * static line sat on screen for a second and a half with nothing happening.
 * Pulses give the thread a sense of ongoing throughput without redrawing it,
 * so the shot keeps moving while the caption lands.
 */
export const ThreadPulse: React.FC<{
  points: Pt[];
  pulses: PulseSpec[];
  color?: string;
  width?: number;
  trail?: number;
  glowId?: string;
}> = ({
  points,
  pulses,
  color = '#5BEDE6',
  width = 5,
  trail = 0.1,
  glowId = 'pulse-glow',
}) => {
  const frame = useCurrentFrame();
  const path = buildPath(points);
  const total = path.length;

  return (
    <svg
      width={1920}
      height={1080}
      viewBox="0 0 1920 1080"
      style={{position: 'absolute', inset: 0, overflow: 'visible'}}
    >
      <defs>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="9" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {pulses.map((pulse, i) => {
        const {start, duration, from = 0, to = 1} = pulse;
        const local = frame - start;
        if (local < 0 || local > duration) return null;

        const t = local / duration;
        const p = interpolate(t, [0, 1], [from, to], {easing: EASE.drift});
        // Fade in off the tail, fade out before the head so it never pops.
        const alpha =
          interpolate(t, [0, 0.14], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }) *
          interpolate(t, [0.76, 1], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

        const headLen = p * total;
        const tip = path.at(p);

        // Three stacked dashes behind the head give a falloff the SVG dash
        // array cannot express on its own.
        const segs = [
          {len: trail * 0.34, op: 0.95, w: width},
          {len: trail * 0.66, op: 0.45, w: width * 0.8},
          {len: trail, op: 0.18, w: width * 0.6},
        ];

        return (
          <g key={i} opacity={alpha}>
            {segs.map((seg, j) => {
              const segStart = Math.max(0, headLen - seg.len * total);
              return (
                <path
                  key={j}
                  d={path.d}
                  fill="none"
                  stroke={color}
                  strokeWidth={seg.w}
                  strokeLinecap="round"
                  strokeOpacity={seg.op}
                  strokeDasharray={`0 ${segStart} ${headLen - segStart} ${total}`}
                />
              );
            })}
            <g transform={`translate(${tip.x} ${tip.y})`} style={{filter: `url(#${glowId})`}}>
              <circle r={width * 2.6} fill={color} opacity={0.2} />
              <circle r={width * 0.86} fill="#FFFFFF" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};
