---
name: mia-Html
description: Build a single-file HTML design or architecture document in the Microsoft house style used for Dynamics 365 MIA - light by default with a dark toggle, Microsoft brand colours, the Microsoft four-square mark, hand-drawn SVG topology and sequence diagrams, and status pills that separate what is running from what is only designed. Use when you want an architecture doc, a threat model, a design review, a trust-boundary write-up, an executive one-pager or any technical document that will be read in a browser and shared as one file. Also use when a Markdown doc needs to become something a reviewer will actually read, or when a page needs to distinguish current state from target state.
verified_on: 2026-08-26
provenance: "Extracted from mia-how-it-works-executive.html and mia-coreservices-architecture-and-trust-boundaries V2.html, both built for Core Services and QA'd in a real browser. The CSS and theme script in assets/ are the shipped files verbatim, not a rewrite. The QA gate exists because it caught two rendering bugs that reading the markup did not."
---

A design document is read once, by someone deciding whether to trust the system
it describes. Two things sink it: a reader who cannot tell which parts are built
and which are aspirational, and a diagram whose labels sit on top of each other.
This skill is the fix for both, plus the visual style so the next one does not
start from a blank file.

## The rule that matters most

**Every claim carries a status.** A threat model of a design that is not deployed
protects nobody, and an architecture doc that mixes shipped behaviour with
intended behaviour trains readers to disbelieve all of it. Four pills:

| Pill | Class | Means |
|---|---|---|
| RUNNING | `p-now` | Deployed and exercised end to end |
| POC ONLY | `p-poc` | A deliberate shortcut with a known reversal |
| DESIGNED | `p-target` | Agreed but not built |
| GAP | `p-gap` | The doc and the code disagree, or a stated control does not hold |

Put a pill on the section heading, and on individual table rows where a section
is mixed. If you cannot decide a pill, you have not read enough source yet - go
read the code, not the doc that describes the code.

## Build it

1. Copy `assets/template.html`, paste `assets/mia.css` inline into `<style>` and
   `assets/theme.js` inline into `<script>`. **Keep it one file.** These get
   shared over Teams and email; a linked stylesheet does not survive that.
2. Write sections. Lead each with a sentence that states the point, not the topic.
3. Draw diagrams (below).
4. Run the QA gate. Do not hand over a file that has not passed it.

## Diagrams

Hand-place SVG coordinates in a `viewBox` of `0 0 1120 H`. Element classes:

- Containers: `s-plane` (dashed, a tenant or ownership boundary), `s-panel`
- Nodes: `s-trust` (blue, holds a credential), `s-untrust` (red, holds nothing),
  `s-cust` (green, the customer's), `s-gate` (purple, a check)
- Text: `.t` title, `.td` detail, `.lbl`, `.sm`, `.xs`, `.bnd` (boundary tag)
- Lines: `.arw` with `marker-end="url(#a1)"`, `.arw.dash` for a return path

The colour carries meaning. Red is not danger, it is *holds no credential* - that
asymmetry is usually the whole architectural argument, so let the diagram make it.

Put the Microsoft four-square mark inside the plane that is Microsoft's. It is the
fastest way to show a tenant boundary to an audience that skims.

**Route return lines down the outside edge, never through the middle.** A line
from a lower-right node back to an upper-left one will cross the captions of
everything between them. Drop to the left margin first, travel, then come up:
`M90,254 L90,372 L666,372`. This exact bug shipped once and was invisible in the
markup.

## Callouts

- `.note` neutral, for the status legend and framing
- `.note.tm` "Threat model relevance" - what the section means for the reader's job
- `.note.warn` a contradiction: state the claim, then the evidence, then the consequence

Reference real finding IDs (`<span class="fid">T-01</span>`) and real boundary IDs
(`b1`..`b8`) that exist in the source threat model. Never invent an ID to make a
callout look rigorous.

## QA gate

```bash
NODE_PATH=/Users/ragnarpitla/.hermes/node/lib/node_modules/@playwright/mcp/node_modules \
  node ~/.copilot/skills/mia-Html/scripts/qa.js <file.html>
```

Checks ASCII cleanliness, light default, the toggle both ways, the Microsoft mark,
**SVG text collisions**, horizontal overflow at 375/768/1280/1440, dead in-page
anchors, and console errors. Exits non-zero on any failure.

Then take a full-page screenshot in both themes and *look at it*. The collision
test catches text-on-text; only a human eye catches text-on-*line*.

### Bugs this gate exists to catch

Each of these passed every syntactic check and shipped anyway:

- **A dashed return line drawn through three centred captions.** Found by
  screenshot, then reproduced by the bbox test.
- **A four-column table pushing the page to 599px at a 375px viewport.** Table
  layout floors at min-content and stops shrinking. Fixed by
  `@media(max-width:760px){table{display:block;overflow-x:auto}}`.
- **Long `<code>` identifiers** such as a test name or a scope URL have no break
  opportunity and push the page. Fixed by `overflow-wrap:anywhere` on `code`.
- **`.call b{display:block}` breaking every inline bold on the page.** Scope
  block-level rules to `.call > b:first-child`, never the bare descendant.

## House style

- Light is the default. `data-theme="light"` on `<html>`, persisted to
  `localStorage` under `mia-theme`. Dark is a real theme, not an inversion:
  diagram fills have their own dark values.
- Microsoft brand colours for the mark only (`#F25022 #7FBA00 #00A4EF #FFB900`).
  Do not decorate with them.
- ASCII only. No em dashes, smart quotes, arrows or typographic symbols - they
  render as garbage in half the places these documents get pasted.
- Numbered sections with `<span class="n">` and a two-column `.toc`.
- Say the date and the source the document was read from in the `.meta` line. A
  design doc without a read-date is indistinguishable from a stale one.
