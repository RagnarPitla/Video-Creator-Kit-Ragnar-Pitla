import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {BrandBackdrop} from '../components/BrandBackdrop';
import {Motes} from '../components/Motes';
import {Panel, Row} from '../components/Panel';
import {ProductTile} from '../components/ProductTile';
import {Stage} from '../components/Stage';
import {Thread} from '../components/Thread';
import {elevation, useLook} from '../lib/material';
import {EASE, floatAt, settle} from '../lib/motion';

export const s17Schema = z.object({
	requirements: z.array(z.object({label: z.string(), verdict: z.string()})),
	planTitle: z.string(),
	planSteps: z.array(z.string()),
	optionsTitle: z.string(),
	options: z.array(z.object({name: z.string(), note: z.string()})),
	chosen: z.number(),
	auditTitle: z.string(),
	auditLines: z.array(z.string()),
	caption: z.string(),
	/**
	 * Suppress the plan panel and hold the requirement list resolved.
	 *
	 * V13 replaces the "for fits" half of this scene with the Mia Console
	 * drafting a real configuration plan, per Ashley's 28 Aug note, but she
	 * asked to keep the gaps animation exactly as it is. The scene is entered
	 * partway through with a negative Sequence offset, at which point the plan
	 * panel would still be lit and would repeat what the console just showed.
	 */
	skipPlan: z.boolean().optional(),
});

/**
 * Fit, gap, decision - the thirteen seconds that used to be a screen
 * recording.
 *
 * The narration moves through four claims here and the scene follows them in
 * order rather than showing everything at once: requirements get a verdict,
 * fits become a configuration plan, gaps get three options weighed against
 * each other, and the choice is written down with its reasoning. The audit
 * trail is the point of the passage, so it is the thing left on screen.
 */
