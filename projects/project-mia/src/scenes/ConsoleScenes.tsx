import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {ConsoleFrame, EnvPill} from '../console/ConsoleFrame';
import {TaskTable, TaskPanel, type TaskRow} from '../console/TaskTable';
import {ArtifactSheet, SheetGrid, Cursor} from '../console/Artifact';
import {C, FONT, R} from '../console/tokens';
import {EASE} from '../lib/motion';

/**
 * The console scenes Ashley asked for in the 28 Aug review.
 *
 * Her request was consistent across five separate notes, and it is worth
 * stating as one rule because it drove every layout here: show the task, then
 * show the artefact the task produced. "I want to show tasks and then I want
 * to show the artifacts that it generates." A task list on its own is a
 * project plan, which no one finds surprising. The artefact on its own could
 * have been written by a person. The two next to each other, with the click
 * between them, are the only way to show that the work was done rather than
 * scheduled.
 *
 * So each scene is the same three beats: a real task row, a click, a document
 * that grows out of the row. What changes is the artefact.
 */

const Caption: React.FC<{at: number; text: string; sub?: string}> = ({at, text, sub}) => {
	const frame = useCurrentFrame();
	const app = interpolate(frame, [at, at + 24], [0, 1], {
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
				bottom: 44,
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: 4,
				opacity: app,
				transform: `translateY(${(1 - app) * 12}px)`,
				fontFamily: FONT,
				pointerEvents: 'none',
			}}
		>
			<div
				style={{
					fontSize: 40,
					lineHeight: 1.25,
					fontWeight: 350,
					color: '#2E343C',
					letterSpacing: '-0.012em',
				}}
			>
				{text}
			</div>
			{sub ? <div style={{fontSize: 21, color: '#7B8492'}}>{sub}</div> : null}
		</div>
	);
};

/** Bottom band the captions live in, so the app never sits under type. */
const CAP_INSET = 152;

/** Backdrop shared by every console scene, so cuts between them do not flash. */
const Deck: React.FC<{children: React.ReactNode}> = ({children}) => (
	<AbsoluteFill style={{backgroundColor: '#EEF3F8'}}>
		<EnvPill />
		{children}
	</AbsoluteFill>
);

/* ------------------------------------------------------------------ fits */

const FIT_TASKS: TaskRow[] = [
	{
		n: 1,
		task: 'Draft configuration plan — Three-way invoice match',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-playbook-draft-config-plan@2',
		output: 'Plan',
	},
	{
		n: 2,
		task: 'Draft configuration plan — Vendor payment terms',
		status: 'Running',
		assignee: 'Agent',
		skill: 'op-playbook-draft-config-plan@2',
	},
	{
		n: 3,
		task: 'Draft configuration plan — Purchase requisition workflow',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-playbook-draft-config-plan@2',
	},
	{
		n: 4,
		task: 'Review and approve configuration plan',
		status: 'Pending',
		assignee: 'Workstream Lead',
	},
	{
		n: 5,
		task: 'Apply configuration to DEV and record evidence',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-platform-apply-configuration@1',
	},
	{
		n: 6,
		task: 'Business sign-off — Record to Report',
		status: 'Pending',
		assignee: 'Business Lead',
	},
	{
		n: 7,
		task: 'Draft configuration plan — Fixed asset depreciation profiles',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-playbook-draft-config-plan@2',
	},
	{
		n: 8,
		task: 'Draft configuration plan — Bank reconciliation matching rules',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-playbook-draft-config-plan@2',
	},
	{
		n: 9,
		task: 'Resolve open questions — Intercompany posting profiles',
		status: 'Pending',
		assignee: 'Consultant',
		skill: 'op-platform-coverage-shortfall-question-generator@3',
	},
	{
		n: 10,
		task: 'Draft configuration plan — Ledger allocation rules',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-playbook-draft-config-plan@2',
	},
	{
		n: 11,
		task: 'Regression test — Record to Report core flows',
		status: 'Pending',
		assignee: 'Consultant',
	},
	{
		n: 12,
		task: 'Publish configuration evidence to project workspace',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-platform-publish-evidence@1',
	},
];

/**
 * "For fits, Mia drafts configuration plans for expert approval."
 *
 * Ashley: show a draft configuration plan task, click it, show the document
 * that was created, then go in on the recommendation, the requirements and the
 * impact analysis. She flagged this one as ahead of the product - "I know this
 * isn't how it looks today, but that's the vision" - so the impact analysis
 * block is the part that is proposed rather than shipped.
 *
 * The impact rows are the argument. A configuration plan that only says what
 * to set is a form; one that says what else moves when you set it is the thing
 * a functional consultant currently spends a week working out by hand.
 */
