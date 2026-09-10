/* ═══════════════════════════════════════════
   Reality Glitch — e2e Tests (Infinite Mode)
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

function buildInlineHTML(preSetStorage) {
  const storageSetup = preSetStorage
    ? `<script>${preSetStorage.clicks !== undefined ? `localStorage.setItem('rg_clicks', '${preSetStorage.clicks}');` : ''}</script>`
    : '';
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
          createOscillator: () => ({ type: '', frequency: { value: 0, setValueAtTime(){}, exponentialRampToValueAtTime(){} }, connect() {}, start() {}, stop() {}, disconnect() {} }),
          createGain: () => ({ gain: { value: 1, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() {} }),
          createBiquadFilter: () => ({ type: '', frequency: { value: 0 }, Q: { value: 0 }, connect() {} }),
          createWaveShaper: () => ({ curve: null, oversample: '', connect() {} }),
          createBuffer: (ch, len) => ({ getChannelData: () => new Float32Array(len || 1024) }),
          createBufferSource: () => ({ buffer: null, playbackRate: { value: 1 }, connect() {}, start() {}, stop() {} }),
        };
      };
      window.webkitAudioContext = window.AudioContext;
      window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {} });

      // Canvas mock
      const canvasStub = {
        clearRect(){}, fillRect(){}, save(){}, restore(){},
        fillStyle: '', globalAlpha: 1,
        beginPath(){}, arc(){}, fill(){}, moveTo(){}, lineTo(){}, stroke(){}
      };
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
        value: function() { return canvasStub; }, writable: true, configurable: true
      });
      Object.defineProperty(window.HTMLCanvasElement.prototype, 'toDataURL', {
        value: function() { return 'data:image/png;base64,mock'; }, writable: true, configurable: true
      });

      let _rafId = 0;
      window.requestAnimationFrame = () => ++_rafId;
      window.cancelAnimationFrame = () => {};
    }
  });
  return dom;
}

function clickBtn(dom, times) {
  const btn = dom.window.document.getElementById('glitch-btn');
  for (let i = 0; i < times; i++) btn.click();
}

console.log('\n🔴 Reality Glitch — e2e Tests (Infinite Mode)\n');

// 1
test('Button exists with initial text "Don\'t."', () => {
  const dom = createDOM();
  const btn = dom.window.document.getElementById('glitch-btn');
  assert.ok(btn);
  assert.strictEqual(btn.textContent, "Don't.");
});

// 2
test('Title and subtitle exist with correct text', () => {
  const dom = createDOM();
  const doc = dom.window.document;
  assert.strictEqual(doc.getElementById('title').textContent, 'Reality Glitch');
  assert.ok(doc.getElementById('subtitle').textContent.includes('better left alone'));
});

// 3
test('Click increments counter in localStorage', () => {
  const dom = createDOM();
  clickBtn(dom, 1);
  assert.strictEqual(parseInt(dom.window.localStorage.getItem('rg_clicks')), 1);
  clickBtn(dom, 4);
  assert.strictEqual(parseInt(dom.window.localStorage.getItem('rg_clicks')), 5);
});

// 4
test('Stage 0 at start', () => {
  const dom = createDOM();
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-0'));
});

// 5
test('Stage 1 at 1-5 clicks', () => {
  const dom = createDOM();
  clickBtn(dom, 3);
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-1'));
});

// 6
test('Stage 2 at 6-12 clicks', () => {
  const dom = createDOM();
  clickBtn(dom, 8);
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-2'));
});

// 7
test('Stage 3 at 13-24 clicks, error popups spawn', () => {
  const dom = createDOM();
  clickBtn(dom, 15);
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-3'));
  assert.ok(dom.window.document.querySelectorAll('.error-popup').length > 0);
});

// 8
test('Stage 4 at 25-39 clicks', () => {
  const dom = createDOM();
  clickBtn(dom, 30);
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-4'));
});

// 9
test('Stage 5 (beyond) at 40+ clicks', () => {
  const dom = createDOM();
  clickBtn(dom, 45);
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-5'));
});

// 10
test('INFINITE: no reset at any click count', () => {
  const dom = createDOM();
  clickBtn(dom, 60);
  const count = parseInt(dom.window.localStorage.getItem('rg_clicks'));
  assert.strictEqual(count, 60, 'Should never reset');
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-5'));
});

// 11
test('Escape button exists and resets to 0', () => {
  const dom = createDOM();
  clickBtn(dom, 20);
  dom.window.document.getElementById('escape-btn').click();
  assert.strictEqual(parseInt(dom.window.localStorage.getItem('rg_clicks')), 0);
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-0'));
});

// 12
test('State persists from localStorage', () => {
  const dom = createDOM({ clicks: 30 });
  assert.ok(dom.window.document.getElementById('app').classList.contains('stage-4'));
  assert.strictEqual(dom.window.document.getElementById('click-counter').textContent, '30');
});

// 13
test('Subtitle changes with clicks (reactive)', () => {
  const dom = createDOM();
  const sub = dom.window.document.getElementById('subtitle');
  const initial = sub.textContent;
  clickBtn(dom, 10);
  assert.notStrictEqual(sub.textContent, initial, 'Subtitle should change');
});

// 14
test('Button text changes at high clicks', () => {
  const dom = createDOM();
  const btn = dom.window.document.getElementById('glitch-btn');
  assert.strictEqual(btn.textContent, "Don't.");
  clickBtn(dom, 20);
  // At 20 clicks (intensity 0.4) button text should not be the initial
  assert.notStrictEqual(btn.textContent, "Don't.", 'Should differ at 20 clicks');
});

// 15
test('Progress bar visible after first click', () => {
  const dom = createDOM();
  clickBtn(dom, 5);
  assert.strictEqual(dom.window.document.getElementById('progress-bar').style.opacity, '1');
});

// 16
test('Counter visible and accurate', () => {
  const dom = createDOM();
  clickBtn(dom, 7);
  const c = dom.window.document.getElementById('click-counter');
  assert.ok(!c.classList.contains('hidden'));
  assert.strictEqual(c.textContent, '7');
});

// 17
test('Overlay elements exist', () => {
  const dom = createDOM();
  const doc = dom.window.document;
  assert.ok(doc.getElementById('scanlines'));
  assert.ok(doc.getElementById('tear-canvas'));
  assert.ok(doc.getElementById('particle-canvas'));
  assert.ok(doc.getElementById('error-container'));
  assert.ok(doc.getElementById('fake-cursor'));
});

// 18
test('CSS defines stages 0-5', () => {
  assert.ok(cssSrc.includes('.stage-0'));
  assert.ok(cssSrc.includes('.stage-1'));
  assert.ok(cssSrc.includes('.stage-2'));
  assert.ok(cssSrc.includes('.stage-3'));
  assert.ok(cssSrc.includes('.stage-4'));
  assert.ok(cssSrc.includes('.stage-5'));
});

// 19
test('Audio engine defines key methods', () => {
  assert.ok(audioSrc.includes('AudioEngine'));
  assert.ok(audioSrc.includes('playClick'));
  assert.ok(audioSrc.includes('startHeartbeat'));
  assert.ok(audioSrc.includes('setDroneIntensity'));
});

// 20
test('Rapid 100 clicks do not throw', () => {
  const dom = createDOM();
  assert.doesNotThrow(() => clickBtn(dom, 100));
  assert.strictEqual(parseInt(dom.window.localStorage.getItem('rg_clicks')), 100);
});

// 21
test('Konami code listener exists in source', () => {
  assert.ok(glitchSrc.includes('KONAMI'));
  assert.ok(glitchSrc.includes('ArrowUp'));
});

// 22
test('Glitch memory system exists in source', () => {
  assert.ok(glitchSrc.includes('glitchMemory'));
  assert.ok(glitchSrc.includes('startGlitchMemory'));
});

// 23
test('Screen invert function exists', () => {
  assert.ok(glitchSrc.includes('triggerInvert'));
  assert.ok(glitchSrc.includes('invert(1)'));
});

// 24
test('Heartbeat audio on hover exists', () => {
  assert.ok(glitchSrc.includes('mouseenter'));
  assert.ok(glitchSrc.includes('startHeartbeat'));
});

// 25
test('Dead pixel accumulation system exists', () => {
  assert.ok(glitchSrc.includes('updateDeadPixels'));
  assert.ok(glitchSrc.includes('dead-pixel-dot'));
});

// Summary
console.log(`\n${'═'.repeat(40)}`);
console.log(`  Results: ${passed}/${total} PASS${failed > 0 ? `, ${failed} FAIL` : ''}`);
console.log(`${'═'.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
