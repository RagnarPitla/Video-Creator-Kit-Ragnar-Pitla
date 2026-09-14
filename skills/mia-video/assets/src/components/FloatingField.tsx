import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {GlassCard} from './GlassCard';

type Kind = 'card' | 'sphere' | 'pill' | 'slab' | 'disc' | 'bar';

type FloatingObject = {
  kind: Kind;
  /** Horizontal position in percent of the frame width. */
  x: number;
  /** Vertical position in percent of the frame height. */
  y: number;
  /** Depth, 0 = far away, 1 = close to camera. Drives size, blur and opacity. */
  z: number;
  size: number;
  rot: number;
  phase: number;
  tint?: boolean;
};

// Ordered back to front so the DOM order doubles as the depth sort.
const OBJECTS: FloatingObject[] = [
  {kind: 'pill', x: 32, y: 13, z: 0.18, size: 0.5, rot: -6, phase: 0.2},
  {kind: 'card', x: 14, y: 22, z: 0.22, size: 0.55, rot: 4, phase: 1.1},
  {kind: 'sphere', x: 46, y: 30, z: 0.2, size: 0.4, rot: 0, phase: 2.4},
  {kind: 'bar', x: 55, y: 44, z: 0.2, size: 0.55, rot: 12, phase: 3.1},
  {kind: 'sphere', x: 27, y: 49, z: 0.26, size: 0.35, rot: 0, phase: 0.7},
  {kind: 'disc', x: 63, y: 17, z: 0.28, size: 0.5, rot: -4, phase: 1.9},
  {kind: 'card', x: 76, y: 26, z: 0.26, size: 0.6, rot: -5, phase: 2.8},
  {kind: 'pill', x: 70, y: 48, z: 0.3, size: 0.45, rot: 8, phase: 4.2},
  {kind: 'disc', x: 88, y: 38, z: 0.32, size: 0.55, rot: 6, phase: 0.4},
  {kind: 'bar', x: 41, y: 24, z: 0.24, size: 0.45, rot: -14, phase: 5.0},

  {kind: 'disc', x: 36, y: 58, z: 0.46, size: 0.7, rot: -7, phase: 1.4},
  {kind: 'card', x: 9, y: 45, z: 0.5, size: 0.85, rot: 6, phase: 2.2},
  {kind: 'pill', x: 44, y: 73, z: 0.5, size: 0.75, rot: -9, phase: 3.6},
  {kind: 'bar', x: 66, y: 66, z: 0.52, size: 0.8, rot: 16, phase: 4.7},
  {kind: 'sphere', x: 20, y: 69, z: 0.56, size: 0.7, rot: 0, phase: 0.9},
  {kind: 'sphere', x: 58, y: 85, z: 0.6, size: 0.75, rot: 0, phase: 2.6, tint: true},
  {kind: 'card', x: 85, y: 59, z: 0.6, size: 0.95, rot: -4, phase: 3.3},
  {kind: 'slab', x: 30, y: 80, z: 0.55, size: 0.85, rot: -6, phase: 1.7},

  {kind: 'bar', x: 12, y: 8, z: 0.8, size: 1.0, rot: -18, phase: 4.1},
  {kind: 'card', x: 94, y: 14, z: 0.82, size: 1.0, rot: 7, phase: 0.6},
  {kind: 'pill', x: 24, y: 91, z: 0.86, size: 1.1, rot: 5, phase: 2.0},
  {kind: 'disc', x: 72, y: 93, z: 0.88, size: 1.15, rot: -8, phase: 3.8},
  {kind: 'card', x: 4, y: 77, z: 0.9, size: 1.2, rot: -6, phase: 1.2},
  {kind: 'sphere', x: 91, y: 81, z: 0.95, size: 1.3, rot: 0, phase: 4.5, tint: true},
];

const Shape: React.FC<{object: FloatingObject}> = ({object}) => {
  if (object.kind === 'card') {
    return <GlassCard width={250 * object.size} lines={object.size > 0.8 ? 3 : 2} />;
  }

  if (object.kind === 'sphere') {
    return (
      <div
        style={{
          width: 96 * object.size,
          height: 96 * object.size,
          borderRadius: '50%',
          background: object.tint
            ? 'radial-gradient(circle at 32% 26%, #FFFFFF 0%, rgba(226,246,254,0.92) 34%, rgba(163,219,240,0.78) 72%, rgba(119,190,220,0.6) 100%)'
            : 'radial-gradient(circle at 32% 26%, #FFFFFF 0%, rgba(255,255,255,0.9) 34%, rgba(215,229,241,0.8) 72%, rgba(178,201,220,0.62) 100%)',
          boxShadow:
            '0 20px 44px rgba(88,118,150,0.22), inset -8px -12px 24px rgba(150,180,205,0.35)',
        }}
      />
    );
  }

  if (object.kind === 'pill') {
    return (
      <div
        style={{
          width: 148 * object.size,
          height: 56 * object.size,
          borderRadius: 99,
          background:
            'linear-gradient(150deg, rgba(255,255,255,0.98) 0%, rgba(232,242,250,0.85) 100%)',
          border: '1px solid rgba(255,255,255,0.95)',
          boxShadow: '0 16px 34px rgba(88,118,150,0.18)',
        }}
      />
    );
  }

  if (object.kind === 'slab') {
    return (
      <div
        style={{
          width: 230 * object.size,
          height: 54 * object.size,
          borderRadius: 10,
          transform: 'skewX(-22deg)',
          background:
            'linear-gradient(160deg, #FFFFFF 0%, #F2F7FC 55%, #DAE6F0 100%)',
          boxShadow: '0 24px 44px rgba(88,118,150,0.2)',
        }}
      />
    );
  }

  if (object.kind === 'disc') {
    return (
      <div
        style={{
          width: 156 * object.size,
          height: 38 * object.size,
          borderRadius: '50%',
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #EFF5FB 45%, #D3E0EB 100%)',
          boxShadow: '0 18px 32px rgba(88,118,150,0.2)',
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 68 * object.size,
        height: 15 * object.size,
        borderRadius: 99,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #DDE8F2 100%)',
        boxShadow: '0 8px 18px rgba(88,118,150,0.18)',
      }}
    />
  );
};

/**
 * The parallaxed cloud of glass UI cards, spheres and slabs.
 * Kept out of the interactive timeline on purpose - two dozen decorative
 * layers would drown the useful ones.
 */
export const FloatingField: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{opacity}}>
      {OBJECTS.map((object, i) => {
        const seconds = frame / fps;
        const bob = Math.sin((seconds + object.phase) * 1.05) * (4 + object.z * 15);
        const rise = -frame * (0.04 + object.z * 0.2);
        const sway = Math.cos((seconds + object.phase) * 0.62) * (2 + object.z * 9);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${object.x}%`,
              top: `${object.y}%`,
              rotate: `${object.rot}deg`,
              translate: `calc(-50% + ${sway}px) calc(-50% + ${bob + rise}px)`,
              scale: 1 + frame * 0.00022 * (0.4 + object.z),
              filter: `blur(${(Math.abs(object.z - 0.62) * 6.5).toFixed(2)}px)`,
              opacity:
                (0.34 + object.z * 0.62) *
                interpolate(frame, [0, 20], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                }),
            }}
          >
            <Shape object={object} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
