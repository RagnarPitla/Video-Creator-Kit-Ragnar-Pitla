import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Caption} from '../components/Caption';
import {Motes} from '../components/Motes';
import {ProductTile} from '../components/ProductTile';
import {useLook} from '../lib/material';
import {Panel, Row} from '../components/Panel';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {ThreadPulse} from '../components/ThreadPulse';
import {buildPath} from '../lib/path';
import {cameraDrift, EASE, floatAt, settle} from '../lib/motion';

export const s14Schema = z.object({
  sourceTitle: z.string(),
  sourceFields: z.array(z.object({label: z.string(), meta: z.string()})),
  targetTitle: z.string(),
  targetFields: z.array(z.object({label: z.string(), meta: z.string()})),
  transforms: z.array(z.string()),
  validation: z.string(),
  anchors: z.array(z.string()),
  caption: z.string(),
});

/**
 * Third of the three "MIA today" scenes. Narration: "For data migration, MIA
 * helps interpret source data, map it to dynamics, define transformations, and
 * guide validation and loading, keeping the migration connected to the
 * requirements and processes it supports."
 *
 * The mapping deliberately crosses rather than running as four parallel lines.
 * Parallel lines say "copy"; crossed lines say "interpret", which is the claim
 * in the narration.
 */
const SRC_X = 612;
const TGT_X = 1156;
const SRC_Y = [372, 444, 516, 588];
const TGT_Y = [356, 432, 508, 584];
/** source index -> target index. */
const MAP = [1, 0, 2, 3];

const ANCHOR_POS = [
  {x: 604, y: 96},
  {x: 1330, y: 96},
];

const KEYS = [0, 190, 214, 330, 354, 438];

