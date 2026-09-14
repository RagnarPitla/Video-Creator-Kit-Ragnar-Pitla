import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EASE, floatAt, range} from '../lib/motion';

/**
 * Ambient motes drifting through the volume of the room.
 *
 * These exist to solve a specific V1 problem: between beats the frame had
 * literally nothing in motion, so a 30 frame gap read as a stall. Motes are
 * always moving, at an amplitude low enough that they never pull focus, so
 * the shot stays alive between the beats that matter.
 */
export const Motes: React.FC<{
  count?: number;
  seed?: number;
  opacity?: number;
  fadeIn?: number;
}> = ({count = 26, seed = 0, opacity = 1, fadeIn = 0}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const wake = interpolate(frame, [fadeIn, fadeIn + 34], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: opacity * wake, pointerEvents: 'none'}}>
      {new Array(count).fill(0).map((_, i) => {
        const s = i + seed * 100;
        const baseX = range(s, 1, -60, 1980);
        const baseY = range(s, 2, -40, 1120);
        // Depth: distant motes are smaller, dimmer, blurrier and drift less.
        const depth = range(s, 4, 0, 1);
        const size = 3 + depth * 9;
        const drift = floatAt(seconds, s, 26 + depth * 52, 20 + depth * 40, 0.42);
        const cyan = range(s, 8, 0, 1) > 0.62;

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: baseX + drift.x,
              top: baseY + drift.y,
              width: size,
              height: size,
              borderRadius: '50%',
              background: cyan
                ? 'rgba(30, 195, 189, 0.5)'
                : 'rgba(255, 255, 255, 0.92)',
              boxShadow: cyan
                ? '0 0 12px rgba(30, 195, 189, 0.42)'
                : '0 0 10px rgba(255, 255, 255, 0.7)',
              opacity: 0.16 + depth * 0.4,
              filter: `blur(${(1 - depth) * 1.6}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
