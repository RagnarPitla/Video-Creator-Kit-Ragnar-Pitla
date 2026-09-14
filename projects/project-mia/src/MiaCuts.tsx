import React from 'react';
import {Sequence} from 'remotion';
import {ProductClip} from './components/ProductClip';
import {makeProductCut, type Shot} from './ProductCut';
import {FILM_COPY} from './film-copy';
import {S17FitGap} from './scenes/S17FitGap';
import {S15Title} from './scenes/S15Title';
import {S03StatementOfWork} from './scenes/S03StatementOfWork';
import {S09Presales} from './scenes/S09Presales';
import {S07Threads, S07Roster} from './scenes/S07Continuity';
import {S01Opening} from './scenes/S01Opening';
import {
	SceneConfigPlanDraft,
	SceneCutover,
	SceneTrainingGuide,
	SceneDocIngest,
	SceneRequirements,
	SceneConfigApply,
	SceneMigrationMap,
} from './scenes/ConsoleScenes';

/**
 * Two further cuts of the same film, both arguing from the shipped console
 * rather than from a drawing.
 *
 * The rule both obey: a recording may sit under a sentence only if the console
 * on screen is doing the thing the sentence describes. Where the narration
 * describes something the product does not do yet - go-live cut-over, life
 * after the implementation team rolls off, evaluating ISV options for a gap -
 * the drawn scene stays. That boundary is the whole reason the cut is worth
 * anything; the moment footage runs under a sentence it does not support, the
 * audience stops trusting the footage that does.
 *
 * Clip offsets are seconds into the source recording and were read off
 * per-second contact sheets in product-capture/sheets, not estimated from the
 * recorder script. Getting one wrong costs a full render.
 */

const shot = (frames: number, node: React.ReactNode): Shot => ({frames, node});

const intakeSignals = (
	<ProductClip
		src="product/clip-01-intake.mp4"
		from={6.0}
		label="Mia Console - project intake"
		caption="It reads the brief, then asks back for what it is missing."
		captionAt={130}
	/>
);

const playbookMatch = (
	<ProductClip
		src="product/clip-07-playbook-detail.mp4"
		from={14.3}
		label="Mia Console - playbook match"
		caption="Each match carries the reason it was picked."
		captionAt={54}
	/>
);

const playbookLibrary = (
	<ProductClip
		src="product/clip-06-playbooks.mp4"
		from={5.0}
		label="Mia Console - playbook library"
		caption="Thirty-three playbooks, Microsoft and partner, filtered by industry."
		captionAt={80}
	/>
);

const charterPrefilled = (
	<ProductClip
		src="product/clip-07-playbook-detail.mp4"
		from={22.0}
		label="Mia Console - project setup"
		caption="The charter arrives pre-filled from the intake answers."
		captionAt={36}
	/>
);

const wavesEstablished = (
	<ProductClip
		src="product/clip-04-waves.mp4"
		from={8.5}
		label="Mia Console - delivery waves"
		caption="Work streams, tasks, and what each one is waiting on."
		captionAt={36}
	/>
);

const scopeBlueprint = (
	<ProductClip
		src="product/clip-10-scope-tree.mp4"
		from={15.0}
		label="Mia Console - business process scope"
		caption="One blueprint. Every process carries its own status."
		captionAt={84}
	/>
);

const documentsList = (
	<ProductClip
		src="product/clip-08-sow.mp4"
		from={14.8}
		label="Mia Console - project documents"
		caption="Statement of work, discovery notes, workshop transcript."
		captionAt={54}
	/>
);

const sowOpen = (
	<ProductClip
		src="product/clip-08-sow.mp4"
		from={23.0}
		label="Mia Console - source document"
		caption="The signed scope, read back in full."
		captionAt={54}
	/>
);

const scopeConfirm = (
	<ProductClip
		src="product/clip-05-scope.mp4"
		from={7.5}
		label="Mia Console - business process scope"
		caption="The agent proposes. A human confirms. Both are recorded."
		captionAt={286}
	/>
);

