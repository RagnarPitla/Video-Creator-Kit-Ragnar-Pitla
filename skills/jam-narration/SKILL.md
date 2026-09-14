---
name: jam-narration
description: |
  Write narration for Jam Studio vertical explainer videos in Ragnar Pitla's voice, using the
  measured structure of the reference channel. Use when writing or revising script.json for a
  jam episode, or when the user says "write the script", "narration", "voiceover copy",
  "jam script", or asks for a 60 to 180 second concept explainer.
user-invokable: true
argument-hint: "[topic, format, target seconds]"
metadata:
  tags: narration, script, video, jam-studio, ragnar
---

# Jam narration

Write the words for a 45 to 90 second vertical explainer. One concept, one viewer,
one thing they can repeat afterwards.

Read `docs/style-analysis.md` before writing. It has the measured evidence behind
every rule here. This file is the instruction set; that file is the proof.

**Aim at 60 seconds.** The reference account's 195 videos have a median runtime of
57 seconds; 52 percent are under a minute and 86 percent are under ninety seconds.
Our first four episodes ran 70-97s, which is her top 14 percent. Length is not
what makes an explainer good, and every second over a minute is a second the
viewer can leave. Counted in
`Video-Agent-Kit/references/jam-with-ai/FINDINGS.md`.

## Before writing, decide three things

1. **The one sentence.** What can the viewer say out loud when the video ends that
   they could not say before? Write it down first. If you cannot write it, there is
   no episode yet, only a topic.
2. **The format.** `versus`, `narrative`, or `listicle`. Each has a different spine
   and a different word rate. Do not blend them.
3. **The word budget.** From the target runtime and the format rate.

| Format | WPM | 45s | 60s | 75s | 90s |
|---|---:|---:|---:|---:|---:|
| narrative | 170 | 128 | 170 | 212 | 255 |
| versus | 155 | 116 | 155 | 194 | 232 |
| listicle | 160 | 120 | 160 | 200 | 240 |

Write to the budget. `jam vo` measures the real audio afterwards and tells you how
far off you were. Over budget by more than ten percent means cut, not speed up.

Past 90 seconds you are no longer making this kind of video. If a concept genuinely
will not fit, it is two episodes.

## The three spines

### narrative

Use for origin stories, company explainers, "why is X the way it is".

1. **Cold open.** One sentence. A specific fact with a number and a name. No warm-up,
   no "in this video". The first four words decide whether the video is watched.
2. **Prerequisite.** The one thing the viewer must hold for the rest to make sense.
   "To understand X, you first have to understand Y."
3. **Mechanism.** Three to five beats. Each beat is one idea, one everyday analogy,
   one visual.
4. **Staircase.** Three ascending numbers with years attached, when the topic has them.
5. **The turn.** One sentence, about two thirds in, that flips direction. "There is a
   problem, though."
6. **Payoff.** One line the viewer can repeat.
7. **CTA as a question** that names the next episode.

### versus

Use for the dozens of pairs people confuse. This is the highest-volume format and the
easiest to make a series from.

Per pair, exactly this shape:

```
"<A> vs <B>."
"<A> <does what> <by what mechanism>, so <consequence for you>."
"<B> <does what> <by what mechanism>, so <consequence for you>."
```

Optionally one synthesis line after the last pair: "Basically, A does the input and
B does the output."

Two rules that are not optional:

- **Symmetry.** Both definitions get the same number of clauses and roughly the same
  length. Asymmetry makes the viewer unable to locate the difference.
- **The `so` clause.** Every definition ends in a consequence for the viewer. A
  definition without a consequence is a dictionary entry, and nobody shares those.
  Ref-D uses `so` six times in five pairs.

**Sentence length is the trap.** The title is a fragment of two to four words. Each
definition is then *one sentence of 15 to 26 words*, not three short ones. Measured:
ref-D's explanatory sentences run 17-26 words, ref-E's run 16-28. Breaking a definition
into fragments destroys the parallel structure, and the parallel structure is the only
reason a comparison lands. The alternation you want is fragment, long, long — not
fragment, fragment, fragment.

Episode 001 was drafted wrong this way on the first pass: 40 sentences averaging 6.8
words, against ref-E's 15.6. It read like a machine gun. Check the average before
rendering.

Five pairs in 110 seconds (ref-D) reads comfortably. Five in 57 seconds (ref-E) is the
ceiling, and it is dense enough that the viewer has to rewatch.

### listicle

Use for "N things you should know". Ordinals do the navigation: First, Second, Third.
Put one hook in the middle so it does not become a recitation, the way the reference
does it: "But here's the catch. Sub-agents can't talk to each other. That's where
number three comes in." Close with a save instruction.

