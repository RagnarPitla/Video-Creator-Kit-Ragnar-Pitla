import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {ProductClip} from '../components/ProductClip';
import {EASE} from '../lib/motion';

export const PROLOGUE_FRAMES = 480;

/**
 * The cold open, before a word is spoken.
 *
 * The narrated film argues from a vision downward: "imagine a future where
 * every Dynamics project moves faster". That argument is stronger if the
 * audience has already seen that some of it exists, so this opens on the
 * shipped console with a real project in it and lets the vision follow.
 *
 * Two shots, eight seconds each. The first establishes that a project is
 * genuinely mid-flight; the second shows the agent doing the one thing that
 * is hardest to fake, which is explaining why it recommended what it did.
 *
 * Nothing here is narrated, so the captions carry only what is legible on
 * screen behind them.
 */
export const S00Prologue: React.FC = () => {
	const frame = useCurrentFrame();

	const openFromWhite = interpolate(frame, [0, 26], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			<Sequence from={0} durationInFrames={240} name="Prologue - console">
				<ProductClip
					src="product/clip-03-dashboard.mp4"
					from={5.5}
					label="Mia Console - running today"
					caption="Finance UAT for Northwind Manufacturing. 63 percent complete."
					captionAt={64}
				/>
			</Sequence>

			<Sequence from={240} durationInFrames={240} name="Prologue - profiling">
				<ProductClip
					src="product/clip-02-profile.mp4"
					from={16.0}
					label="Mia Console - playbook profiling"
					caption="Four playbooks, each carrying the reason it was picked."
					captionAt={70}
				/>
			</Sequence>

			<AbsoluteFill
				style={{
					backgroundColor: '#FFFFFF',
					opacity: openFromWhite,
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};
