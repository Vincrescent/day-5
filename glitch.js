/* ═══════════════════════════════════════════
   Reality Glitch — Main Engine
   Stage escalation, effects, DOM manipulation
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── State ─────────────────────────────── */
  const STAGE_THRESHOLDS = [0, 1, 6, 13, 21]; // idle, s1, s2, s3, climax
  const CLIMAX_CLICK = 25;
  let clickCount = parseInt(localStorage.getItem('rg_clicks') || '0', 10);
  let cycleCount = parseInt(localStorage.getItem('rg_cycles') || '0', 10);
  let titleInterval = null;
  let shakeInterval = null;
  let tearRAF = null;
  let cursorRAF = null;
  const originalTitle = 'Reality Glitch';
  const glitchChars = '░▒▓█▄▀╬╠╣╔╗╚╝┃━┣┫╋▐▌◼◻◾◽';
  const originalFavicon = document.getElementById('favicon').href;

  const buttonTexts = [
    "Don't.", "Stop.", "Why?", "Again?", "Enough.",
    "Please.", "No.", "Quit.", "W̷h̸y̵?", "S̴t̵o̶p̷."
  ];
  const errorMessages = [
    { title: 'MEMORY_FAULT', body: 'Segmentation fault at <code>0x4E2F</code>\nStack trace unavailable.' },
    { title: 'RENDER_ERROR', body: '<code>display.render()</code> returned <code>undefined</code>\nFallback context failed.' },
    { title: 'EVENT_OVERFLOW', body: 'Click event listener exceeded entropy threshold.\n<code>MAX_CHAOS = 255</code>' },
    { title: 'REALITY_CHECK', body: 'Module <code>reality.js</code> not found.\nDid you mean: <code>void</code>?' },
    { title: 'STACK_CORRUPT', body: 'Call stack integrity compromised.\n<code>0xDEAD 0xBEEF 0xCAFE</code>' },
    { title: 'NULL_POINTER', body: 'Cannot read property <code>existence</code>\nof <code>null</code>.' },
    { title: 'BUFFER_OVERFLOW', body: 'Visual buffer exceeded capacity.\n<code>glitch_level > MAX_SAFE_INTEGER</code>' },
    { title: 'ENTROPY_WARNING', body: 'System entropy approaching maximum.\nReality coherence: <code>12%</code>' },
  ];

  /* ── DOM refs ──────────────────────────── */
  const app = document.getElementById('app');
  const btn = document.getElementById('glitch-btn');
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const counter = document.getElementById('click-counter');
  const scanlines = document.getElementById('scanlines');
  const tearCanvas = document.getElementById('tear-canvas');
  const tearCtx = tearCanvas.getContext('2d') || { clearRect(){}, save(){}, restore(){}, fillRect(){}, set globalAlpha(v){}, set fillStyle(v){} };
  const fakeCursor = document.getElementById('fake-cursor');
  const errorContainer = document.getElementById('error-container');
  const deadPixel = document.getElementById('dead-pixel');
  const escapeBtn = document.getElementById('escape-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const particleCanvas = document.getElementById('particle-canvas');
  const particleCtx = particleCanvas.getContext('2d') || { clearRect(){}, fillRect(){}, set fillStyle(v){}, beginPath(){}, arc(){}, fill(){} };

  /* ── Helpers ───────────────────────────── */
  function getStage(clicks) {
    if (clicks >= STAGE_THRESHOLDS[4]) return 4;
    if (clicks >= STAGE_THRESHOLDS[3]) return 3;
    if (clicks >= STAGE_THRESHOLDS[2]) return 2;
    if (clicks >= STAGE_THRESHOLDS[1]) return 1;
    return 0;
  }

  function save() {
    localStorage.setItem('rg_clicks', clickCount);
    localStorage.setItem('rg_cycles', cycleCount);
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function scrambleChar(str, count) {
    const arr = str.split('');
    for (let i = 0; i < count; i++) {
      const idx = randInt(0, arr.length - 1);
      arr[idx] = glitchChars[randInt(0, glitchChars.length - 1)];
    }
    return arr.join('');
  }

  /* ── Tear canvas setup ─────────────────── */
  function resizeCanvas() {
    tearCanvas.width = window.innerWidth;
    tearCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ── Particle system ───────────────────── */
  const particles = [];
  const MAX_PARTICLES = 60;
  let particleRAF = null;

  function initParticles() {
    particles.length = 0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      particles.push({
        x: Math.random() * particleCanvas.width,
        y: Math.random() * particleCanvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }
  }

  function updateParticles(stage) {
    if (!particleCtx.clearRect) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    const speedMult = 1 + stage * 1.5;
    const colors = ['255,255,255', '0,255,213', '255,0,255'];

    for (const p of particles) {
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;

      // Wrap around
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      // Stage 2+: occasional jitter
      if (stage >= 2 && Math.random() > 0.95) {
        p.vx = (Math.random() - 0.5) * stage;
        p.vy = (Math.random() - 0.5) * stage;
      }

      const colorIdx = stage >= 3 ? randInt(0, 2) : stage >= 2 ? randInt(0, 1) : 0;
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r * (1 + stage * 0.2), 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(${colors[colorIdx]}, ${p.alpha + stage * 0.05})`;
      particleCtx.fill();
    }
  }

  function startParticleLoop(stage) {
    if (particleRAF) cancelAnimationFrame(particleRAF);
    if (particles.length === 0) initParticles();
    function loop() {
      updateParticles(stage);
      particleRAF = requestAnimationFrame(loop);
    }
    particleRAF = requestAnimationFrame(loop);
  }

  /* ── Screen tear effect ────────────────── */
  function drawTear(intensity) {
    tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height);
    const tearCount = Math.floor(intensity * 5);
    for (let i = 0; i < tearCount; i++) {
      const y = Math.random() * tearCanvas.height;
      const h = randInt(1, 4 + intensity * 3);
      const offset = (Math.random() - 0.5) * intensity * 30;
      tearCtx.save();
      tearCtx.globalAlpha = 0.3 + intensity * 0.15;
      tearCtx.fillStyle = Math.random() > 0.5 ? '#00ffd5' : '#ff00ff';
      tearCtx.fillRect(offset, y, tearCanvas.width, h);
      tearCtx.restore();
    }
  }

  function startTearLoop(stage) {
    if (tearRAF) cancelAnimationFrame(tearRAF);
    if (stage < 2) { tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height); return; }
    const intensity = (stage - 1) / 3;
    let lastTear = 0;
    function loop(ts) {
      if (ts - lastTear > (200 - stage * 40)) {
        drawTear(intensity);
        lastTear = ts;
      }
      tearRAF = requestAnimationFrame(loop);
    }
    tearRAF = requestAnimationFrame(loop);
  }

  /* ── Title corruption ──────────────────── */
  function startTitleCorruption(stage) {
    stopTitleCorruption();
    if (stage < 2) { document.title = originalTitle; return; }
    const rate = stage >= 3 ? 150 : 300;
    const chars = stage >= 3 ? 4 : 2;
    titleInterval = setInterval(() => {
      document.title = scrambleChar(originalTitle, chars);
    }, rate);
  }

  function stopTitleCorruption() {
    if (titleInterval) { clearInterval(titleInterval); titleInterval = null; }
    document.title = originalTitle;
  }

  /* ── Favicon corruption ────────────────── */
  function corruptFavicon(stage) {
    if (stage < 2) {
      document.getElementById('favicon').href = originalFavicon;
      return;
    }
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const fx = c.getContext('2d');
    if (!fx) return; // jsdom has no canvas
    // glitched icon
    fx.fillStyle = '#0a0a0a';
    fx.fillRect(0, 0, 16, 16);
    fx.fillStyle = '#ff00ff';
    fx.fillRect(2 + Math.random() * 4, 2, 6, 12);
    fx.fillStyle = '#00ffd5';
    fx.fillRect(8 + Math.random() * 2, 4, 5, 8);
    for (let i = 0; i < stage * 3; i++) {
      fx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      fx.fillRect(Math.random() * 16, Math.random() * 16, randInt(1, 4), randInt(1, 3));
    }
    document.getElementById('favicon').href = c.toDataURL();
  }

  /* ── Page shake ────────────────────────── */
  function startShake(stage) {
    stopShake();
    if (stage < 2) { app.style.transform = ''; return; }
    const maxShake = stage === 2 ? 3 : stage === 3 ? 6 : 10;
    shakeInterval = setInterval(() => {
      const x = (Math.random() - 0.5) * maxShake;
      const y = (Math.random() - 0.5) * maxShake;
      const r = (Math.random() - 0.5) * (stage > 2 ? 1 : 0.3);
      app.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    }, 50);
  }

  function stopShake() {
    if (shakeInterval) { clearInterval(shakeInterval); shakeInterval = null; }
    app.style.transform = '';
  }

  /* ── Fake error popups ─────────────────── */
  function spawnError() {
    const existing = errorContainer.querySelectorAll('.error-popup');
    if (existing.length >= 3) return;

    const msg = errorMessages[randInt(0, errorMessages.length - 1)];
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    popup.innerHTML = `
      <div class="popup-title">
        <span>⚠ ${msg.title}</span>
        <span class="close-x">&times;</span>
      </div>
      <div class="popup-body">${msg.body.replace(/\n/g, '<br>')}</div>
    `;
    popup.style.left = randInt(10, window.innerWidth - 320) + 'px';
    popup.style.top = randInt(10, window.innerHeight - 200) + 'px';

    const closeBtn = popup.querySelector('.close-x');
    closeBtn.addEventListener('click', () => dissolvePopup(popup));

    errorContainer.appendChild(popup);

    // Auto-dissolve after 1.5-3s
    setTimeout(() => dissolvePopup(popup), randInt(1500, 3000));
  }

  function dissolvePopup(popup) {
    if (!popup.parentNode) return;
    popup.classList.add('popup-dissolve');
    setTimeout(() => popup.remove(), 400);
  }

  function clearErrors() {
    errorContainer.innerHTML = '';
  }

  /* ── Fake cursor ───────────────────────── */
  const isTouchDevice = ('ontouchstart' in window) || matchMedia('(hover: none)').matches;

  function startFakeCursor(stage) {
    if (isTouchDevice || stage < 2) {
      fakeCursor.classList.add('hidden');
      document.body.style.cursor = '';
      if (cursorRAF) cancelAnimationFrame(cursorRAF);
      return;
    }

    fakeCursor.classList.remove('hidden');
    if (stage >= 4) {
      document.body.style.cursor = 'none';
    } else if (stage >= 2) {
      document.body.style.cursor = 'crosshair';
    }

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function updateCursor() {
      let offX = 0, offY = 0;
      if (stage >= 2) {
        offX = (Math.random() - 0.5) * stage * 3;
        offY = (Math.random() - 0.5) * stage * 3;
      }
      // Stage 3: occasional teleport
      if (stage >= 3 && Math.random() > 0.95) {
        offX = (Math.random() - 0.5) * 200;
        offY = (Math.random() - 0.5) * 200;
      }
      fakeCursor.style.left = (mouseX + offX - 10) + 'px';
      fakeCursor.style.top = (mouseY + offY - 10) + 'px';
      fakeCursor.style.borderColor = stage >= 3 ? '#ff00ff' : '#00ffd5';
      fakeCursor.style.width = (20 + stage * 2) + 'px';
      fakeCursor.style.height = (20 + stage * 2) + 'px';
      cursorRAF = requestAnimationFrame(updateCursor);
    }
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    cursorRAF = requestAnimationFrame(updateCursor);
  }

  /* ── Dead pixel (post-climax residue) ──── */
  function showDeadPixel() {
    if (cycleCount < 1) { deadPixel.classList.add('hidden'); return; }
    deadPixel.classList.remove('hidden');
    deadPixel.style.left = randInt(50, window.innerWidth - 50) + 'px';
    deadPixel.style.top = randInt(50, window.innerHeight - 50) + 'px';
    // Cycle 2+: different color
    deadPixel.style.background = cycleCount === 1 ? '#ff00ff' : '#00ffd5';
    deadPixel.style.width = '3px';
    deadPixel.style.height = '3px';
  }

  function hideDeadPixel() {
    deadPixel.classList.add('hidden');
  }

  /* ── Button text ───────────────────────── */
  function updateButtonText(stage) {
    if (stage === 0) {
      btn.textContent = "Don't.";
    } else if (stage === 1) {
      btn.textContent = buttonTexts[randInt(0, 4)];
    } else if (stage === 2) {
      btn.textContent = buttonTexts[randInt(2, 6)];
    } else if (stage === 3) {
      btn.textContent = buttonTexts[randInt(5, 9)];
    } else {
      btn.textContent = scrambleChar("STOP", 2);
    }
  }

  /* ── Apply stage ───────────────────────── */
  function applyStage(stage) {
    // Update CSS class
    app.className = `stage-${stage}`;

    // Counter visibility
    if (stage >= 1) {
      counter.classList.remove('hidden');
      counter.textContent = clickCount;
    } else {
      counter.classList.add('hidden');
    }

    // Update button
    updateButtonText(stage);

    // Audio
    AudioEngine.setDroneIntensity(stage);

    // Scanlines, tear, shake
    startTearLoop(stage);
    startShake(stage);

    // Particles
    startParticleLoop(stage);

    // Progress bar
    if (stage >= 1) {
      progressBar.style.opacity = '1';
      const pct = Math.min((clickCount / CLIMAX_CLICK) * 100, 100);
      progressFill.style.width = pct + '%';
      // Color shifts with stage
      if (stage >= 3) progressFill.style.background = 'var(--error-red)';
      else if (stage >= 2) progressFill.style.background = 'var(--magenta)';
      else progressFill.style.background = 'var(--fg)';
    } else {
      progressBar.style.opacity = '0';
      progressFill.style.width = '0%';
    }

    // Title & favicon corruption
    startTitleCorruption(stage);
    corruptFavicon(stage);

    // Fake cursor
    startFakeCursor(stage);

    // Error popups (stage 3+)
    if (stage >= 3) {
      spawnError();
    } else {
      clearErrors();
    }

    // Dead pixel
    if (stage === 0 && cycleCount >= 1 && cycleCount <= 2) {
      showDeadPixel();
    }
  }

  /* ── Climax & Reset ────────────────────── */
  function triggerClimax() {
    const stage = 4;
    applyStage(stage);

    // Silence before snap
    AudioEngine.silenceAll();

    setTimeout(() => {
      // Full reset
      clickCount = 0;
      cycleCount++;
      save();

      stopTitleCorruption();
      stopShake();
      if (tearRAF) cancelAnimationFrame(tearRAF);
      tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height);
      if (cursorRAF) cancelAnimationFrame(cursorRAF);
      if (particleRAF) cancelAnimationFrame(particleRAF);
      clearErrors();

      document.body.style.cursor = '';
      fakeCursor.classList.add('hidden');

      AudioEngine.restoreAudio();
      applyStage(0);

      // Show dead pixel residue
      if (cycleCount <= 2) showDeadPixel();

      // Subtitle changes after first cycle
      if (cycleCount === 1) {
        subtitle.textContent = "You were warned.";
      } else if (cycleCount === 2) {
        subtitle.textContent = "...again?";
      } else {
        subtitle.textContent = "Some things are better left alone.";
        hideDeadPixel();
      }
    }, 1800);
  }

  /* ── Full Reset ────────────────────────── */
  function fullReset() {
    clickCount = 0;
    cycleCount = 0;
    save();

    stopTitleCorruption();
    stopShake();
    if (tearRAF) cancelAnimationFrame(tearRAF);
    tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height);
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    if (particleRAF) cancelAnimationFrame(particleRAF);
    clearErrors();
    hideDeadPixel();

    document.body.style.cursor = '';
    fakeCursor.classList.add('hidden');
    subtitle.textContent = "Some things are better left alone.";
    progressBar.style.opacity = '0';
    progressFill.style.width = '0%';

    AudioEngine.reset();
    applyStage(0);
  }

  /* ── Click handler ─────────────────────── */
  btn.addEventListener('click', () => {
    AudioEngine.ensureResumed();
    AudioEngine.startDrone();

    clickCount++;
    save();

    const stage = getStage(clickCount);
    AudioEngine.playClick(stage);

    if (clickCount >= CLIMAX_CLICK) {
      triggerClimax();
    } else {
      applyStage(stage);
    }
  });

  /* ── Escape hatch ──────────────────────── */
  escapeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fullReset();
  });

  /* ── Init ───────────────────────────────── */
  // Restore state from localStorage
  const initStage = getStage(clickCount);
  applyStage(initStage);
  if (clickCount > 0) {
    counter.classList.remove('hidden');
    counter.textContent = clickCount;
  }
  if (cycleCount >= 1 && cycleCount <= 2 && initStage === 0) {
    showDeadPixel();
  }

})();
