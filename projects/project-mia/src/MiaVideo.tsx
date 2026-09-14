import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import {SceneMetrics, sceneMetricsSchema} from './scenes/SceneMetrics';
import {SceneOpen, sceneOpenSchema} from './scenes/SceneOpen';
import {SceneOutro, sceneOutroSchema} from './scenes/SceneOutro';
import {ScenePillars, scenePillarsSchema} from './scenes/ScenePillars';
import {SceneStatement, sceneStatementSchema} from './scenes/SceneStatement';

export const miaVideoSchema = z.object({
  open: sceneOpenSchema,
  statement: sceneStatementSchema,
  pillars: scenePillarsSchema,
  metrics: sceneMetricsSchema,
  outro: sceneOutroSchema,
});

export const MiaVideo: React.FC<z.infer<typeof miaVideoSchema>> = ({
  open,
  statement,
  pillars,
  metrics,
  outro,
}) => {
  return (
    <AbsoluteFill style={{backgroundColor: '#E9F0F7'}}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150} name="Open">
          <SceneOpen {...open} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 20})}
        />
        <TransitionSeries.Sequence durationInFrames={150} name="Statement">
          <SceneStatement {...statement} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 20})}
        />
        <TransitionSeries.Sequence durationInFrames={180} name="Pillars">
          <ScenePillars {...pillars} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 20})}
        />
        <TransitionSeries.Sequence durationInFrames={165} name="Metrics">
          <SceneMetrics {...metrics} />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({durationInFrames: 20})}
        />
        <TransitionSeries.Sequence durationInFrames={135} name="Outro">
          <SceneOutro {...outro} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
