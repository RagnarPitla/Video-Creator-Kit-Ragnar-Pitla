import React from 'react';
import {Composition, Folder} from 'remotion';
import {S07Threads, S07Roster} from './scenes/S07Continuity';
import {SceneConfigPlanDraft, SceneCutover, SceneTrainingGuide, SceneDocIngest, SceneRequirements, SceneConfigApply, SceneMigrationMap} from './scenes/ConsoleScenes';
import './fonts';
import {FILM_COPY} from './film-copy';
import {FILM_FRAMES, MiaFilm, miaFilmSchema} from './MiaFilm';
import {
  MiaProductFilm,
  miaProductFilmSchema,
  PRODUCT_FILM_FRAMES,
} from './MiaProductFilm';
import {MiaVideo, miaVideoSchema} from './MiaVideo';
import {v10, v11, v12, v13a, v13b, v13c, v14a, v14b, v14c, v15a, v15b, v15c, v16, v17a, v17b, v17c, v17d} from './MiaCuts';
import {productCutSchema} from './ProductCut';
import {S01Opening, s01Schema} from './scenes/S01Opening';
import {S02Retailer, s02Schema} from './scenes/S02Retailer';
import {S03StatementOfWork, s03Schema} from './scenes/S03StatementOfWork';
import {S04ConferenceRoom, s04Schema} from './scenes/S04ConferenceRoom';
import {S05FlowBoxes, s05Schema} from './scenes/S05FlowBoxes';
import {S06Montage, s06Schema} from './scenes/S06Montage';
import {S07Handshake, s07Schema} from './scenes/S07Handshake';
import {S08ThoughtBubble, s08Schema} from './scenes/S08ThoughtBubble';
import {S09Presales, s09Schema} from './scenes/S09Presales';
import {S10GoLive, s10Schema} from './scenes/S10GoLive';
import {S11Steady, s11Schema} from './scenes/S11Steady';
import {S12Documentation, s12Schema} from './scenes/S12Documentation';
import {S13Configuration, s13Schema} from './scenes/S13Configuration';
import {S14Migration, s14Schema} from './scenes/S14Migration';
import {S15Title, s15Schema} from './scenes/S15Title';
import {SceneMetrics, sceneMetricsSchema} from './scenes/SceneMetrics';
import {SceneOpen, sceneOpenSchema} from './scenes/SceneOpen';
import {SceneOutro, sceneOutroSchema} from './scenes/SceneOutro';
import {ScenePillars, scenePillarsSchema} from './scenes/ScenePillars';
import {SceneStatement, sceneStatementSchema} from './scenes/SceneStatement';

