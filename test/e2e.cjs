/* ═══════════════════════════════════════════
   Reality Glitch — e2e Tests (jsdom)
   ═══════════════════════════════════════════ */

const { JSDOM } = require('jsdom');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf-8');
const cssSrc = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf-8');
const audioSrc = fs.readFileSync(path.join(ROOT, 'audio.js'), 'utf-8');
const glitchSrc = fs.readFileSync(path.join(ROOT, 'glitch.js'), 'utf-8');

let passed = 0, failed = 0, total = 0;

function test(name, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ❌ ${name}`);
    console.log(`     ${e.message}`);
  }
}

// Build a full inline HTML that embeds all scripts so jsdom runs them in order
function buildInlineHTML(preSetStorage) {
  // Inject a storage-setup script before the main scripts
  const storageSetup = preSetStorage
    ? `<script>
        ${preSetStorage.clicks !== undefined ? `localStorage.setItem('rg_clicks', '${preSetStorage.clicks}');` : ''}
        ${preSetStorage.cycles !== undefined ? `localStorage.setItem('rg_cycles', '${preSetStorage.cycles}');` : ''}
       </script>`
    : '';

  // Replace external script tags with inline
  let h = htmlSrc;
  h = h.replace('<link rel="stylesheet" href="style.css">', `<style>${cssSrc}</style>`);
  h = h.replace('<script src="audio.js"></script>', `${storageSetup}<script>${audioSrc}</script>`);
  h = h.replace('<script src="glitch.js"></script>', `<script>${glitchSrc}</script>`);
  return h;
}

function createDOM(preSetStorage) {
  const fullHTML = buildInlineHTML(preSetStorage);
  const dom = new JSDOM(fullHTML, {
    url: 'http://localhost/',
    runScripts: 'dangerously',
    pretendToBeVisual: true,
    beforeParse(window) {
      // Mock Web Audio API
      window.AudioContext = function () {
        return {
          state: 'running', currentTime: 0, sampleRate: 44100, destination: {},
          resume: () => Promise.resolve(),
          createOscillator: () => ({
            type: '', frequency: { value: 0 }, connect() {}, start() {}, stop() {}, disconnect() {}
          }),
          createGain: () => ({
            gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
            connect() {}
          }),
          createBiquadFilter: () => ({
            type: '', frequency: { value: 0 }, Q: { value: 0 }, connect() {}
          }),
          createWaveShaper: () => ({ curve: null, oversample: '', connect() {} }),
          createBuffer: (ch, len) => ({ getChannelData: () => new Float32Array(len) }),
          createBufferSource: () => ({
            buffer: null, playbackRate: { value: 1 }, connect() {}, start() {}, stop() {}
          }),
        };
      };
      window.webkitAudioContext = window.AudioContext;

      // Mock matchMedia
      window.matchMedia = (q) => ({
        matches: false, media: q, addEventListener() {}, removeEventListener() {}
      });

      // Mock canvas getContext to return a stub 2d context
      const origCreateElement = window.document.createElement.bind(window.document);
      const canvasStub = {
        clearRect(){}, fillRect(){}, save(){}, restore(){},
        fillStyle: '', globalAlpha: 1,
        set strokeStyle(v){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, arc(){}
      };
      // Patch HTMLCanvasElement prototype
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
        value: function() { return canvasStub; },
        writable: true, configurable: true
      });
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'toDataURL', {
        value: function() { return 'data:image/png;base64,mock'; },
        writable: true, configurable: true
      });

      // Mock rAF
      let _rafId = 0;
      window.requestAnimationFrame = () => ++_rafId;
      window.cancelAnimationFrame = () => {};
    }
  });
  return dom;
}

function clickBtn(dom, times) {
  const doc = dom.window.document;
  const btn = doc.getElementById('glitch-btn');
  for (let i = 0; i < times; i++) {
    btn.click();
  }
}

console.log('\n🔴 Reality Glitch — e2e Tests\n');

// ── Test 1: Button exists ───────────────────
test('Button exists and is visible', () => {
  const dom = createDOM();
  const btn = dom.window.document.getElementById('glitch-btn');
  assert.ok(btn, 'Button element should exist');
  assert.strictEqual(btn.tagName, 'BUTTON');
  assert.strictEqual(btn.textContent, "Don't.");
});

// ── Test 2: Title exists ────────────────────
test('Title and subtitle exist', () => {
  const dom = createDOM();
  const doc = dom.window.document;
  assert.ok(doc.getElementById('title'), 'Title should exist');
  assert.ok(doc.getElementById('subtitle'), 'Subtitle should exist');
  assert.strictEqual(doc.getElementById('title').textContent, 'Reality Glitch');
});

// ── Test 3: Click increments localStorage ───
test('Click increments counter in localStorage', () => {
  const dom = createDOM();
  clickBtn(dom, 1);
  const count = parseInt(dom.window.localStorage.getItem('rg_clicks'), 10);
  assert.strictEqual(count, 1);
});

// ── Test 4: Stage 0 (idle) ──────────────────
test('Stage 0: app has stage-0 class at start', () => {
  const dom = createDOM();
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-0'), 'Should have stage-0 class');
});

// ── Test 5: Stage 1 transition (1-5 clicks) ─
test('Stage 1: transitions at click 1-5', () => {
  const dom = createDOM();
  clickBtn(dom, 3);
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-1'), 'Should have stage-1 class after 3 clicks');
  const counter = dom.window.document.getElementById('click-counter');
  assert.ok(!counter.classList.contains('hidden'), 'Counter should be visible');
});

// ── Test 6: Stage 2 transition (6-12) ───────
test('Stage 2: transitions at click 6-12', () => {
  const dom = createDOM();
  clickBtn(dom, 8);
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-2'), 'Should have stage-2 class after 8 clicks');
});

// ── Test 7: Stage 3 transition (13-20) ──────
test('Stage 3: transitions at click 13-20, error popups spawn', () => {
  const dom = createDOM();
  clickBtn(dom, 15);
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-3'), 'Should have stage-3 class after 15 clicks');
  const errors = dom.window.document.querySelectorAll('.error-popup');
  assert.ok(errors.length > 0, 'Error popups should spawn in stage 3');
});

// ── Test 8: Climax resets at 25 ─────────────
test('Climax: triggers at click 25, sets stage-4', () => {
  const dom = createDOM();
  clickBtn(dom, 25);
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-4'), 'Should have stage-4 at climax');
});

// ── Test 9: Escape button exists ────────────
test('Escape button exists', () => {
  const dom = createDOM();
  assert.ok(dom.window.document.getElementById('escape-btn'), 'Escape button should exist');
});

// ── Test 10: Escape resets state ────────────
test('Escape button resets all state', () => {
  const dom = createDOM();
  clickBtn(dom, 10);
  const esc = dom.window.document.getElementById('escape-btn');
  esc.click();
  const count = parseInt(dom.window.localStorage.getItem('rg_clicks'), 10);
  assert.strictEqual(count, 0, 'Clicks should reset to 0');
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-0'), 'Should be back to stage-0');
});

// ── Test 11: localStorage persistence ───────
test('State persists from localStorage on reload', () => {
  const dom = createDOM({ clicks: 10, cycles: 0 });
  const app = dom.window.document.getElementById('app');
  assert.ok(app.classList.contains('stage-2'), 'Should restore to stage-2 from stored 10 clicks');
  const counter = dom.window.document.getElementById('click-counter');
  assert.strictEqual(counter.textContent, '10');
});

// ── Test 12: Post-climax residue ────────────
test('Post-climax dead pixel visible after cycle 1', () => {
  const dom = createDOM({ clicks: 0, cycles: 1 });
  const dp = dom.window.document.getElementById('dead-pixel');
  assert.ok(!dp.classList.contains('hidden'), 'Dead pixel should be visible after 1 cycle');
});

// ── Test 13: Overlay elements exist ─────────
test('Overlay elements exist (scanlines, tear canvas, error container)', () => {
  const dom = createDOM();
  const doc = dom.window.document;
  assert.ok(doc.getElementById('scanlines'), 'Scanlines overlay');
  assert.ok(doc.getElementById('tear-canvas'), 'Tear canvas');
  assert.ok(doc.getElementById('error-container'), 'Error container');
});

// ── Test 14: Fake cursor element exists ─────
test('Fake cursor element exists', () => {
  const dom = createDOM();
  assert.ok(dom.window.document.getElementById('fake-cursor'), 'Fake cursor div should exist');
});

// ── Test 15: Multiple rapid clicks don't crash
test('Rapid 30 clicks do not throw', () => {
  const dom = createDOM();
  assert.doesNotThrow(() => clickBtn(dom, 30));
});

// ── Test 16: CSS stages defined ─────────────
test('CSS defines all stage classes', () => {
  assert.ok(cssSrc.length > 100, 'CSS should have content');
  assert.ok(cssSrc.includes('.stage-0'), 'CSS should define stage-0');
  assert.ok(cssSrc.includes('.stage-1'), 'CSS should define stage-1');
  assert.ok(cssSrc.includes('.stage-2'), 'CSS should define stage-2');
  assert.ok(cssSrc.includes('.stage-3'), 'CSS should define stage-3');
  assert.ok(cssSrc.includes('.stage-4'), 'CSS should define stage-4');
});

// ── Test 17: Audio engine exists ────────────
test('Audio engine defines AudioEngine with key methods', () => {
  assert.ok(audioSrc.length > 100, 'Audio JS should have content');
  assert.ok(audioSrc.includes('AudioEngine'), 'Should define AudioEngine');
  assert.ok(audioSrc.includes('playClick'), 'Should have playClick');
  assert.ok(audioSrc.includes('silenceAll'), 'Should have silenceAll');
});

// ── Test 18: Button text changes ────────────
test('Button text changes across stages', () => {
  const dom = createDOM();
  const btn = dom.window.document.getElementById('glitch-btn');
  assert.strictEqual(btn.textContent, "Don't.");
  clickBtn(dom, 7);
  const newText = btn.textContent;
  assert.notStrictEqual(newText, "Don't.", 'Button text should change by stage 2');
});

// ── Summary ─────────────────────────────────
console.log(`\n${'═'.repeat(40)}`);
console.log(`  Results: ${passed}/${total} PASS${failed > 0 ? `, ${failed} FAIL` : ''}`);
console.log(`${'═'.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
