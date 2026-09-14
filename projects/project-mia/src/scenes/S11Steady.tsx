import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Caption} from '../components/Caption';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {ProductTile} from '../components/ProductTile';
import {useLook} from '../lib/material';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s11Schema = z.object({
  monitors: z.array(z.object({title: z.string(), value: z.string(), note: z.string()})),
  caption: z.string(),
});

/**
 * Fills the 10 sec that ran black from 01:25.3 to 01:35.3, under "MIA is still
 * there, monitoring environment health, explaining upcoming features,
 * analyzing their potential impact".
 *
 * The whole point of the shot is persistence, so it is built on a contrast:
 * the delivery team drifts out of frame and dims, while a single node holds
 * position and a horizon thread keeps extending past the right edge.
 */
const HORIZON = [
  {x: -180, y: 902},
  {x: 420, y: 894},
  {x: 1040, y: 878},
  {x: 1680, y: 866},
  {x: 2120, y: 858},
];

const TEAM = [
  {x: 268, y: 470, scale: 1.0, out: 0},
  {x: 400, y: 512, scale: 0.86, out: 7},
  {x: 176, y: 548, scale: 0.78, out: 14},
];

const NODE_X = 700;
const NODE_Y = 502;

const Figure: React.FC<{size: number; tone: string}> = ({size, tone}) => (
  <svg width={size} height={size * 1.5} viewBox="0 0 40 60">
    <circle cx="20" cy="12" r="9.5" fill={tone} />
    <path d="M4 58c0-9.5 7.2-17 16-17s16 7.5 16 17z" fill={tone} />
  </svg>
);

/** The apps Mia keeps watch over once the team has rolled off. */
const WATCHED = ['finance', 'supply-chain-management', 'commerce'];

export const S11Steady: React.FC<z.infer<typeof s11Schema>> = ({monitors, caption}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const cam = cameraDrift(seconds, 0.85);
  const push = interpolate(frame, [0, 240], [1.0, 1.05], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });

  const horizon = interpolate(frame, [20, 178], [0, 1], {
    easing: EASE.drift,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // The node never scales in from nothing; it is already present at frame 0,
  // because it is the thing that was there before and stays after.
  const nodeGlow = 0.55 + Math.sin(seconds * 1.9) * 0.16;

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={1120}
        vanishY={520}
        zoomFrom={1.08}
        zoomTo={1.0}
        fieldOpacity={0.36}
        people={false}
        scrim={0.5}
      />
      <Motes count={30} seed={11} opacity={0.9} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        <Thread points={HORIZON} head={horizon} width={4} leadLength={0.16} glowId="s11-horizon" />
        {/*
         * Review note 11 took 60 frames off this scene so S08 could start
         * earlier, so every beat below had to come in with it. The two horizon
         * pulses used to start at 150 and 214 and run 96 and 92 frames, which
         * at 240 frames long would have cut the second one off 26 frames into
         * its travel - a light that vanishes mid-thread rather than leaving.
         */}
        <ThreadPulse
          points={HORIZON}
          pulses={[
            {start: 116, duration: 84},
            {start: 158, duration: 80},
          ]}
          width={4}
          trail={0.3}
          glowId="s11-horizon-pulse"
        />

        {TEAM.map((member, i) => {
          // Leaving, not vanishing: they slide left and lose contrast together.
          const leave = interpolate(frame, [member.out, member.out + 92], [0, 1], {
            easing: EASE.inOut,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const drift = floatAt(seconds, i * 9 + 4, 5, 7, 0.8);
          return (
            <div
              key={`team-${i}`}
              style={{
                position: 'absolute',
                left: member.x - 40 + drift.x - leave * 330,
                top: member.y + drift.y,
                opacity: (1 - leave) * 0.62,
                scale: String(member.scale * (1 - leave * 0.12)),
                filter: `blur(${leave * 2.4}px)`,
              }}
            >
              <Figure size={80} tone="rgba(126,148,171,0.85)" />
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: NODE_X - 82,
            top: NODE_Y - 82 + floatAt(seconds, 71, 4, 6, 0.45).y,
            width: 164,
            height: 164,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -34,
              borderRadius: '50%',
              border: '2px solid rgba(30,195,189,0.26)',
              opacity: 0.5 + Math.sin(seconds * 1.3) * 0.2,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 46% 40%, #FFFFFF 0%, #DFF6F5 60%, #BEE9E7 100%)',
              border: '2px solid rgba(30,195,189,0.55)',
              boxShadow: `0 0 ${28 + nodeGlow * 26}px rgba(30,195,189,${nodeGlow * 0.5})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'Segoe UI',
              fontWeight: 350,
              fontSize: 44,
              letterSpacing: '0.02em',
              color: '#177F82',
            }}
          >
            Mia
          </div>
        </div>

        {monitors.map((monitor, i) => {
          const appear = settle({frame, fps, start: 50 + i * 38, duration: 48, bounce: 12});
          const drift = floatAt(seconds, i * 19 + 6, 6, 8, 0.6);
          return (
            <div
              key={monitor.title}
              style={{
                position: 'absolute',
                left: 1064 + drift.x,
                top: 216 + i * 178 + drift.y,
                width: 660,
                display: 'flex',
                alignItems: 'center',
                gap: 26,
                padding: '24px 30px',
                borderRadius: 16,
                opacity: appear,
                translate: `${(1 - appear) * 40}px 0px`,
                background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
                border: '1px solid rgba(198,213,229,0.9)',
                boxShadow: '0 22px 46px rgba(88,118,150,0.15)',
              }}
            >
              {look.logos === 'rich' ? (
                <div style={{opacity: appear, flexShrink: 0}}>
                  <ProductTile slug={WATCHED[i % WATCHED.length]} size={50} bound={1} />
                </div>
              ) : null}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  flex: 1,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Segoe UI',
                    fontWeight: 600,
                    fontSize: 19,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: '#8794A3',
                  }}
                >
                  {monitor.title}
                </span>
                <span
                  style={{
                    fontFamily: 'Segoe UI',
                    fontWeight: 350,
                    fontSize: 38,
                    color: '#2E343C',
                    lineHeight: 1.1,
                  }}
                >
                  {monitor.value}
                </span>
              </div>
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 350,
                  fontSize: 23,
                  color: '#178F92',
                  whiteSpace: 'nowrap',
                  padding: '8px 16px',
                  borderRadius: 99,
                  background: 'rgba(30,195,189,0.10)',
                  border: '1px solid rgba(30,195,189,0.3)',
                }}
              >
                {monitor.note}
              </span>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Also review note 11. At 300 frames the caption started on 216; at 240
          its seven words would still have been staggering in when the cut came.
          It now starts on 168, the last word lands on 218, and the scene holds
          for 22 frames after that. */}
      <Caption
        text={caption}
        start={168}
        end={240}
        size={64}
        align="flex-start"
        left={168}
        bottom={128}
        maxWidth={760}
      />
    </AbsoluteFill>
  );
};
