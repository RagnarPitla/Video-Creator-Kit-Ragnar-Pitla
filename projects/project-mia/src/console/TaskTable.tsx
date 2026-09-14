import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, R, SHADOW} from './tokens';
import {EASE} from '../lib/motion';

export type TaskStatus = 'Pending' | 'Running' | 'Completed' | 'Needs you';

export type TaskRow = {
	n: number;
	task: string;
	status: TaskStatus;
	assignee: 'Agent' | 'Consultant' | 'Business Lead' | 'Workstream Lead';
	skill?: string;
	output?: string;
};

const STATUS_STYLE: Record<TaskStatus, {fg: string; bg: string}> = {
	Pending: {fg: C.idle, bg: C.idleSoft},
	Running: {fg: C.info, bg: C.infoSoft},
	Completed: {fg: C.ok, bg: C.okSoft},
	'Needs you': {fg: C.warn, bg: C.warnSoft},
};

const StatusDot: React.FC<{status: TaskStatus; spin?: boolean}> = ({status, spin}) => {
	const frame = useCurrentFrame();
	const s = STATUS_STYLE[status];
	if (status === 'Completed') {
		return (
			<svg width={15} height={15} viewBox="0 0 15 15">
				<circle cx="7.5" cy="7.5" r="7" fill={s.fg} />
				<path d="m4.3 7.7 2.2 2.2 4.3-4.6" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
			</svg>
		);
	}
	if (status === 'Running' && spin) {
		const a = (frame * 7) % 360;
		return (
			<svg width={15} height={15} viewBox="0 0 15 15" style={{transform: `rotate(${a}deg)`}}>
				<circle cx="7.5" cy="7.5" r="6" fill="none" stroke={C.infoSoft} strokeWidth="2.2" />
				<path d="M7.5 1.5a6 6 0 0 1 6 6" fill="none" stroke={s.fg} strokeWidth="2.2" strokeLinecap="round" />
			</svg>
		);
	}
	return (
		<svg width={15} height={15} viewBox="0 0 15 15">
			<circle cx="7.5" cy="7.5" r="5.6" fill="none" stroke={s.fg} strokeWidth="1.8" opacity={0.75} />
		</svg>
	);
};

/**
 * The task table.
 *
 * Column set is the product's: #, TASK, STATUS, ASSIGNEE, SKILL, OUTPUT. The
 * skill column matters more than it looks - `op-playbook-gather-requirements@1`
 * is the thing that tells a technical audience these are versioned, addressable
 * units of work rather than a to-do list with an AI badge on it.
 *
 * `selected` lights a row and draws the left accent bar the product uses.
 * `revealFrom` staggers rows in, 2 frames apart, so a long list assembles
 * rather than appearing. Pass 0 to have the list simply be there.
 */