const decisionAsked = (
	<ProductClip
		src="product/clip-09-decision.mp4"
		from={15.2}
		label="Mia Console - decision required"
		caption="Three blank financial tags. Mia paused rather than assuming."
		captionAt={110}
	/>
);

const decisionAccepted = (
	<ProductClip
		src="product/clip-09-decision.mp4"
		from={28.8}
		label="Mia Console - decision required"
		caption=""
		captionAt={0}
	/>
);

/* ------------------------------------------------------------------ v10 */

/**
 * v10 - the pre-sales rebuild.
 *
 * v9 put real footage under three sentences, all of them in "Mia today". The
 * complaint about it was that pre-sales, which is where the narration actually
 * starts, was still entirely drawn - and that the console has a playbook
 * library, a document ingest and a signed statement of work sitting in it,
 * which is exactly what those sentences describe.
 *
 * So the pre-sales run is rebuilt from the product: the library under "respond
 * to RFPs and turn discovery into reusable project knowledge", the pre-filled
 * charter and the wave tree under "when the statement of work is signed". Four
 * more scenes carry footage than in v9, and the decision gate - the single
 * best thing in the console - now appears at all.
 */
export const v10 = makeProductCut('MiaCutV10', {
	prologue: [shot(300, intakeSignals), shot(180, playbookMatch)],
	slots: {
		'S09 Pre-sales': playbookLibrary,
		'S03 Statement of Work': [shot(122, charterPrefilled), shot(121, wavesEstablished)],
		'S06 Montage': scopeBlueprint,
		'S12 Documentation': [shot(175, documentsList), shot(176, sowOpen)],
		'S13 Configuration': scopeConfirm,
		'S14 Migration': [shot(384, decisionAsked), shot(54, decisionAccepted)],
	},
});

/* ------------------------------------------------------------------ v11 */

const demoAssets = (
	<ProductClip
		src="product/clip-06-playbooks.mp4"
		from={17.5}
		label="Mia Console - demo assets"
		caption="Partner accelerators and proofs of concept, ready to run."
		captionAt={20}
	/>
);

