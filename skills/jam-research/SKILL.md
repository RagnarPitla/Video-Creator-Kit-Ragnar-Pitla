---
name: jam-research
description: |
  Build the evidence base for a Jam Studio episode before any script is written: gather sources,
  build a claim ledger, separate fact from framing. Use when the user picks a jam topic, says
  "research this video", "get the facts", or before writing script.json for anything factual.
user-invokable: true
argument-hint: "[topic]"
metadata:
  tags: research, fact-check, claim-ledger, jam-studio
---

# Jam research

These videos state numbers about real companies to an audience that includes Ragnar's
colleagues and customers. A wrong figure in a 60 second video is not a small error —
it is a screenshot with his name on it.

Nothing gets scripted until it is in the ledger.

## Output

Two files in the episode folder.

`research.md` — readable notes. What the concept is, how it works, the history, the
numbers, the disputes, the good analogies you found, and what you deliberately left out.

`facts.json` — the ledger. Every claim that will be spoken or shown:

```jsonc
{
  "claims": [
    {
      "id": "c1",
      "claim": "Anthropic was founded in 2021 by Dario and Daniela Amodei after leaving OpenAI",
      "usedIn": ["b3"],
      "source": "https://...",
      "sourceType": "primary",        // primary | secondary | vendor | press | inference
      "confidence": "high",           // high | medium | low
      "checkedOn": "2026-08-30",
      "note": "founding year is reported variously as 2020 and 2021, see research.md"
    }
  ]
}
```

`./jam align` does not enforce the ledger. Ragnar's review does. An episode presented
without one is not ready.

## Rules

**Every number carries a date.** "Anthropic raised sixty four billion" is unusable in
twelve months. "As of early twenty twenty six" makes it survivable and makes the claim
checkable.

**Name the source in the ledger even when the script does not say it.** The script says
"eight of the Fortune ten are customers". The ledger says who published that and when.

**Separate fact from framing.** "Palantir's stock went from seven dollars to two hundred
and seven" is a fact. "OpenAI built Palantir's killer app" is framing — a defensible
opinion, and the video is better for having one. Mark framing as framing in the ledger
with `sourceType: "inference"` so it never gets defended as a fact.

**Where there is genuine dispute, say there is dispute.** The reference does this well:
"Some say they took a principled stand. Others label it a business risk." That is
honest and it is more interesting than picking a side.

**Confidence low means cut or caveat.** Do not launder a low-confidence claim into
confident narration because it makes a better line. This is the one rule with no
exceptions.

## Ragnar-specific sources

For anything touching Copilot Studio, Dynamics 365, MCP, agent architecture, or the
Niyam pattern, check his own material first. It is more accurate than the web and it
is his differentiator:

- `~/RagnarWiki/` — cross-project concepts, decisions, lessons. Read `index.md` first.
- `~/Documents/VS Code Repo/wiki/` — workspace wiki, project relationships and patterns.
- `~/Documents/Youtube-Library-Rbuild/_Productions/` — finished productions with scripts and articles already fact-checked.

If the episode produces a genuinely reusable cross-project insight, offer to file it
back into `~/RagnarWiki/` per the rules in `~/RagnarWiki/AGENTS.md`.

**Views expressed are his own** applies to anything touching Microsoft product
direction. Flag it when the topic gets near.

## Method

1. Define the one sentence the viewer should be able to say afterwards. Research
   serves that sentence, not general coverage.
2. Check Ragnar's own material.
3. Go outward for numbers, dates and history. Prefer primary sources: filings, official
   blogs, documentation. Press coverage is a pointer to a primary source, not a source.
4. Collect analogies as you go. The best ones come from the domain itself, not from
   inventing a metaphor afterwards. Note them in `research.md` under a heading, because
   the narration skill needs them.
5. Write the ledger.
6. Note explicitly what you left out and why. An episode is a set of cuts, and knowing
   what was cut stops the next person re-researching it.

## What good looks like

The Palantir reference video is 417 words. Behind it: a founding year, five founders,
a named CIA venture arm, a dollar figure, a launch year for two named products, an IPO
price, a trough price, a peak price with a month attached, and two named job functions.
Almost every sentence carries a checkable fact.

That density is the standard. It is also why these videos take research and not just
writing.
