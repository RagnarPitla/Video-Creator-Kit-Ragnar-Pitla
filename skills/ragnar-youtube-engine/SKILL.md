---
name: ragnar-youtube-engine
description: >-
  Weekly YouTube content planning system for Ragnar Pitla's channel. Generates
  4-5 video ideas per week from the latest AI news plus Microsoft/Copilot Studio
  announcements and Ragnar's own takes, with Nate B. Jones-style titles,
  thumbnail prompts, and script hooks. Use when planning YouTube content,
  brainstorming weekly video ideas, building the weekly content mix, or writing
  video titles and thumbnails.
---

# Ragnar YouTube Content Engine

Weekly content planning system for Ragnar Pitla's YouTube channel. Generates 4-5 video ideas per week using latest AI news + Microsoft announcements + Ragnar's unique takes.

## Content Mix (Weekly)

| Slot | Focus | Source |
|------|-------|--------|
| **Video 1** | Latest AI News | Anthropic, OpenAI, Google, Meta, industry moves |
| **Video 2** | Latest AI News | Different angle or second big story |
| **Video 3** | Microsoft/Copilot Studio | Copilot Studio, D365, Power Platform, Azure AI |
| **Video 4** | Microsoft/Enterprise AI | Agentic ERP, enterprise patterns, D365 F&O |
| **Video 5** (Optional) | Ragnar's Take | Personal frameworks, "learning together" content, hot takes |

## How to Use This Skill

When triggered, this skill will:
1. Search for latest AI news (last 7 days)
2. Search for latest Microsoft AI announcements
3. Generate 4-5 video concepts with Nate-style titles
4. Provide thumbnail prompts and script hooks

## Title Formulas (Nate B. Jones Style)

### Formula 1: News Hook + Contrarian
`[Company] Just [Did Thing]. [Your Insider Take].`
- "Anthropic Just Shipped [Feature]. Here's What It Actually Means for Builders."
- "Microsoft Just Gave Copilot Studio [Capability]. Most People Won't Use It Right."

### Formula 2: Specific Number + Stakes
`[Number] [Outcome]. [Your Angle].`
- "3 Features. 47% Faster Close. The D365 Agent Nobody's Building."
- "$2M in Failed Implementations. They All Made This Mistake."

### Formula 3: "Here's Why/What" Knowledge Gap
`[Observation]. Here's Why/What [Resolution].`
- "Your Claude Limit Burns in 90 Minutes. Here's Why."
- "Enterprise AI Adoption Stalled. Here's What Actually Works."

### Formula 4: "Nobody's Talking About"
`[Event]. [Hidden Insight Nobody Noticed].`
- "OpenAI Shipped [Thing]. The Part Nobody's Discussing."
- "Microsoft's Agentic Roadmap Has a Gap. Nobody's Noticed."

### Formula 5: Direct "Your" Address
`Your [Thing] Is [Problem]. [Stakes].`
- "Your Copilot Studio Agent Fails at Edge Cases. The Fix Isn't More Prompting."
- "Your D365 Implementation Has 47 Manual Steps. AI Can Replace 41."

### Formula 6: Career/Money Stakes
`[AI Development] + [Career/Financial Impact]`
- "The Skill That Separates $150K Engineers from $300K Engineers."
- "ERP Consultants Charging $300/hr Will Be Replaced by Agents at $0.30/hr."

## Ragnar's Unique Angles

Use these differentiators in every video:

| Edge | How to Position |
|------|-----------------|
| **Microsoft Insider** | "What I'm seeing inside Microsoft's Agentic team" |
| **D365 F&O Depth** | "The business process detail nobody on YouTube covers" |
| **Niyam Pattern Creator** | "The pattern I built that's now in production" |
| **Enterprise Implementation** | "What happens when you deploy to millions of users" |
| **Copilot Studio Authority** | "I deploy these agents. Here's what works." |
| **Learning Together** | "I'm figuring this out too. Here's what I'm learning." |

## Content Pillars

### Pillar 1: AI News (2 videos/week)
- Anthropic releases (Claude updates, MCP, safety research)
- OpenAI releases (GPT updates, API changes, Codex)
- Google AI (Gemini, DeepMind, Android AI)
- Meta AI (Llama, open source moves)
- Industry moves (funding, acquisitions, regulatory)
- Tool releases (Cursor, Windsurf, Lovable, Replit)

### Pillar 2: Microsoft AI (1-2 videos/week)
- Copilot Studio updates and patterns
- D365 AI features and roadmap
- Power Platform AI capabilities
- Azure AI services
- Microsoft 365 Copilot
- Enterprise AI strategy

### Pillar 3: Ragnar's Frameworks (1 video/week optional)
- Agentic ERP concepts
- Niyam pattern deep dives
- "Learning together" reflections
- Career advice for AI era
- Hot takes and contrarian views

## News Sources to Monitor

### AI News
- Anthropic blog + changelog
- OpenAI blog + API changelog
- Google AI blog
- Hacker News (AI filter)
- The Verge AI section
- Ars Technica AI
- X/Twitter: @AnthropicAI, @OpenAI, @GoogleAI, @ylecun, @kaboris

### Microsoft News
- Microsoft Tech Community
- Power Platform blog
- Dynamics 365 blog
- Azure AI blog
- Microsoft Build announcements
- X/Twitter: @MSPowerPlat, @Microsoft365Dev, @sataboris

## Output Format

When generating weekly content plan, output:

```markdown
# Week of [Date] - Content Plan

## Video 1: [Title]
**Category:** AI News
**Hook:** [First 15 seconds]
**Ragnar's Angle:** [Your unique take]
**Thumbnail Concept:** [Brief description]

## Video 2: [Title]
...

## Video 3: [Title]
**Category:** Microsoft AI
...

## Video 4: [Title]
**Category:** Microsoft/Enterprise
...

## Video 5 (Optional): [Title]
**Category:** Ragnar's Take
...
```

## Triggers

Use this skill when:
- User asks for weekly content ideas
- User asks for video topics
- User asks to check latest AI news for content
- User says "content engine", "weekly plan", "video ideas"
- Monday content planning sessions

## Example Execution

1. Search web for "AI news this week 2026"
2. Search web for "Microsoft Copilot Studio news 2026"
3. Search web for "Dynamics 365 AI updates 2026"
4. Filter for stories with video potential (stakes, controversy, practical application)
5. Generate 4-5 video concepts using title formulas
6. Add Ragnar's unique angle to each
7. Provide thumbnail concepts and hooks
