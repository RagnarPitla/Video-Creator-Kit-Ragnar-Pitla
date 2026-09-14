import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
} from 'remotion';
import {z} from 'zod';
import {Stage} from '../components/Stage';
import {SplitWords} from '../components/WordMask';

export const sceneStatementSchema = z.object({
  kicker: z.string(),
  lead: z.string(),
  accent: z.string(),
});

export const SceneStatement: React.FC<z.infer<typeof sceneStatementSchema>> = ({
  kicker,
  lead,
  accent,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage
        vanishX={1280}
        vanishY={470}
        zoomFrom={1.02}
        zoomTo={1.12}
        fieldOpacity={0.85}
        scrim={0.62}
      />

      <AbsoluteFill
        style={{
          padding: '178px 142px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: 46,
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 26}}>
          <Interactive.Div
            name="Kicker tick"
            style={{
              width: 4,
              borderRadius: 99,
              backgroundColor: '#19B6E4',
              height: interpolate(frame, [2, 26], [0, 46], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          />
          <Interactive.Div
            name="Kicker"
            style={{
              fontFamily: 'Segoe UI',
              fontSize: 44,
              fontWeight: 500,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              color: '#54697F',
              opacity: interpolate(frame, [8, 30], [0, 1], {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              }),
            }}
          >
            {kicker}
          </Interactive.Div>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: '0.28em',
            maxWidth: 1640,
            fontFamily: 'Segoe UI',
            fontWeight: 200,
            fontSize: 100,
            lineHeight: 1.18,
            letterSpacing: '-0.015em',
            color: '#4A5D72',
          }}
        >
          <SplitWords text={lead} start={16} stagger={4} />
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            columnGap: '0.2em',
            maxWidth: 1560,
            fontFamily: 'Segoe UI',
            fontWeight: 300,
            fontSize: 178,
            lineHeight: 1.06,
            letterSpacing: '-0.01em',
            color: '#0C1B2A',
          }}
        >
          <SplitWords text={accent} start={40} stagger={6} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