export const SceneConfigPlanDraft: React.FC = () => (
	<Deck>
		<ConsoleFrame active="Waves" project="Zava_Fashion_01" scopeCount={4} bottomInset={CAP_INSET}>
			<TaskTable
				rows={FIT_TASKS}
				selected={1}
				title="Wave 2A — Foundation & Record to Report"
				countLabel="12 tasks"
				spin
				progress={{done: 1, total: 12}}
			/>
		</ConsoleFrame>

		<ArtifactSheet
			at={44}
			title="Configuration Plan — Three-way invoice match"
			subtitle="Accounts payable · Record to Report · Wave 2A"
			origin={{x: 620, y: 300}}
			width={1360}
			zoom={{at: 92, scale: 1.2, x: 900, y: 700}}
		>
			<div style={{padding: '24px 32px', fontFamily: FONT}}>
				<div style={{display: 'flex', gap: 34}}>
					<div style={{flex: 1}}>
						<Field label="RECOMMENDATION">
							Enable three-way matching on all purchase-order invoices with a two percent price
							tolerance and a zero percent quantity tolerance.
						</Field>
						<Field label="REQUIREMENT">
							REQ-0142 · Invoices must not post above agreed price without approval.
							<span style={{color: C.brand}}> Linked to workshop transcript, 14 Aug.</span>
						</Field>
					</div>
					<div style={{width: 352}}>
						<Field label="SETTING">
							<Mono>AP &gt; Setup &gt; Parameters &gt; Invoice matching</Mono>
							<Mono>Matching policy = Three-way</Mono>
							<Mono>Price tolerance = 2.00%</Mono>
						</Field>
					</div>
				</div>

				<div style={{marginTop: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12}}>
					<div style={{fontSize: 12.5, fontWeight: 600, letterSpacing: '0.13em', color: C.faint}}>
						IMPACT ANALYSIS
					</div>
					<div style={{flex: 1, height: 1, background: C.line}} />
					<span
						style={{
							fontSize: 12.5,
							fontWeight: 600,
							color: C.brand,
							background: C.brandSoft,
							padding: '4px 11px',
							borderRadius: 999,
						}}
					>
						4 downstream effects found
					</span>
				</div>

				<SheetGrid
					revealFrom={70}
					columns={[
						{label: 'AREA', w: 244},
						{label: 'EFFECT', w: 610},
						{label: 'SEVERITY', w: 168},
						{label: 'OWNER', w: 274},
					]}
					rows={[
						[
							'Procurement',
							'PO receipt must be posted before invoice, changing dock-to-stock sequence',
							{v: 'High', tone: 'warn'},
							'M. Okafor',
						],
						[
							'Vendor master',
							'118 vendors carry no tolerance group and will inherit the default',
							{v: 'Medium', tone: 'warn'},
							'Data migration',
						],
						['Integration', 'EDI invoice feed must send quantity received', {v: 'Medium', tone: 'warn'}, 'Integration'],
						['Reporting', 'Adds a matching-exception measure to the AP dashboard', {v: 'Low', tone: 'ok'}, 'Analytics'],
					]}
				/>
			</div>
		</ArtifactSheet>

		<Cursor
			path={[
				{at: 8, x: 640, y: 470},
				{at: 26, x: 604, y: 300, click: true},
			]}
			hideAfter={44}
		/>

		<Sequence from={0} durationInFrames={46}>
			<Caption at={4} text="For fits, Mia drafts the plan." />
		</Sequence>
	</Deck>
);

const Field: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
	<div style={{marginBottom: 18}}>
		<div
			style={{
				fontSize: 12.5,
				fontWeight: 600,
				letterSpacing: '0.13em',
				color: C.faint,
				marginBottom: 7,
			}}
		>
			{label}
		</div>
		<div style={{fontSize: 17, lineHeight: 1.45, color: C.body}}>{children}</div>
	</div>
);

const Mono: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div
		style={{
			fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
			fontSize: 14,
			color: C.ink,
			background: '#F4F6FA',
			border: `1px solid ${C.line}`,
			borderRadius: R.sm,
			padding: '8px 11px',
			marginBottom: 6,
		}}
	>
		{children}
	</div>
);

/* --------------------------------------------------------------- go-live */

const CUTOVER_TASKS: TaskRow[] = [
	{
		n: 1,
		task: 'Load opening balances — GL',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-migration-load@4',
		output: 'Log',
	},
	{
		n: 2,
		task: 'Add to cut-over plan — Customer, address and contact',
		status: 'Running',
		assignee: 'Agent',
		skill: 'op-platform-cutover-planner@1',
	},
	{
		n: 3,
		task: 'Build tailored training guide — Order to cash',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-platform-training-author@2',
	},
	{n: 4, task: 'Business sign-off on cut-over rehearsal', status: 'Pending', assignee: 'Business Lead'},
];

/**
 * "As go-live approaches, Mia coordinates cut-over and user readiness while
 * creating tailored training guides and videos."
 *
 * Ashley offered two options for this beat and asked for either. Both are
 * here, because they are the two halves of the sentence: the cut-over plan
 * with load order and dependencies, then the training guide the same task tree
 * produces. Showing only one leaves half the narration unillustrated.
 *
 * The dependency column is the point. Anyone can list what to load; the risk
 * in a cut-over weekend is loading it in the wrong order.
 */
