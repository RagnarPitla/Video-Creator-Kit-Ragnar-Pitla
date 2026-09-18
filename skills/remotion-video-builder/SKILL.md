---
name: remotion-video-builder
description: |
  Build Remotion videos from scripts — scene decomposition, composition setup, animation
  implementation, and rendering. Turns a text script or concept into a multi-scene React video.
  Use when user says "build a video", "create a remotion video", "make a video from this script",
  "remotion project", or wants to go from script/concept to rendered video.
  Leverages remotion-best-practices skill for API patterns.
user-invokable: true
argument-hint: "[paste your script, scene description, or video concept]"
---

# Remotion Video Builder

Build complete Remotion videos from scripts, concepts, or scene descriptions.

---

## CRITICAL RULES

1. **All animations MUST use `useCurrentFrame()` hook** — CSS transitions, CSS animations, and Tailwind `animate-*` classes are FORBIDDEN. They will not render.
2. **Use `interpolate()` with `extrapolateRight: "clamp"`** for all value mappings to prevent overshoot.
3. **Use `spring()` for natural motion** — default config: `{ mass: 1, damping: 10, stiffness: 100 }`.
4. **Assets go in `public/`** — reference with `staticFile("filename.png")`. Never use raw paths.
5. **Use `<Img>` from remotion** — not `<img>`, not Next.js `<Image>`, not CSS `background-image`.
6. **Always premount Sequences** — use `premountFor` prop on `<Sequence>` components.
7. **Express timing in seconds** — multiply by `fps` from `useVideoConfig()`: `2 * fps` = 2 seconds.
8. **Use `type` not `interface`** for component props (ensures `defaultProps` type safety).
9. **Register all compositions in `src/Root.tsx`**.
10. **For Tailwind projects**: no `transition-*` or `animate-*` classes. Tailwind is for layout/styling only.

---

## WORKFLOW

### Step 1: Understand the Brief

Extract from the user's input:
- **Content**: What's the message/story? (script text, bullet points, narrative)
- **Format**: Landscape (1920x1080), Portrait (1080x1920), or Square (1080x1080)
- **Duration**: Total length in seconds
- **Scene count**: How many distinct scenes/slides
- **Style**: Brand colors, typography, mood
- **Audio**: Voiceover, background music, sound effects, or silent
- **Output**: MP4, GIF, or transparent video

If anything is unclear, ask before building.

### Step 2: Decompose into Scenes

Break the script into discrete scenes. Each scene becomes a React component.

**Scene planning template:**

```
Scene 1: [Name] — [duration]s — [description]
Scene 2: [Name] — [duration]s — [description]
Scene 3: [Name] — [duration]s — [description]
...
Total: [sum]s at [fps]fps = [total frames] frames
```

### Step 3: Set Up Project Structure

For a new project:
```bash
npx create-video@latest
# Select: Blank template, TailwindCSS yes
cd my-video && npm install
```

For an existing project, organize files:
```
src/
  Root.tsx              # Composition registry
  Video.tsx             # Main composition (orchestrates scenes)
  scenes/
    Scene1.tsx          # Individual scene components
    Scene2.tsx
    ...
  components/           # Shared UI (progress bar, watermark, etc.)
  lib/
    constants.ts        # Colors, fonts, timing config
public/
  images/               # Static images
  audio/                # Audio files
  voiceover/            # Generated voiceover MP3s
```

### Step 4: Build the Composition

Register in `src/Root.tsx`:

```tsx
import { Composition } from "remotion";
import { MainVideo } from "./Video";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainVideo"
      component={MainVideo}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
```

### Step 5: Orchestrate Scenes

Use `<Series>` for sequential playback or `<TransitionSeries>` for transitions between scenes:

```tsx
import { Series } from "remotion";

export const MainVideo: React.FC = () => {
  return (
    <Series>
      <Series.Sequence durationInFrames={150}>
        <HookScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={180}>
        <ContentScene />
      </Series.Sequence>
      <Series.Sequence durationInFrames={120}>
        <CTAScene />
      </Series.Sequence>
    </Series>
  );
};
```

For transitions between scenes:
```tsx
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={150}>
    <HookScene />
  </TransitionSeries.Sequence>
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: 15 })}
  />
  <TransitionSeries.Sequence durationInFrames={180}>
    <ContentScene />
  </TransitionSeries.Sequence>
</TransitionSeries>
```

### Step 6: Build Each Scene

Each scene is a standard React component using Remotion hooks:

```tsx
import { useCurrentFrame, useVideoConfig, interpolate, spring, AbsoluteFill } from "remotion";

export const HookScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(frame, [0, 1 * fps], [50, 0], {
    extrapolateRight: "clamp",
  });

  const titleOpacity = spring({
    frame,
    fps,
    config: { damping: 200 },
  });

  return (
    <AbsoluteFill className="bg-slate-900 flex items-center justify-center">
      <h1
        style={{
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          fontSize: 72,
          color: "white",
          fontWeight: "bold",
        }}
      >
        Your Hook Text Here
      </h1>
    </AbsoluteFill>
  );
};
```

