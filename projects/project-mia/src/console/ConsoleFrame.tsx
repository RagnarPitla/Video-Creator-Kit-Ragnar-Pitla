import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, R, SHADOW} from './tokens';
import {EASE} from '../lib/motion';

/**
 * The console shell: left nav, header bar, and a content slot.
 *
 * Laid out at 1920x1080 minus a margin, so the app fills the frame the way it
 * does on a real screen rather than sitting in a browser mock inside a laptop
 * mock. Two nested frames would halve the type again and the type is the
 * evidence.
 *
 * `inset` lifts the whole app off the film's paper by a small margin with a
 * soft shadow. That reads as "a screen" without spending pixels drawing one.
 */

const NAV_MAIN = [
	'Home',
	'Waves',
	'Scope',
	'Phases',
	'Pending Tasks',
	'Team',
	'Files',
	'WatchDog',
	'Settings',
] as const;

const NAV_GLOBAL = ['Connections', 'Connection Sets', 'Connectors', 'Help', 'About'] as const;

/** Nav glyphs, drawn rather than iconfont so they stay crisp at any scale. */
const NavGlyph: React.FC<{name: string; active: boolean}> = ({name, active}) => {
	const s = active ? C.brand : C.mute;
	const common = {
		fill: 'none',
		stroke: s,
		strokeWidth: 1.9,
		strokeLinecap: 'round' as const,
		strokeLinejoin: 'round' as const,
	};
	return (
		<svg width={20} height={20} viewBox="0 0 20 20">
			{name === 'Home' ? (
				<path d="M3.4 8.6 10 3.4l6.6 5.2V16a1 1 0 0 1-1 1h-3.2v-4.4H7.6V17H4.4a1 1 0 0 1-1-1Z" {...common} />
			) : name === 'Waves' ? (
				<>
					<path d="M2.6 7.2c1.5-1.7 3-1.7 4.5 0s3 1.7 4.5 0 3-1.7 4.5 0" {...common} />
					<path d="M2.6 12.2c1.5-1.7 3-1.7 4.5 0s3 1.7 4.5 0 3-1.7 4.5 0" {...common} />
				</>
			) : name === 'Scope' ? (
				<>
					<circle cx="10" cy="10" r="6.6" {...common} />
					<circle cx="10" cy="10" r="2.4" {...common} />
				</>
			) : name === 'Phases' ? (
				<>
					<path d="M3.6 16.4V9.2M8.6 16.4V4.6M13.6 16.4v-5" {...common} />
				</>
			) : name === 'Pending Tasks' ? (
				<path d="m3.8 10.4 3.4 3.4 9-9" {...common} />
			) : name === 'Team' ? (
				<>
					<circle cx="7.6" cy="7.6" r="2.7" {...common} />
					<path d="M3 16.4c.6-2.6 2.4-3.9 4.6-3.9s4 1.3 4.6 3.9" {...common} />
					<path d="M13.2 6.2a2.6 2.6 0 0 1 0 5M14.2 12.9c1.6.5 2.6 1.7 3 3.5" {...common} />
				</>
			) : name === 'Files' ? (
				<path d="M5 3.2h5.4l4.2 4.2v9.4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4.2a1 1 0 0 1 1-1Zm5.2.4v4.2h4.2" {...common} />
			) : name === 'WatchDog' ? (
				<>
					<circle cx="10" cy="10" r="6.6" {...common} />
					<path d="M10 5.8v4.4l2.8 1.7" {...common} />
				</>
			) : name === 'Settings' ? (
				<>
					<circle cx="10" cy="10" r="2.6" {...common} />
					<path d="M10 2.6v2M10 15.4v2M17.4 10h-2M4.6 10h-2M15.2 4.8l-1.4 1.4M6.2 13.8l-1.4 1.4M15.2 15.2l-1.4-1.4M6.2 6.2 4.8 4.8" {...common} />
				</>
			) : (
				<circle cx="10" cy="10" r="6.4" {...common} />
			)}
		</svg>
	);
};

