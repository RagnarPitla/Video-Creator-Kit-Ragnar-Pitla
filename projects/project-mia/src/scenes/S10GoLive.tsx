import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Caption} from '../components/Caption';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s10Schema = z.object({
  milestone: z.string(),
  tracks: z.array(z.object({label: z.string(), detail: z.string()})),
  outputs: z.array(z.string()),
  caption: z.string(),
});

/**
 * Fills the 6.3 sec that ran black from 01:14.4 to 01:20.7, under "as go-live
 * approaches, MIA coordinates cut-over and user readiness while creating
 * tailored training guides and videos".
 *
 * Only 189 frames, so the shot carries one idea: two workstreams converging on
 * a fixed date, with training falling out of the convergence.
 */
const MARK_X = 1466;
const MARK_Y = 452;

const TRACK_PATHS = [
  [
    {x: 646, y: 300},
    {x: 812, y: 316},
    {x: 1080, y: 372},
    {x: MARK_X - 26, y: MARK_Y - 20},
  ],
  [
    {x: 646, y: 610},
    {x: 812, y: 596},
    {x: 1080, y: 534},
    {x: MARK_X - 26, y: MARK_Y + 16},
  ],
];

export const S10GoLive: React.FC<z.infer<typeof s10Schema>> = ({
  milestone,
  tracks,
  outputs,
  caption,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const cam = cameraDrift(seconds, 0.9);
  const push = interpolate(frame, [0, 189], [1.012, 1.062], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });

  const markIn = settle({frame, fps, start: 4, duration: 40, bounce: 14});
  // The marker keeps breathing after it lands so the fixed date reads as live.
  const markPulse = 1 + Math.sin(seconds * 2.6) * 0.014;

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={1300}
        vanishY={452}
        zoomFrom={1.12}
        zoomTo={1.0}
        fieldOpacity={0.4}
        people={false}
        scrim={0.52}
      />
      <Motes count={24} seed={10} opacity={0.8} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        {TRACK_PATHS.map((pts, i) => {
          const head = interpolate(frame, [10 + i * 9, 104 + i * 9], [0, 1], {
            easing: EASE.out,
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <React.Fragment key={`track-${i}`}>
              <Thread
                points={pts}
                head={head}
                width={5}
                leadLength={0.26}
                glowId={`s10-track-${i}`}
              />
              <ThreadPulse
                points={pts}
                pulses={[{start: 112 + i * 10, duration: 40}]}
                width={5}
                trail={0.4}
                glowId={`s10-pulse-${i}`}
              />
            </React.Fragment>
          );
        })}

        {tracks.map((track, i) => {
          const appear = settle({frame, fps, start: 22 + i * 10, duration: 40, bounce: 12});
          const drift = floatAt(seconds, i * 13 + 2, 7, 6, 0.7);
          const y = i === 0 ? 300 : 610;
          return (
            <div
              key={track.label}
              style={{
                position: 'absolute',
                left: 172 + drift.x,
                top: y - 78 + drift.y,
                width: 430,
                opacity: appear,
                translate: `${(1 - appear) * -34}px 0px`,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 400,
                  fontSize: 44,
                  color: '#2E343C',
                  letterSpacing: '-0.01em',
                }}
              >
                {track.label}
              </span>
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 350,
                  fontSize: 27,
                  color: '#8794A3',
                }}
              >
                {track.detail}
              </span>
            </div>
          );
        })}

        <div
          style={{
            position: 'absolute',
            left: MARK_X - 130,
            top: MARK_Y - 130,
            width: 260,
            height: 260,
            opacity: markIn,
            scale: String(interpolate(markIn, [0, 1], [0.72, 1]) * markPulse),
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px solid rgba(30,195,189,0.4)',
              background:
                'radial-gradient(circle at 50% 44%, rgba(255,255,255,0.98) 0%, rgba(233,248,248,0.9) 68%, rgba(214,242,241,0.7) 100%)',
              boxShadow: '0 26px 60px rgba(52,120,140,0.2)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 600,
                fontSize: 25,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: '#178F92',
              }}
            >
              {milestone}
            </span>
            <div
              style={{
                width: 46,
                height: 2,
                background: 'rgba(30,195,189,0.55)',
                margin: '4px 0 2px',
              }}
            />
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 300,
                fontSize: 58,
                color: '#2E343C',
                lineHeight: 1,
              }}
            >
              Day 1
            </span>
          </div>
        </div>

        {outputs.map((label, i) => {
          const appear = settle({frame, fps, start: 96 + i * 13, duration: 42, bounce: 13});
          const drift = floatAt(seconds, i * 17 + 9, 6, 8, 0.8);
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: 1188 + i * 254 + drift.x,
                top: 786 + drift.y,
                padding: '18px 28px',
                borderRadius: 13,
                opacity: appear,
                translate: `0px ${(1 - appear) * 30}px`,
                background: 'linear-gradient(150deg,#FFFFFF 0%,#F4F9FC 100%)',
                border: '1px solid rgba(30,195,189,0.32)',
                boxShadow: '0 16px 36px rgba(88,118,150,0.15)',
                fontFamily: 'Segoe UI',
                fontWeight: 400,
                fontSize: 27,
                color: '#2E343C',
                whiteSpace: 'nowrap',
              }}
            >
              {label}
            </div>
          );
        })}
      </AbsoluteFill>

      <Caption
        text={caption}
        start={120}
        end={189}
        size={62}
        align="flex-start"
        left={172}
        bottom={92}
        maxWidth={900}
      />
    </AbsoluteFill>
  );
};
