# jam.with.ai — what the catalogue actually contains

195 videos, posted 2025-05 to 2026-08, mined 2026-08-31. She is a senior data
scientist who posts near-daily about AI engineering.

Method: the files carry no captions or titles, only timestamps, so
`mine_hooks.py` transcribed the first 12 seconds of all 195 with
`whisper-small-mlx`. `hooks.jsonl` is the raw result — 166 usable, 29 silent,
music-only or failed. Everything below is counted from that file, not from
watching.

## Length: she is shorter than we are

| | |
|---|---|
| Median | **57s** |
| Mean | 54s |
| p10 / p90 | 10s / 98s |
| Longest | 135s |
| Under 60s | 52% |
| Under 90s | 86% |

**This is the finding that should change what we build.** Our four episodes run
70-97s, which sits in her top 14%. Nothing about the format demands that length.
Target **45-70s**, which is 130-200 words at 175wpm, and treat 90s as the
ceiling rather than the aim.

## Cadence: she ramped hard

Roughly 5 posts a month through 2025, then 17, 16, 22, 20, 22, 24, 24 from
February 2026 on. She is posting close to daily now. A tool that makes one video
a week does not compete with that; a tool that makes one in an afternoon does.

## Topics, counted from the hooks

| Theme | Videos |
|---|---|
| Books, courses, roadmaps, "how to learn" | 35 |
| LLM fundamentals (tokens, attention, transformers) | 30 |
| Build-a-project walkthroughs | 27 |
| Data science and ML generally | 25 |
| Career, interviews, hiring, salary | 20 |
| Agents and agentic systems | 19 |
| RAG, vectors, embeddings, retrieval | 11 |
| Certifications and exams | 9 |
| Fine-tuning, LoRA | 5 |
| MCP | 4 |

**About a third of her catalogue is career and learning advice** — roadmaps,
interview tips, which book to read, how she passed an AWS exam. That is her
audience and her funnel. It is not Ragnar's. Copying it would put him in a
crowded market against people who do it full time.

The part worth taking is the middle: LLM fundamentals, agents, RAG, MCP,
explained in under a minute to people who half-know the words already.

## Her hook formulas

Openings, classified across the 166 usable hooks. The long tail is deliberate —
most of her hooks are a bare topic statement rather than a formula.

| Shape | Count | Example |
|---|---|---|
| "This is X" | 12 | "This is your six months AI engineering work." |
| Numbered list | 10 | "Avoid these three mistakes in your next interview." |
| Credential first | 10 | "I've hired a lot of AI and ML engineers and two things make all the difference." |
| "If you are X" | 9 | "If you're serious about AI engineering, follow this roadmap." |
| Question | 4 | "Did you know that 9 out of 10 fail ML system design interviews?" |
| Imperative | 4 | "Don't waste your time learning LLM fine-tuning the wrong way." |

### The five worth stealing

1. **Bare versus title.** "Data scientist versus AI engineer." "AI agent versus
   agentic AI." "AI engineer vs ML engineer." No setup, no greeting, just the
   collision. This is the single clearest match to our `versus` spine, and she
   runs it repeatedly.
2. **Named confusion.** "Many still don't know the difference between rag and
   fine tuning." Names the muddle before resolving it.
3. **The one hard part.** "Fine tuning is simple but there's one part that
   confuses almost everyone." Concedes the thing is easy, then sells the
   exception. Maps to our `narrative` spine.
4. **Time-boxed promise.** "Let me explain what are embeddings in 30 seconds."
   The contract is stated up front and the video has to honour it.
5. **Stat.** "9 out of 10 fail ML system design interviews." Only usable with a
   real number we can cite — which rules most of them out for us.

### What not to copy

She opens a fair number of videos with "Hi guys" and a credential. It works for
her because the credential *is* the product — she sells a course. Ragnar's
credibility arrives through the specificity of the explanation, so the greeting
just spends three of the fifty-seven seconds.

## Where the gaps are, counted

Term frequency across the 184 hooks that transcribed. This is the map of what
she has already sold to this audience, and what nobody has said to them yet.

| Term in hook | Hits | What the hits actually are |
|---|---|---|
| agent | 19 | Mostly definitional, plus build-alongs |
| production | 16 | **Almost all credential, not content** — "I have built agents in production, and this course will help you" |
| rag | 10 | Real coverage. Her strongest technical theme |
| deploy | 7 | Project walkthroughs |
| mcp | 4 | One is "MCP vs API" — she runs our format on our topic |
| token | 3 | LLM fundamentals |
| fine-tuning | 2 | Paired against RAG both times |
| memory | 2 | In passing |
| harness | 1 | One line inside a listicle, not a video |
| evals | 1 | One clause inside a playlist recommendation |
| nvidia | 1 | About which certification to take, not the company |
| context engineering | 0 | — |
| context window | 0 | — |
| guardrails | 0 | — |

Two of these matter more than the rest.

**"Production" is her credential, not her subject.** Sixteen hooks contain the
word and roughly thirteen use it to establish that she has shipped, before
pivoting to a course or a roadmap. Only the LLMOps-versus-MLOps video and the
one about libraries that "quietly run behind every production AI agent" are
actually about running the thing. So the audience has been told production
matters 16 times and taught it about twice. That gap is the opening.

**Harness and evals are one line each.** Her single harness mention defines it
correctly — "decides what the model sees, which tools" — and gives it 45 seconds
inside a list of six resources. Nobody in this niche has spent a whole video on
either. Both are Ragnar's daily work.

## What this means for jam-studio

- Cut the target length to 45-70s.
- Keep the `versus` spine as the house format; her catalogue confirms it.
- Skip the career and roadmap material entirely.
- Lead with harness, evals, context engineering and guardrails. She has one line
  on the first two and nothing on the last two, and they are what Ragnar does.
- Do not open the channel on RAG. She has ten videos on it and a head start.
  Come at it later and sideways, through context engineering.


- Cut the target length to 45-70s.
- Keep the `versus` spine as the house format; her catalogue confirms it.
- Skip the career and roadmap material entirely.
- Take the topics where she is thin and Ragnar is deep: MCP (4 videos), agents
  (19, mostly definitional), and everything about running agents in a real
  business, which she does not cover at all.
