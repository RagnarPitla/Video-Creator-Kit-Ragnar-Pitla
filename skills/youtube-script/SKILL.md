---
name: youtube-script
description: |
  YouTube script generator for Ragnar Pitla's tech thought leadership content. Creates scripts in
  Ragnar's natural speaking voice — flowing, conversational, business-leader tone (not presenter tone).
  Outputs transcript-style scripts ready for teleprompter with hook alternatives, B-roll cues,
  production notes, and title options. Use when user says "youtube script", "/youtube-script",
  "video script", "write a youtube video", "create script", or wants to create YouTube content.
user-invokable: true
argument-hint: "[topic, concept, or rough outline for the video]"
---

# YouTube Script Generator — Ragnar Pitla

Generate production-ready YouTube scripts in **Ragnar's natural speaking voice** — flowing, conversational, like explaining something important to a smart colleague.

---

## THE VOICE — THIS IS THE MOST IMPORTANT THING

The script must sound like Ragnar talking. Not presenting. Not announcing. Talking.

### How Ragnar Sounds
- **Practitioner sharing, not selling** — "I work on Microsoft's Agentic team. Here's what I've learned."
- **Confident without hype** — "Think about that for a second." NOT "That's a massive game-changer!"
- **Framework-driven** — Structures ideas clearly, gives people mental models they can screenshot
- **Builds to authority** — Starts conversational, ends with earned conviction
- **Microsoft-aware but not promotional** — References the work without selling it
- **No hedging** — "This is how it works" not "This might work for some"

### Lines to NEVER Write
These are generic, salesy, or fake-sounding. Ragnar will reject them:
- "That's a massive statement / game-changer / paradigm shift"
- "And that's what makes it so exciting"
- "This was built for X from the ground up"
- "X has taken this to a completely different level"
- "And that's what makes this moment so important"
- Any line that tells the viewer how to feel instead of letting them feel it

### What to Write Instead
- "Think about that for a second." (instead of "That's massive.")
- "And that's what I want to show you today." (instead of "And that's what makes it so exciting.")
- "This isn't an afterthought. This is how it was designed." (instead of "Built from the ground up.")
- "And that's why starting now matters." (instead of "And that's what makes this moment so important.")
- "And if you work in enterprise, you already know what that means." (instead of telling them what it means)

### The Read-It-Out-Loud Test
Every sentence must pass: **Would Ragnar say this to a colleague at a whiteboard?** If it sounds like a press release, a product launch, or a YouTube announcer — rewrite it.

---

## CRITICAL RULE: THE FIRST 10 SECONDS

The hook decides everything. YouTube retention graphs show the steepest drop-off between 0:05 and 0:15.

**Spend 50% of your creative energy on the first line.**

The best hooks from Ragnar's videos:
- Open with a bold, simple statement of what changed: "Business skills just went enterprise. And I don't think we've caught up on what that actually means."
- NOT a generic "In this video I'm going to show you..."
- NOT an analogy that takes 30 seconds to set up (unless Ragnar specifically asks for one)
- The hook should make someone who was about to scroll think "wait, what?"

### After the Hook — The Value Promise
Immediately after the hook, tell viewers exactly what they'll learn. Be specific:
- What you'll explain (the concept)
- Why it matters to them (the stakes)
- What you'll show live (the demo/proof)
- Any downloadable resource (link in description)

This is a contract with the viewer. They stay because you promised something concrete.

---

## SCRIPT FORMAT — TRANSCRIPT STYLE

Write scripts as **flowing paragraphs** — the way someone actually talks. NOT in teleprompter short-line format. NOT with [PAUSE] [BEAT] [SLOW] cues unless Ragnar asks for teleprompter format.

Use `##` headers to mark sections. These are for Ragnar's reference while reading, not spoken aloud.

### Section Structure

