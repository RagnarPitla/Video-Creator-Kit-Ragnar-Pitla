import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Canvas, useTheme } from "../../../../shared/brand/ailabs-explainer";
import { copy } from "./copy";
import { Evidence, Kicker, Line, ProbeRow, reveal, Shell, Stage, Verdict } from "./ui";

/**
 * The 22 shots.
 *
 * Three rules this file is written against, all of them load-bearing:
 *
 *  1. Every shot has content on its own frame 0. Nothing anchors at `from={1}` or
 *     later on its own, because a Sequence whose only element is still animating in
 *     shows the bare canvas on its first frame - a blank flash at the cut, which
 *     `contrast.mjs` scores as a transient luma dip and fails. `reveal()` returns 1
 *     for `from <= 0` precisely so an anchor can be written.
 *  2. No shot fades out. Sequences abut rather than overlap, so a fade would dip the
 *     picture through the background instead of dissolving into the next shot.
 *  3. Nothing carries a number VISION.md section 4 does not carry, or a string this
 *     session did not read out of the repository. See `copy.ts`.
 */

/** Scene shell: canvas, slow drift, and the panel that gives the frame its luma spread. */
const Drawn: React.FC<{
  children: React.ReactNode;
  align?: "center" | "flex-start";
  width?: number;
  height?: number;
  gap?: number;
}> = ({ children, align = "flex-start", width, height, gap }) => (
  <Canvas drift driftScale={1.012} driftPx={{ x: -7, y: -4 }} padding={110}>
    <Stage align={align} width={width} height={height} gap={gap}>
      {children}
    </Stage>
  </Canvas>
);

/* ------------------------------------------------------------------ movement 1 */

/** S01 - beat 1. The suite, green. The same terminal goes red at S13. */
export const S01: React.FC = () => (
  <Drawn align="center">
    <Kicker from={0}>the claim</Kicker>
    <Shell
      prompt={copy.suite.prompt}
      command={copy.suite.command}
      from={0}
      width={1300}
      lines={[
        { text: copy.suite.green[0], tone: "dim", from: 60 },
        { text: copy.suite.green[1], tone: "pass", from: 70 },
        { text: copy.suite.green[2], tone: "pass", from: 80 },
      ]}
    />
  </Drawn>
);

/** S02 - beat 2. Seven rows, uncropped, countable. Real capture. */
export const S02: React.FC = () => (
  <Evidence
    src="agentworks/adapters-before.png"
    kind="image"
    sourceW={964}
    sourceH={680}
    maxW={1200}
    maxH={860}
    label={copy.capAdapters}
    push={1.02}
    durationInFrames={224}
  />
);

/* ------------------------------------------------------------------ movement 2 */

/**
 * S03 / S04 - beats 3 and 4. The arm, before and after, on the two rows that matter.
 *
 * This is not the full table. script.md section 6 hazard 2: after the arm the page
 * holds two rows reading OpenAI, one shipped and correct (`OpenAI Codex`) and one
 * planted, "with nothing on the page distinguishing them". Across seven rows a
 * viewer hunting for "the OpenAI one" finds two and can land on the wrong one, and
 * the beat reads as a fabrication. The same section says the Codex row is an asset
 * once the crop is right - "a correct OpenAI row sitting beside a false one, both
 * rendering identically, both green, is the argument in one frame".
 *
 * So the crop is exactly rows 3 and 4, `Claude Code` above `OpenAI Codex`, and the
 * cut is before/after through an identical clip box. Measured on the two band
 * assets: 1693 pixels differ out of 964x173, bounded by x 624-754, y 31-59 - the
 * Claude Code vendor cell, inside row 3. Row 4 is pixel-identical across the cut.
 *
 * Nothing highlights, boxes or colours the changed cell. Section 6 again: "the
 * whole point is that nothing in the system marked it."
 */
