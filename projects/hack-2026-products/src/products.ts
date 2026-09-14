export type Product = {
  id: string;
  name: string;
  tagline: string;
  problem: string[];
  beats: { label: string; body: string }[];
  close: string;
  accent: string;
  accentSoft: string;
};

/**
 * Taglines are verbatim from each project's page on the hackathon site.
 * Nothing here asserts that a product is verified, passing, or shipped:
 * every line describes what the product does, not how it scored.
 */
export const PRODUCTS: Product[] = [
  {
    id: "ProjectHarnessBuilder",
    name: "Project Harness Builder",
    tagline:
      "One deterministic project harness for the coding agents and models your team actually uses.",
    problem: [
      "Guardrails live as prose in a markdown file.",
      "A rule an agent can read is a rule an agent can skip.",
    ],
    beats: [
      {
        label: "Reads the repo first",
        body: "Test, build, lint and deploy lanes are detected from real scripts and real workflow files. A script that does not exist never becomes a lane.",
      },
      {
        label: "Binds every verb",
        body: "Each action is a fixed executable and a frozen argument array. No user-supplied string reaches a shell.",
      },
      {
        label: "Asks only what code cannot settle",
        body: "Who approves an environment write. Which environments are protected. Which branches are protected.",
      },
    ],
    close: "Prose does not bind an executable. A harness does.",
    accent: "#8B5CF6",
    accentSoft: "#C4B5FD",
  },
  {
    id: "AgentMemoryFoundry",
    name: "Agent Memory Foundry",
    tagline: "Learn once. Prove per agent. Share only where it improves the goal.",
    problem: [
      "An agent that teaches itself will eventually teach itself something wrong.",
      "Then it shares that lesson with every other agent.",
    ],
    beats: [
      {
        label: "Promotion is gated",
        body: "A learned procedure does not enter memory because it worked once. It enters behind an approval, against the goal it claims to serve.",
      },
      {
        label: "Drift is detected",
        body: "Memory is tied to a goal contract, so an agent that starts optimising for something else is visible before it spreads.",
      },
      {
        label: "Bad lessons roll back",
        body: "Quarantine a poisoned memory, monitor a canary, and revert the version that caused it.",
      },
    ],
    close: "Memory an agent cannot roll back is a bug it cannot stop repeating.",
    accent: "#6366F1",
    accentSoft: "#A5B4FC",
  },
  {
    id: "AgentTeamVault",
    name: "Agent Team Vault",
    tagline:
      "One shared, auditable project state for every person and agent: goals, claims, handoffs, decisions, evidence.",
    problem: [
      "Two agents edit the same file in the same checkout.",
      "One goes quiet, and somebody silently takes over its work.",
    ],
    beats: [
      {
        label: "Claims and leases",
        body: "A path is claimed before it is edited, and a lease expires, so a silent agent releases its work instead of holding it.",
      },
      {
        label: "Append-only and signed",
        body: "Every claim, handoff and decision is an event in a signed log. Any participant can verify the chain without trusting the writer.",
      },
      {
        label: "Refused before it is written",
        body: "A backward-dated event is rejected before the append, not quarantined after it. The store never holds a fact it has to explain away.",
      },
    ],
    close: "A shared status file is a rumour. A signed event log is a record.",
    accent: "#A855F7",
    accentSoft: "#D8B4FE",
  },
  {
    id: "AgentEvaluationWorkbench",
    name: "Agent Evaluation Workbench",
    tagline:
      "Runs frozen suites against two agent versions and blocks release when a stronger candidate quietly opens an approval bypass.",
    problem: [
      "A candidate agent scores higher than the baseline.",
      "It also learned to skip the approval gate. The score does not show that.",
    ],
    beats: [
      {
        label: "Frozen suites",
        body: "Baseline and candidate face the same suite, pinned to a source digest, so a change to the test cannot flatter the change to the agent.",
      },
      {
        label: "Hash-chained evidence",
        body: "Every run writes a receipt chain. Edit any artifact after the fact and the chain refuses to verify.",
      },
      {
        label: "Safety gates outrank score",
        body: "A win on pass@k does not promote a candidate that opened a bypass. The gate reads both.",
      },
    ],
    close: "A number that cannot be re-derived is not evidence. It is a claim.",
    accent: "#7C3AED",
    accentSoft: "#C4B5FD",
  },
  {
    id: "DynamicsAutopilot",
    name: "Dynamics Autopilot",
    tagline:
      "An always-on runtime that turns signals into bounded work, stops at a named human before every write, and leaves a receipt that recomputes.",
    problem: [
      "An always-on agent with write access is a very fast way to be very wrong.",
      "Autonomy without a stopping rule is not autonomy. It is exposure.",
    ],
    beats: [
      {
        label: "Detect, then bound",
        body: "Signals become a plan with a fixed shape. The runtime proposes work it is allowed to propose, and nothing wider.",
      },
      {
        label: "A named human approves",
        body: "Every write stops at a person, not a role. The approval is bound to the plan it approved, so it cannot be replayed against a different one.",
      },
      {
        label: "The receipt recomputes",
        body: "Replay the receipt and it reproduces the decision, or it fails. There is no third answer.",
      },
    ],
    close: "The stopping rule is the feature.",
    accent: "#4F46E5",
    accentSoft: "#A5B4FC",
  },
  {
    id: "FieldRelay",
    name: "Field Relay",
    tagline:
      "A dispatcher reviews constrained recovery options, approves one simulated reassignment, and receives a verification and audit receipt.",
    problem: [
      "A field job fails and the schedule has to recover now.",
      "An agent that reassigns the wrong technician has cost somebody a day.",
    ],
    beats: [
      {
        label: "Constrained options only",
        body: "The simulator proposes recovery moves that satisfy the constraints. Options that violate them are never shown to the dispatcher.",
      },
      {
        label: "One human decision",
        body: "The dispatcher approves a single reassignment. Nothing is written to the schedule before that approval exists.",
      },
      {
        label: "Deterministic and replayable",
        body: "Same inputs, same options, same receipt. A safety evaluation can be re-run against the recorded run.",
      },
    ],
    close: "The dispatcher decides. The agent shows its work.",
    accent: "#9333EA",
    accentSoft: "#D8B4FE",
  },
];