export const SceneCutover: React.FC = () => (
	<Deck>
		<ConsoleFrame active="Waves" project="Zava_Fashion_01" scopeCount={4} bottomInset={CAP_INSET}>
			<TaskTable rows={CUTOVER_TASKS} selected={2} title="Wave 5C — Customer, Address and Contact" spin />
		</ConsoleFrame>

		<ArtifactSheet
			at={26}
			title="Cut-over plan — go-live weekend"
			subtitle="Sequenced by dependency · 10 of 34 steps shown"
			origin={{x: 620, y: 336}}
			width={1340}
		>
			<div style={{padding: '20px 30px', fontFamily: FONT}}>
				<SheetGrid
					revealFrom={44}
					revealStep={3}
					columns={[
						{label: 'STEP', w: 86},
						{label: 'DATA SET', w: 396},
						{label: 'VOLUME', w: 168},
						{label: 'DEPENDS ON', w: 404},
						{label: 'WINDOW', w: 226},
					]}
					rows={[
						['1', 'Chart of accounts', '1,240 rows', '—', 'Fri 18:00'],
						['2', 'Customer master', '48,902 rows', 'Step 1', 'Fri 19:30'],
						['3', 'Addresses and contacts', '61,455 rows', {v: 'Step 2', tone: 'brand'}, 'Fri 21:00'],
						['4', 'Open AR transactions', '12,088 rows', {v: 'Steps 1, 2', tone: 'brand'}, 'Sat 02:00'],
						['5', 'Product master', '9,301 rows', 'Step 1', 'Sat 04:30'],
						['6', 'Opening balances — GL', '3,776 rows', {v: 'Steps 1, 4', tone: 'warn'}, 'Sat 07:00'],
						['7', 'On-hand inventory by site', '27,410 rows', {v: 'Step 5', tone: 'brand'}, 'Sat 09:00'],
						['8', 'Open sales orders', '6,842 rows', {v: 'Steps 2, 5', tone: 'brand'}, 'Sat 11:30'],
						['9', 'Open purchase orders', '4,118 rows', 'Step 5', 'Sat 13:00'],
						['10', 'Fixed assets and depreciation', '2,265 rows', {v: 'Steps 1, 6', tone: 'warn'}, 'Sat 15:00'],
					]}
				/>
			</div>
		</ArtifactSheet>

		<Cursor
			path={[
				{at: 4, x: 660, y: 440},
				{at: 16, x: 620, y: 338, click: true},
			]}
			hideAfter={26}
		/>

		<Sequence from={0} durationInFrames={26}>
			<Caption at={2} text="Mia sequences the cut-over." />
		</Sequence>
	</Deck>
);

/**
 * The second half of the go-live beat: the training guide.
 *
 * A recorded walkthrough is a video inside a video, which reads badly and is
 * unreadable at any size that leaves room for the console. So it is a step
 * list with the current step lit and a frame counter running - the shape of a
 * task recording without the nesting.
 */
/**
 * A rendition of the F&O screen the training guide is walking through.
 *
 * Ashley asked for "a task recording type thing of walking a user through the
 * process, like click here, click here". A real capture would be 12px type and
 * unreadable projected, so the app is redrawn at film scale and the highlight
 * moves with the lit step.
 */
const FnOMock: React.FC<{step: number}> = ({step}) => {
	const frame = useCurrentFrame();
	const pulse = 0.5 + 0.5 * Math.sin(frame / 7);

	const ring = (on: boolean): React.CSSProperties =>
		on
			? {
					boxShadow: `0 0 0 ${2 + pulse * 2}px rgba(108,63,214,${0.18 + pulse * 0.22})`,
					borderColor: C.brand,
				}
			: {};

	const cell: React.CSSProperties = {
		border: `1px solid ${C.line}`,
		borderRadius: R.sm,
		background: '#fff',
		padding: '9px 12px',
		fontSize: 15,
		color: C.ink,
		transition: 'none',
	};

	return (
		<div style={{padding: 18, fontFamily: FONT}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14}}>
				<div style={{fontSize: 13, color: C.faint, ...(step === 0 ? {color: C.brand, fontWeight: 600} : {})}}>
					Accounts receivable &gt; Orders &gt; All sales orders
				</div>
			</div>

			<div style={{display: 'flex', gap: 9, marginBottom: 16}}>
				{['New', 'Edit', 'Delete', 'Invoice', 'Post'].map((b) => {
					const on = (step === 1 && b === 'New') || (step === 3 && b === 'Post');
					return (
						<div
							key={b}
							style={{
								fontSize: 14,
								fontWeight: on ? 600 : 400,
								color: on ? '#fff' : C.body,
								background: on ? C.brand : '#F2F4F8',
								border: `1px solid ${on ? C.brand : C.line}`,
								borderRadius: R.sm,
								padding: '8px 15px',
								...(on ? ring(true) : {}),
							}}
						>
							{b}
						</div>
					);
				})}
			</div>

			<div style={{display: 'flex', gap: 12, marginBottom: 8}}>
				<div style={{flex: 1}}>
					<div style={{fontSize: 12, color: C.faint, marginBottom: 5}}>SALES ORDER</div>
					<div style={cell}>SO-2026-0417</div>
				</div>
				<div style={{flex: 1.4}}>
					<div style={{fontSize: 12, color: C.faint, marginBottom: 5}}>CUSTOMER ACCOUNT</div>
					<div style={{...cell, ...ring(step === 1)}}>
						{step >= 1 ? 'ZV-1004 · Northwind Retail' : ''}
					</div>
				</div>
			</div>

			<div style={{fontSize: 12, color: C.faint, margin: '16px 0 6px'}}>LINES</div>
			<div style={{...cell, padding: 0, overflow: 'hidden', ...ring(step === 2)}}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.9fr',
						fontSize: 12,
						color: C.faint,
						padding: '9px 12px',
						borderBottom: `1px solid ${C.line}`,
						background: '#F8F9FC',
					}}
				>
					<div>ITEM</div>
					<div>QTY</div>
					<div>SITE</div>
					<div style={{textAlign: 'right'}}>NET AMOUNT</div>
				</div>
				{(step >= 2
					? [
							['ZV001 Woven Leather Carryall', '12', 'DC-01', '3,588.00'],
							['ZV004 Leather Chukka Boot', '30', 'DC-01', '5,970.00'],
						]
					: [['', '', '', '']]
				).map((r, i) => (
					<div
						key={i}
						style={{
							display: 'grid',
							gridTemplateColumns: '1.6fr 0.6fr 0.8fr 0.9fr',
							fontSize: 14.5,
							color: C.ink,
							padding: '11px 12px',
							borderTop: i ? `1px solid ${C.line}` : undefined,
						}}
					>
						<div>{r[0]}</div>
						<div>{r[1]}</div>
						<div>{r[2]}</div>
						<div style={{textAlign: 'right'}}>{r[3]}</div>
					</div>
				))}
			</div>

			<div
				style={{
					marginTop: 14,
					display: 'flex',
					justifyContent: 'flex-end',
					gap: 22,
					fontSize: 14.5,
					color: step >= 2 ? C.ink : 'transparent',
				}}
			>
				<span style={{color: C.mute}}>Order total</span>
				<span style={{fontWeight: 600}}>9,558.00 USD</span>
			</div>

			{step === 3 ? (
				<div
					style={{
						marginTop: 18,
						display: 'flex',
						alignItems: 'center',
						gap: 10,
						fontSize: 14.5,
						color: C.ok,
						fontWeight: 600,
					}}
				>
					<span
						style={{
							width: 20,
							height: 20,
							borderRadius: 999,
							background: C.ok,
							color: '#fff',
							fontSize: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						✓
					</span>
					Invoice posted · IN-2026-0417
				</div>
			) : null}
		</div>
	);
};