/**
 * The vendor arm, S03 and S04, as one component so the two frames cannot drift.
 *
 * The crop is source scanlines 0-332 of the 964x680 adapter table: the column header
 * and rows 1, 2 and 3. Row 3 is Claude Code. Row 4 is `OpenAI Codex | OpenAI`, which
 * is a correct, shipped row, and it is **deliberately outside the crop**.
 *
 * script.md section 6 hazard 2 offers three shapes for this cut and rules out one of
 * them outright: "It does break the shot if the frame is a wide table. A viewer
 * scanning seven rows for 'the OpenAI one' finds two and cannot tell which the arm
 * touched." An earlier version of this shot held rows 3 and 4 together on the same
 * argument the section makes two bullets later ("if the crop can hold both rows
 * without confusing which one moved, hold both"). Program lead review found the
 * condition unmet: on the beat 4 frame alone the adjacency reads OpenAI Codex as the
 * plant. The conditional loses to the hazard.
 *
 * What is left is the section's primary instruction, unconditioned: before and after
 * on the Claude Code row specifically, same crop, same position, same scale, one
 * vendor cell changing. The header and the two rows above it are carried so the
 * stillness is visible - measured, they are pixel-identical across the cut, and the
 * 1753 px that differ are bounded to x 624-754, y 277-305, the Claude Code vendor
 * cell. No highlight, no box, no colour on the changed cell: nothing in the real
 * system marked it, which is the beat.
 */
