import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Caption} from '../components/Caption';
import {Motes} from '../components/Motes';
import {Panel, Row} from '../components/Panel';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s13Schema = z.object({
  requirement: z.string(),
  requirementMeta: z.string(),
  planTitle: z.string(),
  settings: z.array(z.object({label: z.string(), meta: z.string()})),
  reviewer: z.string(),
  reviewerRole: z.string(),
  approvedLabel: z.string(),
  environment: z.string(),
  auditTitle: z.string(),
  audit: z.array(z.object({label: z.string(), meta: z.string()})),
  caption: z.string(),
});

/**
 * Second of the three "MIA today" scenes. Narration: "Once a requirement is
 * adopted, and it is understood, MIA translates it into a configuration plan.
 * A Workstream lead reviews and approves the plan. MIA applies the
 * configuration and records what changed, why, and who approved it."
 *
 * 15 sec is too long to hold one framing, so this uses the travelling camera
 * from S06: three stations in world space, visited in narration order, then a
 * pull-back that reveals they were one connected chain the whole time. The
 * pull-back is the argument the shot is making, so it gets the last 2 sec.
 */
const A = {cx: 700, cy: 450};
const B = {cx: 2200, cy: 450};
const C = {cx: 1520, cy: 1350};

const KEYS = [0, 118, 152, 258, 292, 384, 450];

const A_TO_B = [
  {x: 992, y: 476},
  {x: 1330, y: 432},
  {x: 1660, y: 402},
  {x: 1911, y: 396},
];

const B_TO_C = [
  {x: 2206, y: 646},
  {x: 2286, y: 892},
  {x: 2072, y: 1094},
  {x: 1930, y: 1174},
];

const ApproveStamp: React.FC<{progress: number; label: string}> = ({progress, label}) => (
  <div
    style={{
      position: 'absolute',
      left: 2256,
      top: 508,
      opacity: Math.min(1, progress * 2.2),
      scale: String(interpolate(progress, [0, 1], [1.9, 1])),
      rotate: `${interpolate(progress, [0, 1], [-16, -8])}deg`,
      padding: '12px 26px',
      borderRadius: 9,
      border: '3px solid rgba(63,164,106,0.85)',
      color: '#2F8455',
      fontFamily: 'Segoe UI',
      fontWeight: 600,
      fontSize: 34,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      background: 'rgba(240,250,244,0.86)',
      boxShadow: '0 12px 30px rgba(60,130,95,0.2)',
    }}
  >
    {label}
  </div>
);

