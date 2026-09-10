# Reality Glitch Button

**Day 5** of the 30-Day Build Challenge.

One button. Every click "breaks" the display a little more — on purpose.

## Concept

An escalation arc driven by click count, not randomness:

**Idle → Subtle cracks → Layout distortion → Full chaos → Climax → Reset**

The chaos feels intentional and stays aesthetic. State persists across page reloads via localStorage — you can't escape by refreshing.

## Stages

| Stage | Clicks | Effects |
|---|---|---|
| Idle | 0 | Minimal page, one centered button, faint ambient drone |
| Stage 1 | 1–5 | Button jitter, chromatic aberration flash, glyph swaps |
| Stage 2 | 6–12 | Layout skew, scanlines, title/favicon corruption, custom cursor, page drift |
| Stage 3 | 13–20 | Audio distortion, screen tears, fake OS error popups, cursor teleport |
| Climax | 21–25 | Maximum chaos → dead silence → full reset with subtle residual damage |

## Features

- **5-stage escalation** with distinct visual/audio progression
- **Persistent state** via localStorage (survives refresh)
- **Web Audio API** synthesized drone + click sounds + progressive distortion
- **CSS + Canvas effects**: chromatic aberration, scanlines, screen tear, page shake
- **Cursor corruption**: offset → teleport → disappear
- **document.title & favicon corruption** (Stage 2+)
- **Fake OS error popups** with glitch-dissolve animations
- **Post-climax residue**: subtle artifacts that persist across cycles
- **Escape hatch**: tiny dot in bottom-right corner to force reset
- **Epilepsy-safe**: no rapid high-contrast strobing
- **Mobile responsive**: lighter effect set for touch devices

## Tech Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step, no external audio files.

## How to Run

Open `index.html` in a browser. That's it.

```bash
# Or serve locally
python -m http.server 8080
# Then open http://localhost:8080
```

## Tests

```bash
npm install
node test/e2e.cjs
# 18/18 PASS
```

## File Structure

```
index.html      → page structure
style.css       → base + per-stage styles + animations
glitch.js       → click handler, stage logic, DOM effects, canvas tear
audio.js        → Web Audio drone, click FX, distortion chain
test/e2e.cjs    → 18 jsdom e2e tests
PLAN.md         → detailed design document
```

## Credits

Built by VincenT — Day 5 of 30.
