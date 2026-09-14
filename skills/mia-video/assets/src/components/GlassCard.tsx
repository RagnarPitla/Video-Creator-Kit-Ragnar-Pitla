import React from 'react';
import {raised} from '../lib/material';

/**
 * One of the small floating "agent response" cards that drift through the hall.
 * Sized off a single `width` so it stays proportional at any depth.
 */
export const GlassCard: React.FC<{width: number; lines?: number}> = ({
  width,
  lines = 3,
}) => {
  return (
    <div
      style={{
        width,
        display: 'flex',
        alignItems: 'flex-start',
        gap: width * 0.075,
        padding: width * 0.1,
        borderRadius: width * 0.13,
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.94) 0%, rgba(244,249,253,0.82) 100%)',
        border: '1px solid rgba(255,255,255,0.95)',
        boxShadow: raised(20, '88, 118, 150'),
        backdropFilter: 'blur(6px)',
      }}
    >
      <div
        style={{
          width: width * 0.15,
          height: width * 0.15,
          borderRadius: '50%',
          flexShrink: 0,
          border: `${Math.max(1.5, width * 0.022)}px solid #19B6E4`,
          boxShadow: '0 0 10px rgba(25,182,228,0.45)',
        }}
      />
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: width * 0.05,
          paddingTop: width * 0.03,
        }}
      >
        {Array.from({length: lines}).map((_, i) => (
          <div
            key={i}
            style={{
              height: Math.max(2, width * 0.026),
              width: i === lines - 1 ? '58%' : '100%',
              borderRadius: 99,
              background: 'rgba(118,146,175,0.42)',
            }}
          />
        ))}
      </div>
    </div>
  );
};