export const SceneTrainingGuide: React.FC = () => {
	const frame = useCurrentFrame();
	// 12 to 86, not 30 to 118: this scene gets 95 frames in the split go-live
	// slot, so a step that does not start until 96 never plays at all.
	const step = Math.min(3, Math.floor(interpolate(frame, [12, 86], [0, 4], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	})));

	const STEPS = [
		'Open Accounts receivable, then Orders, then All sales orders',
		'Select New, then pick the customer account',
		'Add the item, quantity and site, then confirm the line',
		'Select Invoice, then Post to complete the order',
	];

	return (
		<Deck>
			<ConsoleFrame active="Files" project="Zava_Fashion_01" scopeCount={4} bottomInset={CAP_INSET}>
				<div style={{padding: 34, fontFamily: FONT, height: '100%'}}>
					<div style={{fontSize: 26, fontWeight: 600, color: C.ink, marginBottom: 5}}>
						Create a sales order
					</div>
					<div style={{fontSize: 16, color: C.mute, marginBottom: 24}}>
						Tailored training guide · generated from the configuration your team approved
					</div>

					<div style={{display: 'flex', gap: 30, height: 'calc(100% - 108px)'}}>
						<div style={{width: 620}}>
							{STEPS.map((s, i) => {
								const on = i === step;
								const done = i < step;
								return (
									<div
										key={s}
										style={{
											display: 'flex',
											gap: 14,
											padding: '15px 17px',
											marginBottom: 9,
											borderRadius: R.md,
											background: on ? C.brandSoft : 'transparent',
											border: `1px solid ${on ? C.brandLine : 'transparent'}`,
											alignItems: 'flex-start',
										}}
									>
										<div
											style={{
												width: 27,
												height: 27,
												borderRadius: 999,
												flexShrink: 0,
												background: done ? C.ok : on ? C.brand : C.idleSoft,
												color: done || on ? '#fff' : C.mute,
												fontSize: 14,
												fontWeight: 600,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											{done ? '✓' : i + 1}
										</div>
										<div
											style={{
												fontSize: 17,
												lineHeight: 1.4,
												color: on ? C.ink : C.body,
												fontWeight: on ? 600 : 400,
											}}
										>
											{s}
										</div>
									</div>
								);
							})}
						</div>

						{/* The recording surface. A rendition of the app being driven, not a
						    nested video: readable at projector size, and honest about being
						    a guide rather than a capture. */}
						<div
							style={{
								flex: 1,
								borderRadius: R.md,
								border: `1px solid ${C.line}`,
								background: '#FCFCFE',
								position: 'relative',
								overflow: 'hidden',
							}}
						>
							<div
								style={{
									height: 42,
									borderBottom: `1px solid ${C.line}`,
									display: 'flex',
									alignItems: 'center',
									padding: '0 15px',
									gap: 9,
									background: '#F7F8FB',
								}}
							>
								<span style={{width: 9, height: 9, borderRadius: 999, background: '#E05B5B'}} />
								<span style={{fontSize: 13, color: C.mute, letterSpacing: '0.1em'}}>
									RECORDING · STEP {step + 1} OF 4
								</span>
							</div>

							<FnOMock step={step} />

							{/* The pointer inside the guide, landing on the control the lit
							    step names: breadcrumb, New, the line grid, then Post. */}
							<svg
								width={26}
								height={33}
								viewBox="0 0 30 38"
								style={{
									position: 'absolute',
									left: [72, 42, 206, 320][step],
									top: [62, 100, 292, 100][step],
									filter: 'drop-shadow(0 3px 6px rgba(31,36,48,0.34))',
								}}
							>
								<path
									d="M3 2.2 3 27.4l6.2-6.1 4.1 9.6 5.2-2.2-4-9.4 8.6-.1Z"
									fill="#fff"
									stroke="#1F2430"
									strokeWidth="1.9"
									strokeLinejoin="round"
								/>
							</svg>
						</div>
					</div>
				</div>
			</ConsoleFrame>

			<Caption at={8} text="And writes the training for it." />
		</Deck>
	);
};

/* ------------------------------------------------- mia today: ingest */

/**
 * "Today, Mia begins by consuming project documentation."
 *
 * Ashley: "I wanted to show not all of this, but like all of this being filled
 * in and then showing, choosing a SharePoint site. I want that to be the part
 * where it says consuming project documentation."
 *
 * So the beat is the intake form completing itself and then a source being
 * picked. The form fills field by field rather than all at once, because the
 * point is that Mia is reading, not that a form exists.
 */
export const SceneDocIngest: React.FC = () => {
	const frame = useCurrentFrame();

	const FIELDS: [string, string][] = [
		['Project name', 'Zava_Fashion_01'],
		['Customer', 'Zava Fashion Group'],
		['Industry', 'Retail and consumer goods'],
		['Products in scope', 'Finance · Supply Chain · Commerce'],
		['Legal entities', '3 · US, DE, SG'],
		['Target go-live', '14 March 2027'],
	];

	const filled = interpolate(frame, [16, 92], [0, FIELDS.length], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<Deck>
			<ConsoleFrame active="Scope" project="New project" scopeCount={4} bottomInset={CAP_INSET}>
				<div style={{padding: 34, fontFamily: FONT, height: '100%', display: 'flex', gap: 34}}>
					<div style={{flex: 1.15}}>
						<div style={{fontSize: 26, fontWeight: 600, color: C.ink, marginBottom: 5}}>
							Project charter
						</div>
						<div style={{fontSize: 16, color: C.mute, marginBottom: 26}}>
							Read from the documents you already have
						</div>

						{FIELDS.map(([label, value], i) => {
							const on = filled > i;
							const app = interpolate(filled, [i, i + 0.8], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							});
							return (
								<div key={label} style={{marginBottom: 15}}>
									<div style={{fontSize: 12.5, color: C.faint, marginBottom: 6, letterSpacing: '0.08em'}}>
										{label.toUpperCase()}
									</div>
									<div
										style={{
											border: `1px solid ${on ? C.brandLine : C.line}`,
											background: on ? C.brandSoft : '#fff',
											borderRadius: R.sm,
											padding: '11px 14px',
											fontSize: 16,
											color: C.ink,
											minHeight: 22,
										}}
									>
										<span style={{opacity: app}}>{value}</span>
									</div>
								</div>
							);
						})}
					</div>

					<div style={{flex: 1}}>
						<div style={{fontSize: 12.5, color: C.faint, letterSpacing: '0.13em', marginBottom: 12}}>
							DOCUMENT SOURCE
						</div>
						{[
							['SharePoint site', 'zavafashion.sharepoint.com/sites/D365-Programme', true],
							['Teams channel', 'Zava D365 · Discovery', false],
							['Local upload', 'Drag files here', false],
						].map(([label, sub, isPicked], i) => {
							const picked = Boolean(isPicked) && frame > 104;
							return (
								<div
									key={String(label)}
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 14,
										border: `1px solid ${picked ? C.brand : C.line}`,
										background: picked ? C.brandSoft : '#fff',
										borderRadius: R.md,
										padding: '16px 18px',
										marginBottom: 11,
										opacity: interpolate(frame, [24 + i * 8, 42 + i * 8], [0, 1], {
											extrapolateLeft: 'clamp',
											extrapolateRight: 'clamp',
										}),
									}}
								>
									<div
										style={{
											width: 20,
											height: 20,
											borderRadius: 999,
											border: `2px solid ${picked ? C.brand : C.idle}`,
											background: picked ? C.brand : 'transparent',
											flexShrink: 0,
										}}
									/>
									<div>
										<div style={{fontSize: 16, color: C.ink, fontWeight: picked ? 600 : 400}}>
											{label}
										</div>
										<div style={{fontSize: 13.5, color: C.mute}}>{sub}</div>
									</div>
								</div>
							);
						})}

						{frame > 118 ? (
							<div
								style={{
									marginTop: 16,
									display: 'flex',
									alignItems: 'center',
									gap: 11,
									fontSize: 15,
									color: C.brand,
									fontWeight: 600,
								}}
							>
								<Spinner />
								Reading 47 documents · 1,204 pages
							</div>
						) : null}

						{/* What it is actually reading. The claim "consuming project
						    documentation" is abstract until the file names are the ones
						    every D365 programme already has on its SharePoint. */}
						<div style={{marginTop: 20}}>
							{[
								['Zava — Statement of Work v3.docx', 'SoW · 62 pages'],
								['Discovery workshop — Order to Cash.docx', 'Transcript · 18 pages'],
								['AS-IS process maps.vsdx', 'Process · 34 diagrams'],
								['RFP response — final.pdf', 'RFP · 140 pages'],
								['Legacy AX 2012 entity list.xlsx', 'Data · 34 entities'],
								['Integration inventory.xlsx', 'Interfaces · 22 systems'],
							].map(([name, meta], i) => {
								const app = interpolate(frame, [124 + i * 7, 142 + i * 7], [0, 1], {
									extrapolateLeft: 'clamp',
									extrapolateRight: 'clamp',
									easing: EASE.out,
								});
								return (
									<div
										key={name}
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: 13,
											padding: '10px 2px',
											borderBottom: `1px solid ${C.lineSoft}`,
											opacity: app,
											transform: `translateX(${(1 - app) * 14}px)`,
										}}
									>
										<span
											style={{
												width: 16,
												height: 16,
												borderRadius: 999,
												background: C.ok,
												color: '#fff',
												fontSize: 10,
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'center',
												flexShrink: 0,
											}}
										>
											✓
										</span>
										<div style={{fontSize: 15, color: C.ink, flex: 1}}>{name}</div>
										<div style={{fontSize: 13, color: C.mute}}>{meta}</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</ConsoleFrame>

			<Cursor
				path={[
					{at: 84, x: 1180, y: 400},
					{at: 102, x: 1120, y: 356, click: true},
				]}
			/>

			<Caption at={6} text="Mia starts by reading what you already wrote." />
		</Deck>
	);
};

