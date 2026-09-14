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

export const sceneMetricsSchema = z.object({
  kicker: z.string(),
  metrics: z.array(z.object({value: z.string(), label: z.string()})),
});

export const SceneMetrics: React.FC<z.infer<typeof sceneMetricsSchema>> = ({
  kicker,
  metrics,
}) => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Stage
        vanishX={960}
        vanishY={430}
        zoomFrom={1.0}
        zoomTo={1.1}
        fieldOpacity={0.72}
        streak
        streakStart={26}
        streakTravel={128}
        streakY={72}
        streakScale={0.72}
        scrim={0.72}
      />

      <AbsoluteFill
        style={{
          padding: '178px 142px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 76,
        }}
      >
        <Interactive.Div
          name="Kicker"
          style={{
            fontFamily: 'Segoe UI',
            fontSize: 44,
            fontWeight: 500,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#54697F',
            opacity: interpolate(frame, [4, 26], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            translate: interpolate(frame, [4, 30], ['0px 16px', '0px 0px'], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          {kicker}
        </Interactive.Div>

        <div style={{display: 'flex', gap: 80, alignItems: 'flex-start'}}>
          {metrics.map((metric, i) => (
            <div
              key={i}
              style={{flex: 1, display: 'flex', flexDirection: 'column', gap: 26}}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  columnGap: '0.06em',
                  fontFamily: 'Segoe UI',
                  fontWeight: 200,
                  fontSize: 186,
                  lineHeight: 1,
                  letterSpacing: '-0.035em',
                  color: '#0C1B2A',
                }}
              >
                <SplitWords text={metric.value} start={16 + i * 14} stagger={4} />
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 99,
                  backgroundColor: '#19B6E4',
                  width: interpolate(
                    frame,
                    [30 + i * 14, 62 + i * 14],
                    ['0%', '72%'],
                    {
                      easing: Easing.bezier(0.16, 1, 0.3, 1),
                      extrapolateLeft: 'clamp',
                      extrapolateRight: 'clamp',
                    },
                  ),
                }}
              />
              <div
                style={{
                  fontFamily: 'Segoe UI',
                  fontSize: 46,
                  fontWeight: 500,
                  letterSpacing: '0.16em',
                  lineHeight: 1.3,
                  textTransform: 'uppercase',
                  color: '#54697F',
                  opacity: interpolate(frame, [40 + i * 14, 66 + i * 14], [0, 1], {
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                {metric.label}
              </div>
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