## Opening lines that work in this format

Counted across the reference account's 195 videos. Five shapes earn their place;
the rest of her openings are a bare topic statement, which is also fine.

1. **Bare versus title.** "Data scientist versus AI engineer." "AI agent versus
   agentic AI." No setup, no greeting, just the collision. She runs this
   repeatedly and it is the natural opening for the `versus` spine.
2. **Named confusion.** "Many still don't know the difference between RAG and
   fine-tuning." Name the muddle, then resolve it.
3. **The one hard part.** "Fine-tuning is simple, but there's one part that
   confuses almost everyone." Concede the easy thing, sell the exception. Good
   for `narrative`.
4. **Time-boxed promise.** "Let me explain embeddings in thirty seconds." Only
   use it if the video actually honours the number.
5. **Stat.** Only with a real figure we can cite, which rules out most of them.

Do not open with a greeting or a credential. She can, because the credential is
the product she sells. Here it just spends three of the sixty seconds, and
Ragnar's credibility arrives through how specific the explanation is.

## Sentence craft

Measured across the reference corpus, 29 percent of sentences are six words or fewer,
and the median is 7 to 13 words. The rhythm is alternating, not uniformly short.

Write a 15 to 20 word explanatory sentence, then land it with a fragment.

> "Made their own copy and put AI inside it, not next to it. Their tool could see the
> entire code base. Every file, every function, every connection between them. Huge
> unlock."

Fragments used as whole sentences are correct here. "Huge unlock." "Like this."
"Silent failure." Never repair them into grammatical sentences. They are the beat.

Other patterns that earn their place:

- **Second person.** "so you can fine-tune it on a single consumer GPU."
- **Present tense** for how a thing works. **Past tense** for how it got here.
- **Contrast on one axis.** "put AI inside it, not next to it."
- **Rule of three, only when the content has three.** "Every file, every function, every connection."
- **Physical analogies.** Home base. Over your shoulder. Red string on a detective wall. Jet fuel. The supplier who started building their own car. Never an abstract analogy for an abstract thing.

## Hard bans

These come from `/de-slop` and from what the reference scripts measurably never do.
Zero instances of any of the following across 1,997 reference words:

- powerful, seamless, robust, cutting-edge, enterprise-grade, game-changing, transformative, revolutionary, unlock the power of
- "in today's fast-moving world", "the landscape of", "at the forefront", "a testament to"
- "experts say", "studies show", "many believe" without a name attached
- "let's dive in", "in this video", "without further ado"
- stacked hedging: "could potentially possibly"

Apply the `/de-slop` core test to every line: could this sentence appear unchanged in
another company's video? If yes, it is carrying no information. Add a fact, a number,
an actor, a mechanism, or a consequence. If none fit, delete the line — a 100 word
script that says something beats a 170 word script that does not.

## Ragnar's voice on top

From `~/Desktop/rbuild-ai/video-studio/docs/VOICE-DNA-RAGNAR.md`:

- He is a practitioner. Claims are grounded in things he has built or deployed. Prefer
  "I ran this" and "here is what broke" over "organisations should consider".
- "We" for Microsoft Agentic team work. "I" for personal views and RBuild.ai.
- He teaches by contrast and by framework. Naming the two things being confused, then
  separating them, is his natural move — which is why `versus` is the house format.
- Necessary hedging survives. If something is untested, say it is untested. Do not
  sharpen an uncertain claim to make the line land.
- Views-are-my-own applies to anything touching Microsoft product direction.

## Output

Write `script.json` per `docs/SCHEMA.md`. Specifics that bite:

- `say` is spoken verbatim by a TTS engine. Write numbers as they should be read:
  "sixty billion dollars", not "$60B". "four bit", not "4-bit". "twenty twenty three",
  not "2023".
- ASCII only. No em dashes, no smart quotes, no arrows. The narrator mangles them and
  Ragnar's environment bans them anyway.
- One beat is one idea. Over 45 spoken words, split it.
- Acronyms the TTS will spell wrong need respelling in `say` while the storyboard label
  keeps the correct form. "M C P" in the audio, "MCP" on screen.

## Self-check before handing over

1. Read it aloud at pace. Where did you stumble? That sentence is too long.
2. Count the words. Compare against the budget for the format and runtime.
3. Find the fragment. If there is no sentence under seven words, the rhythm is flat.
4. Find the analogy. If every explanation is abstract, the video will not land.
5. Find the turn. Narrative without a turn is a list with better grammar.
6. Read the last line alone. Is it repeatable, or is it "the future looks bright"?
7. Run the de-slop core test on every sentence.
