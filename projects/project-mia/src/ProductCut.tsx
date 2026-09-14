import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {SLOTS, FILM_FRAMES} from './MiaFilm';
import {EvidenceMeter} from './components/EvidenceMeter';
import {FilmGrade} from './components/FilmGrade';
import {JourneyRail} from './components/JourneyRail';
import {EASE} from './lib/motion';
import {DEFAULT_LOOK, LOOKS, type LookName} from './lib/look';

export const productCutSchema = z.object({
	narration: z.boolean(),
	look: z.enum(['studio', 'depth', 'product']),
	overlay: z.enum(['none', 'rail', 'evidence']),
});

export type Shot = {frames: number; node: React.ReactNode};

export type Cut = {
	/** The cold open, before the narration starts. */
	prologue: Shot[];
	/**
	 * Slot replacements, keyed by the label in SLOTS. A single node fills the
	 * slot; an array of shots subdivides it and must sum to the slot duration.
	 */
	slots: Record<string, React.ReactNode | Shot[]>;
	/** Narration track. Any replacement must be the same length as the original
	 * or every cut in the body drifts against it. */
	audio?: string;
};

const isShots = (v: React.ReactNode | Shot[]): v is Shot[] =>
	Array.isArray(v) && v.length > 0 && typeof (v[0] as Shot)?.frames === 'number';

const sum = (shots: Shot[]) => shots.reduce((n, s) => n + s.frames, 0);

/**
 * A wrong frame count here is silent at render time and only shows up as a
 * scene that cuts to nothing, so it is checked when the module loads instead.
 */
const assertCut = (name: string, cut: Cut) => {
	for (const [label, value] of Object.entries(cut.slots)) {
		const slot = SLOTS.find((s) => s.label === label);
		if (!slot) {
			throw new Error(`${name}: no slot labelled "${label}"`);
		}
		if (isShots(value) && sum(value) !== slot.duration) {
			throw new Error(
				`${name}: "${label}" shots total ${sum(value)} frames, slot is ${slot.duration}`,
			);
		}
	}
};

const Shots: React.FC<{shots: Shot[]; name: string}> = ({shots, name}) => {
	let at = 0;
	return (
		<AbsoluteFill>
			{shots.map((shot, i) => {
				const from = at;
				at += shot.frames;
				return (
					<Sequence
						key={`${name}-${i}`}
						from={from}
						durationInFrames={shot.frames}
						name={`${name} ${i + 1}`}
					>
						{shot.node}
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);
};

export const makeProductCut = (name: string, cut: Cut) => {
	assertCut(name, cut);
	const prologueFrames = sum(cut.prologue);
	const totalFrames = prologueFrames + FILM_FRAMES;

	const Film: React.FC<z.infer<typeof productCutSchema>> = ({
		narration,
		look = DEFAULT_LOOK,
		overlay = 'none',
	}) => {
		const graded = LOOKS[look as LookName] ?? LOOKS[DEFAULT_LOOK];

		return (
			<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
				{narration ? (
					<Sequence from={prologueFrames} name="Narration">
						<Audio src={staticFile(cut.audio ?? 'narration.m4a')} />
					</Sequence>
				) : null}

				<FilmGrade look={graded}>
					{/*
					 * Skipped entirely when the cut has no prologue. Remotion
					 * rejects durationInFrames of 0, so an empty prologue array
					 * has to mean "no Sequence" rather than "a Sequence of
					 * nothing". V14 onwards opens straight on the film body.
					 */}
					{prologueFrames > 0 ? (
						<Sequence from={0} durationInFrames={prologueFrames} name="Prologue">
							<Prologue shots={cut.prologue} />
						</Sequence>
					) : null}

					<Sequence from={prologueFrames} durationInFrames={FILM_FRAMES} name="Film body">
						<AbsoluteFill>
							{SLOTS.map((slot) => {
								const override = cut.slots[slot.label];
								return (
									<Sequence
										key={slot.label}
										from={slot.from}
										durationInFrames={slot.duration}
										name={slot.label}
									>
										{override === undefined ? (
											slot.node
										) : isShots(override) ? (
											<Shots shots={override} name={slot.label} />
										) : (
											override
										)}
									</Sequence>
								);
							})}
						</AbsoluteFill>
					</Sequence>

					{overlay === 'rail' ? <JourneyRail /> : null}
					{overlay === 'evidence' ? <EvidenceMeter /> : null}
				</FilmGrade>
			</AbsoluteFill>
		);
	};

	Film.displayName = name;
	return {Film, totalFrames, prologueFrames};
};

const Prologue: React.FC<{shots: Shot[]}> = ({shots}) => {
	const frame = useCurrentFrame();
	const openFromWhite = interpolate(frame, [0, 26], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			<Shots shots={shots} name="Prologue" />
			<AbsoluteFill
				style={{backgroundColor: '#FFFFFF', opacity: openFromWhite, pointerEvents: 'none'}}
			/>
		</AbsoluteFill>
	);
};