const Spinner: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<span
			style={{
				width: 15,
				height: 15,
				borderRadius: 999,
				border: `2px solid ${C.brandLine}`,
				borderTopColor: C.brand,
				display: 'inline-block',
				transform: `rotate(${frame * 11}deg)`,
			}}
		/>
	);
};

/* ------------------------------------------- mia today: requirements */

const REQ_TASKS: TaskRow[] = [
	{
		n: 1,
		task: 'Ingest discovery artifacts',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-playbook-ingest-workshop-transcript@1',
		output: 'Log',
	},
	{
		n: 2,
		task: 'Gather requirements (all in-scope L1s)',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-playbook-gather-requirements@1',
		output: 'Workbook',
	},
	{
		n: 3,
		task: 'Analyze requirements for coverage',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-playbook-analyze-requirements@4',
		output: 'Shortfall',
	},
	{
		n: 4,
		task: 'Generate questions for missing information',
		status: 'Running',
		assignee: 'Agent',
		skill: 'op-platform-coverage-shortfall-question-generator@3',
	},
	{
		n: 5,
		task: 'Workshop — Order to Cash',
		status: 'Pending',
		assignee: 'Consultant',
	},
	{
		n: 6,
		task: 'Sign off requirements — Finance',
		status: 'Pending',
		assignee: 'Business Lead',
	},
	{
		n: 7,
		task: 'Sign off requirements — Supply Chain',
		status: 'Pending',
		assignee: 'Business Lead',
	},
	{
		n: 8,
		task: 'Publish requirements baseline',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-platform-publish-evidence@1',
	},
];