### Step 7: Add Audio (if needed)

For voiceover or background music — read `remotion-best-practices/rules/audio.md` and `remotion-best-practices/rules/voiceover.md`.

```tsx
import { Audio, Sequence, staticFile } from "remotion";

// In your scene or main composition:
<Sequence from={0}>
  <Audio src={staticFile("audio/voiceover-scene1.mp3")} />
</Sequence>
```

### Step 8: Preview and Render

```bash
npm run dev              # Preview in Remotion Studio at localhost:3000
npx remotion render MainVideo out/video.mp4   # Render to file
```

---

## ANIMATION COOKBOOK

### Fade In
```tsx
const opacity = interpolate(frame, [0, 1 * fps], [0, 1], { extrapolateRight: "clamp" });
```

### Slide Up
```tsx
const y = interpolate(frame, [0, 0.5 * fps], [40, 0], { extrapolateRight: "clamp" });
```

### Spring Scale
```tsx
const scale = spring({ frame, fps, config: { damping: 12 } });
// style={{ transform: `scale(${scale})` }}
```

### Staggered Items
```tsx
{items.map((item, i) => {
  const delay = i * 8; // 8 frames between each
  const s = spring({ frame: frame - delay, fps, config: { damping: 15 } });
  return <div key={i} style={{ opacity: s, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px)` }}>{item}</div>;
})}
```

### Typewriter Text
```tsx
const text = "Your message here";
const charsShown = Math.floor(interpolate(frame, [0, text.length * 2], [0, text.length], { extrapolateRight: "clamp" }));
return <span>{text.slice(0, charsShown)}</span>;
```

### Progress Bar
```tsx
const { durationInFrames } = useVideoConfig();
const progress = interpolate(frame, [0, durationInFrames], [0, 100], { extrapolateRight: "clamp" });
// style={{ width: `${progress}%` }}
```

---

## SPRING PRESETS

| Preset | Config | Use For |
|--------|--------|---------|
| Smooth | `{ damping: 200 }` | Fade-ins, subtle reveals |
| Snappy | `{ damping: 20, stiffness: 200 }` | UI elements popping in |
| Bouncy | `{ damping: 8 }` | Playful, attention-grabbing |
| Heavy | `{ damping: 15, stiffness: 80, mass: 2 }` | Slow, weighty motion |

---

## COMMON PATTERNS

### Scene with Background + Animated Content
```tsx
<AbsoluteFill style={{ backgroundColor: "#0D1B2A" }}>
  {/* Background layer */}
  <AbsoluteFill style={{ opacity: 0.1 }}>
    <Img src={staticFile("bg-pattern.png")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
  </AbsoluteFill>
  {/* Content layer */}
  <AbsoluteFill className="flex flex-col items-center justify-center p-20">
    {/* Animated content here */}
  </AbsoluteFill>
</AbsoluteFill>
```

### Watermark / Logo Overlay
```tsx
<AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "flex-end", padding: 40 }}>
  <Img src={staticFile("logo.png")} style={{ width: 120, opacity: 0.6 }} />
</AbsoluteFill>
```

---

## FONT LOADING

Use `@remotion/google-fonts` for Google Fonts:
```tsx
import { loadFont } from "@remotion/google-fonts/Inter";
const { fontFamily } = loadFont();
// style={{ fontFamily }}
```

For local fonts, use `@remotion/fonts` with files in `public/`.

---

## CHECKLIST BEFORE RENDER

- [ ] All `interpolate()` calls use `extrapolateRight: "clamp"` where values should cap
- [ ] No CSS transitions, CSS animations, or Tailwind animate classes
- [ ] All images use `<Img>` from remotion, not `<img>`
- [ ] All static assets use `staticFile()` from `public/`
- [ ] Scene durations add up to total composition `durationInFrames`
- [ ] Sequences use `premountFor` for smooth transitions
- [ ] Fonts loaded via `@remotion/google-fonts` or `@remotion/fonts`
- [ ] `npm run dev` previews correctly before rendering

---

## REFERENCE

For detailed API patterns, read the individual rule files in `remotion-best-practices/rules/`:
- **animations.md** — Frame-driven animation fundamentals
- **timing.md** — interpolate, spring, easing functions
- **sequencing.md** — Sequence, Series, timing control
- **transitions.md** — TransitionSeries, fade, slide, wipe
- **compositions.md** — Composition setup, folders, stills, calculateMetadata
- **text-animations.md** — Typewriter, word highlight
- **fonts.md** — Google Fonts, local fonts
- **images.md** — Img component, staticFile
- **audio.md** — Audio embedding, trimming, volume
- **voiceover.md** — ElevenLabs TTS integration
- **tailwind.md** — Tailwind usage constraints
- **parameters.md** — Zod schemas for parametric videos
