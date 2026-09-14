---
name: video-prompt
description: |
  Video prompt generator that outputs prompts in BOTH simple language AND JSON format.
  Takes a script section, scene description, or concept and generates production-ready
  video prompts for Lovart.ai (Kling 3.0, Veo 3.1, Seedance 1.5 Pro, Kling 2.6, etc.).
  Outputs two versions: (1) Plain language prompt ready to paste into Lovart, and
  (2) Structured JSON with all parameters for programmatic use, Remotion pipelines, or API calls.
  Use when user says "video prompt", "/video-prompt", "create video", "generate video prompt",
  "video json", "scene prompt", "shot prompt", or wants video prompts in structured format.
user-invokable: true
argument-hint: "[describe the scene, shot, or concept you want as a video]"
---

# Video Prompt Generator — Simple Language + JSON

Generate production-ready video prompts in **TWO formats**:
1. **Simple Language** — ready to paste directly into Lovart.ai
2. **JSON** — structured data for programmatic use, Remotion pipelines, or API integration

---

## STEP 1: Understand the Request

Determine from the user's input:
- **What** is the scene about? (subject, action, concept)
- **How long** should it be? (5s / 8s / 10s / 15s)
- **What style?** (cinematic, corporate, energetic, calm, documentary)
- **Single shot or multi-shot?**
- **Any specific camera movements?**
- **Audio/dialogue needed?**

If the user provides a script section, extract the key visual moment and translate it into a video prompt.

---

## STEP 2: Select the Right Model

| Model | Best For | Duration | Key Feature |
|---|---|---|---|
| **Kling 3.0** | Multi-shot narratives, dialogue, lip sync | Up to 15s | 6 camera angles, native audio |
| **Kling 2.6** | Stable motion, reliable results (default) | 5-8s | Incredible motion stability |
| **Veo 3.1** | Cinematic commercial-grade, physics-compliant | 5-8s | Best physics simulation |
| **Seedance 1.5 Pro** | Audio sync, lip sync in 8 languages | 5-10s | Best lip sync, "camera switch" |
| **Seedance Lite** | Quick video drafts | 5s | Fast iteration |
| **Sora 2 Pro** | High-quality narrative video | 5-10s | Strong storytelling |

**Quick decision:**
- Multi-shot with dialogue? → **Kling 3.0**
- Cinematic commercial? → **Veo 3.1**
- Lip-synced speech? → **Seedance 1.5 Pro**
- Simple stable motion (default)? → **Kling 2.6**
- Quick draft? → **Seedance Lite**

---

## STEP 3: Camera Movement Reference

Use precise cinematographic terms:

| Movement | Use When |
|---|---|
| `dolly push-in` | Building intimacy, drawing focus to subject |
| `dolly pull-back` | Revealing context, establishing scale |
| `tracking shot` | Following action dynamically |
| `pan left/right` | Scanning environment, panoramic reveal |
| `tilt up/down` | Showing height, dramatic reveal |
| `orbit / arc` | 360-degree product showcase, hero moment |
| `crane up/down` | Dramatic elevation change |
| `handheld drift` | Documentary energy, raw feel |
| `whip-pan` | Scene transition, sudden energy |
| `static tripod` | Contemplative, steady, professional |
| `rack focus` | Shifting attention foreground↔background |
| `steadicam` | Smooth immersive movement |

### Lens Hints (add realism):
- `"35mm film"` → warm grain, organic
- `"85mm portrait lens"` → shallow DOF, intimacy
- `"wide-angle steadicam"` → smooth, expansive
- `"anamorphic lens"` → cinematic wide, lens flares
- `"macro lens"` → extreme detail, tight focus

---

## STEP 4: Write the Prompt

### Simple Language Rules:
- Write like **scene direction for a film** — 1-3 rich sentences
- NOT keyword lists
- Include: camera, subject, action, environment, lighting, mood
- For multi-shot: label `Shot 1:`, `Shot 2:`, etc.
- For dialogue: use double quotes around spoken words

### JSON Schema:

```json
{
  "title": "Short descriptive title for the video",
  "model": "Kling 3.0 | Kling 2.6 | Veo 3.1 | Seedance 1.5 Pro | Seedance Lite | Sora 2 Pro",
  "duration": "5s | 8s | 10s | 12s | 15s",
  "aspect_ratio": "16:9 | 9:16 | 1:1",
  "dimensions": "1920x1080 | 1080x1920 | 1080x1080",
  "input_type": "text-to-video | image-to-video | start-end-frame",
  "source_image": "path or null — if image-to-video, reference the starting frame",
  "audio": {
    "enabled": true,
    "type": "ambient | dialogue | music | sfx | none",
    "description": "Description of audio — e.g., 'soft jazz hum' or 'office ambient sounds'"
  },
  "shots": [
    {
      "shot_number": 1,
      "duration_hint": "5s",
      "camera": {
        "movement": "dolly push-in | tracking | pan | orbit | static | crane | etc.",
        "angle": "eye-level | low-angle | high-angle | overhead | dutch",
        "lens": "35mm | 50mm | 85mm | wide-angle | anamorphic | macro",
        "focus": "shallow DOF | deep focus | rack focus"
      },
      "subject": {
        "description": "Detailed subject description",
        "action": "What the subject is doing — use motion verbs",
        "position": "center | left-third | right-third | foreground | background"
      },
      "environment": {
        "setting": "Location description",
        "time_of_day": "morning | afternoon | golden-hour | night | dawn | dusk",
        "weather": "clear | overcast | rain | fog | snow | none"
      },
      "lighting": {
        "type": "natural | studio | neon | ambient | dramatic | backlit | rim",
        "color_temperature": "warm | cool | neutral | mixed",
        "source": "Description of where light comes from"
      },
      "style": {
        "aesthetic": "cinematic | corporate | documentary | editorial | artistic | flat-vector",
        "color_palette": ["#hex1", "#hex2", "#hex3"],
        "mood": "confident | contemplative | energetic | dramatic | calm | provocative"
      },
      "dialogue": "Spoken words in quotes, or null",
      "text_overlay": "On-screen text, or null"
    }
  ],
  "post_production": {
    "upscale_to": "4K | 8K | none",
    "trim": false,
    "loop": false,
    "export_format": "MP4 | MOV | GIF"
  },
  "notes": "Any additional production notes"
}
```

---

## STEP 5: Output Format

Always output BOTH formats in this order:

### Output Template:

````markdown
## Video Prompt — "[Title]"

### Simple Language Prompt

```
[Plain language prompt here — ready to paste into Lovart]
```

**Settings:**
- Model: [model name]
- Duration: [Xs]
- Aspect Ratio: [ratio] ([dimensions])
- Input: [Text-to-video / Image-to-video]
- Audio: [Yes — description / No]

**Post-generation tips:** [upscale, trim, export notes]

---

### JSON Format

```json
{
  [full JSON object here]
}
```
````

---

## STEP 6: Model-Specific Prompt Syntax

### Kling 3.0 (Multi-Shot)
Simple language format:
```
Shot 1: [Camera], [subject], [action], [environment], [lighting/mood]
Shot 2: [Camera], [subject], [action], [environment], [lighting/mood]
Shot 3: [Camera], [subject], [action], [environment], [lighting/mood]
```
- Up to 6 shots per generation
- Include audio cues and textures (grain, reflections, steam, smoke)
- For dialogue: use character labels with voice quality descriptions

### Veo 3.1 (Cinematic)
Simple language format:
```
[Cinematography instruction]. [Subject and action]. [Environment]. [Style and ambiance]. [Audio if needed].
```
- Separate camera movement from subject action as standalone sentences
- Include lens specifications for realism

### Seedance 1.5 Pro (Audio-Native)
Simple language format:
```
[Subject + motion], [Background + motion], [Camera + motion]. [Dialogue in double quotes]. Camera switch. [Next scene].
```
- Dialogue in double quotes triggers lip sync
- `"camera switch"` keyword for scene transitions
- 8 languages for lip sync

### Kling 2.6 (Default Stable)
Simple language format:
```
[Camera movement and angle]. [Subject description and action]. [Environment and lighting]. [Style and mood].
```
- Keep it to 1-2 sentences for best results
- Focus on ONE clear motion/action

---

## EXAMPLES

### Example 1: Corporate B-Roll (Single Shot)

**Simple Language:**
```
Slow dolly push-in on a modern glass boardroom at golden hour. An executive in navy blazer stands at a presentation screen showing a glowing MCP hub-and-spoke diagram. Warm amber light streams through floor-to-ceiling windows, casting long shadows. Shot on 35mm film, shallow depth of field. Calm, authoritative mood.
```