/**
 * "It drafts requirements and highlights missing information."
 *
 * Ashley: "show a completed task that says gather requirements and like show
 * this completed and then pop up like the Excel document that shows the
 * requirements list and also the highlights missing information. I did want to
 * show, actually during this part, the coverage shortfall documents that we
 * create."
 *
 * Three things in one shot, so the workbook carries a gaps column rather than
 * needing a second document: the row that is short is tinted, and the count is
 * stated in the header. The shortfall is the honest part of the story - Mia
 * saying what it does not yet know is more credible than a full sheet.
 */
export const SceneRequirements: React.FC = () => (
	<Deck>
		<ConsoleFrame active="Waves" project="Zava_Fashion_01" scopeCount={4} bottomInset={CAP_INSET}>
			<TaskTable
				rows={REQ_TASKS}
				selected={2}
				title="Wave 1 — Gather, Workshop & Sign Off Requirements"
				countLabel="8 of 21 tasks"
				spin
				progress={{done: 3, total: 21}}
			/>
		</ConsoleFrame>

		<ArtifactSheet
			at={46}
			title="Requirements workbook — Order to Cash"
			subtitle="142 requirements extracted · 11 need more information"
			origin={{x: 640, y: 336}}
			width={1400}
			zoom={{at: 96, scale: 1.16, x: 900, y: 660}}
		>
			<div style={{padding: '20px 28px', fontFamily: FONT}}>
				<SheetGrid
					revealFrom={68}
					columns={[
						{label: 'ID', w: 120},
						{label: 'REQUIREMENT', w: 560},
						{label: 'PROCESS', w: 230},
						{label: 'SOURCE', w: 224},
						{label: 'COVERAGE', w: 210},
					]}
					rows={[
						['REQ-0118', 'Credit limit checked at order entry', 'Order to Cash', 'Workshop 12 Aug', {v: 'Standard', tone: 'ok'}],
						['REQ-0119', 'Partial shipment allowed for wholesale', 'Order to Cash', 'RFP §4.2', {v: 'Standard', tone: 'ok'}],
						['REQ-0120', 'Returns accepted within 30 days', 'Order to Cash', 'Workshop 12 Aug', {v: 'Standard', tone: 'ok'}],
						['REQ-0121', 'Commission split across two reps', 'Order to Cash', 'Interview notes', {v: 'Needs info', tone: 'warn'}],
						['REQ-0122', 'Season-based pricing calendar', 'Order to Cash', 'Not stated', {v: 'Needs info', tone: 'warn'}],
						['REQ-0123', 'EDI order intake from three partners', 'Order to Cash', 'Integration list', {v: 'Extension', tone: 'brand'}],
					]}
				/>

				<div
					style={{
						marginTop: 18,
						display: 'flex',
						alignItems: 'center',
						gap: 13,
						border: `1px solid #F0DCBB`,
						background: '#FFF8EC',
						borderRadius: R.md,
						padding: '15px 18px',
					}}
				>
					<div
						style={{
							fontSize: 12.5,
							fontWeight: 600,
							letterSpacing: '0.1em',
							color: C.warn,
							whiteSpace: 'nowrap',
						}}
					>
						COVERAGE SHORTFALL
					</div>
					<div style={{fontSize: 15.5, color: C.body, lineHeight: 1.45}}>
						Commission splitting is described in interview notes but never in a workshop.
						Mia has drafted 4 questions for the Order to Cash lead rather than guessing.
					</div>
				</div>
			</div>
		</ArtifactSheet>

		<Cursor
			path={[
				{at: 8, x: 680, y: 430},
				{at: 28, x: 636, y: 338, click: true},
			]}
			hideAfter={46}
		/>

		<Sequence from={0} durationInFrames={48}>
			<Caption at={2} text="It drafts the requirements, and says what is missing." />
		</Sequence>
	</Deck>
);