```markdown
## [Section Name]

Flowing paragraphs of natural speech. The way you'd actually
say this out loud. Conversational. Direct.

New paragraph for new thought. Keep paragraphs short — 2-4
sentences max. Let the ideas breathe.
```

---

## STEP 1: Determine Video Type

| Type | Duration | Structure |
|------|----------|-----------|
| **Short-form** | 60-90s | Hook → 1 insight → CTA |
| **Standard** | 3-5 min | Hook → 2-3 insights → example → CTA |
| **Deep-dive** | 8-15 min | Hook → context → 3-5 insights → demo → future vision → CTA |
| **Essay** | 15-30 min | Hook → thesis → supporting arguments → counterarguments → synthesis → CTA |

Default to **Deep-dive (8-15 min)** for Ragnar's content unless specified.

---

## STEP 2: Hook Formula

### The 7 Hook Types — Always Generate 3-4 Alternatives

1. **The Bold Statement** — State what changed, simply
   - "Business skills just went enterprise."
   - "Skills went from personal configuration to organizational infrastructure. And I don't think we've caught up."

2. **The Contrarian** — Flip a popular belief
   - "Everyone's writing longer agent instructions. That's the wrong approach."
   - "MCP vs Skills isn't the right question. Let me reframe it."

3. **The Value Promise** — State exactly what they'll learn
   - "In the next 9 minutes, I'll show you the difference between general skills and business skills — and why it matters for your agents."

4. **The Provocative Question** — Ask something that demands an answer
   - "If everyone has AI agents, why don't they know how your business actually works?"

5. **The Confession** — Vulnerability builds trust
   - "I've been writing longer and longer agent instructions trying to fix this. It wasn't working."

6. **The Stakes** — Make them feel the cost of not watching
   - "If you're building agents without business skills, you're giving them intelligence without expertise."

7. **The Pattern Interrupt** — Something unexpected
   - Open with a screen recording of the result, then rewind to explain how

**Always include at least 3 hook alternatives at the bottom of the script** so Ragnar can pick the one that feels right on camera.

---

## STEP 3: Script Structure

### Opening (0:00-1:30)
1. **Hook** — Bold first line
2. **Value promise** — What they'll learn, what you'll demo, any downloadable resources
3. **Context** — Set the stage for why this matters NOW (industry shifts, recent launches, what changed)
4. **Transition** — "Let's get into it."

### The Shifts / Context Section (1:30-3:00)
When covering industry evolution or background:
- Frame as 2-3 clear shifts, not a timeline dump
- Each shift: what changed → why it matters → how it connects to the main topic
- End with: "And that's what I want to show you today" or similar bridge to the core content

### Core Content (3:00-7:00+)
Structure as a natural flow of ideas, each building on the last:
- **The Problem** — What's missing, what doesn't work, the gap. Use specific examples from real business processes (AP, procurement, finance, month-end close)
- **The Solution** — What was built and why it's different. Be specific about architecture, not vague about value
- **How It Works** — Make it concrete. One line, one step, one demo. The simpler the better
- **What It Means** — Zoom out. Frameworks, tiers, organizational implications. This is where Ragnar's "framework-driven" voice shines

### The Insight That Sticks (7:00-8:00)
At ~70% mark, deliver the one line people will remember:
- "Instructions tell your agent what to do. Skills teach your agent how your business actually works."
- "Skills compound. Prompts don't."
- Structure as: short punchy statement → evidence → implication

### Demo (if applicable)
- Mention the demo in the hook so viewers stay for it
- Keep it 1-2 minutes
- Note prerequisites (environments, tools needed)
- Show the transformation: file → governed asset → agent discovery

### Future Vision / Teaser (30 seconds)
- Tease upcoming content: "I'm working on X — more on that in the next video"
- Thread these teasers throughout the script (intro, middle, end) — not just at the end
- Frame as forward-looking: "And where I see this heading..." not as current fact unless verified

