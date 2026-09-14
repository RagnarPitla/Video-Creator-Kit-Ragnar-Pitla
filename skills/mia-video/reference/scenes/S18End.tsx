import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {elevation} from '../lib/material';
import {EASE, settle} from '../lib/motion';

export const s18Schema = z.object({
	lead: z.string(),
	wordmark: z.string(),
	pillars: z.array(z.string()),
	product: z.string(),
});

const MS_SQUARES = [
	{x: 0, y: 0, c: '#F25022'},
	{x: 1, y: 0, c: '#7FBA00'},
	{x: 0, y: 1, c: '#00A4EF'},
	{x: 1, y: 1, c: '#FFB900'},
];

/** The Microsoft logo, drawn rather than imported so it can animate. */
const MicrosoftMark: React.FC<{size: number; progress: number}> = ({size, progress}) => {
	const s = size * 0.47;
	const gap = size * 0.06;
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: size * 0.36}}>
			<div style={{position: 'relative', width: size, height: size}}>
				{MS_SQUARES.map((sq, i) => {
					const on = interpolate(progress, [i * 0.12, i * 0.12 + 0.44], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: EASE.out,
					});
					return (
						<div
							key={sq.c}
							style={{
								position: 'absolute',
								left: sq.x * (s + gap),
								top: sq.y * (s + gap),
								width: s,
								height: s,
								background: sq.c,
								opacity: on,
								scale: String(0.6 + on * 0.4),
							}}
						/>
					);
				})}
			</div>
			<span
				style={{
					fontFamily: 'Segoe UI',
					fontWeight: 350,
					fontSize: size * 0.92,
					color: '#2E343C',
					opacity: interpolate(progress, [0.4, 0.9], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: EASE.out,
					}),
					letterSpacing: '-0.005em',
				}}
			>
				Microsoft
			</span>
		</div>
	);
};

/**
 * The close.
 *
 * Three claims - rapid, reliable, repeatable - are the only thing the viewer
 * has to leave with, so they land one at a time and stay up. The brand lockup
 * arrives underneath them rather than replacing them, because a card that
 * cuts to a logo throws away the argument on the last beat.
 */
export const S18End: React.FC<z.infer<typeof s18Schema>> = ({
	lead,
	wordmark,
	pillars,
	product,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const leadIn = settle({frame, fps, start: 4, duration: 40, bounce: 10});
	const markIn = settle({frame, fps, start: 16, duration: 52, bounce: 13});
	const lift = interpolate(frame, [96, 138], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.inOut,
	});
	const brand = interpolate(frame, [150, 210], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			<Stage vanishX={960} vanishY={520} zoomFrom={1.05} zoomTo={1.0} fieldOpacity={0.42} />
			<Motes count={22} seed={19} opacity={0.6} />

			<Img
				src={staticFile('d365-logo.png')}
				style={{
					position: 'absolute',
					height: 1240,
					left: 960,
					top: 540,
					translate: '-50% -50%',
					opacity: interpolate(frame, [0, 60], [0, 0.055], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: EASE.out,
					}),
					scale: String(interpolate(frame, [0, 220], [1.1, 1.02], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
					})),
				}}
			/>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 292 - lift * 44,
					textAlign: 'center',
					opacity: leadIn,
					fontFamily: 'Segoe UI',
					fontWeight: 300,
					fontSize: 38,
					letterSpacing: '0.03em',
					color: '#7D8998',
				}}
			>
				{lead}
			</div>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 352 - lift * 48,
					textAlign: 'center',
					opacity: markIn,
					scale: String(0.94 + markIn * 0.06),
					fontFamily: 'Segoe UI',
					fontWeight: 600,
					fontSize: 118,
					letterSpacing: '-0.018em',
					background: 'linear-gradient(96deg, #2C6BD8 0%, #6B4FD1 46%, #C8478E 100%)',
					WebkitBackgroundClip: 'text',
					backgroundClip: 'text',
					color: 'transparent',
				}}
			>
				{wordmark}
			</div>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 542,
					display: 'flex',
					justifyContent: 'center',
					gap: 26,
				}}
			>
				{pillars.map((word, i) => {
					const land = settle({frame, fps, start: 66 + i * 26, duration: 48, bounce: 14});
					return (
						<div
							key={word}
							style={{
								padding: '20px 44px',
								borderRadius: 16,
								opacity: land,
								translate: `0px ${(1 - land) * 26}px`,
								scale: String(0.93 + land * 0.07),
								background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
								border: '1px solid rgba(198,213,229,0.9)',
								boxShadow: elevation(19),
								fontFamily: 'Segoe UI',
								fontWeight: 400,
								fontSize: 40,
								color: '#2E343C',
							}}
						>
							{word}
						</div>
					);
				})}
			</div>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 736,
					height: 2,
					opacity: brand * 0.5,
					background:
						'linear-gradient(90deg, rgba(160,182,204,0) 0%, rgba(160,182,204,0.7) 50%, rgba(160,182,204,0) 100%)',
					scale: `${0.3 + brand * 0.7} 1`,
				}}
			/>

			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 800,
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					gap: 34,
					opacity: brand,
					translate: `0px ${(1 - brand) * 18}px`,
				}}
			>
				<MicrosoftMark size={54} progress={brand} />
				<div
					style={{
						width: 1,
						height: 52,
						background: 'rgba(160,182,204,0.6)',
						opacity: interpolate(brand, [0.55, 1], [0, 1], {extrapolateLeft: 'clamp'}),
					}}
				/>
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
					<Img
						src={staticFile('d365-logo.png')}
						style={{
							height: 56,
							opacity: interpolate(brand, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'}),
						}}
					/>
					<span
						style={{
							fontFamily: 'Segoe UI',
							fontWeight: 350,
							fontSize: 46,
							color: '#2E343C',
							opacity: interpolate(brand, [0.7, 1], [0, 1], {extrapolateLeft: 'clamp'}),
						}}
					>
						{product}
					</span>
				</div>
			</div>
		</AbsoluteFill>
	);
};