const discoveryArtifacts = (
	<ProductClip
		src="product/clip-08-sow.mp4"
		from={15.5}
		label="Mia Console - project documents"
		caption="Discovery notes and workshop transcripts, queued for ingestion."
		captionAt={46}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const scopeProposed = (
	<ProductClip
		src="product/clip-10-scope-tree.mp4"
		from={15.0}
		label="Mia Console - business process scope"
		caption="Each process proposed, then confirmed by a human."
		captionAt={38}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const playbookPhases = (
	<ProductClip
		src="product/clip-07-playbook-detail.mp4"
		from={33.0}
		label="Mia Console - playbook phases"
		caption="Discover, design, implement, prepare, operate."
		captionAt={28}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const decisionSurfaced = (
	<ProductClip
		src="product/clip-09-decision.mp4"
		from={15.2}
		label="Mia Console - decision required"
		caption="Mia paused rather than assuming how the business wants it handled."
		captionAt={96}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const intakeGaps = (
	<ProductClip
		src="product/clip-01-intake.mp4"
		from={24.0}
		label="Mia Console - project intake"
		caption="It will not profile the project until all five signals are in."
		captionAt={54}
	/>
);

const wavesMigration = (
	<ProductClip
		src="product/clip-04-waves.mp4"
		from={14.0}
		label="Mia Console - delivery waves"
		caption="Migration sits in the same tree as the work it depends on."
		captionAt={72}
	/>
);

const decisionResumed = (
	<ProductClip
		src="product/clip-09-decision.mp4"
		from={28.6}
		label="Mia Console - decision required"
		caption="A suggested answer, accepted by a human. The worker resumes."
		captionAt={84}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

/**
 * v11 - product throughout.
 *
 * The same rule pushed as far as it goes. Eleven scenes carry footage instead
 * of v10's seven, including four inside the vision passage that v9 ruled out
 * wholesale: demo assets, discovery artefacts, the proposed-then-confirmed
 * scope, and the five playbook phases under "success by design".
 *
 * Four scenes stay drawn because the console has nothing to show for them, and
 * that is the point of the cut rather than a gap in it: go-live cut-over,
 * life after the team rolls off, the fit-gap sentence that runs on into ISV
 * options, and the pull-back on "that is the vision".
 */
export const v11Slots = {
	prologue: [shot(300, intakeSignals), shot(180, playbookMatch)],
	slots: {
		'S02 Retailer': demoAssets,
		'S09 Pre-sales': playbookLibrary,
		'S03 Statement of Work': [shot(122, charterPrefilled), shot(121, wavesEstablished)],
		'Success by Design': playbookPhases,
		'S04 Conference room': discoveryArtifacts,
		'S05 Flow boxes': scopeProposed,
		'S06 Montage': decisionSurfaced,
		'S12 Documentation': [shot(175, sowOpen), shot(176, intakeGaps)],
		'S13 Configuration': scopeConfirm,
		'S14 Migration': [shot(240, wavesMigration), shot(198, decisionResumed)],
	},
};

export const v11 = makeProductCut('MiaCutV11', v11Slots);

/**
 * v12 - v11 after the rename, with the old name taken out of the voice track.
 *
 * The rename is on-screen only; the narration still says "This is the vision
 * for Project MIA" and, offset by the prologue, that lands at 26.2s - while the
 * card reading "D365 Mia" is on screen. Hearing one name and reading another at
 * the same moment is not a detail an audience lets go.
 *
 * The word is muted rather than replaced, because there is no new recording.
 * The envelope has a natural floor either side of it - minus 31 dB at 10.175s
 * and minus 35 dB at 10.390s - so the cut sits in existing near-silence and
 * leaves "for" and "MIA" untouched. The track keeps its exact original length,
 * so nothing downstream moves. What is left is "This is the vision for ... MIA",
 * with a 180 millisecond beat where the old name was.
 *
 * This is a holding fix. The real one is a voice pickup of that sentence.
 */
export const v12 = makeProductCut('MiaCutV12', {
	...v11Slots,
	audio: 'narration-d365.m4a',
});

/* ------------------------------------------------------------------ v13 */

/**
 * v13 - the cut rebuilt against Ashley Desiongco's 28 Aug review.
 *
 * Her notes came as a five minute screen recording, and the useful part was
 * not the words but what she was pointing at. From roughly 175s she stops
 * playing the film and starts driving the live Mia Console, which is the whole
 * brief: "I'm trying to show as much of the today Mia console as possible. I
 * want to show tasks and then I want to show the artifacts that it generates."
 *
 * Two decisions follow from that, and both are worth defending.
 *
 * First, the console scenes here are drawn in Remotion rather than recorded.
 * Ashley's own captures are 12px type, which is unreadable projected, and she
 * said plainly that half of what she wants does not exist yet - "I know this
 * isn't how it looks today, but that's the vision" for the configuration plan,
 * and "I started doing some of this recording, but I didn't finish" for the
 * today section. A recording could not have carried those shots at any
 * resolution. Every nav item, wave name, skill id and assignee in them was read
 * off her frames, so the app is invented in fidelity but not in content.
 *
 * Second, the pre-sales passage is real footage, because there it exists and it
 * is the strongest thing in the film: a public retailer website, its URL pasted
 * into Mia, and a branded F&O environment with the scraped product catalogue.
 * Ashley's only complaint about it was length, so it is cut from one 20s take
 * into four shots totalling 11.3s.
 *
 * Where the narration describes something the product does not do, the drawn
 * scene stays. That boundary is the reason any of the footage is believable.
 */

const zavaSite = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={1.8}
		label="Zava Fashion - public website"
		caption="It starts with what the customer already shows the world."
		captionAt={30}
	/>
);

const zavaUrl = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={6.6}
		label="Mia Console - project intake"
		caption="Paste the customer's public website."
		captionAt={26}
	/>
);

const zavaProfile = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={9.0}
		label="Mia Console - profile my project"
		caption="Mia reads the site and profiles the project."
		captionAt={12}
	/>
);

const zavaEnv = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={12.9}
		label="Dynamics 365 - Zava environment"
		caption="A configured environment, branded for the customer."
		captionAt={20}
	/>
);

const zavaProduct = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={15.1}
		label="Dynamics 365 - released product"
		caption="With their own catalogue already in it."
		captionAt={20}
	/>
);