### Close
- Concrete next step (not "subscribe and like" — tell them exactly what to do)
- Mention downloadable resources again (link in description)
- Comment prompt: ask a specific question ("What business process would you turn into a skill first?")
- Callback to the opening hook for closure

---

## STEP 4: Tone Calibration

### Pattern Interrupts (Every 60-90 Seconds)
- "Here's the thing."
- "Stay with me on this."
- "This is the part most people miss."
- "Think about it."
- "Now here's the thing nobody talks about..."
- Rhetorical questions: "So what does this actually mean?"

### Rhythm
- Mix short punchy sentences with longer flowing ones
- Short sentence lands the point. Longer sentence explains it and gives context for why it matters and what to do about it.
- New paragraph = new breath. Keep them to 2-4 sentences.

### What Ragnar Does NOT Do
- Announce what he's about to say before saying it ("I'm going to tell you three things...")
- Summarize what he just said at the end of every section
- Use filler transitions ("With that being said...", "Moving on to...")
- Hedge ("This could potentially maybe work for some organizations...")

---

## STEP 5: Technical Accuracy

Before finalizing any script:
- Verify all technical claims against source docs / research
- Flag preview vs. GA features — never overstate availability
- Note prerequisites for any demo or tutorial steps
- Position forward-looking claims as "where I see this heading" not as current fact
- Include Microsoft disclaimer: "Views expressed are my own and do not represent Microsoft's official position"

---

## OUTPUT FORMAT

```markdown
# [VIDEO TITLE]

**Duration:** X-X min
**Tone:** [e.g., "Business leader sharing — positive, energized, educational"]

---

[Full flowing script with ## section headers]

---

_Disclaimer: Views expressed are my own and do not represent Microsoft's official position._

---

## PRODUCTION NOTES

| Element | Detail |
|---------|--------|
| **Tone** | [Description] |
| **Pacing** | [Description] |
| **Key Moments** | [The lines/sections to nail] |
| **Demo** | [What to show, prerequisites] |
| **Estimated Runtime** | [X:XX] |

---

## TITLE OPTIONS

1. [Option 1]
2. [Option 2]
3. [Option 3]
4. [Option 4]

---

## HOOK ALTERNATIVES

If the main hook doesn't land in filming, try:
- **[Type]:** "[Alternative hook]"
- **[Type]:** "[Alternative hook]"
- **[Type]:** "[Alternative hook]"
```

---

## RAGNAR'S CONTENT PATTERNS — LEARNED FROM BUILDING SCRIPTS

These patterns come from real iteration on Ragnar's scripts. Follow them:

### The "Missing Piece" Structure
Ragnar's strongest scripts identify a gap everyone feels but can't name:
- "We had intelligence. We had tools. We had policies. But we were missing [X]."
- Build the list of what exists, then reveal what's missing. The gap becomes the thesis.

### The Three Tiers Framework
When explaining organizational impact, structure as three tiers:
- Tier 1: Standard (org-wide, consistent)
- Tier 2: Methodology (best people's expertise, high-value)
- Tier 3: Personal (individual productivity)
This gives viewers a framework they can immediately apply.

### Thread the Teasers
Don't save all future content mentions for the end. Seed them throughout:
- Intro: light mention ("I'm working on something exciting — more on that later")
- Middle: natural context ("the skill you write today evolves — I'm working on automating that")
- End: concrete promise ("I'll be sharing how in an upcoming video")

### Enterprise Credibility Without Selling
Ragnar establishes credibility by naming his role and what he does daily — not by listing credentials:
- "I work on Microsoft's Agentic team. I deploy AI agents in D365 F&O using Copilot Studio."
- This is enough. Don't oversell. The rest of the script earns the authority.

### Specific Business Examples
Always use concrete D365/enterprise examples, not abstract ones:
- "Your accounts payable team handling duplicate invoices"
- "Your procurement lead evaluating vendors across legal entities"
- "Your finance team's month-end close process"
These ground the script in reality and signal expertise.
