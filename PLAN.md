# Reality Glitch Button — Day 5 Plan

**One button. Every click "breaks" the display a little more — on purpose.**

## Concept

Not random glitches on every click. The whole thing is built as an **escalation arc** driven by click count, not `Math.random()` alone:

> calm → starts cracking → gets worse → climax → reset back to calm

Click counter is the main trigger. Chaos should feel intentional and stay aesthetic — not just "look broken."

Persistent across refresh — localStorage saves clickCount. User can't escape by reloading. Reset only happens from the climax snap-back or the hidden escape.

## Stage Breakdown

| Stage | Clicks | What happens |
|---|---|---|
| **Idle** | 0 | Super minimal page. One button, centered. Calm copy: "Don't." or "Are you sure?" Clean, almost empty. Faint ambient drone barely audible — sets a baseline tension. |
| **Stage 1** | 1–5 | Subtle. Button text jitters slightly per click. Quick chromatic aberration flash (RGB split, <100ms). One letter in the title occasionally swaps to a strange glyph for a split second, then reverts. Cursor unchanged. |
| **Stage 2** | 6–12 | Layout starts shifting — elements skew/rotate slightly, scanline flicker appears in background, text weight/size randomizes briefly, colors shift toward cyan/magenta. **document.title starts scrambling** (random char swaps on interval). **Favicon swaps to glitched icon.** Custom cursor appears — slightly corrupted/offset. Whole page starts drifting with subtle `transform: translate()` jitter. |
| **Stage 3** | 13–20 | Sound distortion kicks in — each click's audio gets more pitch-shifted/bitcrushed. Screen tear becomes more frequent and wider. **Fake "error" popups** spawn briefly — divs styled like OS error windows, not real alerts. Cursor offset gets worse, occasionally "teleports." Page shake intensifies. Text fragments from "error logs" flash across the screen. |
| **Climax** | 21–25 | Final clicks accelerate everything. At 25: all audio cuts to **dead silence for 0.5s** (dramatic pause), then full-screen distortion for ~1.5s — everything "breaks" maximally. Cursor disappears. Then snaps back to initial state with a reveal effect (glitch-clear). Counter resets. **But one subtle artifact remains** — a single "dead pixel" div, or one letter in a slightly wrong font. Hint that damage isn't fully healed. The artifact clears after the second full cycle. |

## Cursor Corruption Progression

- **Idle – Stage 1:** Default cursor.
- **Stage 2:** Custom cursor — slightly glitchy (CSS `cursor: url(...)`, a small corrupted crosshair or arrow). Occasional 2-4px offset via a transparent overlay div that shifts pointer position.
- **Stage 3:** Cursor more distorted. Random "teleport" effect — cursor visually jumps to a random spot for 1 frame then returns. Achieved via a fake cursor element + `pointer-events: none` overlay.
- **Climax:** Real cursor hidden (`cursor: none`), fake cursor element spirals/disintegrates, then everything resets.

## Favicon & Title Corruption

- **Stage 2 start:** `document.title` enters a setInterval loop — every 300ms, 1-2 chars randomly replaced with glitch characters (░▒▓█▄▀╬╠╣). Original title cached for restore.
- **Stage 2 mid:** Favicon swapped to a pre-made glitched 16x16 canvas (drawn procedurally — shifted RGB channels on a simple icon).
- **Climax reset:** Title and favicon restored to clean state.

## Fake System UI (Stage 3)

Spawned as absolutely-positioned divs styled like a generic OS error dialog:
- Title bar with "Error", a close button (non-functional or closes the fake popup)
- Body text: pseudo-technical nonsense ("MEMORY_FAULT at 0x4E2F", "display.render() returned undefined", "click event listener exceeded entropy threshold")
- Appear at random screen positions, linger 1-3s, then glitch-dissolve out
- Max 2-3 on screen at once to avoid clutter
- Styled to feel like Windows/system dialogs but clearly fake on close inspection

## Post-Climax Residue

After the snap-back reset, the page looks clean **except**:
- Cycle 1: One tiny (3x3px) "dead pixel" div in a random position, barely noticeable. Stays until cycle 2 completes.
- Cycle 2: The dead pixel clears on reset, but now one character in the button text uses a subtly different font-weight. Clears after cycle 3.
- Cycle 3+: Clean reset. The "damage heals" — or does it? (Could keep layering micro-artifacts indefinitely, but diminishing returns.)