/**
 * The fit-gap slot, split.
 *
 * Ashley wanted the configuration plan under "for fits" and the existing
 * options animation kept under "for gaps" - "Power Platform chosen over
 * customization, like that animation is good". The drawn scene uses absolute
 * frame numbers internally, so it is entered at frame 162 with a negative
 * offset, which is exactly where its options panel begins. `skipPlan` holds
 * back the plan panel that would otherwise still be lit and would repeat what
 * the console had just shown.
 */
const fitGapSplit: Shot[] = [
	shot(150, <SceneConfigPlanDraft />),
	shot(
		243,
		<Sequence from={-162}>
			<S17FitGap {...FILM_COPY.s17} skipPlan />
		</Sequence>,
	),
];

const v13Base = {
	prologue: [shot(300, intakeSignals), shot(180, playbookMatch)],
	slots: {
		'S02 Retailer': zavaSite,
		'S09 Pre-sales': [
			shot(60, zavaUrl),
			shot(45, zavaProfile),
			shot(66, zavaEnv),
			shot(78, zavaProduct),
		],
		'S03 Statement of Work': [shot(122, charterPrefilled), shot(121, wavesEstablished)],
		'Success by Design': playbookPhases,
		'S04 Conference room': discoveryArtifacts,
		'S05 Flow boxes': scopeProposed,
		'Configuration plan (source)': fitGapSplit,
		'S06 Montage': decisionSurfaced,
		'S10 Go-live': [shot(94, <SceneCutover />), shot(95, <SceneTrainingGuide />)],
		'S12 Documentation': [shot(175, <SceneDocIngest />), shot(176, <SceneRequirements />)],
		'S13 Configuration': <SceneConfigApply />,
		'S14 Migration': [shot(240, <SceneMigrationMap />), shot(198, decisionResumed)],
	},
	audio: 'narration-d365.m4a',
};

/**
 * A - the console cut.
 *
 * Everything above, with the roll-off beat carried by the two-lane thread. This
 * is the variant that argues hardest for the product: nine slots carry either
 * real footage or the console, and the abstract shot still uses the film's own
 * thread language rather than leaving the visual system.
 */
export const v13a = makeProductCut('MiaCutV13A', {
	...v13Base,
	slots: {
		...v13Base.slots,
		'S07 Handshake': <S07Threads {...FILM_COPY.s07} />,
	},
});

/**
 * B - the typographic cut.
 *
 * Identical to A except the roll-off is the project roster emptying until one
 * name is left. Ragnar's note allowed either - "we can change to text or convey
 * it via text or other visuals" - and this is the version that survives being
 * watched on a phone with the sound off, which is most of LinkedIn.
 */
export const v13b = makeProductCut('MiaCutV13B', {
	...v13Base,
	slots: {
		...v13Base.slots,
		'S07 Handshake': <S07Roster {...FILM_COPY.s07} />,
	},
});

/**
 * C - the restrained cut.
 *
 * The same console work, but the go-live slot gives its whole 189 frames to
 * the cut-over plan instead of splitting them with the training guide, and the
 * fit-gap slot keeps more of the drawn scene.
 *
 * The argument for it: A and B change nine slots at once, and a stakeholder
 * seeing the film for the third time may read that as a different film rather
 * than a better one. C changes fewer things and lets each one breathe. If the
 * room says A feels rushed, this is the answer, and it exists so that answer
 * does not cost another render cycle.
 */
