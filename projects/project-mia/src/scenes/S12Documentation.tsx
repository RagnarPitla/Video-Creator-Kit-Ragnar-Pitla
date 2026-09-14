import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Caption} from '../components/Caption';
import {Motes} from '../components/Motes';
import {Panel, Row} from '../components/Panel';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {buildPath} from '../lib/path';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s12Schema = z.object({
  docs: z.array(z.string()),
  panelTitle: z.string(),
  requirements: z.array(
    z.object({label: z.string(), meta: z.string(), warn: z.boolean().optional()}),
  ),
  question: z.string(),
  questionTag: z.string(),
  caption: z.string(),
});

/**
 * First of the three scenes covering the 41.3 sec black stretch from 01:44.3 to
 * 02:25.6, which is the entire "MIA today" half of the film and the largest
 * hole in the cut.
 *
 * Narration: "MIA begins by consuming project documentation. It drafts
 * requirements, links them back to source evidence, highlights missing
 * information, and suggests targeted questions for the business."
 *
 * Traceability is the claim being made, so the evidence links are drawn as real
 * lines back to the specific document rather than implied by proximity.
 */
const DOC_X = 300;
const DOC_Y = 452;
const PANEL_LEFT = 592;
const PANEL_TOP = 208;
const PANEL_W = 636;
const ROW_TOP = PANEL_TOP + 96;
const ROW_STEP = 86;

const INTAKE = [
  {x: 404, y: 430},
  {x: 486, y: 404},
  {x: 560, y: 348},
  {x: 616, y: 300},
];

const ROW_APPEAR = [54, 78, 102, 126];
const LINK_START = 146;

