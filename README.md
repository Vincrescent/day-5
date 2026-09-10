# Reality Glitch Button

**Day 5** of the 30-Day Build Challenge.

One button. Every click "breaks" the display a little more. **It never resets. It only gets worse.**

## Concept

An ever-escalating chaos arc driven by click count. There is no climax, no reset, no relief. The intensity grows linearly for the first 50 clicks, then logarithmically forever. Every 100 clicks unlocks a new tier of visual destruction. State persists via localStorage. The only way back is the hidden escape hatch.

## Stage Progression (0-50 clicks)

| Stage | Clicks | Effects |
|---|---|---|
| Idle | 0 | Minimal page, centered button, floating particles |
| Stage 1 | 1–5 | Button jitter, chromatic aberration flash, title scramble |
| Stage 2 | 6–12 | Layout skew, scanlines, title/favicon corruption, custom cursor, page drift |
| Stage 3 | 13–24 | Audio distortion, screen tears, fake OS error popups, cursor teleport, screen invert flash |
| Stage 4 | 25–39 | Heavy chaos — all effects intensified, deep bass audio, dead pixels accumulate |
| Stage 5 | 40+ | "Beyond" — maximum permanent chaos, all base effects at max |

## Mega-Tier Escalation (100+ clicks)

| Tier | Clicks | What Happens |
|---|---|---|
| **SHATTERED GLASS** | 100+ | Procedural crack lines radiate from center, floating glass shards drift and rotate |
| **DIMENSION RIFT** | 200+ | Glowing jagged portal tears pulse and grow, reality echo ghosts of title text appear |
| **REALITY COLLAPSE** | 300+ | Static noise overlay, full RGB channel separation, subtitle melts, progress bar rainbow cycles |
| **THE VOID** | 400+ | Pulsing radial gradient background shifts through spectrum, content opacity pulses, massive button glow |
| **SINGULARITY** | 500+ | Converging lines to center, content contracts, particles pulled by gravity, everything spirals inward |

All tiers stack — at 500+ clicks you get shattered glass + dimension rifts + collapsing reality + void pulse + singularity pull simultaneously.

## Features

- **Infinite escalation** — never resets, intensity scales forever
- **10 visual layers** — 6 stages + 5 mega-tiers, all stacking
- **Web Audio API** — synthesized drone (4 oscillators), descending pitch clicks, heartbeat on hover
- **Canvas rendering** — screen tear, particles, cracks, shards, rifts, void pulse, singularity lines
- **Reactive subtitles** — 31 unique dialogue lines
- **27 button text variants** — progressively more corrupted
- **16 fake error messages** — tier-specific, increasingly existential
- **Konami code easter egg** — ↑↑↓↓←→←→BA jumps to 100 clicks
- **Cursor corruption, title/favicon scramble, dead pixel accumulation**
- **Screen invert flash** with multi-filter combos at high tiers
- **Glitch memory** — button text flickers to past states
- **localStorage persistence** — survives refresh
- **Escape hatch** — tiny dot in bottom-right corner (only way to reset)
- **Epilepsy-safe** — no rapid high-contrast strobing
- **Mobile responsive**

## Tech Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step, no external files.

## How to Run

```bash
# Just open index.html, or:
python -m http.server 8080
# open http://localhost:8080
```

## Tests

```bash
npm install
node test/e2e.cjs
# 34/34 PASS
```

## File Structure

```
index.html      → page structure, 3 canvas layers, overlays
style.css       → 6 stages + 5 mega-tiers + animations
glitch.js       → infinite escalation engine, mega effects
audio.js        → Web Audio drone, heartbeat, click FX, distortion
test/e2e.cjs    → 34 jsdom e2e tests
PLAN.md         → original design document
```

## Credits

Built by VincenT — Day 5 of 30.
