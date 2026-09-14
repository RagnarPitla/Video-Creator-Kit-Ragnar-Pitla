import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {BrandBackdrop} from '../components/BrandBackdrop';
import {Motes} from '../components/Motes';
import {Stage} from '../components/Stage';
import {elevation} from '../lib/material';
import {EASE, settle} from '../lib/motion';

export const s16Schema = z.object({
	heading: z.string(),
	phases: z.array(z.string()),
	caption: z.string(),
});

/**
 * Success by Design, built rather than borrowed.
 *
 * The original slide had the four phases wrong - its fourth read "Initiate",
 * duplicating the first, where the methodology ends on Operate. Rebuilding the
 * slot fixes that instead of carrying the error into another cut.
 *
 * 129 frames is a little over four seconds, so this has to land in one read:
 * a track, four stops filling along it, done.
 */
export const S16SuccessByDesign: React.FC<z.infer<typeof s16Schema>> = ({
	heading,
	phases,
	caption,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const TRACK_X = 300;
	const TRACK_W = 1320;
	const Y = 560;
	const step = TRACK_W / (phases.length - 1);

	const headIn = settle({frame, fps, start: 2, duration: 34, bounce: 9});
	/** How far the track has drawn, in phase index. */
	const progress = interpolate(frame, [14, 104], [0, phases.length - 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.inOut,
	});

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			<Stage vanishX={960} vanishY={470} zoomFrom={1.03} zoomTo={1.08} fieldOpacity={0.5} />
			<BrandBackdrop start={0} strength={0.05} height={980} y={545} />
			<Motes count={20} seed={7} opacity={0.7} />

			<div
				style={{
					position: 'absolute',
					top: 300,
					left: 0,
					right: 0,
					textAlign: 'center',
					opacity: headIn,
					translate: `0px ${(1 - headIn) * 20}px`,
					fontFamily: 'Segoe UI',
					fontWeight: 350,
					fontSize: 60,
					color: '#2E343C',
				}}
			>
				{heading}
			</div>

			<div
				style={{
					position: 'absolute',
					left: TRACK_X,
					top: Y - 2,
					width: TRACK_W,
					height: 4,
					borderRadius: 2,
					background: 'rgba(160, 182, 204, 0.34)',
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: TRACK_X,
					top: Y - 2,
					width: step * progress,
					height: 4,
					borderRadius: 2,
					background: 'linear-gradient(90deg, #19B6E4 0%, #29D3C0 100%)',
					boxShadow: '0 0 14px rgba(25, 182, 228, 0.5)',
				}}
			/>

			{phases.map((phase, i) => {
				const reached = progress - i;
				const on = interpolate(reached, [-0.42, 0.16], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: EASE.out,
				});
				const pop = interpolate(reached, [-0.1, 0.34], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: EASE.out,
				});
				const cx = TRACK_X + step * i;
				return (
					<div key={phase}>
						{pop > 0 && pop < 1 ? (
							<div
								style={{
									position: 'absolute',
									left: cx - 20 - pop * 46,
									top: Y - 20 - pop * 46,
									width: 40 + pop * 92,
									height: 40 + pop * 92,
									borderRadius: '50%',
									border: '2px solid rgba(25, 182, 228, 0.4)',
									opacity: 1 - pop,
								}}
							/>
						) : null}
						<div
							style={{
								position: 'absolute',
								left: cx - 15,
								top: Y - 15,
								width: 30,
								height: 30,
								borderRadius: '50%',
								background: on > 0.5 ? '#FFFFFF' : '#F2F6FA',
								border: `3px solid ${on > 0.5 ? '#19B6E4' : 'rgba(160,182,204,0.6)'}`,
								boxShadow: on > 0.5 ? '0 0 16px rgba(25,182,228,0.42)' : 'none',
								scale: String(0.86 + on * 0.14),
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: cx - 150,
								top: Y + 44,
								width: 300,
								textAlign: 'center',
								opacity: 0.32 + on * 0.68,
								translate: `0px ${(1 - on) * 12}px`,
								fontFamily: 'Segoe UI',
								fontWeight: 600,
								fontSize: 27,
								letterSpacing: '0.04em',
								color: on > 0.5 ? '#2E343C' : '#93A2B2',
							}}
						>
							{phase}
						</div>
					</div>
				);
			})}

			{(() => {
				const capIn = settle({frame, fps, start: 74, duration: 40, bounce: 10});
				return (
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 760,
							display: 'flex',
							justifyContent: 'center',
							opacity: capIn,
							translate: `0px ${(1 - capIn) * 16}px`,
						}}
					>
						<div
							style={{
								padding: '18px 40px',
								borderRadius: 15,
								background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
								border: '1px solid rgba(198,213,229,0.9)',
								boxShadow: elevation(18),
								fontFamily: 'Segoe UI',
								fontWeight: 400,
								fontSize: 30,
								color: '#3A4450',
							}}
						>
							{caption}
						</div>
					</div>
				);
			})()}
		</AbsoluteFill>
	);
};
