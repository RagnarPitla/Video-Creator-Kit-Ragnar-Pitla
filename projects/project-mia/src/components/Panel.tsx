import React from 'react';
import {elevation} from '../lib/material';

/**
 * The workspace surface used across the "Mia today" scenes: a titled white
 * card that requirement rows, configuration settings and mapping fields sit
 * inside. Deliberately flatter than `GlassCard`, which is a drifting ambient
 * element; this one is meant to read as a real piece of software.
 */
export const Panel: React.FC<{
  title?: string;
  width: number;
  height?: number;
  accent?: string;
  children?: React.ReactNode;
  padding?: number;
}> = ({title, width, height, accent = '#1EC3BD', children, padding = 26}) => {
  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 18,
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #FFFFFF 0%, #F7FAFD 100%)',
        border: '1px solid rgba(196,212,228,0.9)',
        boxShadow: elevation(22),
      }}
    >
      {title ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: `${padding * 0.62}px ${padding}px`,
            borderBottom: '1px solid rgba(200,215,230,0.75)',
            background: 'rgba(243,248,252,0.8)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 10px ${accent}`,
            }}
          />
          <span
            style={{
              fontFamily: 'Segoe UI',
              fontWeight: 600,
              fontSize: 21,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#5A6675',
            }}
          >
            {title}
          </span>
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          padding,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * A single line item inside a `Panel`. `state` drives the status pip so the
 * same row can read as pending, adopted, flagged or complete without changing
 * its geometry, which keeps rows from jumping when their status changes.
 */
export const Row: React.FC<{
  label: string;
  meta?: string;
  state?: 'idle' | 'active' | 'warn' | 'done';
  size?: number;
}> = ({label, meta, state = 'idle', size = 25}) => {
  const tone = {
    idle: {pip: 'rgba(150,170,190,0.55)', text: '#5D6875', ring: 'transparent'},
    active: {pip: '#1EC3BD', text: '#2E343C', ring: 'rgba(30,195,189,0.32)'},
    warn: {pip: '#E8A33D', text: '#2E343C', ring: 'rgba(232,163,61,0.34)'},
    done: {pip: '#3FA46A', text: '#2E343C', ring: 'rgba(63,164,106,0.30)'},
  }[state];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: size * 0.55,
        padding: `${size * 0.42}px ${size * 0.6}px`,
        borderRadius: 11,
        background: state === 'idle' ? 'rgba(238,244,250,0.62)' : 'rgba(255,255,255,0.96)',
        border: `1px solid ${state === 'idle' ? 'rgba(206,219,232,0.7)' : tone.ring}`,
        boxShadow: state === 'idle' ? 'none' : elevation(7, '90, 120, 150'),
      }}
    >
      <div
        style={{
          width: size * 0.4,
          height: size * 0.4,
          borderRadius: '50%',
          flexShrink: 0,
          background: tone.pip,
          boxShadow: state === 'idle' ? 'none' : `0 0 9px ${tone.pip}`,
        }}
      />
      <span
        style={{
          flex: 1,
          fontFamily: 'Segoe UI',
          fontWeight: 400,
          fontSize: size,
          color: tone.text,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {label}
      </span>
      {meta ? (
        <span
          style={{
            fontFamily: 'Segoe UI',
            fontWeight: 350,
            fontSize: size * 0.76,
            color: '#8794A3',
            whiteSpace: 'nowrap',
          }}
        >
          {meta}
        </span>
      ) : null}
    </div>
  );
};