const S07_CAP = 'The thread stays with the customer.';
const S07ThreadsProbe: React.FC = () => <S07Threads caption={S07_CAP} />;
const S07RosterProbe: React.FC = () => <S07Roster caption={S07_CAP} />;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="MiaVisionDemo">
        <Composition
          id="S01-Opening"
          component={S01Opening}
          durationInFrames={282}
          fps={30}
          width={1920}
          height={1080}
          schema={s01Schema}
          defaultProps={{...FILM_COPY.s01}}
        />
        <Composition
          id="S02-Retailer"
          component={S02Retailer}
          durationInFrames={85}
          fps={30}
          width={1920}
          height={1080}
          schema={s02Schema}
          defaultProps={{...FILM_COPY.s02}}
        />
        <Composition
          id="S03-StatementOfWork"
          component={S03StatementOfWork}
          durationInFrames={233}
          fps={30}
          width={1920}
          height={1080}
          schema={s03Schema}
          defaultProps={{...FILM_COPY.s03}}
        />
        <Composition
          id="S04-ConferenceRoom"
          component={S04ConferenceRoom}
          durationInFrames={171}
          fps={30}
          width={1920}
          height={1080}
          schema={s04Schema}
          defaultProps={{...FILM_COPY.s04}}
        />
        <Composition
          id="S05-FlowBoxes"
          component={S05FlowBoxes}
          durationInFrames={140}
          fps={30}
          width={1920}
          height={1080}
          schema={s05Schema}
          defaultProps={{...FILM_COPY.s05}}
        />
        <Composition
          id="S06-Montage"
          component={S06Montage}
          durationInFrames={276}
          fps={30}
          width={1920}
          height={1080}
          schema={s06Schema}
          defaultProps={{...FILM_COPY.s06}}
        />
        <Composition
          id="S07-Handshake"
          component={S07Handshake}
          durationInFrames={140}
          fps={30}
          width={1920}
          height={1080}
          schema={s07Schema}
          defaultProps={{...FILM_COPY.s07}}
        />
        <Composition
          id="S08-ThoughtBubble"
          component={S08ThoughtBubble}
          durationInFrames={330}
          fps={30}
          width={1920}
          height={1080}
          schema={s08Schema}
          defaultProps={{...FILM_COPY.s08}}
        />
        <Composition
          id="S09-Presales"
          component={S09Presales}
          durationInFrames={249}
          fps={30}
          width={1920}
          height={1080}
          schema={s09Schema}
          defaultProps={{...FILM_COPY.s09}}
        />
        <Composition
          id="S10-GoLive"
          component={S10GoLive}
          durationInFrames={189}
          fps={30}
          width={1920}
          height={1080}
          schema={s10Schema}
          defaultProps={{...FILM_COPY.s10}}
        />
        <Composition
          id="S11-Steady"
          component={S11Steady}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          schema={s11Schema}
          defaultProps={{...FILM_COPY.s11}}
        />
        <Composition
          id="S12-Documentation"
          component={S12Documentation}
          durationInFrames={351}
          fps={30}
          width={1920}
          height={1080}
          schema={s12Schema}
          defaultProps={{...FILM_COPY.s12}}
        />
        <Composition
          id="S13-Configuration"
          component={S13Configuration}
          durationInFrames={450}
          fps={30}
          width={1920}
          height={1080}
          schema={s13Schema}
          defaultProps={{...FILM_COPY.s13}}
        />
        <Composition
          id="S14-Migration"
          component={S14Migration}
          durationInFrames={438}
          fps={30}
          width={1920}
          height={1080}
          schema={s14Schema}
          defaultProps={{...FILM_COPY.s14}}
        />
      </Folder>

      <Composition
        id="Mia-Film"
        component={MiaFilm}
        durationInFrames={FILM_FRAMES}
        fps={30}
        width={1920}
        height={1080}
        schema={miaFilmSchema}
        defaultProps={{narration: true, look: 'depth', overlay: 'none', openingLogo: false}}
      />

      {/*
       * v7. Both carry all twelve review notes and differ only in the overlay:
       * the rail says where in the implementation you are, the meter says how
       * much Mia has produced by the time it ends.
       *
       * The ids used to read V6-Journey and V7-Evidence, because v6 used V6 and
       * V7 as labels for its two overlay options rather than as version
       * numbers. That is what produced v6/Mia-Vision-Film-V7-Evidence.mp4. The
       * ids now match the file names they render to.
       */}
      {/*
       * V8-Logo and V8-Clean differ from V7-Evidence only in `openingLogo`,
       * which puts a Dynamics 365 lockup where note 1's deleted caption was.
       * They are registered so that renders/v8/*.mp4, produced by a separate
       * session, stay reproducible. Note that no request for that lockup
       * appears in Feedback/comments.json; see "One thing left for a human" in
       * renders/README.md before treating it as approved.
       */}
      {(
        [
          ['V7-Journey', 'product', 'rail', false],
          ['V7-Evidence', 'product', 'evidence', false],
          ['V8-Logo', 'product', 'evidence', true],
          ['V8-Clean', 'product', 'evidence', false],
        ] as const
      ).map(([id, look, overlay, openingLogo]) => (
        <Composition
          key={id}
          id={`Mia-Film-${id}`}
          component={MiaFilm}
          durationInFrames={FILM_FRAMES}
          fps={30}
          width={1920}
          height={1080}
          schema={miaFilmSchema}
          defaultProps={{narration: true, look, overlay, openingLogo}}
        />
      ))}

      {/*
       * v9, the product cut. Opens on sixteen seconds of the shipped console
       * before the narration starts, and replaces the three "Mia today" scenes
       * with recordings of the console doing those things. Longer than the
       * others by exactly the prologue. See MiaProductFilm.tsx for why part one
       * stays drawn.
       */}
      {(
        [
          ['V9-Product-Journey', 'product', 'rail'],
          ['V9-Product-Evidence', 'product', 'evidence'],
          ['V9-Product-Clean', 'product', 'none'],
        ] as const
      ).map(([id, look, overlay]) => (
        <Composition
          key={id}
          id={`Mia-Film-${id}`}
          component={MiaProductFilm}
          durationInFrames={PRODUCT_FILM_FRAMES}
          fps={30}
          width={1920}
          height={1080}
          schema={miaProductFilmSchema}
          defaultProps={{narration: true, look, overlay}}
        />
      ))}

      {/*
       * v10 and v11. Two further product cuts, both the same length as v9.
       * v10 rebuilds the pre-sales run from the console's playbook library,
       * pre-filled charter and document ingest, and adds the decision gate.
       * v11 pushes footage into every beat the product can honestly carry and
       * leaves only go-live, steady state and the fit-gap tail drawn.
       * See MiaCuts.tsx for the rule about which sentence gets footage.
       */}
      {(
        [
          ['V10-Presales-Clean', v10, 'none'],
          ['V10-Presales-Journey', v10, 'rail'],
          ['V11-Throughout-Clean', v11, 'none'],
          ['V11-Throughout-Journey', v11, 'rail'],
        ] as const
      ).map(([id, cut, overlay]) => (
        <Composition
          key={id}
          id={`Mia-Film-${id}`}
          component={cut.Film}
          durationInFrames={cut.totalFrames}
          fps={30}
          width={1920}
          height={1080}
          schema={productCutSchema}
          defaultProps={{narration: true, look: 'product' as const, overlay}}
        />
      ))}

      {/*
       * v12 rename to D365 Mia, and v14 renaming it back.
       *
       * v12 changed the wordmark in film-copy so it propagated everywhere, and
       * shipped two variants because the change put the card in conflict with
       * the voice track, which says "Project MIA" at 26.2s. Clean muted that
       * word; VOOriginal kept the recording intact so the two could be
       * compared by ear.
       *
       * v14 reverts the name on Ragnar's correction, which removes the reason
       * the mute existed - the voice and the card agree again, so v14 uses the
       * untouched narration. v14 also drops the silent prologue, so its cuts
       * are 4608 frames where the v13 cuts are 5088.
       *
       * v15 restores two drawn scenes that v13 had replaced with footage, on
       * Ragnar's note that he still wanted the V6 statement-of-work and RFP
       * animations. Its three variants are a gradient of how much drawn work
       * comes back, not three unrelated edits - see the header in MiaCuts.
       */}
      {(
        [
          ['V12-D365Mia-Clean', v12, 'none'],
          ['V12-D365Mia-Journey', v12, 'rail'],
          ['V12-D365Mia-VOOriginal', v11, 'none'],
          ['V13A-Console', v13a, 'none'],
          ['V13B-Roster', v13b, 'none'],
          ['V13C-Restrained', v13c, 'none'],
          ['V14A-Console', v14a, 'none'],
          ['V14B-Roster', v14b, 'none'],
          ['V14C-Restrained', v14c, 'none'],
          ['V15A-Footage', v15a, 'none'],
          ['V15B-Balanced', v15b, 'none'],
          ['V15C-Animation', v15c, 'none'],
          ['V16-Console', v16, 'none'],
          ['V17A-Chips', v17a, 'none'],
          ['V17B-Brackets', v17b, 'none'],
          ['V17C-Words', v17c, 'none'],
          ['V17D-Both', v17d, 'none'],
          /**
           * The two delivered finals. Ragnar chose the D opening, so V17-Final
           * is the same cut as V17D-Both and V17-Final-NoLabels the same cut as
           * V17A-Chips - they are aliased rather than redefined so the finals
           * cannot drift from the variants he approved. Render these two, not
           * the lettered variants, which exist only as the picker.
           */
          ['V17-Final', v17d, 'none'],
          ['V17-Final-NoLabels', v17a, 'none'],
        ] as const
      ).map(([id, cut, overlay]) => (
        <Composition
          key={id}
          id={`Mia-Film-${id}`}
          component={cut.Film}
          durationInFrames={cut.totalFrames}
          fps={30}
          width={1920}
          height={1080}
          schema={productCutSchema}
          defaultProps={{narration: true, look: 'product' as const, overlay}}
        />
      ))}

      {/* v5 grade variants. Same cut, same layout, three different looks. */}
      {(['studio', 'depth', 'product'] as const).map((look) => (
        <Composition
          key={look}
          id={`Mia-Film-${look[0].toUpperCase()}${look.slice(1)}`}
          component={MiaFilm}
          durationInFrames={FILM_FRAMES}
          fps={30}
          width={1920}
          height={1080}
          schema={miaFilmSchema}
          defaultProps={{narration: true, look, overlay: 'none', openingLogo: false}}
        />
      ))}

      <Composition
        id="MiaVideo"
        component={MiaVideo}
        durationInFrames={700}
        fps={30}
        width={1920}
        height={1080}
        schema={miaVideoSchema}
        defaultProps={{
          open: {
            kicker: 'Agentic Enterprise',
            wordmark: 'Mia',
            tagline: 'Agents that do the work, not just the talking.',
          },
          statement: {
            kicker: 'The shift',
            lead: 'Software used to wait for you.',
            accent: 'Now it moves first.',
          },
          pillars: {
            kicker: 'What it does',
            pillars: [
              {index: '01', label: 'Reads the policy, not the vibes.'},
              {index: '02', label: 'Acts inside D365, not beside it.'},
              {index: '03', label: 'Shows its work on every run.'},
            ],
          },
          metrics: {
            kicker: 'By the numbers',
            metrics: [
              {value: '60%', label: 'Less rework'},
              {value: '4x', label: 'Faster cycles'},
              {value: '24/7', label: 'Always on'},
            ],
          },
          outro: {
            closingLine: 'Build the agent. Then prove it.',
            wordmark: 'Mia',
            footer: 'Agentic ERP, in production',
          },
        }}
      />

      <Folder name="MiaVideo-Scenes">
        <Composition
          id="Scene-Open"
          component={SceneOpen}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          schema={sceneOpenSchema}
          defaultProps={{
            kicker: 'Agentic Enterprise',
            wordmark: 'Mia',
            tagline: 'Agents that do the work, not just the talking.',
          }}
        />
        <Composition
          id="Scene-Statement"
          component={SceneStatement}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          schema={sceneStatementSchema}
          defaultProps={{
            kicker: 'The shift',
            lead: 'Software used to wait for you.',
            accent: 'Now it moves first.',
          }}
        />
        <Composition
          id="Scene-Pillars"
          component={ScenePillars}
          durationInFrames={180}
          fps={30}
          width={1920}
          height={1080}
          schema={scenePillarsSchema}
          defaultProps={{
            kicker: 'What it does',
            pillars: [
              {index: '01', label: 'Reads the policy, not the vibes.'},
              {index: '02', label: 'Acts inside D365, not beside it.'},
              {index: '03', label: 'Shows its work on every run.'},
            ],
          }}
        />
        <Composition
          id="Scene-Metrics"
          component={SceneMetrics}
          durationInFrames={165}
          fps={30}
          width={1920}
          height={1080}
          schema={sceneMetricsSchema}
          defaultProps={{
            kicker: 'By the numbers',
            metrics: [
              {value: '60%', label: 'Less rework'},
              {value: '4x', label: 'Faster cycles'},
              {value: '24/7', label: 'Always on'},
            ],
          }}
        />
        <Composition
          id="Scene-Outro"
          component={SceneOutro}
          durationInFrames={135}
          fps={30}
          width={1920}
          height={1080}
          schema={sceneOutroSchema}
          defaultProps={{
            closingLine: 'Build the agent. Then prove it.',
            wordmark: 'Mia',
            footer: 'Agentic ERP, in production',
          }}
        />
        <Composition
          id="S15-Title"
          component={S15Title}
          durationInFrames={240}
          fps={30}
          width={1920}
          height={1080}
          schema={s15Schema}
          defaultProps={{...FILM_COPY.s15}}
        />
      </Folder>
    
      {/*
        Probes. Each duration is the *shortest* shot that scene gets in any V13
        cut, so scrubbing to the last frame of a probe tests the tightest case.
        This is what caught the cut-over table needing 114 frames to reveal in a
        94-frame shot, and the training guide's fourth step starting at 96.
      */}
      <Folder name="Probes">
        {([['Probe-ConfigPlan', SceneConfigPlanDraft, 112],['Probe-Cutover', SceneCutover, 94],['Probe-Training', SceneTrainingGuide, 95],['Probe-DocIngest', SceneDocIngest, 175],['Probe-Requirements', SceneRequirements, 176],['Probe-ConfigApply', SceneConfigApply, 450],['Probe-MigrationMap', SceneMigrationMap, 240],['Probe-S07Threads', S07ThreadsProbe, 138],['Probe-S07Roster', S07RosterProbe, 138]] as const).map(([id, Comp, dur]) => (
          <Composition key={id} id={id} component={Comp as React.FC} durationInFrames={dur} fps={30} width={1920} height={1080} />
        ))}
      </Folder>
</>
  );
};