export const S17FitGap: React.FC<z.infer<typeof s17Schema>> = ({
	requirements,
	planTitle,
	planSteps,
	optionsTitle,
	options,
	chosen,
	auditTitle,
	auditLines,
	caption,
	skipPlan,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const seconds = frame / fps;
	const look = useLook();

	/** The right-hand half swaps twice: plan -> options -> decision. */
	const planLive = skipPlan
		? 0
		: interpolate(frame, [46, 74, 150, 178], [0, 1, 1, 0], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: EASE.inOut,
			});
	const optLive = interpolate(frame, [162, 194, 286, 312], [0, 1, 1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.inOut,
	});
	const auditLive = interpolate(frame, [298, 330], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	const reqDrift = floatAt(seconds, 3, 5, 7, 0.5);

	return (
		<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
			<Stage vanishX={900} vanishY={500} zoomFrom={1.02} zoomTo={1.09} fieldOpacity={0.52} />
			<BrandBackdrop start={0} strength={0.045} height={1020} x={1010} y={540} />
			<Motes count={24} seed={11} opacity={0.75} />

			<AbsoluteFill>
				<svg width={1920} height={1080} style={{position: 'absolute'}}>
					<Thread
						points={[
							{x: 640, y: 540},
							{x: 810, y: 508},
							{x: 980, y: 540},
							{x: 1140, y: 540},
						]}
						head={interpolate(frame, [40, 96], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						})}
						width={4}
						glowId="s17-bridge"
					/>
				</svg>
			</AbsoluteFill>

			<div
				style={{
					position: 'absolute',
					left: 168 + reqDrift.x,
					top: 300 + reqDrift.y,
				}}
			>
				<Panel title="Requirements" width={452} height={392} padding={22}>
					{requirements.map((req, i) => {
						const land = settle({frame, fps, start: 6 + i * 13, duration: 40, bounce: 11});
						const judged = frame > 58 + i * 13;
						const fit = req.verdict === 'Fit';
						return (
							<div
								key={req.label}
								style={{opacity: land, translate: `0px ${(1 - land) * 14}px`}}
							>
								<Row
									label={req.label}
									meta={judged ? req.verdict : 'Reading'}
									state={judged ? (fit ? 'done' : 'warn') : 'active'}
									size={23}
								/>
							</div>
						);
					})}
				</Panel>
			</div>

			<div
				style={{
					position: 'absolute',
					left: 1140,
					top: 268,
					opacity: planLive,
					translate: `0px ${(1 - planLive) * 26}px`,
					scale: String(0.97 + planLive * 0.03),
				}}
			>
				<Panel title={planTitle} width={548} height={286} padding={24}>
					{planSteps.map((stepText, i) => {
						const land = settle({frame, fps, start: 66 + i * 15, duration: 40, bounce: 10});
						return (
							<div
								key={stepText}
								style={{opacity: land, translate: `0px ${(1 - land) * 14}px`}}
							>
								<Row
									label={stepText}
									meta={frame > 112 + i * 15 ? 'Drafted' : ''}
									state={frame > 112 + i * 15 ? 'done' : 'active'}
									size={23}
								/>
							</div>
						);
					})}
				</Panel>
				{look.logos === 'rich' ? (
					<div style={{position: 'absolute', right: 2, top: -60, display: 'flex', gap: 11}}>
						{['finance', 'supply-chain-management'].map((slug) => (
							<ProductTile key={slug} slug={slug} size={46} bound={1} />
						))}
					</div>
				) : null}
			</div>

			<div
				style={{
					position: 'absolute',
					left: 1074,
					top: 300,
					width: 700,
					opacity: optLive,
					translate: `0px ${(1 - optLive) * 26}px`,
					display: 'flex',
					flexDirection: 'column',
					gap: 16,
				}}
			>
				<div
					style={{
						fontFamily: 'Segoe UI',
						fontWeight: 600,
						fontSize: 20,
						letterSpacing: '0.07em',
						textTransform: 'uppercase',
						color: '#8794A3',
						marginBottom: 4,
					}}
				>
					{optionsTitle}
				</div>
				{options.map((opt, i) => {
					const land = settle({frame, fps, start: 178 + i * 20, duration: 44, bounce: 12});
					const isChosen = i === chosen;
					const mark = interpolate(frame, [262, 288], [0, 1], {
						extrapolateLeft: 'clamp',
						extrapolateRight: 'clamp',
						easing: EASE.out,
					});
					const weight = isChosen ? mark : 0;
					return (
						<div
							key={opt.name}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 20,
								padding: '20px 26px',
								borderRadius: 15,
								opacity: land * (isChosen ? 1 : 1 - mark * 0.55),
								translate: `${(1 - land) * 34}px 0px`,
								background: 'linear-gradient(150deg,#FFFFFF 0%,#F5FAFD 100%)',
								border: `1px solid ${
									weight > 0.5 ? 'rgba(30,195,189,0.75)' : 'rgba(198,213,229,0.9)'
								}`,
								boxShadow: elevation(15 + weight * 8),
								scale: String(1 + weight * 0.02),
							}}
						>
							<div
								style={{
									width: 12,
									height: 12,
									borderRadius: '50%',
									flexShrink: 0,
									background: weight > 0.5 ? '#1EC3BD' : 'rgba(150,170,190,0.55)',
									boxShadow: weight > 0.5 ? '0 0 10px rgba(30,195,189,0.6)' : 'none',
								}}
							/>
							<div style={{display: 'flex', flexDirection: 'column', gap: 3, flex: 1}}>
								<span
									style={{
										fontFamily: 'Segoe UI',
										fontWeight: 400,
										fontSize: 31,
										color: '#2E343C',
									}}
								>
									{opt.name}
								</span>
								<span
									style={{
										fontFamily: 'Segoe UI',
										fontWeight: 300,
										fontSize: 22,
										color: '#7D8998',
									}}
								>
									{opt.note}
								</span>
							</div>
							{weight > 0.4 ? (
								<span
									style={{
										fontFamily: 'Segoe UI',
										fontWeight: 600,
										fontSize: 18,
										letterSpacing: '0.07em',
										color: '#12A79F',
										opacity: (weight - 0.4) / 0.6,
									}}
								>
									SELECTED
								</span>
							) : null}
						</div>
					);
				})}
			</div>

			<div
				style={{
					position: 'absolute',
					left: 1096,
					top: 322,
					opacity: auditLive,
					translate: `0px ${(1 - auditLive) * 24}px`,
				}}
			>
				<Panel title={auditTitle} width={604} height={346} padding={24}>
					{auditLines.map((line, i) => {
						const land = settle({frame, fps, start: 316 + i * 16, duration: 40, bounce: 10});
						return (
							<div
								key={line}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 14,
									opacity: land,
									translate: `0px ${(1 - land) * 12}px`,
									padding: '9px 0',
								}}
							>
								<svg width={20} height={20} viewBox="0 0 20 20">
									<circle cx={10} cy={10} r={9} fill="rgba(30,195,189,0.13)" />
									<path
										d="M5.6 10.2 L8.6 13.2 L14.4 6.9"
										fill="none"
										stroke="#12A79F"
										strokeWidth={2.1}
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeDasharray={14}
										strokeDashoffset={14 * (1 - land)}
									/>
								</svg>
								<span
									style={{
										fontFamily: 'Segoe UI',
										fontWeight: 350,
										fontSize: 25,
										color: '#3A4450',
									}}
								>
									{line}
								</span>
							</div>
						);
					})}
				</Panel>
			</div>

			{(() => {
				const capIn = interpolate(frame, [336, 366], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
					easing: EASE.out,
				});
				return (
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: 96,
							textAlign: 'center',
							opacity: capIn,
							translate: `0px ${(1 - capIn) * 14}px`,
							fontFamily: 'Segoe UI',
							fontWeight: 350,
							fontSize: 42,
							color: '#2E343C',
						}}
					>
						{caption}
					</div>
				);
			})()}
		</AbsoluteFill>
	);
};
