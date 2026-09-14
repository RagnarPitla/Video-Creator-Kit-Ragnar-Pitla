import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {EASE} from '../lib/motion';
import {elevation} from '../lib/material';

/**
 * A Dynamics 365 lockup for the opening frame.
 *
 * Not used by either shipped cut. Review note 1 removed the "One coordinated
 * flow." caption from that frame and replacing it with another line of type
 * would undo the note. The frame is already anchored by BrandBackdrop, a
 * D365 mark at 7.5% behind the fifteen product tiles.
 *
 * Kept because it is one prop away (`openingLogo`) if the mark is wanted up
 * front, and because it bookends the lockup that closes the film in S18.
 */
export const BrandLockup: React.FC<{
	/** Frame the lockup starts arriving on, relative to this sequence. */
	start?: number;
	label?: string;
}> = ({start = 96, label = 'Dynamics 365'}) => {
	const frame = useCurrentFrame();

	const rise = interpolate(frame, [start, start + 34], [0, 1], {
		easing: EASE.out,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// The mark lands a beat before the words, so the eye reads the shape first.
	const word = interpolate(frame, [start + 14, start + 48], [0, 1], {
		easing: EASE.out,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const drift = interpolate(frame, [start, start + 180], [0, -7], {
		easing: EASE.drift,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'flex-end',
				paddingBottom: 128,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 30,
					padding: '22px 40px',
					borderRadius: 24,
					background: 'rgba(255, 255, 255, 0.74)',
					border: '1px solid rgba(214, 224, 236, 0.9)',
					backdropFilter: 'blur(10px)',
					boxShadow: elevation(1, '24, 46, 72'),
					opacity: rise,
					translate: `0px ${interpolate(rise, [0, 1], [22, 0]) + drift}px`,
					scale: String(interpolate(rise, [0, 1], [0.965, 1])),
				}}
			>
				<Img
					src={staticFile('d365-logo.png')}
					style={{
						height: 74,
						width: 'auto',
						display: 'block',
					}}
				/>
				<div
					style={{
						width: 1,
						height: 56,
						background: 'rgba(140, 156, 176, 0.42)',
						opacity: word,
					}}
				/>
				<div
					style={{
						fontFamily: 'Segoe UI',
						fontWeight: 350,
						fontSize: 52,
						letterSpacing: '-0.008em',
						color: '#2B3038',
						whiteSpace: 'nowrap',
						opacity: word,
						translate: `${interpolate(word, [0, 1], [-14, 0])}px 0px`,
					}}
				>
					{label}
				</div>
			</div>
		</AbsoluteFill>
	);
};