export const v13c = makeProductCut('MiaCutV13C', {
	...v13Base,
	slots: {
		...v13Base.slots,
		'Configuration plan (source)': [
			shot(112, <SceneConfigPlanDraft />),
			// -162 not -124: the options panel is the first thing on the right
			// half and it does not light until child frame 162. Entering any
			// earlier leaves the right two thirds of the frame empty, and the
			// caption does not start until 336 either, so it reads as a dropped
			// shot rather than a beat. Verified by still before this was fixed.
			shot(
				281,
				<Sequence from={-162}>
					<S17FitGap {...FILM_COPY.s17} skipPlan />
				</Sequence>,
			),
		],
		'S10 Go-live': <SceneCutover />,
		'S07 Handshake': <S07Roster {...FILM_COPY.s07} />,
	},
});

/* ------------------------------------------------------------------------- *
 * V14 - Project Mia, and no silent head
 *
 * Three corrections from Ragnar, all structural rather than cosmetic.
 *
 * 1. The name is Project Mia again. It went to "D365 Mia" in v12 and that was
 *    wrong. Restoring it also removes the reason the v12 audio existed: the
 *    narration says "This is the vision for Project MIA", and v12 muted the
 *    word "Project" so the voice would not contradict the card. With the card
 *    reading Project Mia the word is correct, so v14 goes back to the intact
 *    narration and the 180ms hole in the voice track closes.
 *
 * 2. No silent prologue. V13 opened on sixteen seconds of console recording
 *    with no voice over it. Ragnar: "we should not add prefix with real demo
 *    without audio, start after imagine" and "there should not be any empty
 *    audio space". So the prologue is empty and the film starts on the first
 *    word. That takes the runtime from 5088 frames to 4608.
 *
 * 3. The real product moves to where the logos hand off. "When all apps are
 *    done we can include some of real project" - the D365 product logos finish
 *    docking along the thread at the end of S01, so the console now arrives in
 *    the title slot rather than before the film starts.
 *
 * The title slot is 240 frames and it only needs 150: the last node in the
 * title graph enters at frame 95 and settles over 44, so the card is fully
 * built by 139. That frees 90 frames, and they land on narration cue 6, "and
 * delivery knowledge across the journey" - which is the one line in the film
 * where cutting to the actual console is an argument rather than a decoration.
 * ------------------------------------------------------------------------- */

/**
 * The playbook match, cut to 90 frames.
 *
 * The first attempt here used the intake clip, and a still killed it: at that
 * offset the console reads "0 of 5 signals ready" over an empty form, which
 * argues the opposite of the line it plays under. Read off
 * product-capture/sheets/clip-07-playbook-detail.png instead - the four
 * recommended playbook cards are on screen from 14s to 20s, and named
 * playbooks are what "delivery knowledge" actually looks like.
 *
 * The caption is at 30 rather than the 54 the prologue version used, so it is
 * complete by 56 and clear of the 16-frame fade out.
 */
const playbookShort = (
	<ProductClip
		src="product/clip-07-playbook-detail.mp4"
		from={15.0}
		label="Mia Console - playbook match"
		caption="Each match carries the reason it was picked."
		captionAt={30}
	/>
);

const v14Base = {
	...v13Base,
	prologue: [],
	slots: {
		...v13Base.slots,
		Title: [shot(150, <S15Title {...FILM_COPY.s15} />), shot(90, playbookShort)],
	},
	audio: 'narration.m4a',
};

/** A - the console cut. Roll-off carried by the two-lane thread. */
export const v14a = makeProductCut('MiaCutV14A', {
	...v14Base,
	slots: {
		...v14Base.slots,
		'S07 Handshake': <S07Threads {...FILM_COPY.s07} />,
	},
});

/** B - the typographic cut. Roll-off carried by the emptying roster. */
export const v14b = makeProductCut('MiaCutV14B', {
	...v14Base,
	slots: {
		...v14Base.slots,
		'S07 Handshake': <S07Roster {...FILM_COPY.s07} />,
	},
});

/**
 * C - the restrained cut. Cut-over gets the whole go-live slot and more of the
 * drawn fit-gap scene survives. Same two changes as V13C.
 */