**JSON:**
```json
{
  "title": "Boardroom MCP Presentation",
  "model": "Kling 2.6",
  "duration": "5s",
  "aspect_ratio": "16:9",
  "dimensions": "1920x1080",
  "input_type": "text-to-video",
  "source_image": null,
  "audio": {
    "enabled": true,
    "type": "ambient",
    "description": "Soft office ambient hum, subtle air conditioning"
  },
  "shots": [
    {
      "shot_number": 1,
      "duration_hint": "5s",
      "camera": {
        "movement": "dolly push-in",
        "angle": "eye-level",
        "lens": "35mm",
        "focus": "shallow DOF"
      },
      "subject": {
        "description": "Executive in navy blazer standing at presentation screen",
        "action": "Gesturing toward MCP hub-and-spoke diagram on screen",
        "position": "right-third"
      },
      "environment": {
        "setting": "Modern glass boardroom with floor-to-ceiling windows",
        "time_of_day": "golden-hour",
        "weather": "clear"
      },
      "lighting": {
        "type": "natural",
        "color_temperature": "warm",
        "source": "Golden hour sunlight through floor-to-ceiling windows, casting long shadows"
      },
      "style": {
        "aesthetic": "corporate",
        "color_palette": ["#0D1B2A", "#0078D4", "#FFB800"],
        "mood": "confident"
      },
      "dialogue": null,
      "text_overlay": null
    }
  ],
  "post_production": {
    "upscale_to": "4K",
    "trim": false,
    "loop": false,
    "export_format": "MP4"
  },
  "notes": "B-roll for YouTube video. Can be used as background while presenter talks."
}
```

---

### Example 2: Multi-Shot Narrative (Kling 3.0)

**Simple Language:**
```
Shot 1: Static tripod, wide shot of a dimly lit server room. Rows of blinking server racks stretch into the background. A single IT engineer walks between the racks checking cables, blue LED reflections on their face. Cool blue ambient lighting, subtle electronic hum.
Shot 2: Close-up tracking shot of the engineer's hand plugging in a single glowing blue cable labeled "MCP". The moment of connection — all server indicators turn from amber to green in a cascade. Shallow depth of field on 85mm lens.
Shot 3: Wide crane shot pulling up and back, revealing the entire data center now fully illuminated in electric blue, all systems connected and active. Orchestral swell builds to a finish. The engineer stands at the center, arms relaxed, job done.
```

**JSON:**
```json
{
  "title": "MCP Connection Moment — Server Room",
  "model": "Kling 3.0",
  "duration": "12s",
  "aspect_ratio": "16:9",
  "dimensions": "1920x1080",
  "input_type": "text-to-video",
  "source_image": null,
  "audio": {
    "enabled": true,
    "type": "ambient",
    "description": "Electronic hum building to orchestral swell on connection moment"
  },
  "shots": [
    {
      "shot_number": 1,
      "duration_hint": "4s",
      "camera": {
        "movement": "static tripod",
        "angle": "eye-level",
        "lens": "35mm",
        "focus": "deep focus"
      },
      "subject": {
        "description": "IT engineer in dark polo, checking server cables",
        "action": "Walking between server racks, inspecting connections",
        "position": "center"
      },
      "environment": {
        "setting": "Dimly lit server room with rows of blinking racks",
        "time_of_day": "none",
        "weather": "none"
      },
      "lighting": {
        "type": "ambient",
        "color_temperature": "cool",
        "source": "Blue LED server lights reflecting on face and walls"
      },
      "style": {
        "aesthetic": "cinematic",
        "color_palette": ["#0D1B2A", "#0078D4", "#FFB800"],
        "mood": "contemplative"
      },
      "dialogue": null,
      "text_overlay": null
    },
    {
      "shot_number": 2,
      "duration_hint": "4s",
      "camera": {
        "movement": "tracking shot",
        "angle": "eye-level",
        "lens": "85mm",
        "focus": "shallow DOF"
      },
      "subject": {
        "description": "Engineer's hand holding a glowing blue cable labeled MCP",
        "action": "Plugging cable in — indicators cascade from amber to green",
        "position": "center"
      },
      "environment": {
        "setting": "Server rack close-up, patch panel visible",
        "time_of_day": "none",
        "weather": "none"
      },
      "lighting": {
        "type": "dramatic",
        "color_temperature": "mixed",
        "source": "Blue glow from MCP cable, amber-to-green cascade from indicators"
      },
      "style": {
        "aesthetic": "cinematic",
        "color_palette": ["#0078D4", "#FFB800", "#00C853"],
        "mood": "dramatic"
      },
      "dialogue": null,
      "text_overlay": null
    },
    {
      "shot_number": 3,
      "duration_hint": "4s",
      "camera": {
        "movement": "crane up and pull-back",
        "angle": "high-angle",
        "lens": "wide-angle",
        "focus": "deep focus"
      },
      "subject": {
        "description": "Engineer standing at center of now-connected data center",
        "action": "Standing still, arms relaxed, surveying the connected systems",
        "position": "center"
      },
      "environment": {
        "setting": "Full data center revealed, all racks illuminated in electric blue",
        "time_of_day": "none",
        "weather": "none"
      },
      "lighting": {
        "type": "ambient",
        "color_temperature": "cool",
        "source": "Electric blue LED from all connected servers"
      },
      "style": {
        "aesthetic": "cinematic",
        "color_palette": ["#0078D4", "#00C853", "#0D1B2A"],
        "mood": "confident"
      },
      "dialogue": null,
      "text_overlay": null
    }
  ],
  "post_production": {
    "upscale_to": "4K",
    "trim": false,
    "loop": false,
    "export_format": "MP4"
  },
  "notes": "Hero video for MCP connection concept. Shot 2 is the key moment — the connection cascade. Consider using IMAGE 06 (Build Once, Reuse Everywhere) as starting frame for image-to-video variant."
}
```