## Audio Design

- **Ambient drone:** Starts at Idle — a very low volume (~0.05) continuous tone via OscillatorNode (low frequency, ~60Hz sine + slight detuned second oscillator for warmth). Sets subconscious tension.
- **Click sound:** Base sound is a short noise burst (white noise through a bandpass filter, ~50ms decay). Clean at Stage 1.
- **Stage 2:** Click sound gains slight distortion (WaveShaperNode with mild curve). Drone volume creeps up to ~0.1.
- **Stage 3:** Click sound heavily bitcrushed/pitch-shifted (sample rate reduction via ScriptProcessor or AudioWorklet). Drone gets dissonant — add a detuned third oscillator. Random audio artifacts (short static bursts) between clicks.
- **Pre-climax silence:** At click 25, ALL audio nodes ramp gain to 0 over 100ms. 500ms of absolute silence. Then the climax visual fires.
- **Post-reset:** Drone fades back in at original calm level.

No external audio files needed — everything synthesized via Web Audio API.

## Tech Stack

Vanilla HTML/CSS/JS — no framework, no build step.

- **Visual glitch:** CSS for lighter effects (skew, filter, text-shadow for RGB split, scanlines via repeating-linear-gradient). Canvas 2D for screen tear / datamosh effects overlaid on the page.
- **Audio:** Web Audio API — OscillatorNode (drone), noise buffer (clicks), BiquadFilterNode + WaveShaperNode (distortion chain). Intensity parameters driven by stage config.
- **State:** `clickCount` in localStorage + `getStage(clickCount)` function returning the active stage config (intensity values, which effects are enabled, audio params).
- **Cursor:** CSS `cursor` property + fake cursor div for Stage 3 teleport effect.
- **Fake UI:** DOM elements styled as system dialogs, spawned/removed by stage logic.

## File Structure

```
index.html          → semantic structure, button, overlay containers
style.css           → base styles + per-stage CSS classes (.stage-1, .stage-2, etc.)
glitch.js           → click handler, stage logic, DOM manipulation, canvas effects
audio.js            → Web Audio setup, drone, click sound, distortion chain
test/e2e.cjs        → jsdom e2e tests (stage transitions, DOM state, reset, localStorage)
README.md           → project description, how to run, credits
```

## e2e Test Coverage (test/e2e.cjs)

- Button exists and is clickable
- Click increments counter in localStorage
- Stage transitions happen at correct click thresholds (0, 1-5, 6-12, 13-20, 21-25)
- Correct CSS classes applied per stage (.stage-0 through .stage-4)
- Fake error popups spawn in Stage 3
- Climax triggers at click 25 and resets counter to 0
- Post-climax residue element exists after first cycle reset
- Hidden escape button exists and resets state
- Title corruption activates in Stage 2
- Page survives rapid clicking without errors

## Polish / UX Notes

- **Escape hatch:** Tiny dot in bottom-right corner (4x4px, barely visible, `opacity: 0.1`). Click it to force-reset everything including localStorage. For dev/testing and users who get stuck.
- **Mobile:** Lighter effect set — skip canvas overlay, reduce simultaneous CSS transforms, no fake cursor (touch devices don't have one). Detect via `'ontouchstart' in window` or `matchMedia('(hover: none)')`.
- **Epilepsy safety:** No rapid full-white/full-black strobing. Glitch effects use color shifts (cyan/magenta on dark bg), not high-contrast flashing. Screen tear is translucent overlay, not full-opacity. Max flash rate stays under 3Hz.
- **Performance:** `requestAnimationFrame` for all continuous effects. Cleanup intervals/timeouts on reset. Canvas overlay only active during stages that need it.

## Scope Note

Fits in one day. Core priority order if time gets tight:
1. Stage escalation loop + click counter + reset (the skeleton)
2. CSS glitch effects per stage (visual payoff)
3. Audio synthesis + distortion chain (atmosphere)
4. Cursor corruption + title/favicon (detail polish)
5. Fake system UI popups (bonus flavor)
6. Post-climax residue (subtle flex)
