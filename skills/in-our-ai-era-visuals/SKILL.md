---
name: in-our-ai-era-visuals
description: "Generates Lovart.ai image prompts in the 'In Our AI Era' podcast brand style — flat editorial illustration with bold outlines, coral/navy palette, and the two recurring hosts (Ragnar + Tina). Handles architecture diagrams, explainer visuals, episode thumbnails, and concept illustrations all in brand. Use when user says 'in our ai era image', 'podcast visual', 'episode image', 'architecture diagram in our style', 'brand image', 'explainer visual', 'inourai', or wants any image for the In Our AI Era podcast."
user-invokable: true
argument-hint: "[what to visualize: architecture / explainer / thumbnail / concept] [optional: topic or episode context]"
metadata:
  author: Ragnar Pitla
  version: "1.0"
  category: content
---

# In Our AI Era Visuals — Brand-Consistent Image Prompt Generator

Generates Lovart.ai prompts for all "In Our AI Era" visual needs. Every output matches the podcast's established flat editorial illustration style — whether it's an architecture diagram, explainer concept, or episode thumbnail.

**Platform:** Lovart.ai — Nano Banana Pro (default) or GPT Image 1.5 (text-heavy)

---

## Visual Types Handled

| Request | Type | What Gets Generated |
|---|---|---|
| Architecture diagram | `arch` | Brand-styled system/agent architecture illustration |
| Explainer visual | `explainer` | Concept breakdown with floating labels + characters |
| Episode thumbnail | `thumbnail` | Show-branded cover image with hosts + topic |
| Concept illustration | `concept` | Abstract idea visualized in brand style |
| AI term visual | `term` | Single concept illustrated with speech bubbles |

---

## Step 1: Identify Visual Type

Ask or infer from context which of the 5 types above applies. Most requests will be `arch` or `explainer`.

---

## Step 2: Load Style Foundation

**Always** apply the brand style from `references/style-guide.md`. Key anchors to embed in every prompt:

```
Flat editorial illustration style with bold black outlines.
Warm cream background #FFF8F0. Primary accent coral-red #D93A52.
Consistent character designs: [see references/character-reference section]
Decorative elements: outlined 6-point stars, dot clusters, rounded speech bubbles.
Typography: bold chunky sans-serif for labels, clean readable for descriptions.
No gradients on fills. No drop shadows. Clean flat 2D.
```

---

## Step 3: Build the Prompt

Use the matching template from `references/prompt-templates.md`. Adapt with:
- The specific topic/components to illustrate
- Whether characters appear (thumbnails + explainers yes, pure arch diagrams optional)
- Text labels needed (GPT Image 1.5 if 5+ labels)

---

## Step 4: Output Format

```
## In Our AI Era — [Visual Type] Prompt

[prompt in a code block, ready to paste into Lovart]

**Settings:**
- Model: [Nano Banana Pro / GPT Image 1.5]
- Aspect Ratio: [16:9 for thumbnails | 4:3 for arch | 1:1 for social]
- Resolution: 2K (upscale to 4K for final)
- Mode: Thinking

**Tips:**
- [Touch Edit guidance for labels]
- [Character consistency note if applicable]
```

---

## Model Guide

| Model | Use For |
|---|---|
| **Nano Banana Pro** | Thumbnails, explainers, character-driven images — best character consistency |
| **GPT Image 1.5** | Architecture diagrams with 5+ text labels — superior text rendering |
| **Flux 2 Max** | Complex scenes with many distinct components |

---

## Aspect Ratios

| Use | Ratio | Dimensions |
|---|---|---|
| Episode thumbnail / YouTube | 16:9 | 1456x816 |
| Architecture / explainer | 4:3 | 1232x928 |
| Square / social | 1:1 | 1024x1024 |
| Vertical / story | 9:16 | 816x1456 |

---

## Related Skills

- `tech-architecture-diagrams` — pure corporate Figma-style diagrams without brand characters
- `lovart` — general Lovart prompt generation for non-brand work
- `remotion-video-builder` — animate these visuals as Remotion scenes
