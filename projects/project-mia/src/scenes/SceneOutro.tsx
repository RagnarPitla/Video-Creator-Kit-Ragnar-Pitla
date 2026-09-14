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

export const sceneOutroSchema = z.object({
  closingLine: z.string(),
  wordmark: z.string(),
  footer: z.string(),
});

export const SceneOutro: React.FC<z.infer<typeof sceneOutroSchema>> = ({
  closingLine,
  wordmark,
  footer,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage
        vanishX={960}
        vanishY={520}
        zoomFrom={1.0}
        zoomTo={1.14}
        fieldOpacity={0.66}
        streak
        streakStart={4}
        streakTravel={104}
        streakY={40}
        streakScale={0.9}
        streakReverse
        scrim={0.7}
      />

      <AbsoluteFill
        style={{
          padding: '178px 142px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 44,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.2em',
            maxWidth: 1520,
            textAlign: 'center',
            fontFamily: 'Segoe UI',
            fontWeight: 300,
            fontSize: 168,
            lineHeight: 1.08,
            letterSpacing: '-0.01em',
            color: '#0C1B2A',
          }}
        >
          <SplitWords text={closingLine} start={10} stagger={5} />
        </div>

        <Interactive.Div
          name="Accent rule"
          style={{
            height: 3,
            borderRadius: 99,
            background:
              'linear-gradient(90deg, rgba(25,182,228,0) 0%, #19B6E4 50%, rgba(25,182,228,0) 100%)',
            width: interpolate(frame, [42, 76], [0, 520], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />

        <Interactive.Div
          name="Wordmark"
          style={{
            fontFamily: 'Segoe UI',
            fontSize: 66,
            fontWeight: 500,
            letterSpacing: '0.42em',
            textTransform: 'uppercase',
            color: '#0C1B2A',
            paddingLeft: '0.42em',
            opacity: interpolate(frame, [52, 78], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [52, 82], ['0px 20px', '0px 0px'], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {wordmark}
        </Interactive.Div>

        <Interactive.Div
          name="Footer"
          style={{
            fontFamily: 'Segoe UI',
            fontSize: 44,
            fontWeight: 400,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#5C7189',
            opacity: interpolate(frame, [64, 90], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {footer}
        </Interactive.Div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