export const TaskTable: React.FC<{
	rows: TaskRow[];
	selected?: number;
	revealFrom?: number;
	title?: string;
	countLabel?: string;
	spin?: boolean;
	/**
	 * Wave completion strip pinned to the bottom of the table. Real waves carry
	 * up to 21 tasks, so a short list leaves the panel looking half-drawn; the
	 * strip closes it and doubles as the "release wave" affordance.
	 */
	progress?: {done: number; total: number};
}> = ({rows, selected, revealFrom = 0, title, countLabel, spin, progress}) => {
	const frame = useCurrentFrame();

	return (
		<div style={{fontFamily: FONT, height: '100%', display: 'flex', flexDirection: 'column'}}>
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: 14,
					padding: '15px 22px',
					borderBottom: `1px solid ${C.line}`,
					background: C.paper,
				}}
			>
				{(['Status', 'Assignee'] as const).map((f) => (
					<div
						key={f}
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 9,
							padding: '7px 13px',
							borderRadius: R.sm,
							border: `1px solid ${C.line}`,
							fontSize: 14,
							color: C.body,
							minWidth: 132,
						}}
					>
						<span style={{color: C.faint, fontSize: 13}}>{f}</span>
						<span style={{flex: 1, textAlign: 'right'}}>All</span>
						<svg width={11} height={11} viewBox="0 0 11 11">
							<path d="m2.6 4.2 2.9 3 2.9-3" fill="none" stroke={C.mute} strokeWidth="1.5" strokeLinecap="round" />
						</svg>
					</div>
				))}
				<div style={{flex: 1}} />
				{title ? <div style={{fontSize: 15, color: C.ink, fontWeight: 600}}>{title}</div> : null}
				<div style={{fontSize: 14, color: C.mute}}>{countLabel ?? `${rows.length} tasks`}</div>
			</div>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: '52px 1fr 132px 150px 268px 86px',
					padding: '11px 22px',
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: '0.11em',
					color: C.faint,
					borderBottom: `1px solid ${C.line}`,
					background: C.paper,
				}}
			>
				<div>#</div>
				<div>TASK</div>
				<div>STATUS</div>
				<div>ASSIGNEE</div>
				<div>SKILL</div>
				<div>OUTPUT</div>
			</div>

			<div style={{flex: 1, overflow: 'hidden', background: C.paper}}>
				{rows.map((r, i) => {
					const on = selected === r.n;
					const app = revealFrom
						? interpolate(frame, [revealFrom + i * 2, revealFrom + i * 2 + 14], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: EASE.out,
							})
						: 1;
					const s = STATUS_STYLE[r.status];
					return (
						<div
							key={r.n}
							style={{
								display: 'grid',
								gridTemplateColumns: '52px 1fr 132px 150px 268px 86px',
								alignItems: 'center',
								padding: '13px 22px',
								borderBottom: `1px solid ${C.lineSoft}`,
								background: on ? C.brandSoft : 'transparent',
								borderLeft: on ? `3px solid ${C.brand}` : '3px solid transparent',
								opacity: app,
								transform: `translateX(${(1 - app) * -10}px)`,
							}}
						>
							<div style={{color: C.faint, fontSize: 14}}>{r.n}</div>
							<div
								style={{
									color: C.ink,
									fontSize: 15.5,
									fontWeight: on ? 600 : 400,
									paddingRight: 20,
									lineHeight: 1.25,
								}}
							>
								{r.task}
							</div>
							<div style={{display: 'flex', alignItems: 'center', gap: 8}}>
								<StatusDot status={r.status} spin={spin} />
								<span style={{fontSize: 14, color: s.fg}}>{r.status}</span>
							</div>
							<div style={{fontSize: 14, color: C.body}}>{r.assignee}</div>
							<div
								style={{
									fontSize: 13,
									color: C.mute,
									fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
									whiteSpace: 'nowrap',
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									paddingRight: 14,
								}}
							>
								{r.skill ?? '—'}
							</div>
							<div style={{fontSize: 14, color: r.output ? C.brand : C.faint}}>{r.output ?? '—'}</div>
						</div>
					);
				})}
			</div>

			{progress ? <WaveProgress {...progress} revealFrom={revealFrom} /> : null}
		</div>
	);
};

const WaveProgress: React.FC<{done: number; total: number; revealFrom: number}> = ({
	done,
	total,
	revealFrom,
}) => {
	const frame = useCurrentFrame();
	const grow = interpolate(frame, [revealFrom + 14, revealFrom + 52], [0, done / total], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 18,
				padding: '16px 22px',
				borderTop: `1px solid ${C.line}`,
				background: C.paper,
			}}
		>
			<div style={{fontSize: 13.5, color: C.mute, whiteSpace: 'nowrap'}}>
				Wave completion
			</div>
			<div
				style={{
					flex: 1,
					height: 6,
					borderRadius: 999,
					background: C.line,
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						width: `${grow * 100}%`,
						height: '100%',
						borderRadius: 999,
						background: C.brand,
					}}
				/>
			</div>
			<div style={{fontSize: 13.5, color: C.body, whiteSpace: 'nowrap'}}>
				{Math.round(grow * total)} of {total} complete
			</div>
			<div
				style={{
					fontSize: 13.5,
					fontWeight: 600,
					color: C.brand,
					border: `1px solid ${C.brand}`,
					borderRadius: 8,
					padding: '7px 16px',
					whiteSpace: 'nowrap',
				}}
			>
				Release Wave
			</div>
		</div>
	);
};

/**
 * The right-hand task detail panel.
 *
 * Slides in from the right when a row is clicked, which is what the product
 * does. The badge row, DESCRIPTION / SKILL / ATTACHMENTS / DEPENDENCIES /
 * TIMELINE / TASK ID order, and the Edit and Cancel pair at the foot are all
 * from the real panel.
 */
