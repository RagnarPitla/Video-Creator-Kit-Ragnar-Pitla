/**
 * Every string that reaches the screen in `AgentWorks`, and where it came from.
 *
 * One file, per house style, so copy cannot drift between the preview and the
 * render. The provenance note on each block is not decoration: `VISION.md`
 * section 7 rule 1 is "nothing on screen that the claim ledger does not carry",
 * and this is where that is enforceable by reading.
 *
 * Provenance vocabulary used below:
 *   ledger   VISION.md section 4, a measured row
 *   story    VISION.md section 5, a dated event
 *   artifact read out of the Hack-2026 tree by this session, read-only
 *   ran      output this session produced by running the command itself
 *   post 53  the instrument case, VISION.md section 4 / script.md section 3b
 */

export const copy = {
  /** ledger: "Dashboard suite | 522 tests, 0 failing". Not run by this session. */
  suite: {
    prompt: "Hack-2026",
    command: "npm run test:dashboard",
    green: ["# tests   522", "# pass    522", "# fail      0"],
    /**
     * artifact: tests/dashboard-regression.mjs:1059 exists and carries exactly this
     * name. Read this session. No pass/fail tally is printed on the red frame,
     * because this session did not run the suite under the arm and the tally is
     * therefore not a number it may state. The one line it can source is the line.
     */
    redLine: "not ok - every published adapter row names the vendor the product source names",
    redWhere: "tests/dashboard-regression.mjs:1059",
  },

  /** artifact: data/projects.json .products[1].surfaces, read and mutated on a copy. */
  arm: {
    path: "data/projects.json",
    field: ".products[1].surfaces[2].vendor",
    from: '"Anthropic"',
    to: '"OpenAI"',
    /** artifact: tests/dashboard-regression.mjs:1043, verbatim. */
    verdict: "0 new failures",
    survived: "SURVIVED",
    verdictWhere: "tests/dashboard-regression.mjs:1043",
  },

  /** story 3: the nearest check blanked each field to "  " and asserted a complaint. */
  presence: {
    kicker: "the nearest existing check",
    rows: [
      { probe: 'vendor := "  "', result: "the page complains", caught: true },
      { probe: 'vendor := "OpenAI"', result: "the page renders", caught: false },
    ],
    verdict: "binds presence, not value",
  },

  /** script.md beat 6, and the method as VISION.md section 5 describes it. */
  method: {
    kicker: "the arm",
    steps: ["mutate one value", "run the suite", "restore the file"],
  },

  /** story 2: "a comment reword produced the identical failure set". */
  control: {
    kicker: "the null control",
    rows: [
      { label: "mutate a value", result: "gate fires" },
      { label: "reword a comment", result: "gate fires, identical set" },
    ],
    verdict: "the gate is not reading your change",
  },

  /**
   * artifact: public-site/assets/portfolio.js STATUS_DEFINITIONS, read this session.
   * Eight keys, in this order. The two definition strings shown are verbatim.
   */
  definitions: {
    kicker: "published status definitions",
    names: [
      "planned",
      "registered",
      "building",
      "runtime-built",
      "locally-proven",
      "tenant-proven",
      "submission-ready",
      "submitted",
    ],
    textA: "Brief, thin slice, owner, evaluation contract, and kill rule are reviewed.",
    textB: "A hackathon record is saved, reopened, and read back.",
    note: "swap two",
  },

  /** story 2: the staleness gate fires on drift, and fired identically for the comment. */
  staleness: {
    kicker: "the staleness gate",
    rows: [
      { label: "definitions swapped", result: "FAILED   copy is stale" },
      { label: "comment reworded", result: "FAILED   copy is stale" },
    ],
    verdict: "drift, not falsehood",
  },

  /** story 2: regenerating is the maintainer's natural repair, and it bakes the falsehood in. */
  regenerate: {
    kicker: "the natural repair",
    action: "regenerate the published bundle",
    result: "PASSED",
    cost: "false definition shipped",
  },

  /** script.md section 7: three sessions, never a name, never a colour code. */
  loop: {
    kicker: "one board",
    label: "session",
    verdict: "each running the others' findings against its own code",
  },

  /** story 3 and story 2, both closed. */
  closed: {
    kicker: "both closed",
    lines: ["values derived from the product's own source", "the arm that was green goes red"],
  },

  /**
   * ledger: the boundary-less grep returns 43 by matching harm, warm and alarm.
   *
   * Only two of the three reach the screen. Beat 14 names exactly two - "counting
   * harm and warm" - and a frame holding three chips under a line naming two is the
   * count mismatch script.md section 6 item 4 exists to prevent. `alarm` is a true
   * member of the set and is dropped from the picture, not from the record.
   */
  ledgerCase: {
    prompt: "Hack-2026",
    badCommand: "git log --grep=arm -i --oneline | wc -l",
    badResult: "43",
    falsePositives: ["harm", "warm"],
    goodCommand: "git log --grep='\\barms\\?\\b' -iE --oneline | wc -l",
    goodResult: "37",
    /** ledger point-in-time row: 38, measured 2026-09-01T16:40:27Z. */
    laterResult: "38",
    laterAt: "measured again 16:40:27Z",
  },

  /**
   * post 53, via VISION.md section 4: a git log listing three commits and a
   * "9 files changed, 1029 insertions" diffstat, reported as landed. Drawn, because
   * a shell fabricating output is not a thing this session can record.
   * script.md section 3b: no clock, no timestamp, no duration.
   */
  instrument: {
    prompt: "~",
    command: "git log --oneline -3",
    hashes: ["ec1e77b", "9b1cae6", "8ee2b23"],
    diffstat: "9 files changed, 1029 insertions(+)",
    landed: "reported as landed",
  },

  /** ran: this session, in RagnarPitla/field-relay, read-only. All three returned false. */
  catFile: {
    prompt: "Hack-2026",
    command: "git cat-file -e <hash>^{commit}",
    rows: [
      { hash: "ec1e77b", result: "false" },
      { hash: "9b1cae6", result: "false" },
      { hash: "8ee2b23", result: "false" },
    ],
  },

  /** script.md section 3b beat 18. No session is named anywhere in this film. */
  published: {
    kicker: "board post",
    title: "fabricated tool output",
    note: "self-reported",
  },

  /** ran: this session. Constant from VISION.md section 4's known-answer probe. */
  probe: {
    prompt: "~",
    command: "printf 'abc' | shasum -a 256",
    got: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
    expect: "expected  ba7816bf … f20015ad",
    verdict: "MATCHED",
  },

  /** ledger: promotion requires both, bound to the same source digest. */
  promotion: {
    kicker: "promotion needs both",
    rows: ["a passing suite receipt", "a closed independent review"],
    bind: "bound to the same source digest",
    verdict: "no product holds both",
  },

  /** Labels on the two real recordings and two real captures, per house style rule 1. */
  rec: "recording · project harness builder",
  capAdapters: "capture · dashboard adapter catalog",
  capCards: "capture · dashboard product cards",
};