export const v14c = makeProductCut('MiaCutV14C', {
	...v14Base,
	slots: {
		...v14Base.slots,
		'Configuration plan (source)': [
			shot(112, <SceneConfigPlanDraft />),
			shot(
				281,
				<Sequence from={-162}>
					<S17FitGap {...FILM_COPY.s17} skipPlan />
				</Sequence>,
			),
		],
		'S10 Go-live': <SceneCutover />,
		'S07 Handshake': <S07Roster {...FILM_COPY.s07} />,
	},
});

/* ------------------------------------------------------------------------- *
 * V15 - the V6 animations come back
 *
 * Ragnar: "i also like the statement of work RFP animations and all from V6,
 * can we bring them back also and use relevant screen recordings too. I love
 * everything in V14 for sure."
 *
 * So V15 is V14 with two drawn scenes restored, and the three variants are a
 * gradient rather than three unrelated edits: A keeps all of V14's footage and
 * restores one animation, B restores both as splits, C gives both slots
 * entirely to the drawn scenes.
 *
 * Why those two scenes are the ones worth restoring. Both were dropped in v13
 * for real footage, and in both cases the drawn version is a closer match to
 * what the narration actually says:
 *
 *   S09Presales animates three sources - "RFP response, 142 questions
 *   answered", a recorded demo and a discovery workshop - feeding a project
 *   knowledge library. The narration over that slot is "respond to RFPs, and
 *   turn recorded demos and discovery workshops into reusable project
 *   knowledge". The scene is a literal diagram of the sentence.
 *
 *   S03StatementOfWork animates a signed SoW branching into project charter,
 *   team structure and delivery plan, under "when the statement of work is
 *   signed". The console clip that replaced it shows the charter already
 *   filled, which is the result rather than the act.
 *
 * Neither can be shortened much. Read off their interpolate calls:
 *   S03: sign 22-68, corral 54-128, branches 124-178. Built at 178.
 *   S09: feeds 18-120, sends 44-128, knowledge library 150-178. Built at 178.
 * The slow `push` zoom in each runs the full slot but carries no content, so
 * 178 frames is the real floor and anything under it drops the payoff panel.
 * That is what sets every split below.
 * ------------------------------------------------------------------------- */

/**
 * The statement-of-work scene takes its whole slot.
 *
 * The first attempt split it 178 drawn / 65 recording, and a still at the last
 * drawn frame caught the error: the third branch card, "Delivery plan", was
 * still translucent and mid-settle. Its reveal is
 * `settle({start: 152 + i * 9, duration: 32})`, so for i=2 it does not finish
 * until frame 202. That leaves 41 frames of the 243, which is too short to
 * hang a captioned clip on, so this slot does not split. The screen recording
 * Ragnar asked for lands in the pre-sales slot instead, where the arithmetic
 * works.
 */
const sowDrawn = <S03StatementOfWork {...FILM_COPY.s03} />;

/**
 * The URL paste, then the drawn RFP scene.
 *
 * 60 frames of real footage carry "helping teams create customer-relevant
 * demos and data" - the paste is the whole of that line - and the remaining
 * 189 carry "respond to RFPs, and turn recorded demos and discovery workshops
 * into reusable project knowledge", which is exactly what S09Presales draws.
 *
 * The caption has to be retimed for the shorter shot. At its default 168-249
 * it was a quarter revealed when the shot ended - a still read "Pre-sales
 * work" where the line is "Pre-sales work stops being disposable."
 */
const presalesSplit: Shot[] = [
	shot(60, zavaUrl),
	shot(
		189,
		<S09Presales {...FILM_COPY.s09} captionStart={124} captionEnd={184} />,
	),
];

const v15Base = {
	...v14Base,
	slots: {
		...v14Base.slots,
		'S03 Statement of Work': sowDrawn,
	},
};

