/**
 * Every word that appears on screen in the film, in one place.
 *
 * `MiaFilm` and the per-scene compositions in `Root` both read from here, so a
 * copy change lands in the full cut and the individual clip at the same time
 * and the two can never drift apart.
 *
 * The wording for the six generated scenes is taken from the narration
 * transcript in `../../transcript/narration.md`. On-screen text should say
 * something the voice-over does not, rather than subtitle it.
 */
export const FILM_COPY = {
  s01: {caption: 'One coordinated flow.'},

  s02: {brand: 'ZAVA', screenTitle: 'Fit-gap analysis'},

  s03: {
    docTitle: 'Statement of Work',
    artifacts: [
      {label: 'Discovery notes'},
      {label: 'Solution blueprint'},
      {label: 'Commercial terms'},
    ],
    branches: [{label: 'Project charter'}, {label: 'Team structure'}, {label: 'Delivery plan'}],
  },

  s04: {
    label: 'Requirements workshop',
    requirements: [
      {text: 'Three-way match on PO invoices'},
      {text: 'Approval routing above 50k'},
      {text: 'Vendor onboarding in five days'},
    ],
  },

  s05: {
    steps: [{label: 'Requisition'}, {label: 'Purchase order'}, {label: 'Invoice match'}],
    requirements: [{label: 'REQ-014'}, {label: 'REQ-022'}, {label: 'REQ-031'}],
    fitLabel: 'Fit',
    gapLabel: 'Gap',
  },

  s06: {
    vignettes: [
      {title: 'Critical decision', body: 'Invoice tolerance set at two percent'},
      {title: 'Impact analysis', body: 'Touches four processes and two integrations'},
      {title: 'Data migration', body: 'Vendor master mapped and transformed'},
      {title: 'One thread', body: 'Every finding stays connected'},
      {title: 'Automated testing', body: 'Regression runs on every change'},
    ],
  },

  s07: {caption: 'The thread stays with the customer.'},

  s08: {screenTitle: 'Mia configuration plan', caption: 'All of it, one plan.'},

  /** 00:20.4 - 00:28.7. "Respond to RFPs, and turn recorded demos and
   * discovery workshops into reusable project knowledge." */
  s09: {
    sources: [
      {label: 'RFP response', meta: '142 questions answered'},
      {label: 'Recorded demo', meta: 'Procure to pay, 38 min'},
      {label: 'Discovery workshop', meta: 'Finance and operations'},
    ],
    libraryTitle: 'Project knowledge',
    knowledge: ['Customer processes', 'Answered objections', 'Demo data set'],
    caption: 'Pre-sales work stops being disposable.',
  },

  /** 01:14.4 - 01:20.7. "As go-live approaches, MIA coordinates cut-over and
   * user readiness while creating tailored training guides and videos." */
  s10: {
    milestone: 'Go-live',
    tracks: [
      {label: 'Cut-over', detail: 'Sequenced, owned, timed to the hour'},
      {label: 'User readiness', detail: 'By role, by process, by site'},
    ],
    outputs: ['Training guides', 'Training videos'],
    caption: 'Two workstreams, one date.',
  },

  /** 01:25.3 - 01:35.3. "MIA is still there, monitoring environment health,
   * explaining upcoming features, analyzing their potential impact." */
  s11: {
    monitors: [
      {title: 'Environment health', value: 'All services nominal', note: 'Monitored'},
      {title: 'Upcoming release', value: '14 features land in April', note: 'Explained'},
      {title: 'Potential impact', value: '3 touch your approval flow', note: 'Analysed'},
    ],
    caption: 'The team rolls off. Mia does not.',
  },

  /** 01:44.3 - 01:56.0. "MIA begins by consuming project documentation. It
   * drafts requirements, links them back to source evidence, highlights
   * missing information, and suggests targeted questions." */
  s12: {
    docs: ['Discovery notes', 'Process maps', 'Current-state SOPs'],
    panelTitle: 'Drafted requirements',
    requirements: [
      {label: 'Three-way invoice match', meta: 'SOP p.14'},
      {label: 'Approval routing above 50k', meta: 'Workshop 03'},
      {label: 'Tax on cross-border orders', meta: 'Evidence incomplete', warn: true},
      {label: 'Vendor onboarding SLA', meta: 'Process map 2.1'},
    ],
    questionTag: 'Question for the business',
    question: 'Which tax jurisdictions apply when a store ships across a border?',
    caption: 'Every requirement carries its evidence.',
  },

  /** 01:56.0 - 02:11.0. "Once a requirement is adopted MIA translates it into
   * a configuration plan. A Workstream lead reviews and approves. MIA applies
   * the configuration and records what changed, why, and who approved it." */
  s13: {
    requirement: 'Three-way invoice match',
    requirementMeta: 'REQ-014 - Accounts payable',
    planTitle: 'Configuration plan',
    settings: [
      {label: 'Matching policy', meta: 'Three-way'},
      {label: 'Price tolerance', meta: '2 percent'},
      {label: 'Post on match only', meta: 'Enabled'},
    ],
    reviewer: 'Workstream lead',
    reviewerRole: 'Finance and operations',
    approvedLabel: 'Approved',
    environment: 'Contoso UAT',
    auditTitle: 'Change record',
    audit: [
      {label: 'What changed', meta: 'Matching policy set to three-way'},
      {label: 'Why', meta: 'REQ-014, evidenced in SOP p.14'},
      {label: 'Who approved', meta: 'Workstream lead, 09:42'},
    ],
    caption: 'Nothing is applied without a record.',
  },

  /** 02:11.0 - 02:25.6. "For data migration, MIA helps interpret source data,
   * map it to dynamics, define transformations, and guide validation and
   * loading, keeping the migration connected to the requirements and
   * processes it supports." */
  s14: {
    sourceTitle: 'Legacy source',
    sourceFields: [
      {label: 'VEND_NO', meta: 'char(8)'},
      {label: 'VEND_NAME1', meta: 'char(40)'},
      {label: 'PAY_TERM_CD', meta: 'char(4)'},
      {label: 'CUR', meta: 'char(3)'},
    ],
    targetTitle: 'Dynamics 365',
    targetFields: [
      {label: 'Vendor account', meta: 'Unmapped'},
      {label: 'Vendor name', meta: 'Unmapped'},
      {label: 'Terms of payment', meta: 'Unmapped'},
      {label: 'Currency', meta: 'Unmapped'},
    ],
    transforms: ['Trim and normalise', 'Map payment terms', 'Resolve duplicates'],
    validation: 'Validated and loaded',
    anchors: ['Requirements', 'Process flows'],
    caption: 'Migration tied to the work it serves.',
  },

  // The title card, rebuilt as a scene in v4. The graph around the wordmark is
  // people, knowledge and validation: the three things a project actually runs on.
  s15: {title: 'Project Mia'},

  /** 00:35.8 - 00:41.1. "and embed success by design into project execution."
   * The source slide had four phases and named the last one Initiate, which is
   * the first. The methodology ends on Operate. Rebuilt rather than repeated. */
  s16: {
    heading: 'Success by Design, embedded',
    phases: ['Initiate', 'Implement', 'Prepare', 'Operate'],
    caption: 'Not a review gate. Part of execution.',
  },

  /** 00:52.1 - 01:05.2. "For fits, MIA drafts configuration plans for expert
   * approval. For gaps, it evaluates customization, power platform, and ISV
   * options, preserving decisions and an audit trail." */
  s17: {
    requirements: [
      {label: 'Three-way invoice match', verdict: 'Fit'},
      {label: 'Vendor onboarding portal', verdict: 'Gap'},
      {label: 'Multi-currency settlement', verdict: 'Fit'},
      {label: 'Rebate accrual schedule', verdict: 'Gap'},
    ],
    planTitle: 'Configuration plan',
    planSteps: [
      'Set matching policy to three-way',
      'Define tolerance by vendor group',
      'Route exceptions to AP approver',
    ],
    optionsTitle: 'Gap: vendor onboarding portal',
    options: [
      {name: 'Customization', note: 'Highest effort, carries upgrade cost'},
      {name: 'Power Platform', note: 'Fits the process, no core change'},
      {name: 'ISV solution', note: 'Fast, adds a vendor dependency'},
    ],
    chosen: 1,
    auditTitle: 'Decision recorded',
    auditLines: [
      'Power Platform chosen over customization',
      'Reason: avoids upgrade cost on core',
      'Approved by solution architect',
      'Linked to requirement and process map',
    ],
    caption: 'One blueprint. Every decision traceable.',
  },

  /** 02:25.6 - 02:33.6. "This is MIA Today, making implementations more rapid,
   * reliable, and repeatable." */
  s18: {
    lead: 'This is',
    wordmark: 'Mia',
    pillars: ['Rapid', 'Reliable', 'Repeatable'],
    product: 'Dynamics 365',
  },
};
