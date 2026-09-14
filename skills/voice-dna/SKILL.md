---
name: "Voice DNA"
slug: "voice-dna"
description: "Extract your exact writing voice from samples — rhythm, patterns, what you never do — so AI writes like you, not a polished stranger."
tab: "personal"
domain: "content-creation"
industry_vertical: null
difficulty: "starter"
source_type: "ragnar-custom"
tags: ["voice", "writing", "content-creation", "personal-brand", "style"]
version: "1.0.1"
icon_emoji: "🧬"
is_coming_soon: false
is_featured: true
author: "ragnar"
learning_path: null
learning_path_position: null
prerequisites: []
references:
  - title: "Daria Cupareanu — Voice DNA (original concept)"
    url: "https://substack.com/@daria"
requires: "None"
mcp_tools: []
---

# Voice DNA

The problem with "write in my voice" is that Claude has no idea what that means. It produces something polished and professional that sounds nothing like you.

Voice DNA fixes this by systematically extracting what makes your writing yours — not just the patterns, but the **absences**. Words you never use. Structures you instinctively avoid. Places where AI will "improve" your intentional choices.

## What You Give It

Paste 3-5 pieces of your own writing. These can be:
- Newsletter issues or blog posts
- LinkedIn posts
- Emails you're proud of
- Transcripts of talks you've given
- Notes or threads

More variation = better extraction. Don't use just one type.

## What It Extracts

**Sentence patterns:**
- Average length (short punchy vs long flowing)
- How you open paragraphs
- Transition style (do you use "But", "And", "However", or none?)
- Where you use fragments intentionally

**Vocabulary fingerprint:**
- Words you use often (your verbal tics)
- Words you never use (especially AI-common words like "delve", "furthermore", "transformative")
- Technical terms vs plain language ratio
- How formal your language is

**Structural habits:**
- Do you use bullet points or prose?
- How long before you get to the point?
- Do you use rhetorical questions?
- How you end: call to action, open question, or statement?

**Override rules (the critical part):**
- "This writer never uses Oxford commas"
- "This writer uses sentence fragments as emphasis"
- "Never 'optimize' — always 'improve' or 'fix'"
- "Short paragraphs, always. 3 lines max."

## Trigger Phrases

- "Extract my Voice DNA from these samples"
- "Analyze my writing voice"
- "Build my voice profile"
- "What are my writing patterns?"
- "Create a voice reference for me"

## How to Use the Output

Once Claude gives you your Voice DNA profile:

1. **Save it as a Project instruction** in Claude — paste it in your Project settings so it applies to every conversation automatically
2. **Start every writing session with:** "Use my Voice DNA profile. [then your request]"
3. **Update it** every few months as your writing evolves

## Example Voice DNA Profile (Output)

```
VOICE DNA — [Your Name]

Sentence rhythm: Short. Often 1-2 sentences per paragraph. 
Intentional fragments for emphasis. Reads fast.

Opening style: Starts with the problem or the contrarian take. 
Never with "In today's world" or scene-setting.

Vocabulary: Plain language. Avoids: leverage, utilize, delve, 
transformative, robust, holistic. Uses: build, run, ship, fix, real.

Punctuation: Em dashes for asides — like this. 
No semicolons. Oxford comma: never.

Structural habit: No bullet points in personal writing. 
Bullets only in lists that are genuinely lists.

Override rules:
- Never "journey" — always "path" or just describe it
- Never end with "I'd love to hear your thoughts"
- Short paragraphs always. 3 lines hard limit.
- The word "very" never appears
```

## Troubleshooting

| Issue | Cause | Fix |
|---|---|---|
| Profile sounds generic | Too few samples | Add 5+ diverse examples |
| Voice still sounds off | Profile not being applied | Paste the profile directly at start of the conversation |
| Profile conflicts with itself | Inconsistent writing samples | Choose samples from the same period / same platform |

## Version History
| Version | Date | Changes |
|---|---|---|
| 1.0.1 | 2026-04-10 | Initial skill with full extraction framework |
