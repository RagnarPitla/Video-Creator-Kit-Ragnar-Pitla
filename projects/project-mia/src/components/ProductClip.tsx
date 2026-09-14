import React from 'react';
import {
	AbsoluteFill,
	OffthreadVideo,
	interpolate,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {EASE} from '../lib/motion';

/**
 * A shot of the real Mia Console, full bleed.
 *
 * Every other scene in this film is drawn. This one is not: it is a recording
 * of the product at https://mango-desert-0f88f590f.7.azurestaticapps.net,
 * captured at 1920x1080 with a pointer drawn into the page, so the frame is
 * the software itself rather than an illustration of it. It is deliberately
 * not put inside a laptop shell - a device frame shrinks the UI to the point
 * where the labels stop being readable, and the labels are the evidence.
 *
 * `from` is the second in the source clip where this shot starts, so the
 * segment can be aimed at the exact moment the narration is describing.
 *
 * The push is small on purpose. Scaling a screen recording past about 1.04
 * starts to soften the type, and the type is the reason the shot is here.
 * `zoomFrom` exists for captures framed wider than the rest - clip-01-intake
 * sits the console card in about 54 percent of the frame where clip-11 gives
 * it 69 - so that shot can start already tight instead of pushing 25 percent
 * across three seconds to get there.
 *
 * `fadeInFrames` and `fadeOutFrames` default to the original 14 and 16. Set
 * either to 0 for a hard cut. This matters when ProductClips run back to back:
 * the shots are sequential, not overlapping, so one clip's fade out plays
 * *before* the next one's fade in rather than crossing with it, and the film
 * dips through blank paper for the sum of the two. Measured on V15A at the
 * zavaProfile -> zavaEnv boundary, frame contrast fell from 18 to 5.9 for 13
 * frames. Four boundaries did that inside an 11.3s passage. Between two
 * screens of the same product a hard cut is the correct grammar anyway.
 */
export const ProductClip: React.FC<{
	src: string;
	from: number;
	label?: string;
	caption?: string;
	/** Frame at which the caption arrives. */
	captionAt?: number;
	push?: number;
	zoomFrom?: number;
	fadeInFrames?: number;
	fadeOutFrames?: number;
}> = ({
	src,
	from,
	label,
	caption,
	captionAt = 28,
	push = 1.035,
	zoomFrom = 1,
	fadeInFrames = 14,
	fadeOutFrames = 16,
}) => {
	const frame = useCurrentFrame();
	const {durationInFrames, fps} = useVideoConfig();

	const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, push], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.drift,
	});

	const fadeIn =
		fadeInFrames > 0
			? interpolate(frame, [0, fadeInFrames], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: EASE.out,
				})
			: 1;

	const fadeOut =
		fadeOutFrames > 0
			? interpolate(
					frame,
					[durationInFrames - fadeOutFrames, durationInFrames],
					[1, 0],
					{
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: EASE.inOut,
					},
				)
			: 1;

	const labelIn = interpolate(frame, [10, 34], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	const capIn = interpolate(frame, [captionAt, captionAt + 26], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8', opacity: fadeIn * fadeOut}}>
			<AbsoluteFill style={{scale: String(scale), overflow: 'hidden'}}>
				<OffthreadVideo
					src={staticFile(src)}
					muted
					trimBefore={Math.round(from * fps)}
					style={{width: '100%', height: '100%', objectFit: 'cover'}}
				/>
			</AbsoluteFill>

			{/* A lens, not a spotlight - the same falloff the drawn scenes carry. */}
			<AbsoluteFill
				style={{
					background:
						'radial-gradient(120% 108% at 50% 46%, rgba(0,0,0,0) 54%, rgba(22,30,44,0.14) 100%)',
					pointerEvents: 'none',
				}}
			/>

			{label ? (
				<div
					style={{
						position: 'absolute',
						left: 64,
						bottom: 152,
						opacity: labelIn,
						translate: `0px ${(1 - labelIn) * 10}px`,
						display: 'flex',
						alignItems: 'center',
						gap: 12,
						padding: '10px 18px',
						borderRadius: 999,
						background: 'rgba(255,255,255,0.86)',
						border: '1px solid rgba(198,213,229,0.9)',
						boxShadow: '0 6px 22px rgba(31,45,66,0.10)',
						backdropFilter: 'blur(6px)',
					}}
				>
					<span
						style={{
							width: 9,
							height: 9,
							borderRadius: '50%',
							background: '#1EC3BD',
							boxShadow: '0 0 9px rgba(30,195,189,0.65)',
						}}
					/>
					<span
						style={{
							fontFamily: 'Segoe UI',
							fontWeight: 600,
							fontSize: 19,
							letterSpacing: '0.09em',
							textTransform: 'uppercase',
							color: '#5A6673',
						}}
					>
						{label}
					</span>
				</div>
			) : null}

			{caption ? (
				<>
					<AbsoluteFill
						style={{
							background:
								'linear-gradient(180deg, rgba(238,243,248,0) 62%, rgba(238,243,248,0.94) 88%, rgba(238,243,248,1) 100%)',
							opacity: capIn,
							pointerEvents: 'none',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: 64,
							right: 64,
							bottom: 62,
							opacity: capIn,
							translate: `0px ${(1 - capIn) * 14}px`,
							fontFamily: 'Segoe UI',
							fontWeight: 350,
							fontSize: 44,
							lineHeight: 1.16,
							letterSpacing: '-0.012em',
							color: '#2E343C',
						}}
					>
						{caption}
					</div>
				</>
			) : null}
		</AbsoluteFill>
	);
};