export const S13Configuration: React.FC<z.infer<typeof s13Schema>> = ({
  requirement,
  requirementMeta,
  planTitle,
  settings,
  reviewer,
  reviewerRole,
  approvedLabel,
  environment,
  auditTitle,
  audit,
  caption,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const opts = {
    easing: EASE.inOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  } as const;

  const cx = interpolate(frame, KEYS, [A.cx, A.cx, B.cx, B.cx, C.cx, C.cx, 1451], opts);
  const cy = interpolate(frame, KEYS, [A.cy, A.cy, B.cy, B.cy, C.cy, C.cy, 940], opts);
  const scale = interpolate(frame, KEYS, [1.52, 1.52, 1.52, 1.52, 1.52, 1.52, 0.58], opts);

  // Drift is applied to the camera translation rather than to cx/cy so its
  // amplitude does not get multiplied by the zoom.
  const cam = cameraDrift(seconds, 1.1);

  const reqIn = settle({frame, fps, start: 0, duration: 44, bounce: 12});
  const planIn = settle({frame, fps, start: 48, duration: 48, bounce: 13});
  const reviewIn = settle({frame, fps, start: 158, duration: 48, bounce: 12});
  const stamp = settle({frame, fps, start: 236, duration: 46, bounce: 8});
  const envIn = settle({frame, fps, start: 266, duration: 46, bounce: 12});
  const auditIn = settle({frame, fps, start: 286, duration: 48, bounce: 12});

  const adopted = interpolate(frame, [30, 52], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const abHead = interpolate(frame, [118, 186], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bcHead = interpolate(frame, [252, 318], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={520}
        zoomFrom={1.06}
        zoomTo={1.0}
        fieldOpacity={0.28}
        people={false}
        scrim={0.5}
      />
      <Motes count={20} seed={13} opacity={0.6} />

      <AbsoluteFill
        style={{
          transformOrigin: '0 0',
          translate: `${960 - cx * scale + cam.x}px ${540 - cy * scale + cam.y}px`,
          scale: String(scale),
        }}
      >
        <Thread points={A_TO_B} head={abHead} width={4.5} leadLength={0.3} glowId="s13-ab" />
        <ThreadPulse
          points={A_TO_B}
          pulses={[{start: 190, duration: 34}]}
          width={4.5}
          trail={0.4}
          glowId="s13-ab-pulse"
        />
        <Thread points={B_TO_C} head={bcHead} width={4.5} leadLength={0.3} glowId="s13-bc" />
        <ThreadPulse
          points={B_TO_C}
          pulses={[
            {start: 322, duration: 34},
            {start: 392, duration: 40},
          ]}
          width={4.5}
          trail={0.4}
          glowId="s13-bc-pulse"
        />

        <div
          style={{
            position: 'absolute',
            left: 420,
            top: 250,
            width: 566,
            opacity: reqIn,
            translate: `0px ${(1 - reqIn) * 26}px`,
            padding: '22px 26px',
            borderRadius: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
            border: `1px solid ${
              adopted > 0.5 ? 'rgba(30,195,189,0.5)' : 'rgba(198,213,229,0.9)'
            }`,
            boxShadow: '0 20px 44px rgba(88,118,150,0.16)',
          }}
        >
          <div style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 6}}>
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 400,
                fontSize: 29,
                color: '#2E343C',
              }}
            >
              {requirement}
            </span>
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 350,
                fontSize: 21,
                color: '#8794A3',
              }}
            >
              {requirementMeta}
            </span>
          </div>
          <span
            style={{
              opacity: adopted,
              scale: String(interpolate(adopted, [0, 1], [0.8, 1])),
              padding: '7px 16px',
              borderRadius: 99,
              fontFamily: 'Segoe UI',
              fontWeight: 400,
              fontSize: 20,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#178F92',
              background: 'rgba(30,195,189,0.12)',
              border: '1px solid rgba(30,195,189,0.4)',
              whiteSpace: 'nowrap',
            }}
          >
            Adopted
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 420,
            top: 404,
            opacity: planIn,
            translate: `0px ${(1 - planIn) * 24}px`,
          }}
        >
          <Panel title={planTitle} width={566} height={286} padding={22}>
            {settings.map((setting, i) => {
              const land = settle({frame, fps, start: 62 + i * 20, duration: 40, bounce: 11});
              const applied = frame > 300 + i * 14;
              return (
                <div
                  key={setting.label}
                  style={{opacity: land, translate: `0px ${(1 - land) * 18}px`}}
                >
                  <Row
                    label={setting.label}
                    meta={applied ? 'Applied' : setting.meta}
                    state={applied ? 'done' : land > 0.5 ? 'active' : 'idle'}
                    size={23}
                  />
                </div>
              );
            })}
          </Panel>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1917,
            top: 268,
            width: 566,
            opacity: reviewIn,
            translate: `${(1 - reviewIn) * 40}px 0px`,
            padding: 26,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
            border: '1px solid rgba(198,213,229,0.9)',
            boxShadow: '0 24px 50px rgba(88,118,150,0.17)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: '50%',
                flexShrink: 0,
                background: 'linear-gradient(150deg,#D8E6F2 0%,#BCD2E4 100%)',
                border: '2px solid rgba(255,255,255,0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Segoe UI',
                fontWeight: 400,
                fontSize: 28,
                color: '#54637A',
              }}
            >
              {reviewer
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 400,
                  fontSize: 30,
                  color: '#2E343C',
                }}
              >
                {reviewer}
              </span>
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 350,
                  fontSize: 22,
                  color: '#8794A3',
                }}
              >
                {reviewerRole}
              </span>
            </div>
          </div>
          <div
            style={{
              height: 2,
              background: 'rgba(200,215,230,0.8)',
            }}
          />
          {['Scope matches the requirement', 'No downstream conflicts'].map((line, i) => {
            const land = settle({frame, fps, start: 186 + i * 22, duration: 40, bounce: 11});
            return (
              <div
                key={line}
                style={{opacity: land, translate: `0px ${(1 - land) * 16}px`}}
              >
                <Row label={line} state="done" size={23} />
              </div>
            );
          })}
        </div>

        {stamp > 0.001 ? <ApproveStamp progress={stamp} label={approvedLabel} /> : null}

        <div
          style={{
            position: 'absolute',
            left: 1050,
            top: 1180 + floatAt(seconds, 33, 3, 4, 0.5).y,
            width: 380,
            opacity: envIn,
            translate: `0px ${(1 - envIn) * 26}px`,
            padding: 24,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            background: 'linear-gradient(150deg,#FFFFFF 0%,#F2F8FC 100%)',
            border: '1px solid rgba(30,195,189,0.36)',
            boxShadow: '0 22px 46px rgba(88,118,150,0.16)',
          }}
        >
          <span
            style={{
              fontFamily: 'Segoe UI',
              fontWeight: 600,
              fontSize: 18,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#8794A3',
            }}
          >
            Environment
          </span>
          <span
            style={{
              fontFamily: 'Segoe UI',
              fontWeight: 350,
              fontSize: 33,
              color: '#2E343C',
            }}
          >
            {environment}
          </span>
          <div
            style={{
              height: 8,
              borderRadius: 99,
              background: 'rgba(206,222,235,0.8)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${interpolate(frame, [294, 372], [0, 100], {
                  easing: EASE.out,
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                })}%`,
                background: 'linear-gradient(90deg,#1EC3BD 0%,#3FE3DC 100%)',
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1470,
            top: 1180,
            opacity: auditIn,
            translate: `0px ${(1 - auditIn) * 26}px`,
          }}
        >
          <Panel title={auditTitle} width={520} height={330} padding={22}>
            {audit.map((entry, i) => {
              const land = settle({frame, fps, start: 300 + i * 18, duration: 42, bounce: 11});
              return (
                <div
                  key={entry.label}
                  style={{
                    opacity: land,
                    translate: `${(1 - land) * -20}px 0px`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Segoe UI',
                      fontWeight: 600,
                      fontSize: 17,
                      letterSpacing: '0.07em',
                      textTransform: 'uppercase',
                      color: '#9AA7B6',
                    }}
                  >
                    {entry.label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Segoe UI',
                      fontWeight: 350,
                      fontSize: 26,
                      color: '#2E343C',
                    }}
                  >
                    {entry.meta}
                  </span>
                </div>
              );
            })}
          </Panel>
        </div>
      </AbsoluteFill>

      <Caption text={caption} start={396} end={450} size={60} bottom={62} />
    </AbsoluteFill>
  );
};