export const S14Migration: React.FC<z.infer<typeof s14Schema>> = ({
  sourceTitle,
  sourceFields,
  targetTitle,
  targetFields,
  transforms,
  validation,
  anchors,
  caption,
}) => {
  const look = useLook();
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const seconds = frame / fps;

  const opts = {
    easing: EASE.inOut,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  } as const;

  const cx = interpolate(frame, KEYS, [900, 900, 900, 900, 950, 950], opts);
  const cy = interpolate(frame, KEYS, [470, 470, 810, 810, 640, 640], opts);
  const scale = interpolate(frame, KEYS, [1.24, 1.24, 1.24, 1.24, 0.8, 0.8], opts);
  const cam = cameraDrift(seconds, 1.1);

  const srcIn = settle({frame, fps, start: 0, duration: 46, bounce: 12});
  const tgtIn = settle({frame, fps, start: 38, duration: 48, bounce: 12});
  const valIn = settle({frame, fps, start: 262, duration: 48, bounce: 12});

  const load = interpolate(frame, [286, 372], [0, 100], {
    easing: EASE.out,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
      <Stage
        vanishX={960}
        vanishY={500}
        zoomFrom={1.06}
        zoomTo={1.0}
        fieldOpacity={0.28}
        people={false}
        scrim={0.58}
      />
      <Motes count={20} seed={14} opacity={0.6} />

      <AbsoluteFill
        style={{
          transformOrigin: '0 0',
          translate: `${960 - cx * scale + cam.x}px ${540 - cy * scale + cam.y}px`,
          scale: String(scale),
        }}
      >
        <svg
          width={1920}
          height={1400}
          viewBox="0 0 1920 1400"
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          {MAP.map((target, i) => {
            const link = buildPath([
              {x: SRC_X, y: SRC_Y[i]},
              {x: SRC_X + 190, y: SRC_Y[i] + (TGT_Y[target] - SRC_Y[i]) * 0.16},
              {x: TGT_X - 190, y: TGT_Y[target] - (TGT_Y[target] - SRC_Y[i]) * 0.16},
              {x: TGT_X, y: TGT_Y[target]},
            ]);
            const draw = interpolate(frame, [34 + i * 17, 116 + i * 17], [0, 1], {
              easing: EASE.out,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <path
                key={`map-${i}`}
                d={link.d}
                fill="none"
                stroke="#1EC3BD"
                strokeWidth={2.8}
                strokeLinecap="round"
                strokeOpacity={0.68 * draw}
                strokeDasharray={`${draw * link.length} ${link.length}`}
              />
            );
          })}
        </svg>

        {MAP.map((target, i) => (
          <ThreadPulse
            key={`mp-${i}`}
            points={[
              {x: SRC_X, y: SRC_Y[i]},
              {x: SRC_X + 190, y: SRC_Y[i] + (TGT_Y[target] - SRC_Y[i]) * 0.16},
              {x: TGT_X - 190, y: TGT_Y[target] - (TGT_Y[target] - SRC_Y[i]) * 0.16},
              {x: TGT_X, y: TGT_Y[target]},
            ]}
            pulses={[
              {start: 146 + i * 11, duration: 32},
              {start: 296 + i * 11, duration: 32},
            ]}
            width={3}
            trail={0.44}
            glowId={`s14-mp-${i}`}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            left: 150,
            top: 292,
            opacity: srcIn,
            translate: `${(1 - srcIn) * -32}px 0px`,
          }}
        >
          <Panel title={sourceTitle} width={462} height={372} accent="#8FA3B8" padding={22}>
            {sourceFields.map((field, i) => {
              const land = settle({frame, fps, start: 10 + i * 12, duration: 40, bounce: 11});
              return (
                <div
                  key={field.label}
                  style={{opacity: land, translate: `0px ${(1 - land) * 16}px`}}
                >
                  <Row label={field.label} meta={field.meta} state="idle" size={23} />
                </div>
              );
            })}
          </Panel>
        </div>

        <div
          style={{
            position: 'absolute',
            left: 1156,
            top: 276,
            opacity: tgtIn,
            translate: `${(1 - tgtIn) * 32}px 0px`,
          }}
        >
          {look.logos === 'rich' ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: -64,
                display: 'flex',
                gap: 12,
              }}
            >
              {['finance', 'supply-chain-management', 'project-operations'].map((slug) => (
                <ProductTile key={slug} slug={slug} size={48} bound={1} />
              ))}
            </div>
          ) : null}
          <Panel title={targetTitle} width={470} height={396} padding={22}>
            {targetFields.map((field, i) => {
              const land = settle({frame, fps, start: 66 + i * 17, duration: 42, bounce: 11});
              const mapped = frame > 116 + i * 17;
              return (
                <div
                  key={field.label}
                  style={{opacity: land, translate: `0px ${(1 - land) * 16}px`}}
                >
                  <Row
                    label={field.label}
                    meta={mapped ? 'Mapped' : field.meta}
                    state={mapped ? 'done' : 'active'}
                    size={23}
                  />
                </div>
              );
            })}
          </Panel>
        </div>

        {transforms.map((label, i) => {
          const land = settle({frame, fps, start: 208 + i * 18, duration: 44, bounce: 12});
          const drift = floatAt(seconds, i * 15 + 7, 5, 6, 0.7);
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: 330 + i * 424 + drift.x,
                top: 768 + drift.y,
                opacity: land,
                translate: `0px ${(1 - land) * 24}px`,
                scale: String(interpolate(land, [0, 1], [0.9, 1])),
                padding: '17px 28px',
                borderRadius: 12,
                background: 'linear-gradient(150deg,#FFFFFF 0%,#F4F9FC 100%)',
                border: '1px solid rgba(30,195,189,0.34)',
                boxShadow: '0 16px 34px rgba(88,118,150,0.14)',
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

        <div
          style={{
            position: 'absolute',
            left: 560,
            top: 894,
            width: 800,
            opacity: valIn,
            translate: `0px ${(1 - valIn) * 26}px`,
            padding: 28,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            background: 'linear-gradient(150deg,#FFFFFF 0%,#F4F9FC 100%)',
            border: '1px solid rgba(198,213,229,0.9)',
            boxShadow: '0 24px 50px rgba(88,118,150,0.16)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 350,
                fontSize: 34,
                color: '#2E343C',
              }}
            >
              {validation}
            </span>
            <span
              style={{
                fontFamily: 'Segoe UI',
                fontWeight: 400,
                fontSize: 28,
                color: '#178F92',
              }}
            >
              {Math.round(load)}%
            </span>
          </div>
          <div
            style={{
              height: 10,
              borderRadius: 99,
              background: 'rgba(206,222,235,0.85)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${load}%`,
                background: 'linear-gradient(90deg,#1EC3BD 0%,#3FE3DC 100%)',
                boxShadow: '0 0 16px rgba(30,195,189,0.5)',
              }}
            />
          </div>
        </div>

        <svg
          width={1920}
          height={1400}
          viewBox="0 0 1920 1400"
          style={{position: 'absolute', inset: 0, overflow: 'visible'}}
        >
          {ANCHOR_POS.map((anchor, i) => {
            const link = buildPath([
              {x: i === 0 ? 430 : 1400, y: i === 0 ? 292 : 276},
              {x: anchor.x + (i === 0 ? -40 : 30), y: 210},
              {x: anchor.x, y: 158},
            ]);
            const draw = interpolate(frame, [356 + i * 14, 416 + i * 14], [0, 1], {
              easing: EASE.out,
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <path
                key={`anchor-link-${i}`}
                d={link.d}
                fill="none"
                stroke="#1EC3BD"
                strokeWidth={3}
                strokeLinecap="round"
                strokeOpacity={0.7 * draw}
                strokeDasharray={`${draw * link.length} ${link.length}`}
              />
            );
          })}
        </svg>

        {anchors.map((label, i) => {
          const land = settle({frame, fps, start: 360 + i * 16, duration: 46, bounce: 12});
          const drift = floatAt(seconds, i * 21 + 11, 5, 6, 0.55);
          return (
            <div
              key={label}
              style={{
                position: 'absolute',
                left: ANCHOR_POS[i].x - 180 + drift.x,
                top: ANCHOR_POS[i].y - 44 + drift.y,
                width: 360,
                opacity: land,
                translate: `0px ${(1 - land) * -22}px`,
                scale: String(interpolate(land, [0, 1], [0.88, 1])),
                padding: '20px 26px',
                borderRadius: 14,
                textAlign: 'center',
                background: 'linear-gradient(150deg,#FFFFFF 0%,#F1F8FC 100%)',
                border: '1px solid rgba(30,195,189,0.4)',
                boxShadow: '0 20px 44px rgba(88,118,150,0.16)',
                fontFamily: 'Segoe UI',
                fontWeight: 400,
                fontSize: 30,
                color: '#2E343C',
              }}
            >
              {label}
            </div>
          );
        })}
      </AbsoluteFill>

      <Caption text={caption} start={384} end={438} size={58} bottom={54} />
    </AbsoluteFill>
  );
};