/* ------------------------------------------ mia today: configuration */

/**
 * "It translates that into a configuration plan... and records what changed,
 * why, and who approved it."
 *
 * Ashley asked for the configuration plan twice - once for the vision section
 * and again for today. Repeating the same document would waste the second
 * slot, so the vision shows the plan being drafted and this shows it being
 * approved and applied. The audit strip is the whole difference: a plan any
 * tool can produce, a signed record it cannot.
 */
export const SceneConfigApply: React.FC = () => {
	const frame = useCurrentFrame();
	const applied = frame > 104;

	return (
		<Deck>
			<ConsoleFrame active="Phases" project="Zava_Fashion_01" scopeCount={4} bottomInset={CAP_INSET}>
				<div style={{padding: 34, fontFamily: FONT, height: '100%'}}>
					<div style={{fontSize: 26, fontWeight: 600, color: C.ink, marginBottom: 5}}>
						Configuration plan — Order to Cash
					</div>
					<div style={{fontSize: 16, color: C.mute, marginBottom: 26}}>
						38 settings across 6 modules · applied to DEV
					</div>

					<div style={{display: 'flex', gap: 16, marginBottom: 26}}>
						{[
							['Drafted by Mia', '38 settings', 'done'],
							['Reviewed by workstream lead', 'M. Okafor · 2 edits', 'done'],
							['Applied to DEV', applied ? '38 of 38' : 'running', applied ? 'done' : 'run'],
							['Evidence recorded', applied ? 'Signed' : 'waiting', applied ? 'done' : 'idle'],
						].map(([label, sub, state], i) => {
							const app = interpolate(frame, [14 + i * 12, 36 + i * 12], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: EASE.out,
							});
							const done = state === 'done';
							return (
								<div
									key={String(label)}
									style={{
										flex: 1,
										border: `1px solid ${done ? C.brandLine : C.line}`,
										background: done ? C.brandSoft : '#fff',
										borderRadius: R.md,
										padding: '17px 19px',
										opacity: app,
										transform: `translateY(${(1 - app) * 10}px)`,
									}}
								>
									<div style={{display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8}}>
										{state === 'run' ? (
											<Spinner />
										) : (
											<span
												style={{
													width: 17,
													height: 17,
													borderRadius: 999,
													background: done ? C.ok : C.idleSoft,
													color: '#fff',
													fontSize: 10.5,
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
												}}
											>
												{done ? '✓' : ''}
											</span>
										)}
										<div style={{fontSize: 15, color: C.ink, fontWeight: 600}}>{label}</div>
									</div>
									<div style={{fontSize: 13.5, color: C.mute}}>{sub}</div>
								</div>
							);
						})}
					</div>

					<SheetGrid
						revealFrom={56}
						columns={[
							{label: 'SETTING', w: 430},
							{label: 'FROM', w: 200},
							{label: 'TO', w: 230},
							{label: 'WHY', w: 380},
							{label: 'APPROVED BY', w: 288},
						]}
						rows={[
							['Sales order credit check', 'None', {v: 'Balance + orders', tone: 'brand'}, 'REQ-0118', 'M. Okafor · 21 Aug'],
							['Partial delivery', 'Not allowed', {v: 'Allowed', tone: 'brand'}, 'REQ-0119', 'M. Okafor · 21 Aug'],
							['Return policy window', '14 days', {v: '30 days', tone: 'brand'}, 'REQ-0120', 'S. Whitfield · 22 Aug'],
							['Invoice matching policy', 'Two-way', {v: 'Three-way', tone: 'brand'}, 'REQ-0142', 'M. Okafor · 22 Aug'],
							['Price tolerance', '0.00%', {v: '2.00%', tone: 'warn'}, 'REQ-0142', 'M. Okafor · 22 Aug'],
							['Sales tax group defaults', 'Blank', {v: 'By delivery address', tone: 'brand'}, 'REQ-0131', 'S. Whitfield · 23 Aug'],
							['Commission calculation', 'Single rep', {v: 'Split by percentage', tone: 'warn'}, 'REQ-0121', 'Pending decision'],
							['Warehouse release policy', 'Manual', {v: 'Automatic on confirm', tone: 'brand'}, 'REQ-0127', 'M. Okafor · 23 Aug'],
						]}
					/>
				</div>
			</ConsoleFrame>

			<Caption at={8} text="Every change carries why it was made, and who approved it." />
		</Deck>
	);
};