/**
 * A - footage-forward.
 *
 * The statement-of-work animation is back; everything else is V14A. The whole
 * Zava pre-sales passage survives intact, including the configured F&O
 * environment and the ZV001 product record, which is the payoff Ashley asked
 * for by name. Pick this if the room wants V14 with one thing added rather
 * than a re-edit.
 */
export const v15a = makeProductCut('MiaCutV15A', {
	...v15Base,
	slots: {
		...v15Base.slots,
		'S07 Handshake': <S07Threads {...FILM_COPY.s07} />,
	},
});

/**
 * B - balanced.
 *
 * Both animations back, and the RFP scene is introduced by the real URL paste
 * rather than replacing the footage outright. The cost is the back half of the
 * Zava passage: the configured F&O environment and the product record come out
 * to make room. That is the trade worth arguing about.
 */
export const v15b = makeProductCut('MiaCutV15B', {
	...v15Base,
	slots: {
		...v15Base.slots,
		'S09 Pre-sales': presalesSplit,
		'S07 Handshake': <S07Roster {...FILM_COPY.s07} />,
	},
});

/**
 * C - animation-forward.
 *
 * Both slots go entirely to the drawn scenes, which is how V6 played them, on
 * top of V14C's restrained go-live and fit-gap. The least footage of the three
 * and the most continuous visual language. This is "bring back V6" taken
 * literally, and it exists so that answer does not cost another render cycle.
 */
export const v15c = makeProductCut('MiaCutV15C', {
	...v15Base,
	slots: {
		...v15Base.slots,
		'S09 Pre-sales': <S09Presales {...FILM_COPY.s09} />,
		'Configuration plan (source)': [
			shot(112, <SceneConfigPlanDraft />),
			shot(
				281,
				<Sequence from={-162}>
					<S17FitGap {...FILM_COPY.s17} skipPlan />
				</Sequence>,
			),
		],
		'S10 Go-live': <SceneCutover />,
		'S07 Handshake': <S07Roster {...FILM_COPY.s07} />,
	},
});

/* ------------------------------------------------------------------ *
 * V16 - V15A, two changes
 *
 * Ragnar picked V15A: "i love this Mia-Film-V15A-Footage.mp4 can you only
 * make sure we updae the presaels pice.. and also in the begining maybwe we
 * add one slide on main page for Prject mia assoon asn asnimations are done
 * .. can we start with tat screen".
 *
 * The screenshot he attached is the Mia Console intake page - "Let's shape
 * your project." beside "How can Mia help you on your Dynamics 365 journey?"
 * with the eight Dynamics 365 application checkboxes. That is clip-01-intake
 * at about 5.2s.
 * ------------------------------------------------------------------ */

/**
 * The console front door, in the 90-frame slot straight after the title card.
 *
 * The narration across it is "an agentic platform connecting people,
 * decisions, and delivery knowledge across the journey", and this is the
 * platform. It also rhymes with the shot that just ended: the Dynamics 365
 * logos finish assembling in S01, and here the same eight applications are
 * the checkboxes you tick. That rhyme is the reason this shot belongs here
 * rather than anywhere else in the film.
 *
 * This replaces V14's playbook match. V14 had moved *away* from the intake
 * form for a good reason - at 6.0s it reads "0 of 5 signals ready" over an
 * empty form, which argued against a line about delivery knowledge. Under the
 * title narration the empty form is not a contradiction, it is a front door.
 *
 * `zoomFrom` is doing real work. clip-01-intake was captured wider than
 * clip-11-presales, so at scale 1 the card holds about 54 percent of the
 * frame against clip-11's 69 and the checkbox labels get small. Starting at
 * 1.12 and drifting to 1.26 keeps them legible for the whole shot. The Mia
 * Console title bar crops away at that zoom; the label pill carries the
 * product name instead.
 */
const consoleHome = (
	<ProductClip
		src="product/clip-01-intake.mp4"
		from={5.2}
		label="Mia Console"
		caption="Every project starts in one place."
		captionAt={30}
		zoomFrom={1.12}
		push={1.26}
		fadeOutFrames={0}
	/>
);