export const S12Documentation: React.FC<z.infer<typeof s12Schema>> = ({
  docs,
  panelTitle,
  requirements,
  question,
  questionTag,
  caption,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;
  const cam = cameraDrift(seconds, 0.9);
  const push = interpolate(frame, [0, 351], [1.006, 1.05], {
    easing: EASE.drift,
    extrapolateRight: 'clamp',
  });

  const intake = interpolate(frame, [20, 92], [0, 1], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const panelIn = settle({frame, fps, start: 34, duration: 46, bounce: 13});
  const qIn = settle({frame, fps, start: 212, duration: 52, bounce: 12});

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={980}
        vanishY={460}
        zoomFrom={1.09}
        zoomTo={1.0}
        fieldOpacity={0.34}
        people={false}
        scrim={0.54}
      />
      <Motes count={22} seed={12} opacity={0.75} />

      <AbsoluteFill style={{scale: String(push), translate: `${cam.x}px ${cam.y}px`}}>
        <Thread points={INTAKE} head={intake} width={5} leadLength={0.32} glowId="s12-intake" />
        <ThreadPulse
          points={INTAKE}
          pulses={[
            {start: 96, duration: 30},
            {start: 122, duration: 30},
            {start: 148, duration: 30},
          ]}
          width={5}
          trail={0.4}
          glowId="s12-intake-pulse"
        />

        {docs.map((doc, i) => {
          const appear = settle({frame, fps, start: i * 8, duration: 42, bounce: 12});
          const drift = floatAt(seconds, i * 12 + 3, 6, 7, 0.6);
          return (
            <div
              key={doc}
              style={{
                position: 'absolute',
                left: DOC_X - 108 + i * 26 + drift.x,
                top: DOC_Y - 150 + i * 40 + drift.y,
                width: 216,
                height: 282,
                opacity: appear * (0.72 + i * 0.14),
                translate: `${(1 - appear) * -40}px 0px`,
                scale: String(interpolate(appear, [0, 1], [0.9, 1])),
                borderRadius: 12,
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                gap: 11,
                background: 'linear-gradient(155deg,#FFFFFF 0%,#F4F8FC 100%)',
                border: '1px solid rgba(198,213,229,0.95)',
                boxShadow: '0 20px 42px rgba(88,118,150,0.16)',
                zIndex: i,
              }}
            >
              <span
                style={{
                  fontFamily: 'Segoe UI',
                  fontWeight: 400,
                  fontSize: 21,
                  color: '#5A6675',
                  marginBottom: 4,
                }}
              >
                {doc}
              </span>
              {Array.from({length: 7}).map((_, r) => (
                <div
                  key={r}
                  style={{
                    height: 4,
                    width: r === 6 ? '52%' : r === 3 ? '84%' : '100%',
                    borderRadius: 99,
                    background: 'rgba(150,172,194,0.4)',
                  }}
                />
              ))}
            </div>
          );
        })}

        <svg
          width={1920}
          height={1080}
          viewBox="0 0 1920 1080"
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          {requirements.map((req, i) => {
            const y = ROW_TOP + i * ROW_STEP + 26;
            const link = buildPath([
              {x: PANEL_LEFT - 8, y},
              {x: PANEL_LEFT - 96, y: y - (y - DOC_Y) * 0.22},
              {x: DOC_X + 118, y: DOC_Y - 40 + i * 22},
            ]);
            const draw = interpolate(
              frame,
              [LINK_START + i * 13, LINK_START + 52 + i * 13],
              [0, 1],
              {easing: EASE.out, extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
            );
            const tone = req.warn ? '#E8A33D' : '#1EC3BD';
            return (
              <g key={`link-${i}`}>
                <path
                  d={link.d}
                  fill="none"
                  stroke={tone}
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeOpacity={0.72 * draw}
                  strokeDasharray={`${draw * link.length} ${link.length}`}
                />
                {draw > 0.98 ? (
                  <circle cx={DOC_X + 118} cy={DOC_Y - 40 + i * 22} r={5} fill={tone} opacity={0.9} />
                ) : null}
              </g>
            );
          })}
        </svg>

        <div
          style={{
            position: 'absolute',
            left: PANEL_LEFT,
            top: PANEL_TOP + floatAt(seconds, 55, 4, 5, 0.45).y,
            opacity: panelIn,
            scale: String(interpolate(panelIn, [0, 1], [0.94, 1])),
          }}
        >
          <Panel title={panelTitle} width={PANEL_W} height={476} padding={24}>
            {requirements.map((req, i) => {
              const land = settle({
                frame,
                fps,
                start: ROW_APPEAR[i] ?? 54 + i * 24,
                duration: 42,
                bounce: 11,
              });
              const flagged =
                req.warn && frame > LINK_START + 30 + i * 13 ? 'warn' : 'active';
              return (
                <div
                  key={req.label}
                  style={{opacity: land, translate: `0px ${(1 - land) * 22}px`}}
                >
                  <Row
                    label={req.label}
                    meta={req.meta}
                    state={land > 0.55 ? flagged : 'idle'}
                    size={26}
                  />
                </div>
              );
            })}
          </Panel>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1306,
            top: 336 + floatAt(seconds, 83, 5, 7, 0.55).y,
            width: 520,
            opacity: qIn,
            translate: `${(1 - qIn) * 46}px 0px`,
            scale: String(interpolate(qIn, [0, 1], [0.9, 1])),
            padding: 30,
            borderRadius: 18,
            background: 'linear-gradient(150deg,#FFFFFF 0%,#FDF8F0 100%)',
            border: '1px solid rgba(232,163,61,0.42)',
            boxShadow: '0 26px 56px rgba(132,110,72,0.18)',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: 'Segoe UI',
              fontWeight: 600,
              fontSize: 19,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: '#B27A22',
            }}
          >
            {questionTag}
          </span>
          <span
            style={{
              fontFamily: 'Segoe UI',
              fontWeight: 350,
              fontSize: 34,
              lineHeight: 1.28,
              color: '#2E343C',
            }}
          >
            {question}
          </span>
        </div>
      </AbsoluteFill>

      <Caption text={caption} start={268} end={351} size={62} bottom={78} />
    </AbsoluteFill>
  );
};