export const TaskPanel: React.FC<{
	title: string;
	badges?: {label: string; tone?: 'idle' | 'info' | 'brand' | 'ok'}[];
	description: string;
	skill?: string;
	dependencies?: string;
	modified?: string;
	taskId?: string;
	/** Frame the panel starts sliding in. */
	at?: number;
	output?: {label: string; kind: string};
}> = ({
	title,
	badges = [],
	description,
	skill,
	dependencies = '2 predecessor(s)',
	modified = 'Aug 27, 01:23 PM',
	taskId = '01f8ad34-55a2-f111-aaae-000d3a5c88d3',
	at = 0,
	output,
}) => {
	const frame = useCurrentFrame();
	const app = interpolate(frame, [at, at + 22], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
		easing: EASE.out,
	});

	const tone = (t?: string) =>
		t === 'info'
			? {fg: C.info, bg: C.infoSoft}
			: t === 'brand'
				? {fg: C.brand, bg: C.brandSoft}
				: t === 'ok'
					? {fg: C.ok, bg: C.okSoft}
					: {fg: C.idle, bg: C.idleSoft};

	const Label: React.FC<{children: React.ReactNode}> = ({children}) => (
		<div
			style={{
				fontSize: 11.5,
				fontWeight: 600,
				letterSpacing: '0.13em',
				color: C.faint,
				marginBottom: 8,
			}}
		>
			{children}
		</div>
	);

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				right: 0,
				bottom: 0,
				width: 520,
				background: C.paper,
				borderLeft: `1px solid ${C.line}`,
				boxShadow: SHADOW.panel,
				fontFamily: FONT,
				padding: '24px 26px',
				opacity: app,
				transform: `translateX(${(1 - app) * 90}px)`,
				display: 'flex',
				flexDirection: 'column',
				gap: 20,
			}}
		>
			<div style={{fontSize: 22, fontWeight: 600, color: C.ink, lineHeight: 1.25, paddingRight: 30}}>
				{title}
			</div>

			{badges.length ? (
				<div style={{display: 'flex', gap: 9, flexWrap: 'wrap'}}>
					{badges.map((b) => {
						const t = tone(b.tone);
						return (
							<span
								key={b.label}
								style={{
									padding: '5px 12px',
									borderRadius: 999,
									background: t.bg,
									color: t.fg,
									fontSize: 13,
									fontWeight: 600,
								}}
							>
								{b.label}
							</span>
						);
					})}
				</div>
			) : null}

			<div>
				<Label>DESCRIPTION</Label>
				<div style={{fontSize: 15, lineHeight: 1.5, color: C.body}}>{description}</div>
			</div>

			{skill ? (
				<div>
					<Label>SKILL</Label>
					<div
						style={{
							fontSize: 14,
							color: C.brand,
							fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
						}}
					>
						{skill}
					</div>
				</div>
			) : null}

			{output ? (
				<div>
					<Label>OUTPUT</Label>
					<div
						style={{
							display: 'flex',
							alignItems: 'center',
							gap: 12,
							padding: '13px 15px',
							borderRadius: R.md,
							border: `1px solid ${C.brandLine}`,
							background: C.brandSoft,
						}}
					>
						<svg width={22} height={22} viewBox="0 0 22 22">
							<path
								d="M6 2.6h7l4 4v12.8a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3.6a1 1 0 0 1 1-1Z"
								fill="#fff"
								stroke={C.brand}
								strokeWidth="1.6"
								strokeLinejoin="round"
							/>
							<path d="M13 2.8V6.8h4" fill="none" stroke={C.brand} strokeWidth="1.6" strokeLinejoin="round" />
						</svg>
						<div style={{flex: 1}}>
							<div style={{fontSize: 14.5, color: C.ink, fontWeight: 600}}>{output.label}</div>
							<div style={{fontSize: 12.5, color: C.mute}}>{output.kind}</div>
						</div>
					</div>
				</div>
			) : null}

			<div>
				<Label>DEPENDENCIES</Label>
				<div style={{fontSize: 14, color: C.mute}}>{dependencies}</div>
			</div>

			<div>
				<Label>TIMELINE</Label>
				<div style={{fontSize: 14, color: C.mute}}>Modified: {modified}</div>
			</div>

			<div>
				<Label>TASK ID</Label>
				<div
					style={{
						fontSize: 12.5,
						color: C.faint,
						fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
					}}
				>
					{taskId}
				</div>
			</div>

			<div style={{flex: 1}} />

			<div style={{display: 'flex', gap: 12}}>
				<div
					style={{
						flex: 1,
						padding: '11px 0',
						textAlign: 'center',
						borderRadius: R.sm,
						border: `1px solid ${C.line}`,
						fontSize: 14.5,
						color: C.body,
					}}
				>
					Edit
				</div>
				<div
					style={{
						width: 132,
						padding: '11px 0',
						textAlign: 'center',
						borderRadius: R.sm,
						border: `1px solid #F0D4D4`,
						color: '#B03434',
						fontSize: 14.5,
					}}
				>
					Cancel
				</div>
			</div>
		</div>
	);
};