/**
 * The pre-sales chain, hard cut.
 *
 * Same five shots as V15A, same lengths, same offsets. The only change is
 * that the four boundaries inside the passage no longer dip through blank
 * paper. See the ProductClip doc comment for the measurement.
 *
 * Two fades are kept on purpose:
 *
 *  - into `zavaSite` at frame 522, shortened to 10 frames to match
 *    consoleHome's fade out. That boundary lands inside the 1.48s narration
 *    pause between "across the journey" (ends 16.28s) and "MIA begins in
 *    pre-sales" (starts 17.76s), so a dip there reads as a section break
 *    rather than a stutter. It is the one beat in this run that should
 *    breathe.
 *  - out of `zavaProduct` at frame 861, into the drawn statement of work
 *    scene. Footage to drawing is a real change of register and earns a fade.
 *
 * The four in between sit mid-sentence, so they cut.
 */
const zavaSiteCut = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={1.8}
		label="Zava Fashion - public website"
		caption="It starts with what the customer already shows the world."
		captionAt={30}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const zavaUrlCut = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={6.6}
		label="Mia Console - project intake"
		caption="Paste the customer's public website."
		captionAt={26}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const zavaProfileCut = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={9.0}
		label="Mia Console - profile my project"
		caption="Mia reads the site and profiles the project."
		captionAt={12}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const zavaEnvCut = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={12.9}
		label="Dynamics 365 - Zava environment"
		caption="A configured environment, branded for the customer."
		captionAt={20}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

const zavaProductCut = (
	<ProductClip
		src="product/clip-11-presales.mp4"
		from={15.1}
		label="Dynamics 365 - released product"
		caption="With their own catalogue already in it."
		captionAt={20}
		fadeInFrames={0}
		fadeOutFrames={0}
	/>
);

/**
 * V16. V15A with the console front door and the hard-cut pre-sales chain.
 * Everything else - the restored statement of work animation, the thread
 * roll-off, the fit-gap split, the whole Today section - is V15A untouched.
 */
const v16Base = {
	...v15Base,
	slots: {
		...v15Base.slots,
		Title: [shot(150, <S15Title {...FILM_COPY.s15} />), shot(90, consoleHome)],
		'S02 Retailer': zavaSiteCut,
		'S09 Pre-sales': [
			shot(60, zavaUrlCut),
			shot(45, zavaProfileCut),
			shot(66, zavaEnvCut),
			shot(78, zavaProductCut),
		],
		'S07 Handshake': <S07Threads {...FILM_COPY.s07} />,
	},
};

export const v16 = makeProductCut('MiaCutV16', v16Base);

/**
 * Opening-only variants, for choosing how the applications get named.
 *
 * Ragnar's note on V16: "I dont see anything that says about Dynamics other
 * than logos". The gather is legible as motion but the icons are 40px glyphs,
 * so a viewer who does not already know the Dynamics 365 family learns nothing
 * about what a company actually runs. These three differ only in S01 and only
 * in how the words arrive; everything downstream is V16 untouched.
 *
 *   A chips     names all 15 while they are loose, clears them as they dock
 *   B brackets  annotates the docked chain with ERP and CRM spans
 *   C words     a capability list in the top band once the tiles vacate it
 *   D both      A then B - every app named while loose, grouped once docked
 *
 * Render frames 0-299 only. The rest of the film is identical to V16, so
 * rendering it again would prove nothing.
 */
const openingVariant = (mode: 'chips' | 'brackets' | 'words' | 'both') => ({
	...v16Base,
	slots: {
		...v16Base.slots,
		'S01 Opening': <S01Opening {...FILM_COPY.s01} capabilities={mode} />,
	},
});

export const v17a = makeProductCut('MiaCutV17A', openingVariant('chips'));
export const v17b = makeProductCut('MiaCutV17B', openingVariant('brackets'));
export const v17c = makeProductCut('MiaCutV17C', openingVariant('words'));
export const v17d = makeProductCut('MiaCutV17D', openingVariant('both'));