export const ConsoleFrame: React.FC<{
	/** Which nav item is lit. */
	active?: string;
	/** Breadcrumb after the product name. */
	project?: string;
	/** Playbook chip in the header. */
	playbook?: string;
	/** Count badge on Scope. */
	scopeCount?: number;
	/** Frame at which the shell finishes assembling. Set 0 for an instant cut. */
	buildIn?: number;
	/**
	 * Space left under the app for a caption. The film's captions are 40px and
	 * sit on the paper, not on the app, so the shell has to give the band back
	 * rather than have type cross the panel edge.
	 */
	bottomInset?: number;
	children?: React.ReactNode;
}> = ({
	active = 'Waves',
	project = 'Zava_Fashion_01',
	playbook = 'Success by Design - Mia EAP - End to End',
	scopeCount = 4,
	buildIn = 18,
	bottomInset = 46,
	children,
}) => {
	const frame = useCurrentFrame();

	const app = buildIn
		? interpolate(frame, [0, buildIn], [0, 1], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
				easing: EASE.out,
			})
		: 1;

	return (
		<div
			style={{
				position: 'absolute',
				top: 46,
				left: 46,
				right: 46,
				bottom: bottomInset,
				borderRadius: R.xl,
				background: C.paper,
				boxShadow: SHADOW.float,
				overflow: 'hidden',
				display: 'flex',
				fontFamily: FONT,
				opacity: app,
				transform: `translateY(${(1 - app) * 16}px) scale(${0.994 + app * 0.006})`,
			}}
		>
			{/* ---------------------------------------------------- left nav */}
			<div
				style={{
					width: 232,
					flexShrink: 0,
					background: C.rail,
					borderRight: `1px solid ${C.line}`,
					padding: '26px 0',
				}}
			>
				<div style={{padding: '0 20px 22px', display: 'flex', alignItems: 'center', gap: 11}}>
					<div
						style={{
							width: 34,
							height: 34,
							borderRadius: 9,
							background: C.brand,
							color: '#fff',
							fontWeight: 600,
							fontSize: 19,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						M
					</div>
					<div style={{fontWeight: 600, fontSize: 19, color: C.ink, letterSpacing: '-0.01em'}}>
						Mia Console
					</div>
				</div>

				<div
					style={{
						padding: '0 20px 9px',
						fontSize: 11.5,
						fontWeight: 600,
						letterSpacing: '0.13em',
						color: C.faint,
					}}
				>
					MENU
				</div>

				{NAV_MAIN.map((n) => {
					const on = n === active;
					return (
						<div
							key={n}
							style={{
								margin: '0 12px 2px',
								padding: '9px 10px',
								borderRadius: R.sm,
								display: 'flex',
								alignItems: 'center',
								gap: 11,
								background: on ? C.brandSoft : 'transparent',
								color: on ? C.brand : C.body,
								fontWeight: on ? 600 : 400,
								fontSize: 15.5,
							}}
						>
							<NavGlyph name={n} active={on} />
							<span style={{flex: 1}}>{n === 'Pending Tasks' ? 'Pending Tasks (0)' : n}</span>
							{n === 'Scope' && scopeCount ? (
								<span
									style={{
										minWidth: 21,
										height: 21,
										borderRadius: 999,
										background: C.brand,
										color: '#fff',
										fontSize: 12,
										fontWeight: 600,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									{scopeCount}
								</span>
							) : null}
						</div>
					);
				})}

				<div
					style={{
						padding: '22px 20px 9px',
						fontSize: 11.5,
						fontWeight: 600,
						letterSpacing: '0.13em',
						color: C.faint,
					}}
				>
					GLOBAL
				</div>
				{NAV_GLOBAL.map((n) => (
					<div
						key={n}
						style={{
							margin: '0 12px 2px',
							padding: '9px 10px',
							borderRadius: R.sm,
							display: 'flex',
							alignItems: 'center',
							gap: 11,
							color: C.body,
							fontSize: 15.5,
						}}
					>
						<NavGlyph name={n} active={false} />
						{n}
					</div>
				))}
			</div>

			{/* --------------------------------------------------- main area */}
			<div style={{flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0}}>
				<div
					style={{
						height: 66,
						flexShrink: 0,
						borderBottom: `1px solid ${C.line}`,
						display: 'flex',
						alignItems: 'center',
						padding: '0 22px',
						gap: 14,
						background: C.paper,
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 9, fontSize: 16.5}}>
						<span style={{fontWeight: 600, color: C.ink}}>Mia Console</span>
						<span style={{color: C.faint}}>/</span>
						<span style={{color: C.body}}>{project}</span>
					</div>

					<div style={{flex: 1}} />

					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 8,
							padding: '7px 13px',
							borderRadius: 999,
							border: `1px solid ${C.line}`,
							fontSize: 13.5,
							color: C.body,
							maxWidth: 430,
							whiteSpace: 'nowrap',
							overflow: 'hidden',
							textOverflow: 'ellipsis',
						}}
					>
						<svg width={14} height={14} viewBox="0 0 14 14">
							<rect x="1.6" y="2.2" width="10.8" height="9.6" rx="1.6" fill="none" stroke={C.mute} strokeWidth="1.5" />
							<path d="M4.2 5.4h5.6M4.2 8h3.6" stroke={C.mute} strokeWidth="1.5" strokeLinecap="round" />
						</svg>
						{playbook}
					</div>

					<div
						style={{
							padding: '9px 17px',
							borderRadius: R.sm,
							background: C.brand,
							color: '#fff',
							fontSize: 14.5,
							fontWeight: 600,
						}}
					>
						+ New Project
					</div>
				</div>

				<div style={{flex: 1, minHeight: 0, background: C.shell, position: 'relative'}}>{children}</div>
			</div>
		</div>
	);
};

/**
 * The env pill that sits above the app in the real product.
 * Small, but it is the detail that says "this is a running environment".
 */
export const EnvPill: React.FC<{env?: string}> = ({env = 'MIA-DEV-MAIN'}) => (
	<div
		style={{
			position: 'absolute',
			top: 12,
			left: 0,
			right: 0,
			display: 'flex',
			justifyContent: 'center',
			fontFamily: FONT,
			fontSize: 12.5,
			letterSpacing: '0.2em',
			color: C.faint,
			gap: 9,
			alignItems: 'center',
		}}
	>
		<span style={{width: 6, height: 6, borderRadius: 999, background: '#E8B23A'}} />
		ENV · {env}
		<span style={{width: 6, height: 6, borderRadius: 999, background: '#E8B23A'}} />
	</div>
);
