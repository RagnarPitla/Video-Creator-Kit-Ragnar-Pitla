import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {z} from 'zod';
import {SLOTS, FILM_FRAMES} from './MiaFilm';
import {S00Prologue, PROLOGUE_FRAMES} from './scenes/S00Prologue';
import {ProductClip} from './components/ProductClip';
import {EvidenceMeter} from './components/EvidenceMeter';
import {FilmGrade} from './components/FilmGrade';
import {JourneyRail} from './components/JourneyRail';
import {DEFAULT_LOOK, LOOKS, type LookName} from './lib/look';

export const miaProductFilmSchema = z.object({
	narration: z.boolean(),
	look: z.enum(['studio', 'depth', 'product']),
	overlay: z.enum(['none', 'rail', 'evidence']),
});

export const PRODUCT_FILM_FRAMES = PROLOGUE_FRAMES + FILM_FRAMES;

/**
 * The product cut.
 *
 * Same narration and the same 4608-frame body as the shipped film, with two
 * changes.
 *
 * First, it opens on the real console for sixteen seconds before the narration
 * starts, so the audience meets the software before it meets the pitch. The
 * narration track is offset by exactly that much and the body is otherwise
 * untouched, which is why the cut inside those 4608 frames still lands where
 * it always did.
 *
 * Second, the three scenes that carry the "Mia today" passage are replaced by
 * recordings of the console doing that exact thing. Those three were drawn
 * illustrations of a product that now exists, and an illustration of a real
 * thing is a weaker argument than the thing:
 *
 *   S12  "consuming project documentation ... suggests targeted questions"
 *        -> intake, including the follow-up question the form asks back
 *   S13  "a workstream lead reviews and approves the plan"
 *        -> business process scope, agent proposes and a human confirms
 *   S14  "for data migration ... keeping the migration connected"
 *        -> the wave tree, the DA gate, and the opening-balance migration
 *
 * Part one is left drawn on purpose. It narrates a future, and cutting today's
 * screens under a sentence about what is coming would claim something the
 * product does not do yet.
 */
const PRODUCT_SLOTS: Record<string, React.ReactNode> = {
	'S12 Documentation': (
		<ProductClip
			src="product/clip-01-intake.mp4"
			from={6.0}
			label="Mia Console - project intake"
			caption="It reads the brief, then asks back what it still needs."
			captionAt={196}
		/>
	),
	'S13 Configuration': (
		<ProductClip
			src="product/clip-05-scope.mp4"
			from={7.5}
			label="Mia Console - business process scope"
			caption="The agent proposes. A human confirms. Both are recorded."
			captionAt={286}
		/>
	),
	'S14 Migration': (
		<ProductClip
			src="product/clip-04-waves.mp4"
			from={11.5}
			label="Mia Console - delivery waves"
			caption="Migration sits in the same tree as the work it depends on."
			captionAt={276}
		/>
	),
};

export const MiaProductFilm: React.FC<z.infer<typeof miaProductFilmSchema>> = ({
	narration,
	look = DEFAULT_LOOK,
	overlay = 'none',
}) => {
	const graded = LOOKS[look as LookName] ?? LOOKS[DEFAULT_LOOK];

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			{narration ? (
				<Sequence from={PROLOGUE_FRAMES} name="Narration">
					<Audio src={staticFile('narration.m4a')} />
				</Sequence>
			) : null}

			<FilmGrade look={graded}>
				<Sequence from={0} durationInFrames={PROLOGUE_FRAMES} name="S00 Prologue">
					<S00Prologue />
				</Sequence>

				<Sequence from={PROLOGUE_FRAMES} durationInFrames={FILM_FRAMES} name="Film body">
					<AbsoluteFill>
						{SLOTS.map((slot) => (
							<Sequence
								key={slot.label}
								from={slot.from}
								durationInFrames={slot.duration}
								name={slot.label}
							>
								{PRODUCT_SLOTS[slot.label] ?? slot.node}
							</Sequence>
						))}
					</AbsoluteFill>
				</Sequence>

				{overlay === 'rail' ? <JourneyRail /> : null}
				{overlay === 'evidence' ? <EvidenceMeter /> : null}
			</FilmGrade>
		</AbsoluteFill>
	);
};
