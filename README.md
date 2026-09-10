# Reality Glitch Button

**Day 5** of the 30-Day Build Challenge.

One button. Every click "breaks" the display a little more. **It never resets.**

## Concept

An ever-escalating chaos arc driven by click count. There is no climax, no reset, no relief — only deeper into the glitch. The intensity grows linearly for the first 50 clicks, then logarithmically forever. State persists via localStorage. The only way back is the hidden escape hatch.

## Stages

| Stage | Clicks | Effects |
|---|---|---|
| Idle | 0 | Minimal page, centered button, floating particles |
| Stage 1 | 1–5 | Button jitter, chromatic aberration flash, title scramble |
| Stage 2 | 6–12 | Layout skew, scanlines, title/favicon corruption, custom cursor, page drift |
| Stage 3 | 13–24 | Audio distortion, screen tears, fake OS error popups, cursor teleport, screen invert flash |
| Stage 4 | 25–39 | Heavy chaos — all effects intensified, deep bass audio, dead pixels accumulate |
| Stage 5+ | 40+ | "Beyond" — maximum permanent chaos, everything at max, keeps scaling forever |

## Features

- **Infinite escalation** — never resets, intensity scales logarithmically forever
- **6 CSS stages** with continuously scaling effect intensity
- **Web Audio API** — synthesized drone (4 oscillators), click sounds with descending pitch (high → deep bass rumble), progressive distortion
- **Heartbeat on hover** — low thump when hovering the button, BPM scales with click count
- **Reactive subtitles** — 21 unique dialogue lines ("I warned you.", "The void stares back.", etc.)
- **Konami code easter egg** — ↑↑↓↓←→←→BA instantly jumps to 100 clicks
- **Screen invert flash** — random full-screen color inversion (Stage 3+)
- **Glitch memory** — button text randomly flickers to past text (PTSD effect)
- **Dead pixel accumulation** — colored dots that accumulate and never disappear
- **CSS + Canvas effects**: chromatic aberration, scanlines, screen tear, page shake, CRT vignette
- **Cursor corruption**: crosshair → offset → teleport → hidden
- **document.title & favicon corruption** — scales with intensity
- **Fake OS error popups** — 12 unique messages, max popups scales with intensity
- **Floating particle system** — speeds up and shifts colors with chaos
- **Progress bar** — grows but never fills (glitches at high intensity)
- **localStorage persistence** — state survives refresh
- **Escape hatch** — tiny dot in bottom-right corner (the only way to reset)
- **Epilepsy-safe** — no rapid high-contrast strobing
- **Mobile responsive** — lighter effect set for touch devices

## Tech Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step, no external audio files.

## How to Run

Open `index.html` in a browser. Or:

```bash
python -m http.server 8080
# open http://localhost:8080
```

## Tests

```bash
npm install
node test/e2e.cjs
# 25/25 PASS
```

## File Structure

```
index.html      → page structure, overlays, containers
style.css       → base + 6 stage styles + CRT vignette + animations
glitch.js       → infinite escalation engine, all DOM effects
audio.js        → Web Audio drone, heartbeat, click FX, distortion
test/e2e.cjs    → 25 jsdom e2e tests
PLAN.md         → original design document
```

## Credits

Built by VincenT — Day 5 of 30.
