/* ═══════════════════════════════════════════
   Reality Glitch — Main Engine (Infinite)
   No reset. Ever-escalating chaos.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────── */
  const originalTitle = 'Reality Glitch';
  const glitchChars = '░▒▓█▄▀╬╠╣╔╗╚╝┃━┣┫╋▐▌◼◻◾◽⌐¬¡¿ÆÐÞ×÷';
  const originalFavicon = document.getElementById('favicon').href;

  // Konami code sequence
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;

  // Reactive subtitle dialogue
  const subtitleLines = [
    // 0-5
    "Some things are better left alone.",
    "I warned you.",
    "Still going?",
    "You can't undo this.",
    "...interesting.",
    "Almost there? No. There is no 'there.'",
    // 6-10
    "You really can't stop, can you?",
    "The damage is accumulating.",
    "This page remembers everything.",
    "Error count: rising.",
    "Your curiosity is... noted.",
    // 11-15
    "Do you feel it yet?",
    "The cracks are spreading.",
    "There's no going back now.",
    "Reality coherence: declining.",
    "W̷h̸a̵t̶ ̷a̵r̶e̸ ̷y̴o̶u̸ ̷l̴o̵o̶k̵i̸n̶g̸ ̷f̶o̷r̶?",
    // 16-20
    "Ṫ̵h̸e̷ ̶v̷o̷i̸d̶ ̸s̵t̶a̷r̵e̷s̵ ̶b̷a̷c̵k̶.",
    "Y̷o̸u̶ ̶b̵r̸o̷k̵e̸ ̷i̴t̸.",
    "T̵̢h̴̨ḛ̸r̷̰e̷͇ ̷̣i̸̠s̶̱ ̵̰n̵̰o̶̱ ̸̣b̶̰u̷̱t̷͇t̸̢ǫ̵ṇ̶.",
    "...",
    "█████████████████",
  ];

  const buttonTexts = [
    "Don't.", "Stop.", "Why?", "Again?", "Enough.",
    "Please.", "No.", "Quit.", "W̷h̸y̵?", "S̴t̵o̶p̷.",
    "H̵e̶l̵p̸.", "R̵̦ǘ̵n̵̰.", "░░░", "███", "...",
    "E̸̢N̸̨Ḍ̵", "V̷̰O̸̱I̵̠D̶̰", "N̵̰U̸̱Ḷ̶L̸̢",
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
    { title: 'DIMENSION_LEAK', body: 'Adjacent reality bleed detected.\n<code>universe[3].merge(universe[7])</code>' },
    { title: 'TIME_FAULT', body: 'Temporal loop detected at <code>click[∞]</code>.\nCausality: <code>BROKEN</code>' },
    { title: 'SELF_AWARE', body: 'This page knows you\'re reading this.\n<code>awareness++</code>' },
    { title: 'VOID_RETURN', body: 'Function <code>escape()</code> returned\n<code>void void void void</code>' },
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

  /* ── State ─────────────────────────────── */
  let clickCount = parseInt(localStorage.getItem('rg_clicks') || '0', 10);
  let titleInterval = null;
  let shakeInterval = null;
  let tearRAF = null;
  let cursorRAF = null;
  let particleRAF = null;
  let invertTimeout = null;
  let glitchMemoryInterval = null;
  let isHovering = false;

  function save() { localStorage.setItem('rg_clicks', clickCount); }

  /* ── Helpers ───────────────────────────── */
  // Continuous intensity 0..1+ (never caps — keeps growing slowly)
  function getIntensity(clicks) {
    // Fast ramp 0-50, then logarithmic growth forever
    if (clicks <= 50) return clicks / 50;
    return 1 + Math.log2(clicks / 50) * 0.3;
  }

  // Stage buckets for CSS classes (0-5, stage 5 = "beyond")
  function getStage(clicks) {
    if (clicks >= 40) return 5;
    if (clicks >= 25) return 4;
    if (clicks >= 13) return 3;
    if (clicks >= 6) return 2;
    if (clicks >= 1) return 1;
    return 0;
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

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* ── Canvas setup ──────────────────────── */
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
  const MAX_PARTICLES = 80;

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

  function updateParticles(intensity) {
    if (!particleCtx.clearRect) return;
    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    const speedMult = 1 + intensity * 3;
    const colors = ['255,255,255', '0,255,213', '255,0,255', '255,51,51'];

    for (const p of particles) {
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      if (intensity > 0.3 && Math.random() > 0.95) {
        p.vx = (Math.random() - 0.5) * intensity * 3;
        p.vy = (Math.random() - 0.5) * intensity * 3;
      }

      const maxColor = intensity > 0.8 ? 3 : intensity > 0.4 ? 2 : intensity > 0.1 ? 1 : 0;
      const ci = maxColor > 0 ? randInt(0, maxColor) : 0;
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.r * (1 + intensity * 0.5), 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(${colors[ci]}, ${clamp(p.alpha + intensity * 0.1, 0, 0.8)})`;
      particleCtx.fill();
    }
  }

  function startParticleLoop() {
    if (particleRAF) cancelAnimationFrame(particleRAF);
    if (particles.length === 0) initParticles();
    function loop() {
      updateParticles(getIntensity(clickCount));
      particleRAF = requestAnimationFrame(loop);
    }
    particleRAF = requestAnimationFrame(loop);
  }

  /* ── Screen tear ───────────────────────── */
  function drawTear(intensity) {
    tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height);
    const tearCount = Math.floor(intensity * 8);
    for (let i = 0; i < tearCount; i++) {
      const y = Math.random() * tearCanvas.height;
      const h = randInt(1, 3 + intensity * 5);
      const offset = (Math.random() - 0.5) * intensity * 50;
      tearCtx.save();
      tearCtx.globalAlpha = clamp(0.2 + intensity * 0.2, 0, 0.7);
      tearCtx.fillStyle = Math.random() > 0.5 ? '#00ffd5' : '#ff00ff';
      tearCtx.fillRect(offset, y, tearCanvas.width, h);
      tearCtx.restore();
    }
  }

  function startTearLoop() {
    if (tearRAF) cancelAnimationFrame(tearRAF);
    const intensity = getIntensity(clickCount);
    if (intensity < 0.2) { tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height); return; }
    let lastTear = 0;
    function loop(ts) {
      const currentIntensity = getIntensity(clickCount);
      const interval = Math.max(200 - currentIntensity * 80, 30);
      if (ts - lastTear > interval) {
        drawTear(currentIntensity);
        lastTear = ts;
      }
      tearRAF = requestAnimationFrame(loop);
    }
    tearRAF = requestAnimationFrame(loop);
  }

  /* ── Title corruption ──────────────────── */
  function startTitleCorruption() {
    stopTitleCorruption();
    const intensity = getIntensity(clickCount);
    if (intensity < 0.2) { document.title = originalTitle; return; }
    const rate = Math.max(400 - intensity * 150, 80);
    const chars = Math.min(Math.floor(intensity * 3) + 1, originalTitle.length);
    titleInterval = setInterval(() => {
      document.title = scrambleChar(originalTitle, chars);
    }, rate);
  }

  function stopTitleCorruption() {
    if (titleInterval) { clearInterval(titleInterval); titleInterval = null; }
    document.title = originalTitle;
  }

  /* ── Favicon corruption ────────────────── */
  function corruptFavicon() {
    const intensity = getIntensity(clickCount);
    if (intensity < 0.2) {
      document.getElementById('favicon').href = originalFavicon;
      return;
    }
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const fx = c.getContext('2d');
    if (!fx) return;
    fx.fillStyle = '#0a0a0a';
    fx.fillRect(0, 0, 16, 16);
    const corruption = Math.min(Math.floor(intensity * 5), 20);
    for (let i = 0; i < corruption; i++) {
      fx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
      fx.fillRect(Math.random() * 16, Math.random() * 16, randInt(1, 5), randInt(1, 4));
    }
    document.getElementById('favicon').href = c.toDataURL();
  }

  /* ── Page shake ────────────────────────── */
  function startShake() {
    stopShake();
    const intensity = getIntensity(clickCount);
    if (intensity < 0.2) { app.style.transform = ''; return; }
    const maxShake = clamp(intensity * 8, 1, 20);
    const maxRot = clamp(intensity * 0.8, 0, 3);
    shakeInterval = setInterval(() => {
      const x = (Math.random() - 0.5) * maxShake;
      const y = (Math.random() - 0.5) * maxShake;
      const r = (Math.random() - 0.5) * maxRot;
      app.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg)`;
    }, Math.max(60 - intensity * 10, 16));
  }

  function stopShake() {
    if (shakeInterval) { clearInterval(shakeInterval); shakeInterval = null; }
    app.style.transform = '';
  }

  /* ── Fake error popups ─────────────────── */
  function spawnError() {
    const intensity = getIntensity(clickCount);
    const maxPopups = Math.min(Math.floor(intensity * 3) + 1, 8);
    const existing = errorContainer.querySelectorAll('.error-popup');
    if (existing.length >= maxPopups) return;

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
    popup.style.left = randInt(10, Math.max(window.innerWidth - 320, 20)) + 'px';
    popup.style.top = randInt(10, Math.max(window.innerHeight - 200, 20)) + 'px';
    popup.querySelector('.close-x').addEventListener('click', () => dissolvePopup(popup));
    errorContainer.appendChild(popup);
    const lifetime = Math.max(3000 - intensity * 500, 800);
    setTimeout(() => dissolvePopup(popup), lifetime);
  }

  function dissolvePopup(popup) {
    if (!popup.parentNode) return;
    popup.classList.add('popup-dissolve');
    setTimeout(() => popup.remove(), 400);
  }

  function clearErrors() { errorContainer.innerHTML = ''; }

  /* ── Fake cursor ───────────────────────── */
  const isTouchDevice = ('ontouchstart' in window) || matchMedia('(hover: none)').matches;
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

  function startFakeCursor() {
    const intensity = getIntensity(clickCount);
    if (isTouchDevice || intensity < 0.2) {
      fakeCursor.classList.add('hidden');
      document.body.style.cursor = '';
      if (cursorRAF) cancelAnimationFrame(cursorRAF);
      return;
    }
    fakeCursor.classList.remove('hidden');
    if (intensity >= 0.8) {
      document.body.style.cursor = 'none';
    } else {
      document.body.style.cursor = 'crosshair';
    }

    function updateCursor() {
      const ci = getIntensity(clickCount);
      let offX = 0, offY = 0;
      offX = (Math.random() - 0.5) * ci * 6;
      offY = (Math.random() - 0.5) * ci * 6;
      // Teleport at higher intensity
      if (ci >= 0.5 && Math.random() > 0.95) {
        offX = (Math.random() - 0.5) * 300;
        offY = (Math.random() - 0.5) * 300;
      }
      fakeCursor.style.left = (mouseX + offX - 10) + 'px';
      fakeCursor.style.top = (mouseY + offY - 10) + 'px';
      const hue = ci > 0.7 ? '#ff3333' : ci > 0.4 ? '#ff00ff' : '#00ffd5';
      fakeCursor.style.borderColor = hue;
      const size = 20 + ci * 6;
      fakeCursor.style.width = size + 'px';
      fakeCursor.style.height = size + 'px';
      cursorRAF = requestAnimationFrame(updateCursor);
    }
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    cursorRAF = requestAnimationFrame(updateCursor);
  }

  /* ── Dead pixels (accumulate over time) ── */
  function updateDeadPixels() {
    const intensity = getIntensity(clickCount);
    const count = Math.min(Math.floor(intensity * 3), 10);
    // Remove excess
    const existing = document.querySelectorAll('.dead-pixel-dot');
    if (existing.length < count && clickCount > 10) {
      const dp = document.createElement('div');
      dp.className = 'dead-pixel-dot';
      dp.style.cssText = `position:fixed;width:${randInt(2,4)}px;height:${randInt(2,4)}px;background:${['#ff00ff','#00ffd5','#ff3333'][randInt(0,2)]};pointer-events:none;z-index:150;left:${randInt(20,window.innerWidth-20)}px;top:${randInt(20,window.innerHeight-20)}px;`;
      app.appendChild(dp);
    }
  }

  /* ── Screen invert flash ───────────────── */
  function triggerInvert() {
    const intensity = getIntensity(clickCount);
    if (intensity < 0.5 || Math.random() > 0.3) return;
    app.style.filter = 'invert(1)';
    const duration = Math.min(30 + intensity * 20, 100);
    if (invertTimeout) clearTimeout(invertTimeout);
    invertTimeout = setTimeout(() => { app.style.filter = ''; }, duration);
  }

  /* ── Glitch memory (post-click flicker) ── */
  function startGlitchMemory() {
    stopGlitchMemory();
    if (clickCount < 20) return;
    const intensity = getIntensity(clickCount);
    glitchMemoryInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const oldText = btn.textContent;
        // Flicker to a "memory" text for 1 frame
        btn.textContent = buttonTexts[randInt(0, Math.min(clickCount, buttonTexts.length - 1))];
        setTimeout(() => { btn.textContent = oldText; }, 50);
      }
    }, Math.max(2000 - intensity * 300, 500));
  }

  function stopGlitchMemory() {
    if (glitchMemoryInterval) { clearInterval(glitchMemoryInterval); glitchMemoryInterval = null; }
  }

  /* ── Subtitle ──────────────────────────── */
  function updateSubtitle() {
    const idx = Math.min(Math.floor(clickCount / 3), subtitleLines.length - 1);
    subtitle.textContent = subtitleLines[idx];
    // At very high clicks, scramble the subtitle too
    if (clickCount > 40) {
      subtitle.textContent = scrambleChar(subtitleLines[idx], Math.floor(getIntensity(clickCount)));
    }
  }

  /* ── Button text ───────────────────────── */
  function updateButtonText() {
    const intensity = getIntensity(clickCount);
    if (clickCount === 0) {
      btn.textContent = "Don't.";
    } else if (intensity < 0.3) {
      btn.textContent = buttonTexts[randInt(0, 4)];
    } else if (intensity < 0.6) {
      btn.textContent = buttonTexts[randInt(3, 9)];
    } else if (intensity < 1.0) {
      btn.textContent = buttonTexts[randInt(7, 14)];
    } else {
      btn.textContent = scrambleChar(buttonTexts[randInt(10, buttonTexts.length - 1)], Math.floor(intensity));
    }
  }

  /* ── Progress bar (never fills — keeps growing) ── */
  function updateProgressBar() {
    const intensity = getIntensity(clickCount);
    if (clickCount >= 1) {
      progressBar.style.opacity = '1';
      // Bar oscillates and grows but never truly "completes"
      const pct = Math.min(intensity * 60, 98);
      progressFill.style.width = pct + '%';
      if (intensity > 0.8) progressFill.style.background = 'var(--error-red)';
      else if (intensity > 0.4) progressFill.style.background = 'var(--magenta)';
      else progressFill.style.background = 'var(--fg)';
      // At very high intensity the bar starts glitching
      if (intensity > 1.0) {
        progressFill.style.width = (pct + (Math.random() - 0.5) * 10) + '%';
      }
    } else {
      progressBar.style.opacity = '0';
      progressFill.style.width = '0%';
    }
  }

  /* ── Apply all effects ─────────────────── */
  function applyEffects() {
    const stage = getStage(clickCount);
    const intensity = getIntensity(clickCount);

    // CSS stage class (caps at 5 for styling)
    app.className = `stage-${stage}`;

    // Counter
    if (clickCount >= 1) {
      counter.classList.remove('hidden');
      counter.textContent = clickCount;
    } else {
      counter.classList.add('hidden');
    }

    updateButtonText();
    updateSubtitle();
    updateProgressBar();

    // Audio drone intensity
    AudioEngine.setDroneIntensity(intensity);

    // Continuous effects
    startTearLoop();
    startShake();
    startParticleLoop();
    startTitleCorruption();
    corruptFavicon();
    startFakeCursor();
    updateDeadPixels();
    startGlitchMemory();

    // Error popups (stage 3+)
    if (stage >= 3) {
      spawnError();
      // Spawn extra at higher intensity
      if (intensity > 0.8 && Math.random() > 0.5) spawnError();
    }
  }

  /* ── Heartbeat on hover ────────────────── */
  btn.addEventListener('mouseenter', () => {
    isHovering = true;
    AudioEngine.ensureResumed();
    AudioEngine.startDrone();
    // BPM increases with click count
    const bpm = Math.min(40 + clickCount * 2, 180);
    AudioEngine.startHeartbeat(bpm);
  });

  btn.addEventListener('mouseleave', () => {
    isHovering = false;
    AudioEngine.stopHeartbeat();
  });

  /* ── Full Reset (escape hatch only) ────── */
  function fullReset() {
    clickCount = 0;
    save();

    stopTitleCorruption();
    stopShake();
    stopGlitchMemory();
    AudioEngine.stopHeartbeat();
    if (tearRAF) cancelAnimationFrame(tearRAF);
    tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height);
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    if (particleRAF) cancelAnimationFrame(particleRAF);
    if (invertTimeout) clearTimeout(invertTimeout);
    clearErrors();

    // Remove all dead pixel dots
    document.querySelectorAll('.dead-pixel-dot').forEach(d => d.remove());
    deadPixel.classList.add('hidden');

    document.body.style.cursor = '';
    fakeCursor.classList.add('hidden');
    app.style.filter = '';
    progressBar.style.opacity = '0';
    progressFill.style.width = '0%';

    AudioEngine.reset();
    subtitle.textContent = subtitleLines[0];
    app.className = 'stage-0';
    btn.textContent = "Don't.";
    counter.classList.add('hidden');
    startParticleLoop();
  }

  /* ── Click handler ─────────────────────── */
  btn.addEventListener('click', () => {
    AudioEngine.ensureResumed();
    AudioEngine.startDrone();

    clickCount++;
    save();

    AudioEngine.playClick(clickCount);

    // Chromatic aberration flash (stage 1-2)
    const stage = getStage(clickCount);
    if (stage <= 2) {
      app.classList.add('chroma-flash');
      setTimeout(() => app.classList.remove('chroma-flash'), 120);
    }

    // Title text scramble flash
    const intensity = getIntensity(clickCount);
    if (intensity > 0) {
      const scrambled = scrambleChar(originalTitle, Math.min(Math.floor(intensity * 3) + 1, originalTitle.length));
      title.textContent = scrambled;
      setTimeout(() => { title.textContent = intensity > 0.6 ? scrambleChar(originalTitle, 2) : originalTitle; }, 80);
    }

    // Screen invert flash (stage 3+)
    triggerInvert();

    // Update heartbeat BPM if hovering
    if (isHovering) {
      const bpm = Math.min(40 + clickCount * 2, 180);
      AudioEngine.startHeartbeat(bpm);
    }

    applyEffects();
  });

  /* ── Escape hatch ──────────────────────── */
  escapeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fullReset();
  });

  /* ── Konami code ───────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === KONAMI[konamiIdx]) {
      konamiIdx++;
      if (konamiIdx === KONAMI.length) {
        konamiIdx = 0;
        // Easter egg: instant jump to 100 clicks
        clickCount = Math.max(clickCount, 100);
        save();
        // Flash the whole screen
        app.style.filter = 'hue-rotate(180deg) saturate(3)';
        setTimeout(() => { app.style.filter = ''; applyEffects(); }, 500);
      }
    } else {
      konamiIdx = 0;
    }
  });

  /* ── Init ───────────────────────────────── */
  applyEffects();
  startParticleLoop();

})();