/* --------------------------------------------- mia today: migration */

const MIG_TASKS: TaskRow[] = [
	{
		n: 1,
		task: 'Profile legacy source — Customer master',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-migration-profile-source@2',
		output: 'Profile',
	},
	{
		n: 2,
		task: 'Map source fields to Dynamics 365 entities',
		status: 'Completed',
		assignee: 'Agent',
		skill: 'op-migration-field-mapper@3',
		output: 'Mapping',
	},
	{
		n: 3,
		task: 'Step review — confirm mapping and transforms',
		status: 'Running',
		assignee: 'Consultant',
		skill: 'op-migration-step-review@1',
	},
	{
		n: 4,
		task: 'Dry-run load into sandbox',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-migration-dry-run@2',
	},
	{
		n: 5,
		task: 'Reconcile counts and balances',
		status: 'Pending',
		assignee: 'Agent',
		skill: 'op-migration-reconcile@1',
	},
	{
		n: 6,
		task: 'Business validation — Customer master',
		status: 'Pending',
		assignee: 'Business Lead',
	},
];

/**
 * "For data migration, it can read your legacy data, map it to Dynamics, and
 * tell you what will not fit."
 *
 * Ashley: "Same for data migration. I want to go to a task and then I want to
 * show the mapping, probably in the step review that's being done."
 *
 * The mapping is shown as source on the left and target on the right with the
 * transform in between, because that middle column is where the judgement
 * lives. The last row does not map, which is the honest half of the sentence.
 */
export const SceneMigrationMap: React.FC = () => (
	<Deck>
		<ConsoleFrame active="Waves" project="Zava_Fashion_01" scopeCount={4} bottomInset={CAP_INSET}>
			<TaskTable
				rows={MIG_TASKS}
				selected={3}
				title="Wave 5C — Customer, Address and Contact"
				countLabel="6 tasks"
				spin
				progress={{done: 2, total: 6}}
			/>
		</ConsoleFrame>

		<ArtifactSheet
			at={48}
			title="Step review — Customer master mapping"
			subtitle="Legacy AX 2012 · 48,902 records · 31 of 34 fields mapped"
			origin={{x: 640, y: 384}}
			width={1420}
			zoom={{at: 100, scale: 1.14, x: 900, y: 680}}
		>
			<div style={{padding: '20px 28px', fontFamily: FONT}}>
				<SheetGrid
					revealFrom={70}
					columns={[
						{label: 'SOURCE FIELD', w: 316},
						{label: 'TRANSFORM', w: 396},
						{label: 'DYNAMICS 365 TARGET', w: 372},
						{label: 'CONFIDENCE', w: 156},
						{label: 'STATUS', w: 124},
					]}
					rows={[
						['CUSTTABLE.ACCOUNTNUM', 'Direct', 'CustomerV3.CustomerAccount', {v: 'High', tone: 'ok'}, {v: 'Accepted', tone: 'ok'}],
						['CUSTTABLE.CUSTGROUP', 'Lookup — 12 values remapped', 'CustomerV3.CustomerGroupId', {v: 'High', tone: 'ok'}, {v: 'Accepted', tone: 'ok'}],
						['CUSTTABLE.PAYMTERMID', 'Lookup — 3 new terms created', 'CustomerV3.PaymentTerms', {v: 'Medium', tone: 'warn'}, {v: 'Review', tone: 'warn'}],
						['LOGISTICSPOSTALADDRESS', 'Split into address lines 1-3', 'CustPostalAddress', {v: 'High', tone: 'ok'}, {v: 'Accepted', tone: 'ok'}],
						['CUSTTABLE.CREDITMAX', 'Currency converted to USD', 'CustomerV3.CreditLimit', {v: 'High', tone: 'ok'}, {v: 'Accepted', tone: 'ok'}],
						['CUSTTABLE.SALESDISTRICTID', 'No target — legacy district codes', {v: 'Unmapped', tone: 'warn'}, {v: 'None', tone: 'warn'}, {v: 'Decide', tone: 'warn'}],
					]}
				/>

				<div
					style={{
						marginTop: 18,
						display: 'flex',
						alignItems: 'center',
						gap: 13,
						border: '1px solid #F0DCBB',
						background: '#FFF8EC',
						borderRadius: R.md,
						padding: '15px 18px',
					}}
				>
					<div
						style={{
							fontSize: 12.5,
							fontWeight: 600,
							letterSpacing: '0.1em',
							color: C.warn,
							whiteSpace: 'nowrap',
						}}
					>
						3 WILL NOT FIT
					</div>
					<div style={{fontSize: 15.5, color: C.body, lineHeight: 1.45}}>
						Sales district has no Dynamics 365 equivalent. Mia proposes a financial dimension
						and is holding the load until someone decides.
					</div>
				</div>
			</div>
		</ArtifactSheet>

		<Cursor
			path={[
				{at: 10, x: 690, y: 470},
				{at: 30, x: 636, y: 386, click: true},
			]}
			hideAfter={48}
		/>

		<Sequence from={0} durationInFrames={50}>
			<Caption at={2} text="It maps your legacy data, and flags what will not fit." />
		</Sequence>
	</Deck>
);