---

### Example 3: Image-to-Video (From Existing Image)

**Simple Language:**
```
Starting from the provided image of the MCP infrastructure building cross-section. Slow dolly pull-back revealing the full building. AI agent icons on the rooftop begin to glow and pulse. Blue connection lines running through each floor light up sequentially from foundation to rooftop. A small crane on the roof rotates slowly. Calm, ambient electronic soundtrack.
```

**JSON:**
```json
{
  "title": "MCP Infrastructure Building — Animated",
  "model": "Kling 2.6",
  "duration": "8s",
  "aspect_ratio": "16:9",
  "dimensions": "1920x1080",
  "input_type": "image-to-video",
  "source_image": "IMAGE 21 — MCP Is Infrastructure",
  "audio": {
    "enabled": true,
    "type": "ambient",
    "description": "Calm ambient electronic soundtrack, subtle pulse on each floor lighting up"
  },
  "shots": [
    {
      "shot_number": 1,
      "duration_hint": "8s",
      "camera": {
        "movement": "dolly pull-back",
        "angle": "eye-level",
        "lens": "35mm",
        "focus": "deep focus"
      },
      "subject": {
        "description": "Isometric cross-section building with MCP blue foundation, department floors, AI agents on roof",
        "action": "Connection lines light up floor by floor from foundation to rooftop, agents pulse, crane rotates",
        "position": "center"
      },
      "environment": {
        "setting": "Teal background, building is the full scene",
        "time_of_day": "none",
        "weather": "none"
      },
      "lighting": {
        "type": "ambient",
        "color_temperature": "cool",
        "source": "Glowing blue foundation radiating upward through floors"
      },
      "style": {
        "aesthetic": "flat-vector",
        "color_palette": ["#0078D4", "#0D1B2A", "#D4E6F1"],
        "mood": "confident"
      },
      "dialogue": null,
      "text_overlay": null
    }
  ],
  "post_production": {
    "upscale_to": "4K",
    "trim": false,
    "loop": true,
    "export_format": "MP4"
  },
  "notes": "Use IMAGE 21 as the starting frame. This becomes the closing hero video for the YouTube outro. Loop-friendly for end screen."
}
```

---

## STYLE GUIDELINES FOR RAGNAR'S CONTENT

When generating video prompts for Ragnar's brand:
- **Microsoft palette:** Navy (#0D1B2A), Electric blue (#0078D4), White (#FFFFFF)
- **Corporate-modern:** Clean, professional, not busy
- **Flat vector style** for illustration-based videos (matches image assets)
- **Cinematic style** for live-action B-roll concepts
- **Confident mood** — thought leadership energy, not hype
- **No stock-photo aesthetic** — everything should feel intentional and designed

For non-Ragnar content, ask about brand colors and style preferences.

---

## BATCH GENERATION

When the user provides a full script with multiple image references, generate video prompts for each visual that would benefit from motion:
- Before/after pairs → morph transition video
- Hero closing images → slow camera movement video
- Workflow diagrams → sequential animation video
- Architecture diagrams → build-up reveal video

Output all prompts in a single response, both formats for each.
