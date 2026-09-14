import React from 'react';
import {Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {EASE, floatAt} from '../lib/motion';

/**
 * The Dynamics 365 mark, very large and very faint, sitting behind a scene.
 *
 * A white frame with a few small objects in it reads as unfinished rather than
 * as minimal. This gives the eye something to hold at the centre of the image
 * without competing with the content: it is a watermark, not a subject, so it
 * never rises above a few percent opacity and it drifts slowly enough that you
 * register it as depth rather than as motion.
 */
export const BrandBackdrop: React.FC<{
	/** Frame the mark starts fading up. */
	start?: number;
	/** Peak opacity. Above about 0.09 it stops being a backdrop. */
	strength?: number;
	height?: number;
	x?: number;
	y?: number;
	/** Faint expanding rings behind the mark, for scenes that need more air filled. */
	rings?: boolean;
}> = ({start = 0, strength = 0.06, height = 1180, x = 960, y = 540, rings = false}) => {
	const frame = useCurrentFrame();
	const seconds = frame / 30;

	const rise = interpolate(frame, [start, start + 46], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});
	const settleIn = interpolate(frame, [start, start + 70], [1.14, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});
	const drift = floatAt(seconds, 3, 16, 22, 0.16);

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				pointerEvents: 'none',
			}}
		>
			{rings
				? [0, 1, 2].map((i) => {
						const r = 420 + i * 250;
						const pulse = Math.sin(seconds * 0.42 - i * 0.9) * 0.5 + 0.5;
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: x - r + drift.x * 0.4,
									top: y - r + drift.y * 0.4,
									width: r * 2,
									height: r * 2,
									borderRadius: '50%',
									border: '2px solid rgba(112, 132, 200, 0.10)',
									opacity: rise * (0.35 + pulse * 0.4),
								}}
							/>
						);
					})
				: null}

			<Img
				src={staticFile('d365-logo.png')}
				style={{
					position: 'absolute',
					height,
					left: x + drift.x,
					top: y + drift.y,
					translate: '-50% -50%',
					scale: String(settleIn),
					opacity: rise * strength,
					filter: 'blur(0.6px)',
				}}
			/>
		</div>
	);
};
