import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';

/**
 * A QC reel: the film, but only the frames worth looking at.
 *
 * Checking a change to this film used to mean a 4608-frame render, which is
 * about 23 minutes on this machine. That is slow enough that a review pass
 * gets done once rather than five times, and it is the reason the V17 white
 * flashes survived four rounds - each round looked at a narrow window because
 * looking at everything was too expensive.
 *
 * The reel plays a short window around each cut boundary plus any frames named
 * explicitly. Forty-odd windows of 16 frames is about 700 frames, which renders
 * in a bit over two minutes against 26 for the full film.
 *
 * Render it at half size with Remotion's own `--scale=0.5`, never by wrapping
 * the film in a CSS `transform: scale()`. The film's FilmGrade uses
 * `backdrop-filter`, and Chrome resolves a backdrop-filter against the nearest
 * transformed ancestor, so the wrapper made it sample the wrong region and
 * painted a mirrored ghost of the card below the plate line. It looked like a
 * defect in the film. qc-verify caught it as 37 of 46 marks matching their own
 * frame at only 25 dB - which is exactly the failure a proxy has to be gated
 * for, because the reel still looked like a plausible film.
 *
 * It is a *proxy*, and a proxy is only worth having if it is faithful, so
 * scripts/qc-verify.mjs re-derives a reel frame from the full render and
 * compares them. If that check is not run, the reel is an opinion.
 *
 * What it is good for: white flashes at cuts, a shot that starts on the wrong
 * frame, composition, plate and caption placement, anything static.
 * What it is not good for: audio, total duration, drift against narration, and
 * anything that depends on watching a shot play out. Those need the full file,
 * which is why the final gate is still a full render.
 */
export const makeQcReel = <P extends object>({
	Film,
	props,
	marks,
	span = 16,
}: {
	Film: React.ComponentType<P>;
	props: P;
	marks: number[];
	/** Frames held per mark. Even, so the mark sits in the middle. */
	span?: number;
}) => {
	const sorted = [...new Set(marks)].sort((a, b) => a - b);

	const Reel: React.FC = () => (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			{sorted.map((mark, i) => {
				const cursor = i * span;
				const start = Math.max(0, mark - span / 2);
				return (
					<Sequence
						key={mark}
						from={cursor}
						durationInFrames={span}
						name={`f${mark}`}
					>
						{/*
						 * A negative offset seeks the film: inside this
						 * window the child's frame reads start + elapsed.
						 */}
						<Sequence from={-start} name={`seek-${mark}`}>
							<Film {...props} />
						</Sequence>

						<Stamp mark={mark} start={start} span={span} />
					</Sequence>
				);
			})}
		</AbsoluteFill>
	);

	return {Reel, totalFrames: Math.max(span, sorted.length * span), marks: sorted};
};

/**
 * Drawn outside the scaled container so it stays crisp, and it prints the real
 * film frame number - without it a flash in the reel cannot be traced back to
 * a frame in the film, which is the only thing that makes the reel actionable.
 */
const Stamp: React.FC<{mark: number; start: number; span: number}> = ({
	mark,
	start,
	span,
}) => (
	<div
		style={{
			position: 'absolute',
			left: 20,
			bottom: 16,
			padding: '7px 16px',
			borderRadius: 8,
			background: 'rgba(20,26,38,0.78)',
			color: '#FFFFFF',
			fontFamily: 'monospace',
			fontSize: 26,
			letterSpacing: '0.03em',
		}}
	>
		{`f${mark}  [${start}-${start + span - 1}]`}
	</div>
);
