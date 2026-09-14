import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, settle} from '../lib/motion';

export const s03Schema = z.object({
  docTitle: z.string(),
  artifacts: z.array(z.object({label: z.string()})),
  branches: z.array(z.object({label: z.string()})),
});

const DOC = {x: 560, y: 228, w: 520, h: 664};

const CORRAL = [
  {x: -160, y: 980},
  {x: 280, y: 940},
  {x: 486, y: 742},
  {x: 516, y: 330},
  {x: 742, y: 166},
  {x: 1046, y: 182},
  {x: 1132, y: 408},
  {x: 1116, y: 566},
  {x: 1164, y: 604},
];

const BRANCH_Y = [268, 540, 812];

/*
 * Review note 5: the corral and the top branch shared a corridor.
 *
 * The corral used to drop onto the junction almost vertically at x=1150 while
 * the top branch left the same point climbing up and to the right, so the two
 * ran about 40px apart for 150px and read as one line crossing another. The
 * bubble tail lands in exactly that gap.
 *
 * Two changes separate them. The corral now hugs the document down x=1116 and
 * swings right into the junction, so it arrives heading down-right instead of
 * straight down. And the fan leads right before it climbs, which puts 122px
 * between the corral and the top branch at y=510 and 76px between the three
 * branches at x=1244, where they used to be 30px apart. The branches still
 * stop at x=1318, 34px short of the cards at x=1352.
 *
 * These are waypoints, not bezier handles: buildPath runs a Catmull-Rom spline
 * through them, so the curve passes through each one.
 */
const FAN_X = 1164;
const FAN_Y = 604;
const BRANCHES = BRANCH_Y.map((y) => [
  {x: FAN_X, y: FAN_Y},
  {x: FAN_X + 80, y: FAN_Y + (y - FAN_Y) * 0.28},
  {x: FAN_X + 132, y: FAN_Y + (y - FAN_Y) * 0.78},
  {x: 1318, y},
]);

/**
 * Placeholder 04 (7.77 sec). The statement of work is signed, the thread
 * corrals the presales artifacts, then branches them into delivery artifacts.
 */
export const S03StatementOfWork: React.FC<z.infer<typeof s03Schema>> = ({
  docTitle,
  artifacts,
  branches,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const docIn = settle({frame, fps, start: 0, duration: 30, bounce: 13});

  const sign = interpolate(frame, [22, 68], [0, 1], {
    easing: Easing.bezier(0.24, 0.8, 0.2, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Each beat now starts before the previous one finishes.
  const corralHead = interpolate(frame, [54, 128], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const branchHead = interpolate(frame, [124, 178], [0, 1], {
    easing: Easing.bezier(0.28, 0.84, 0.16, 1),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const push = interpolate(frame, [0, 233], [1.0, 1.06], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });
  const cam = cameraDrift(seconds, 0.85);

  const signPath = 'M18 62c26-34 44-48 56-42s2 40 16 44 34-30 52-38 30 4 44 10 30 2 44-12';

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={1004}
        vanishY={512}
        zoomFrom={1.07}
        zoomTo={1.0}
        fieldOpacity={0.2}
        people={false}
        scrim={0.66}
      />
      <Motes count={20} seed={3} opacity={0.7} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>

      <div
        style={{
          position: 'absolute',
          left: DOC.x,
          top: DOC.y,
          width: DOC.w,
          height: DOC.h,
          borderRadius: 20,
          background: '#FFFFFF',
          border: '1px solid #E4E9EF',
          boxShadow: '0 30px 70px rgba(24, 46, 72, 0.18)',
          padding: 46,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          opacity: docIn,
          scale: String(0.94 + docIn * 0.06),
        }}
      >
        <div
          style={{
            fontFamily: 'Segoe UI',
            fontWeight: 600,
            fontSize: 40,
            lineHeight: 1.16,
            letterSpacing: '-0.004em',
            color: '#34383F',
          }}
        >
          {docTitle}
        </div>
        <div style={{height: 3, width: 96, borderRadius: 2, background: '#1EC3BD'}} />
        {[0.96, 0.86, 0.92, 0.72, 0.9, 0.62].map((w, i) => (
          <div
            key={i}
            style={{height: 15, width: `${w * 100}%`, borderRadius: 8, background: '#EDF1F5'}}
          />
        ))}
        <div style={{flex: 1}} />
        <div style={{height: 2, background: '#D6DEE7'}} />
        <svg width={260} height={92} viewBox="0 0 260 92" fill="none">
          <path
            d={signPath}
            stroke="#3C4552"
            strokeWidth={5}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - sign}
          />
        </svg>
      </div>

      {artifacts.map((a, i) => {
        const pull = settle({frame, fps, start: 60 + i * 12, duration: 42, bounce: 15});
        const from = [
          {x: 250, y: 236},
          {x: 232, y: 906},
          {x: 1520, y: 940},
        ][i % 3];
        const x = interpolate(pull, [0, 1], [from.x, DOC.x + DOC.w / 2]);
        const y = interpolate(pull, [0, 1], [from.y, DOC.y + DOC.h * 0.52]);
        const fade = interpolate(pull, [0, 0.7, 1], [1, 0.95, 0]);
        return (
          <div
            key={a.label}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              translate: '-50% -50%',
              padding: '16px 30px',
              borderRadius: 999,
              background: '#FFFFFF',
              border: '1px solid #E4E9EF',
              boxShadow: '0 16px 36px rgba(24, 46, 72, 0.14)',
              fontFamily: 'Segoe UI',
              fontWeight: 400,
              fontSize: 38,
              letterSpacing: '0.005em',
              color: '#5C6B7C',
              whiteSpace: 'nowrap',
              opacity: fade,
              scale: String(1 - pull * 0.22),
            }}
          >
            {a.label}
          </div>
        );
      })}

      <Thread points={CORRAL} head={corralHead} width={5} leadLength={0.22} glowId="corral" />

      {BRANCHES.map((pts, i) => (
        <Thread
          key={i}
          points={pts}
          head={branchHead}
          width={4}
          leadLength={0.4}
          showHead={false}
          glowId={`branch-${i}`}
        />
      ))}

      {branches.map((b, i) => {
        const appear = settle({frame, fps, start: 152 + i * 9, duration: 32, bounce: 13});
        return (
          <div
            key={b.label}
            style={{
              position: 'absolute',
              left: 1352,
              top: BRANCH_Y[i] - 74,
              width: 424,
              height: 148,
              borderRadius: 20,
              background: '#FFFFFF',
              border: '1px solid #E4E9EF',
              boxShadow: '0 20px 46px rgba(24, 46, 72, 0.15)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 32px',
              fontFamily: 'Segoe UI',
              fontWeight: 400,
              fontSize: 44,
              lineHeight: 1.16,
              color: '#34383F',
              opacity: appear,
              translate: `${(1 - appear) * -26}px 0`,
            }}
          >
            {b.label}
          </div>
        );
      })}

      <ThreadPulse
        points={CORRAL}
        pulses={[
          {start: 132, duration: 70},
          {start: 176, duration: 68},
          {start: 214, duration: 64},
        ]}
        width={4.5}
        trail={0.14}
        glowId="s03-pulse"
      />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
