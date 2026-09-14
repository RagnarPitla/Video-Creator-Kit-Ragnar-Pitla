import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

/**
 * The bright glass-atrium environment the whole template sits in.
 * Built as a one-point perspective hall so the vanishing point can be moved
 * per scene, which is what makes each scene read as a different camera setup.
 */
export const Backdrop: React.FC<{
  vanishX?: number;
  vanishY?: number;
  zoomFrom?: number;
  zoomTo?: number;
}> = ({vanishX = 960, vanishY = 520, zoomFrom = 1.14, zoomTo = 1.02}) => {
  const frame = useCurrentFrame();

  const wallX1 = vanishX - 420;
  const wallX2 = vanishX + 420;
  const wallY1 = vanishY - 215;
  const wallY2 = vanishY + 215;

  const spanX = wallX2 - wallX1;
  const bottomDrop = 1080 - wallY2;

  return (
    <AbsoluteFill style={{backgroundColor: '#E9F0F7', overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          filter: 'blur(2.2px)',
          scale: interpolate(frame, [0, 300], [zoomFrom, zoomTo], {
            easing: Easing.bezier(0.22, 1, 0.36, 1),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            output: 'perceptual-scale',
          }),
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="mia-ceiling" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#F1F6FB" />
            </linearGradient>
            <linearGradient id="mia-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDFEFF" />
              <stop offset="52%" stopColor="#E2EBF3" />
              <stop offset="100%" stopColor="#CFDCE8" />
            </linearGradient>
            <linearGradient id="mia-wall-left" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C8D8E7" />
              <stop offset="100%" stopColor="#FAFCFE" />
            </linearGradient>
            <linearGradient id="mia-wall-right" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#C8D8E7" />
              <stop offset="100%" stopColor="#FAFCFE" />
            </linearGradient>
            <linearGradient id="mia-column" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#BFD0E0" />
              <stop offset="38%" stopColor="#FCFDFF" />
              <stop offset="100%" stopColor="#D6E2EC" />
            </linearGradient>
            <radialGradient id="mia-bloom">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.72" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          <polygon
            points={`0,0 1920,0 ${wallX2},${wallY1} ${wallX1},${wallY1}`}
            fill="url(#mia-ceiling)"
          />
          <polygon
            points={`0,1080 1920,1080 ${wallX2},${wallY2} ${wallX1},${wallY2}`}
            fill="url(#mia-floor)"
          />
          <polygon
            points={`0,0 ${wallX1},${wallY1} ${wallX1},${wallY2} 0,1080`}
            fill="url(#mia-wall-left)"
          />
          <polygon
            points={`1920,0 ${wallX2},${wallY1} ${wallX2},${wallY2} 1920,1080`}
            fill="url(#mia-wall-right)"
          />
          <rect
            x={wallX1}
            y={wallY1}
            width={spanX}
            height={wallY2 - wallY1}
            fill="#FCFEFF"
          />

          {[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1].map((t) => (
            <line
              key={`ceiling-rib-${t}`}
              x1={t * 1920}
              y1={0}
              x2={wallX1 + t * spanX}
              y2={wallY1}
              stroke="rgba(118,146,175,0.28)"
              strokeWidth={2}
            />
          ))}

          {[0, 0.16, 0.33, 0.5, 0.67, 0.84, 1].map((t) => (
            <line
              key={`floor-rib-${t}`}
              x1={t * 1920}
              y1={1080}
              x2={wallX1 + t * spanX}
              y2={wallY2}
              stroke="rgba(118,146,175,0.2)"
              strokeWidth={2}
            />
          ))}

          {[0.14, 0.32, 0.55, 0.82].map((t) => (
            <line
              key={`floor-band-${t}`}
              x1={wallX1 * (1 - t)}
              y1={wallY2 + t * bottomDrop}
              x2={wallX2 + t * (1920 - wallX2)}
              y2={wallY2 + t * bottomDrop}
              stroke="rgba(118,146,175,0.15)"
              strokeWidth={2}
            />
          ))}

          {[0.28, 0.46, 0.62, 0.76, 0.88].map((t) => (
            <line
              key={`left-mullion-${t}`}
              x1={t * wallX1}
              y1={t * wallY1}
              x2={t * wallX1}
              y2={1080 + t * (wallY2 - 1080)}
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={4}
            />
          ))}

          {[0.28, 0.46, 0.62, 0.76, 0.88].map((t) => (
            <line
              key={`right-mullion-${t}`}
              x1={1920 + t * (wallX2 - 1920)}
              y1={t * wallY1}
              x2={1920 + t * (wallX2 - 1920)}
              y2={1080 + t * (wallY2 - 1080)}
              stroke="rgba(255,255,255,0.9)"
              strokeWidth={4}
            />
          ))}

          {[0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map((t) => (
            <line
              key={`far-mullion-${t}`}
              x1={wallX1 + t * spanX}
              y1={wallY1}
              x2={wallX1 + t * spanX}
              y2={wallY2}
              stroke="rgba(150,178,204,0.26)"
              strokeWidth={2}
            />
          ))}

          <rect x={214} y={64} width={122} height={946} fill="url(#mia-column)" />
          <rect x={742} y={222} width={64} height={608} fill="url(#mia-column)" opacity={0.85} />
          <rect x={1498} y={168} width={86} height={742} fill="url(#mia-column)" opacity={0.9} />

          <ellipse cx={vanishX} cy={vanishY} rx={900} ry={540} fill="url(#mia-bloom)" />
        </svg>
      </AbsoluteFill>

      <AbsoluteFill style={{filter: 'blur(30px)', opacity: 0.5}}>
        <div
          style={{
            position: 'absolute',
            left: -240,
            top: -420,
            width: 430,
            height: 1960,
            rotate: '21deg',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 210,
            top: -460,
            width: 170,
            height: 1960,
            rotate: '21deg',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 100%)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            'radial-gradient(118% 118% at 50% 46%, rgba(255,255,255,0) 40%, rgba(146,178,208,0.32) 100%)',
        }}
      />
    </AbsoluteFill>
  );
};