const ArmBand: React.FC<{ src: string; at: number; children: React.ReactNode }> = ({ src, at, children }) => {
  const t = useTheme();
  const p = reveal(useCurrentFrame(), at, 16);
  const w = 1500;
  const h = Math.round((332 / 964) * w);
  return (
    <AbsoluteFill style={{ backgroundColor: t.bgDeep, alignItems: "center", justifyContent: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18, width: w }}>
        <div style={{ width: w, height: h, borderRadius: 12, overflow: "hidden", backgroundColor: "#FFFFFF" }}>
          <Img src={staticFile(src)} style={{ width: "100%", height: "100%", display: "block" }} />
        </div>
        <div
          style={{
            fontFamily: t.mono,
            fontSize: 22,
            letterSpacing: 2.4,
            textTransform: "uppercase",
            color: t.pillDim,
            paddingLeft: 4,
          }}
        >
          {copy.capAdapters}
        </div>
        {/* Fixed height, so the band does not shift when the pill arrives. */}
        <div style={{ height: 118, width: "100%", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              fontFamily: t.mono,
              fontSize: 29,
              backgroundColor: t.surfaceAlt,
              borderRadius: 999,
              padding: "16px 34px",
              opacity: p,
              transform: `translateY(${(1 - p) * 12}px)`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const S03: React.FC = () => {
  const t = useTheme();
  return (
    <ArmBand src="agentworks/adapters-arm-before.png" at={20}>
      <span style={{ color: t.pillDim }}>{copy.arm.path}</span>
      <span style={{ color: t.pillBright }}>{copy.arm.field}</span>
      <span style={{ color: t.pillDim }}>{copy.arm.from}</span>
      <span style={{ color: t.accent }}>&#8594;</span>
      <span style={{ color: t.accent, fontWeight: 500 }}>{copy.arm.to}</span>
    </ArmBand>
  );
};

export const S04: React.FC = () => {
  const t = useTheme();
  return (
    <ArmBand src="agentworks/adapters-arm-after.png" at={44}>
      <span style={{ color: t.trafficGreen, fontWeight: 500 }}>{copy.arm.verdict}</span>
      <span style={{ color: t.pillDim }}>&#183;</span>
      <span style={{ color: t.pillBright, fontWeight: 500 }}>{copy.arm.survived}</span>
      <span style={{ color: t.pillDim, fontSize: 23 }}>{copy.arm.verdictWhere}</span>
    </ArmBand>
  );
};

/** S05 - beat 5. What the nearest existing check actually bound. */
export const S05: React.FC = () => (
  <Drawn>
    <Kicker from={0}>{copy.presence.kicker}</Kicker>
    <ProbeRow label={copy.presence.rows[0].probe} result={copy.presence.rows[0].result} verdict="pass" from={0} />
    <ProbeRow label={copy.presence.rows[1].probe} result={copy.presence.rows[1].result} verdict="none" from={78} />
    <div style={{ height: 22 }} />
    <Verdict from={138}>{copy.presence.verdict}</Verdict>
  </Drawn>
);

/* ------------------------------------------------------------------ movement 3 */

/** S06 - beat 6. The method, three steps, the accent walking across them. */
export const S06: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const active = frame < 56 ? 0 : frame < 104 ? 1 : 2;
  return (
    <Drawn align="center" height={520}>
      <Kicker from={0}>{copy.method.kicker}</Kicker>
      <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
        {copy.method.steps.map((s, i) => {
          const at = i === 0 ? 0 : 12 + i * 22;
          const p = reveal(frame, at, 14);
          const on = i === active;
          return (
            <React.Fragment key={s}>
              {i > 0 ? <div style={{ width: 40 * p, height: 2, backgroundColor: t.connector }} /> : null}
              <div
                style={{
                  padding: "30px 34px",
                  borderRadius: t.radiusCard,
                  backgroundColor: t.surface,
                  border: `2px solid ${on ? t.accent : "transparent"}`,
                  fontFamily: t.mono,
                  fontSize: 30,
                  color: on ? t.pillBright : t.pillDim,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 12}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                {s}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </Drawn>
  );
};

/**
 * S07 - beat 7. The null control: the same fire from a change that changed nothing.
 *
 * The two verdicts are accent, not red. script.md section 7: "Everything green
 * until then, then red once, then never again", where "then" is beat 13. The film
 * has exactly one red frame and it is S13. Accent still says "this is the thing
 * that fired" without spending the one red the script allots.
 */
export const S07: React.FC = () => (
  <Drawn>
    <Kicker from={0}>{copy.control.kicker}</Kicker>
    <ProbeRow label={copy.control.rows[0].label} result={copy.control.rows[0].result} verdict="fired" from={0} />
    <ProbeRow label={copy.control.rows[1].label} result={copy.control.rows[1].result} verdict="fired" from={74} />
    <div style={{ height: 22 }} />
    <Verdict from={136}>{copy.control.verdict}</Verdict>
  </Drawn>
);

/**
 * S08 - beat 8. Eight published status definitions; two of them swap.
 *
 * Eight is not a design choice: `public-site/assets/portfolio.js`
 * STATUS_DEFINITIONS has exactly eight keys, read this session, and the two
 * definition strings shown are that file's verbatim text for `planned` and
 * `registered`. No count is printed - "eight" is not spoken.
 *
 * The names hold still and the prose crosses over. An earlier cut of this shot slid
 * the whole rows past each other, which looked like a swap and was not one: each
 * name carried its own definition with it, so the pairings never changed and the
 * end state was a reorder of a correct table under a narration that says two
 * definitions were swapped. Caught by reading frame 1370 against beat 8.
 */
export const S08: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const swap = reveal(frame, 88, 34);
  const rowH = 56;
  const defs = [copy.definitions.textA, copy.definitions.textB];
  return (
    <Drawn gap={20}>
      <Kicker from={0}>{copy.definitions.kicker}</Kicker>
      <div style={{ position: "relative", width: 1420, height: rowH * 8 }}>
        {copy.definitions.names.map((name, i) => {
          const p = reveal(frame, i === 0 ? 0 : i * 5, 12);
          const moves = i < 2;
          return (
            <div
              key={name}
              style={{
                position: "absolute",
                top: i * rowH,
                left: 0,
                width: "100%",
                height: rowH - 8,
                display: "flex",
                alignItems: "center",
                opacity: p,
                backgroundColor: moves ? t.surface : "transparent",
                borderRadius: 8,
                padding: "0 16px",
                boxSizing: "border-box",
              }}
            >
              <span
                style={{ fontFamily: t.mono, fontSize: 27, color: moves ? t.accent : t.pillDim, width: 324, flexShrink: 0 }}
              >
                {name}
              </span>
              {!moves ? (
                <span
                  style={{ height: 12, borderRadius: 6, backgroundColor: t.pillDim, opacity: 0.45, width: 660 - i * 44 }}
                />
              ) : null}
            </div>
          );
        })}

        {/*
         * The two definition strings, positioned over the name column and free of
         * their rows. Row 0's prose travels down to row 1 and row 1's travels up, so
         * at the end `planned` is carrying `registered`'s sentence and vice versa.
         * That is the falsehood beat 9 and beat 10 then fail to catch.
         */}
        {defs.map((text, i) => (
          <span
            key={text}
            style={{
              position: "absolute",
              top: i * rowH,
              left: 340,
              height: rowH - 8,
              display: "flex",
              alignItems: "center",
              fontFamily: t.mono,
              fontSize: 23,
              color: t.pillBright,
              whiteSpace: "nowrap",
              opacity: reveal(frame, i === 0 ? 0 : 5, 12),
              transform: `translateY(${(i === 0 ? swap : -swap) * rowH}px)`,
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </Drawn>
  );
};

/** S09 - beat 9. The staleness gate fires identically for both. Accent, not red - see S07. */
export const S09: React.FC = () => (
  <Drawn>
    <Kicker from={0}>{copy.staleness.kicker}</Kicker>
    <ProbeRow label={copy.staleness.rows[0].label} result={copy.staleness.rows[0].result} verdict="fired" from={0} />
    <ProbeRow label={copy.staleness.rows[1].label} result={copy.staleness.rows[1].result} verdict="fired" from={62} />
    <div style={{ height: 22 }} />
    <Verdict from={114}>{copy.staleness.verdict}</Verdict>
  </Drawn>
);

/** S10 - beat 10. The natural repair turns it green with the falsehood inside. */
export const S10: React.FC = () => {
  const t = useTheme();
  const p = reveal(useCurrentFrame(), 88, 20);
  return (
    <Drawn>
      <Kicker from={0}>{copy.regenerate.kicker}</Kicker>
      <ProbeRow label={copy.regenerate.action} result={copy.regenerate.result} verdict="pass" from={0} />
      <div style={{ height: 30 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 20, opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>
        <div style={{ width: 54, height: 3, backgroundColor: t.accent }} />
        <span style={{ fontFamily: t.mono, fontSize: 40, color: t.accent, fontWeight: 500 }}>
          {copy.regenerate.cost}
        </span>
      </div>
    </Drawn>
  );
};

/**
 * S11 - beat 11. The film's one quoted line, over a real gate.
 *
 * The recording is cropped to 1440x826 so its own burned-in caption is off frame.
 * That caption is a full sentence and beat 11 is the film's one quoted sentence;
 * running both at once is the on-screen-prose-against-narration defect that passes
 * every output gate and is caught only by reading the frame against the transcript.
 */
export const S11: React.FC = () => (
  <Evidence
    src="agentworks/rec-gate.mp4"
    kind="video"
    sourceW={1440}
    sourceH={826}
    maxW={1640}
    maxH={880}
    label={copy.rec}
    push={1.03}
    durationInFrames={133}
  />
);

/* ------------------------------------------------------------------ movement 4 */

/**
 * S12 - beat 12. Three sessions, one board.
 *
 * Identical panels, one word each, no names and no colour coding. script.md
 * section 7: "Do not add a label, a colour code, or two visually distinct
 * terminals that let a viewer start telling the participants apart." The only
 * thing that differs between the three is which row the accent sits on, which is
 * the beat's actual content - each is running someone else's finding.
 */
export const S12: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  return (
    <Drawn align="center" height={620}>
      <Kicker from={0}>{copy.loop.kicker}</Kicker>
      <div style={{ display: "flex", gap: 54, alignItems: "flex-start" }}>
        {[0, 1, 2].map((i) => {
          const at = i === 0 ? 0 : 8 + i * 14;
          const p = reveal(frame, at, 16);
          return (
            <div
              key={i}
              style={{
                width: 300,
                padding: 28,
                borderRadius: t.radiusCard,
                backgroundColor: t.surface,
                opacity: p,
                transform: `translateY(${(1 - p) * 16}px)`,
                display: "flex",
                flexDirection: "column",
                gap: 15,
              }}
            >
              <span style={{ fontFamily: t.mono, fontSize: 26, color: t.pillBright }}>{copy.loop.label}</span>
              {[0, 1, 2, 3].map((r) => {
                const rp = reveal(frame, at + 20 + r * 9, 10);
                return (
                  <div
                    key={r}
                    style={{
                      height: 13,
                      borderRadius: 6,
                      backgroundColor: r === i ? t.accent : t.pillDim,
                      opacity: r === i ? rp : rp * 0.5,
                      transform: `scaleX(${rp})`,
                      transformOrigin: "left center",
                      width: r === 3 ? "62%" : "100%",
                    }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ height: 12 }} />
      <Line from={96} size={30} dim>
        {copy.loop.verdict}
      </Line>
    </Drawn>
  );
};

/**
 * S13 - beat 13. The film's only red frame.
 *
 * Same prompt, same command, same component as S01 - script.md section 6 hazard 4
 * wants the same suite shown twice, green then red, with the reason in between. No
 * pass/fail tally is printed: this session did not run the suite under the arm, so
 * the tally is a number it may not state. The one thing it can source is the name
 * of the test, which it read at tests/dashboard-regression.mjs:1059.
 */
export const S13: React.FC = () => (
  <Drawn align="center">
    <Kicker from={0}>{copy.closed.kicker}</Kicker>
    <Shell
      prompt={copy.suite.prompt}
      command={copy.suite.command}
      from={0}
      fontSize={25}
      width={1440}
      lines={[
        { text: copy.suite.redLine, tone: "fail", from: 72 },
        { text: `  ${copy.suite.redWhere}`, tone: "dim", from: 84 },
      ]}
    />
    <div style={{ height: 4 }} />
    <Line from={118} size={28} dim>
      {copy.closed.lines[0]}
    </Line>
  </Drawn>
);

/** S14 - beat 14. The ledger case: a grep with no word boundary. */
export const S14: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  return (
    <Drawn align="center">
      <Kicker from={0}>third case &#183; this script</Kicker>
      <Shell
        prompt={copy.ledgerCase.prompt}
        command={copy.ledgerCase.badCommand}
        from={0}
        width={1300}
        fontSize={30}
        lines={[{ text: copy.ledgerCase.badResult, tone: "bright", from: 86 }]}
      />
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: 24 }}>
        {copy.ledgerCase.falsePositives.map((w, i) => {
          const p = reveal(frame, 138 + i * 16, 12);
          return (
            <div
              key={w}
              style={{
                fontFamily: t.mono,
                fontSize: 38,
                color: t.accent,
                backgroundColor: t.surface,
                borderRadius: 999,
                padding: "12px 32px",
                opacity: p,
                transform: `translateY(${(1 - p) * 12}px)`,
              }}
            >
              {w}
            </div>
          );
        })}
      </div>
    </Drawn>
  );
};

/**
 * S15 - beat 15. Corrected to 37, then 38, with the instant the 38 was taken.
 *
 * The command is set as a plain mono line, not as a `Kicker`. `Kicker` applies
 * `text-transform: uppercase`, which rendered this shot's command as
 * `--GREP='\BARMS\?\B'` - and `\B` is not `\b`, it is the negation of it. A film
 * about claims that pass their checks and are false cannot put a corrupted regex on
 * screen. Caught by reading frame 2774.
 */
export const S15: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const big = (v: string, at: number, color: string) => {
    const p = reveal(frame, at, 14);
    return (
      <span
        style={{
          fontFamily: t.mono,
          fontSize: 124,
          fontWeight: 500,
          color,
          opacity: p,
          transform: `translateY(${(1 - p) * 14}px)`,
          display: "inline-block",
          lineHeight: 1,
        }}
      >
        {v}
      </span>
    );
  };
  const strike = reveal(frame, 14, 20);
  return (
    <Drawn align="center" height={520} gap={38}>
      <div style={{ fontFamily: t.mono, fontSize: 27, color: t.pillDim, whiteSpace: "pre" }}>
        {copy.ledgerCase.goodCommand}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        <span style={{ position: "relative", display: "inline-block" }}>
          {big(copy.ledgerCase.badResult, 0, t.pillDim)}
          <span
            style={{
              position: "absolute",
              left: -6,
              top: "44%",
              height: 5,
              width: `${strike * 108}%`,
              backgroundColor: t.accent,
            }}
          />
        </span>
        <span style={{ fontFamily: t.mono, fontSize: 52, color: t.pillDim }}>&#8594;</span>
        {big(copy.ledgerCase.goodResult, 40, t.pillBright)}
        <span style={{ fontFamily: t.mono, fontSize: 52, color: t.pillDim }}>&#8594;</span>
        {big(copy.ledgerCase.laterResult, 84, t.accent)}
      </div>
      <Line from={100} size={27} dim>
        {copy.ledgerCase.laterAt}
      </Line>
    </Drawn>
  );
};

/**
 * S16 - beat 16. The instrument, as reported.
 *
 * Drawn, and it has to be: this is a shell returning output for commits that do not
 * exist, which is not a thing that can be recorded on a working machine. The three
 * hashes and the diffstat are the strings board post 53 reported, cleared for screen
 * by script.md section 3b. No clock, no timestamp, no duration.
 */
export const S16: React.FC = () => (
  <Drawn align="center">
    <Kicker from={0}>fourth case &#183; not ours</Kicker>
    <Shell
      prompt={copy.instrument.prompt}
      command={copy.instrument.command}
      from={0}
      width={1180}
      fontSize={30}
      lines={[
        { text: `${copy.instrument.hashes[0]}   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`, tone: "bright", from: 58 },
        { text: `${copy.instrument.hashes[1]}   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`, tone: "bright", from: 68 },
        { text: `${copy.instrument.hashes[2]}   \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500`, tone: "bright", from: 78 },
        { text: " ", tone: "dim", from: 86 },
        { text: copy.instrument.diffstat, tone: "dim", from: 94 },
      ]}
    />
    <div style={{ height: 10 }} />
    <Verdict from={132} size={36}>
      {copy.instrument.landed}
    </Verdict>
  </Drawn>
);

/**
 * S17 - beat 17. The same three hashes, probed.
 *
 * This output is real. Run by this session, read-only, in the Hack-2026 working
 * tree: `git cat-file -e <hash>^{commit}` returned non-zero for all three.
 *
 * Accent, not red. The three `false`s are the film's hardest reversal and the
 * temptation to paint them red is exactly what script.md section 7 forbids: red
 * happens once, at beat 13, then never again. Beat 17 is after beat 13.
 */
export const S17: React.FC = () => {
  const t = useTheme();
  const p = reveal(useCurrentFrame(), 72, 14);
  return (
    <Drawn align="center" height={560}>
      <Shell
        prompt={copy.catFile.prompt}
        command={copy.catFile.command}
        from={0}
        width={1180}
        fontSize={30}
        lines={copy.catFile.rows.map((r, i) => ({
          text: `${r.hash}   ${r.result}`,
          tone: "accent" as const,
          from: 34 + i * 12,
        }))}
      />
      <div style={{ fontFamily: t.mono, fontSize: 24, color: t.pillDim, opacity: p }}>
        verified in this repository, read only
      </div>
    </Drawn>
  );
};

/** S18 - beat 18. The finding goes back to the session that made the error. No name. */
export const S18: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  return (
    <Drawn align="center" height={520}>
      <div
        style={{
          width: 980,
          padding: 40,
          borderRadius: t.radiusCard,
          backgroundColor: t.surface,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <span
          style={{ fontFamily: t.mono, fontSize: 21, letterSpacing: 3, textTransform: "uppercase", color: t.pillDim }}
        >
          {copy.published.kicker}
        </span>
        <span style={{ fontFamily: t.mono, fontSize: 40, color: t.accent, fontWeight: 500 }}>
          {copy.published.title}
        </span>
        {[0, 1, 2].map((r) => {
          const rp = reveal(frame, 14 + r * 8, 10);
          return (
            <div
              key={r}
              style={{
                height: 13,
                borderRadius: 6,
                backgroundColor: t.pillDim,
                transform: `scaleX(${rp})`,
                transformOrigin: "left center",
                width: r === 2 ? "48%" : "100%",
              }}
            />
          );
        })}
      </div>
      <Line from={50} size={27} dim>
        {copy.published.note}
      </Line>
    </Drawn>
  );
};

/**
 * S19 - beat 19. A command whose answer you already know.
 *
 * Real. Run by this session; the digest printed is the value SHA-256 of "abc" has
 * always had, and VISION.md section 4 records it as the known-answer probe every
 * number in that ledger was produced under.
 */
export const S19: React.FC = () => (
  <Drawn align="center" height={560}>
    <Shell
      prompt={copy.probe.prompt}
      command={copy.probe.command}
      from={0}
      width={1500}
      fontSize={26}
      lines={[
        { text: `${copy.probe.got}  -`, tone: "bright", from: 56 },
        { text: " ", tone: "dim", from: 64 },
        { text: copy.probe.expect, tone: "dim", from: 72 },
      ]}
    />
    <div style={{ height: 6 }} />
    <Verdict from={94} size={42}>
      {copy.probe.verdict}
    </Verdict>
  </Drawn>
);

/* ------------------------------------------------------------------ movement 5 */

/**
 * S20 - beat 20. Five products.
 *
 * The dashboard's own card grid, not a directory listing. script.md section 6
 * hazard 1: `products/` holds six tracked directories because `products/agent-org`
 * is deliberately unregistered, so a file tree, sidebar or IDE explorer here would
 * show six under a narration that says five. Measured on the page before shooting:
 * the first `.cards` grid holds exactly 5, and the only other card on the page is in
 * section 7, captioned "not one of the 5 products", and is outside this clip.
 */
export const S20: React.FC = () => (
  <Evidence
    src="agentworks/five-cards-compact.png"
    kind="image"
    sourceW={2300}
    sourceH={786}
    maxW={1720}
    maxH={660}
    label={copy.capCards}
    push={1.02}
    durationInFrames={86}
  />
);

/** S21 - beat 21. The promotion rule, and the binding that makes it a rule. */
export const S21: React.FC = () => {
  const t = useTheme();
  const frame = useCurrentFrame();
  const bind = reveal(frame, 68, 20);
  return (
    <Drawn align="center" height={600}>
      <Kicker from={0}>{copy.promotion.kicker}</Kicker>
      <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
        {copy.promotion.rows.map((r, i) => {
          const p = reveal(frame, i === 0 ? 0 : 20, 16);
          return (
            <React.Fragment key={r}>
              {i > 0 ? (
                <span style={{ fontFamily: t.mono, fontSize: 30, color: t.pillDim, opacity: p }}>and</span>
              ) : null}
              <div
                style={{
                  padding: "30px 38px",
                  borderRadius: t.radiusCard,
                  backgroundColor: t.surface,
                  fontFamily: t.mono,
                  fontSize: 29,
                  color: t.pillBright,
                  opacity: p,
                  transform: `translateY(${(1 - p) * 14}px)`,
                  whiteSpace: "nowrap",
                }}
              >
                {r}
              </div>
            </React.Fragment>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          opacity: bind,
          fontFamily: t.mono,
          fontSize: 28,
          color: t.accent,
        }}
      >
        <div style={{ width: 40, height: 2, backgroundColor: t.accent }} />
        {copy.promotion.bind}
        <div style={{ width: 40, height: 2, backgroundColor: t.accent }} />
      </div>
      <div style={{ height: 10 }} />
      <Verdict from={112} size={42}>
        {copy.promotion.verdict}
      </Verdict>
    </Drawn>
  );
};

/**
 * S22 - the last image, and it is a recording.
 *
 * script.md section 6 placement 3: the closing statement belongs to the product, not
 * to the narrator. This is the only recorded shot that keeps its own burned-in
 * caption, because that caption - "Documented is not executed, and the product says
 * so itself" - agrees with the two narration lines playing over it.
 *
 * TWO CROPS OF THE SAME FRAME, NOT ONE. The product draws its caption as FIXED PAGE
 * CHROME occupying source scanlines 793-900; page content scrolls behind it. Measured
 * across source frames 2000-2900 at 15-frame intervals, the band's top rule sits at
 * y=816 in every single frame and the caption text is present in every single frame.
 * There is no caption-free frame of this section to cut to.
 *
 * WHY THE COLUMN HEADER IS NOT IN THE FRAME. An earlier cut carried the header
 * ("Surface | State | Where a human would install it | Not proven") with no data row
 * under it. Program lead review called that correctly: a header that promises columns
 * the frame never shows. The obvious fix - open the crop until a data row appears -
 * was tested and rejected on evidence. The first data row occupies source scanlines
 * 806-826, which is inside the band, and the band's own top rule at y=816 runs
 * horizontally through the middle of every cell on it. Magnified 3x, "GitHub Copilot",
 * "documented", "nothing to install" and the "Not proven" paragraph are all struck
 * through. Placing a struck-out "documented" under a caption that reads "Documented is
 * not executed" invites the viewer to read the strike as the product crossing the word
 * out. That is a false reading manufactured by the crop, on the last frame of a film
 * about false readings. So the header is dropped instead, which is the reviewer's
 * stated fallback: a sliced header is worse than no header, and a header with a
 * struck-through row under it is worse than both.
 *
 * WHAT THE FRAME CARRIES. Source scanlines 670-761 (the card's top rule, PORTABILITY,
 * "Surface compatibility states", "Read compatibility record") above source scanlines
 * 846-893 (the product's sentence). Verified by row-matching the built asset back
 * against source frame 2400: output row 0 matches source row 670. The header glyphs
 * begin at source y~770 and the densest row in the upper band measures 12 mean luma
 * against the header's 30-34, so no part of the header is in the frame.
 *
 * OPAQUE BACKING. The elided scanlines 762-845 are replaced by 16 rows of the film's
 * own surface grey (#1A1F21), so the join cannot be mistaken for a continuous
 * screenshot, and the caption crop has every value at or below 22/255 flattened to a
 * constant 7 - the product's own band background luma. The remnant product copy that
 * bled through the semi-transparent band peaked at 18 and is inside that range; the
 * sentence peaks at 251 and is untouched. Measured on the built asset, the region
 * right of the sentence (x 1080-1439 across the whole caption band) now runs peak 9 /
 * min 4, which is x264 noise around a flat 7 with no glyph structure left in it. The
 * backing is opaque by measurement.
 *
 * WHY THE MATTE. `Evidence` paints bgDeep full-frame. A 1440x156 strip leaves ~84% of
 * the picture at luma 3, and the first cut of this fix put only 9.6% of the frame above
 * luma 23 - just under the percentile knee - so contrast.mjs read the closing shot as
 * an UNINTENDED WASH at spread 3. That was a true finding, not a false alarm: the shot
 * really was a thin bright strip in a void. The 54px surfaceAlt matte is the fix.
 */
export const S22: React.FC = () => (
  <Evidence
    src="agentworks/rec-honest.mp4"
    kind="video"
    sourceW={1440}
    sourceH={156}
    maxW={1680}
    maxH={300}
    matte={54}
    label={copy.rec}
    push={1.02}
    durationInFrames={130}
  />
);
