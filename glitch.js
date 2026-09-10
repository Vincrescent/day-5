/* ═══════════════════════════════════════════
   Reality Glitch — Main Engine (Infinite v2)
   Mega-escalation tiers every 100 clicks.
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ── Constants ─────────────────────────── */
  const originalTitle = 'Reality Glitch';
  const glitchChars = '░▒▓█▄▀╬╠╣╔╗╚╝┃━┣┫╋▐▌◼◻◾◽⌐¬¡¿ÆÐÞ×÷ΩΣΔΨλμπ∞∅∂';
  const originalFavicon = document.getElementById('favicon').href;

  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let konamiIdx = 0;

  const subtitleLines = [
    "Some things are better left alone.",
    "I warned you.",
    "Still going?",
    "You can't undo this.",
    "...interesting.",
    "Almost there? No. There is no 'there.'",
    "You really can't stop, can you?",
    "The damage is accumulating.",
    "This page remembers everything.",
    "Error count: rising.",
    "Your curiosity is... noted.",
    "Do you feel it yet?",
    "The cracks are spreading.",
    "There's no going back now.",
    "Reality coherence: declining.",
    "W̷h̸a̵t̶ ̷a̵r̶e̸ ̷y̴o̶u̸ ̷l̴o̵o̶k̵i̸n̶g̸ ̷f̶o̷r̶?",
    "Ṫ̵h̸e̷ ̶v̷o̷i̸d̶ ̸s̵t̶a̷r̵e̷s̵ ̶b̷a̷c̵k̶.",
    "Y̷o̸u̶ ̶b̵r̸o̷k̵e̸ ̷i̴t̸.",
    "T̵̢h̴̨ḛ̸r̷̰e̷͇ ̷̣i̸̠s̶̱ ̵̰n̵̰o̶̱ ̸̣b̶̰u̷̱t̷͇t̸̢ǫ̵ṇ̶.",
    "...",
    "█████████████████",
    // 100+ tier subtitles
    "T̷̨̧̢h̸̡̨̛e̷̢̧ ̶̧̛g̸̢̧l̴̡̨a̵̧̛s̸̢̧s̵̡̨ ̶̧̛i̸̢̧s̵̡̨ ̶̧̛c̸̢̧r̵̡̨a̶̧̛c̸̢̧k̵̡̨i̶̧̛n̸̢̧g̵̡̨.",
    "S̶h̵a̷r̸d̵s̶ ̷e̵v̶e̷r̵y̶w̵h̷e̵r̶e̵.",
    "D̶̨i̵̧m̸̢e̵̡ņ̶s̸̢i̵̡o̶̧n̸̢ ̵̡b̶̧r̸̢e̵̡a̶̧c̸̢h̵̡.",
    "R̶̡̧e̸̢̨a̵̡̧l̶̢̨i̸̡̧t̵̢̨y̶̡̧ ̸̢̨i̵̡̧s̶̢̨ ̸̡̧t̵̢̨e̶̡̧a̸̢̨r̵̡̧i̶̢̨n̸̡̧g̵̢̨.",
    "Y̷̢̧o̸̡̨u̵̢̧ ̶̡̨s̸̢̧h̵̡̨o̶̢̧u̸̡̨l̵̢̧d̶̡̨ ̸̢̧h̵̡̨a̶̢̧v̸̡̨e̵̢̧ ̶̡̨s̸̢̧t̵̡̨o̶̢̧p̸̡̨p̵̢̧e̶̡̨d̸̢̧.",
    "C̷̨O̸̧L̵̨Ļ̶Ą̸P̵̧S̶̨Ȩ̸.",
    "T̷̢H̵̡E̶̢ ̸̡V̵̢O̶̡I̸̢D̵̡ ̶̢C̸̡O̵̢N̶̡S̸̢U̵̡M̶̢E̸̡S̵̢.",
    "S̷I̵N̶G̸U̵L̶A̷R̸I̵T̶Y̸.",
    ".",
    "",
  ];

  const buttonTexts = [
    "Don't.", "Stop.", "Why?", "Again?", "Enough.",
    "Please.", "No.", "Quit.", "W̷h̸y̵?", "S̴t̵o̶p̷.",
    "H̵e̶l̵p̸.", "R̵̦ǘ̵n̵̰.", "░░░", "███", "...",
    "E̸̢N̸̨Ḍ̵", "V̷̰O̸̱I̵̠D̶̰", "N̵̰U̸̱Ḷ̶L̸̢",
    "C̷R̸A̵C̶K̵", "S̶H̵A̶T̵T̶E̵R̸", "█", "▓░▒",
    "D̸̢̧̛I̵̡̨̧M̶̧̢̛E̸̡̨̧Ņ̵̢̛S̶̡̨̧I̸̧̢̛O̵̡̨̧Ņ̶̢̛",
    "∅", "∞", " ", "⌐¬¡¿",
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
    { title: 'GLASS_FRACTURE', body: 'Display integrity: <code>SHATTERED</code>\nFragment count: <code>∞</code>' },
    { title: 'RIFT_DETECTED', body: 'Dimensional barrier breach at\n<code>layer[0].tear(magnitude=MAX)</code>' },
    { title: 'REALITY_404', body: 'Error 404: Reality not found.\n<code>existence.resolve() → null</code>' },
    { title: 'SINGULARITY', body: 'All matter converging to point.\n<code>radius → 0, density → ∞</code>' },
  ];

  /* ── DOM refs ──────────────────────────── */
  const app = document.getElementById('app');
  const btn = document.getElementById('glitch-btn');
  const title = document.getElementById('title');
  const subtitle = document.getElementById('subtitle');
  const counter = document.getElementById('click-counter');
  const tearCanvas = document.getElementById('tear-canvas');
  const tearCtx = tearCanvas.getContext('2d') || { clearRect(){}, save(){}, restore(){}, fillRect(){}, set globalAlpha(v){}, set fillStyle(v){} };
  const fakeCursor = document.getElementById('fake-cursor');
  const errorContainer = document.getElementById('error-container');
  const deadPixel = document.getElementById('dead-pixel');
  const escapeBtn = document.getElementById('escape-btn');
  const progressBar = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const particleCanvas = document.getElementById('particle-canvas');
  const particleCtx = particleCanvas.getContext('2d') || { clearRect(){}, fillRect(){}, set fillStyle(v){}, beginPath(){}, arc(){}, fill(){}, moveTo(){}, lineTo(){}, stroke(){}, set strokeStyle(v){}, set lineWidth(v){} };
  const megaCanvas = document.getElementById('mega-canvas');
  const megaCtx = megaCanvas ? (megaCanvas.getContext('2d') || { clearRect(){}, save(){}, restore(){}, fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, arc(){}, fill(){}, set strokeStyle(v){}, set fillStyle(v){}, set lineWidth(v){}, set globalAlpha(v){}, set globalCompositeOperation(v){}, set shadowBlur(v){}, set shadowColor(v){} }) : null;

  /* ── State ─────────────────────────────── */
  let clickCount = parseInt(localStorage.getItem('rg_clicks') || '0', 10);
  let titleInterval = null;
  let shakeInterval = null;
  let tearRAF = null;
  let cursorRAF = null;
  let particleRAF = null;
  let megaRAF = null;
  let invertTimeout = null;
  let glitchMemoryInterval = null;
  let isHovering = false;
  let voidPulsePhase = 0;

  function save() { localStorage.setItem('rg_clicks', clickCount); }

  /* ── Helpers ───────────────────────────── */
  function getIntensity(clicks) {
    if (clicks <= 50) return clicks / 50;
    return 1 + Math.log2(clicks / 50) * 0.3;
  }

  // Mega tier (0 = below 100, 1-5 = tiers)
  function getMegaTier(clicks) {
    if (clicks >= 500) return 5;
    if (clicks >= 400) return 4;
    if (clicks >= 300) return 3;
    if (clicks >= 200) return 2;
    if (clicks >= 100) return 1;
    return 0;
  }

  function getStage(clicks) {
    if (clicks >= 40) return 5;
    if (clicks >= 25) return 4;
    if (clicks >= 13) return 3;
    if (clicks >= 6) return 2;
    if (clicks >= 1) return 1;
    return 0;
  }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function randFloat(min, max) { return min + Math.random() * (max - min); }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function scrambleChar(str, count) {
    const arr = str.split('');
    for (let i = 0; i < count; i++) {
      const idx = randInt(0, arr.length - 1);
      arr[idx] = glitchChars[randInt(0, glitchChars.length - 1)];
    }
    return arr.join('');
  }

  /* ── Canvas setup ──────────────────────── */
  function resizeCanvas() {
    tearCanvas.width = window.innerWidth;
    tearCanvas.height = window.innerHeight;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
    if (megaCanvas) { megaCanvas.width = window.innerWidth; megaCanvas.height = window.innerHeight; }
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  /* ══════════════════════════════════════════
     MEGA EFFECTS (100+ clicks)
     ══════════════════════════════════════════ */

  // ── Shattered glass cracks (Tier 1: 100+) ──
  const cracks = [];

  function generateCracks(count) {
    const w = window.innerWidth, h = window.innerHeight;
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const length = randFloat(80, Math.min(w, h) * 0.5);
      const segments = randInt(3, 8);
      const crack = [];
      let x = cx + (Math.random() - 0.5) * 60;
      let y = cy + (Math.random() - 0.5) * 60;
      crack.push({ x, y });
      for (let s = 0; s < segments; s++) {
        const a = angle + (Math.random() - 0.5) * 1.2;
        const len = length / segments * randFloat(0.5, 1.5);
        x += Math.cos(a) * len;
        y += Math.sin(a) * len;
        crack.push({ x, y });
        // Branch
        if (Math.random() > 0.6) {
          const ba = a + (Math.random() - 0.5) * 2;
          const bl = len * randFloat(0.3, 0.7);
          crack.push({ x: x + Math.cos(ba) * bl, y: y + Math.sin(ba) * bl, branch: true });
        }
      }
      cracks.push(crack);
    }
  }

  function drawCracks(ctx, alpha) {
    if (!ctx || !ctx.beginPath) return;
    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    for (const crack of cracks) {
      ctx.beginPath();
      let prevX = crack[0].x, prevY = crack[0].y;
      ctx.moveTo(prevX, prevY);
      for (let i = 1; i < crack.length; i++) {
        if (crack[i].branch) {
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(crack[i].x, crack[i].y);
        } else {
          ctx.lineTo(crack[i].x, crack[i].y);
          prevX = crack[i].x;
          prevY = crack[i].y;
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Glass shards floating (Tier 1: 100+) ──
  const shards = [];

  function generateShards(count) {
    for (let i = 0; i < count; i++) {
      shards.push({
        x: randFloat(0, window.innerWidth),
        y: randFloat(0, window.innerHeight),
        w: randFloat(10, 40),
        h: randFloat(10, 30),
        rot: randFloat(0, Math.PI * 2),
        vx: randFloat(-0.5, 0.5),
        vy: randFloat(-0.3, 0.3),
        vr: randFloat(-0.02, 0.02),
        alpha: randFloat(0.1, 0.3),
      });
    }
  }

  function drawShards(ctx, intensity) {
    if (!ctx || !ctx.save) return;
    for (const s of shards) {
      s.x += s.vx * intensity;
      s.y += s.vy * intensity;
      s.rot += s.vr * intensity;
      if (s.x < -50) s.x = window.innerWidth + 50;
      if (s.x > window.innerWidth + 50) s.x = -50;
      if (s.y < -50) s.y = window.innerHeight + 50;
      if (s.y > window.innerHeight + 50) s.y = -50;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = s.alpha * intensity;
      ctx.fillStyle = ['#ffffff11', '#00ffd511', '#ff00ff11', '#ff333311'][randInt(0, 3)];
      ctx.beginPath();
      ctx.moveTo(0, -s.h / 2);
      ctx.lineTo(s.w / 2, s.h / 3);
      ctx.lineTo(-s.w / 3, s.h / 2);
      ctx.closePath();
      ctx.fill();
      // Shard edge highlight
      ctx.strokeStyle = '#ffffff33';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // ── Dimension rifts (Tier 2: 200+) ──
  const rifts = [];

  function generateRifts(count) {
    for (let i = 0; i < count; i++) {
      rifts.push({
        x: randFloat(50, window.innerWidth - 50),
        y: randFloat(50, window.innerHeight - 50),
        w: randFloat(30, 120),
        h: randFloat(60, 200),
        phase: Math.random() * Math.PI * 2,
        speed: randFloat(0.01, 0.04),
        hue: randInt(0, 360),
      });
    }
  }

  function drawRifts(ctx, time, intensity) {
    if (!ctx || !ctx.save) return;
    for (const r of rifts) {
      r.phase += r.speed;
      const pulse = Math.sin(r.phase) * 0.3 + 0.7;
      const w = r.w * pulse;
      const h = r.h * pulse;

      ctx.save();
      ctx.translate(r.x, r.y);
      ctx.globalAlpha = clamp(0.15 * intensity, 0, 0.6);

      // Rift glow
      ctx.shadowBlur = 30 * intensity;
      ctx.shadowColor = `hsl(${r.hue}, 100%, 50%)`;

      // Rift shape — jagged vertical tear
      ctx.beginPath();
      ctx.moveTo(0, -h / 2);
      for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const jag = Math.sin(t * Math.PI * 4 + r.phase * 3) * w * 0.3;
        ctx.lineTo(jag, -h / 2 + h * t);
      }
      for (let i = 7; i >= 0; i--) {
        const t = i / 7;
        const jag = Math.sin(t * Math.PI * 4 + r.phase * 3 + 1) * w * 0.3 + w * 0.15;
        ctx.lineTo(jag, -h / 2 + h * t);
      }
      ctx.closePath();
      ctx.fillStyle = `hsla(${r.hue}, 80%, 20%, ${0.4 * intensity})`;
      ctx.fill();
      ctx.strokeStyle = `hsla(${r.hue}, 100%, 60%, ${0.6 * intensity})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.restore();
    }
  }

  // ── Reality echoes / duplicates (Tier 2: 200+) ──
  let echoInterval = null;

  function startEchos() {
    stopEchos();
    if (clickCount < 200) return;
    const tier = getMegaTier(clickCount);
    echoInterval = setInterval(() => {
      const existing = document.querySelectorAll('.reality-echo');
      if (existing.length >= Math.min(tier * 2, 6)) return;
      const echo = document.createElement('div');
      echo.className = 'reality-echo';
      echo.textContent = title.textContent;
      echo.style.cssText = `
        position:fixed; z-index:5; pointer-events:none;
        font-size:clamp(1.5rem,4vw,3rem); font-weight:700; font-family:'Space Mono',monospace;
        color:${['#00ffd533','#ff00ff33','#ff333333'][randInt(0,2)]};
        left:${50 + (Math.random()-0.5)*30}%;
        top:${50 + (Math.random()-0.5)*30}%;
        transform:translate(-50%,-50%) skewX(${(Math.random()-0.5)*10}deg) rotate(${(Math.random()-0.5)*5}deg);
        opacity:0; animation:echoFade ${randFloat(2,5)}s ease-in-out forwards;
        text-shadow:${randInt(-5,5)}px ${randInt(-3,3)}px ${['#00ffd5','#ff00ff'][randInt(0,1)]};
      `;
      app.appendChild(echo);
      setTimeout(() => echo.remove(), 5000);
    }, Math.max(3000 - (tier - 2) * 500, 800));
  }

  function stopEchos() {
    if (echoInterval) { clearInterval(echoInterval); echoInterval = null; }
    document.querySelectorAll('.reality-echo').forEach(e => e.remove());
  }

  // ── Void pulse background (Tier 4: 400+) ──
  function drawVoidPulse(ctx, time) {
    if (!ctx || clickCount < 400) return;
    const tier = getMegaTier(clickCount);
    voidPulsePhase += 0.015;
    const pulse = Math.sin(voidPulsePhase) * 0.5 + 0.5;

    ctx.save();
    const grd = ctx.createRadialGradient ?
      ctx.createRadialGradient(window.innerWidth/2, window.innerHeight/2, 0, window.innerWidth/2, window.innerHeight/2, window.innerWidth * 0.6) :
      null;
    if (grd) {
      const hue = (time * 0.02 + clickCount) % 360;
      grd.addColorStop(0, `hsla(${hue}, 60%, 8%, ${0.3 * pulse})`);
      grd.addColorStop(0.5, `hsla(${(hue + 120) % 360}, 80%, 5%, ${0.15 * pulse})`);
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    }
    ctx.restore();

    // Tier 5 (500+): singularity pull — draw converging lines
    if (tier >= 5) {
      ctx.save();
      const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
      ctx.globalAlpha = 0.08 + pulse * 0.05;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2 + voidPulsePhase;
        const r = Math.max(window.innerWidth, window.innerHeight);
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
        ctx.lineTo(cx + Math.cos(angle) * 20 * pulse, cy + Math.sin(angle) * 20 * pulse);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  // ── Mega canvas render loop ───────────────
  function startMegaLoop() {
    if (megaRAF) cancelAnimationFrame(megaRAF);
    if (!megaCtx) return;

    let time = 0;
    function loop() {
      time++;
      const tier = getMegaTier(clickCount);
      const megaIntensity = clamp((clickCount - 100) / 100, 0, 4);

      megaCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      // Tier 1+ (100+): Cracks & shards
      if (tier >= 1) {
        if (cracks.length === 0) generateCracks(8);
        if (shards.length === 0) generateShards(15);
        // Add more cracks/shards as tier grows
        if (cracks.length < tier * 8) generateCracks(3);
        if (shards.length < tier * 12 && shards.length < 60) generateShards(5);
        drawCracks(megaCtx, clamp(megaIntensity * 0.4, 0, 0.9));
        drawShards(megaCtx, megaIntensity);
      }

      // Tier 2+ (200+): Dimension rifts
      if (tier >= 2) {
        if (rifts.length === 0) generateRifts(3);
        if (rifts.length < (tier - 1) * 3 && rifts.length < 12) generateRifts(2);
        drawRifts(megaCtx, time, clamp(megaIntensity * 0.4, 0, 1.5));
      }

      // Tier 3+ (300+): Static noise overlay
      if (tier >= 3 && time % 2 === 0) {
        const noiseAlpha = clamp((tier - 2) * 0.04, 0, 0.15);
        megaCtx.save();
        megaCtx.globalAlpha = noiseAlpha;
        const imgData = megaCtx.createImageData ? megaCtx.createImageData(window.innerWidth, window.innerHeight) : null;
        if (imgData) {
          const d = imgData.data;
          for (let i = 0; i < d.length; i += 16) {
            const v = Math.random() * 255;
            d[i] = v; d[i+1] = v; d[i+2] = v; d[i+3] = randInt(10, 60);
          }
          megaCtx.putImageData(imgData, 0, 0);
        }
        megaCtx.restore();
      }

      // Tier 4+ (400+): Void pulse
      if (tier >= 4) {
        drawVoidPulse(megaCtx, time);
      }

      megaRAF = requestAnimationFrame(loop);
    }
    megaRAF = requestAnimationFrame(loop);
  }

  /* ══════════════════════════════════════════
     EXISTING EFFECTS (upgraded)
     ══════════════════════════════════════════ */

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
    const tier = getMegaTier(clickCount);
    const speedMult = 1 + intensity * 3 + tier * 2;
    const colors = ['255,255,255', '0,255,213', '255,0,255', '255,51,51'];

    for (const p of particles) {
      p.x += p.vx * speedMult;
      p.y += p.vy * speedMult;
      if (p.x < 0) p.x = particleCanvas.width;
      if (p.x > particleCanvas.width) p.x = 0;
      if (p.y < 0) p.y = particleCanvas.height;
      if (p.y > particleCanvas.height) p.y = 0;

      // More chaotic at higher tiers
      if (intensity > 0.3 && Math.random() > (0.98 - tier * 0.02)) {
        p.vx = (Math.random() - 0.5) * (intensity + tier) * 3;
        p.vy = (Math.random() - 0.5) * (intensity + tier) * 3;
      }

      // Tier 5: particles pulled toward center
      if (tier >= 5) {
        const cx = particleCanvas.width / 2, cy = particleCanvas.height / 2;
        p.vx += (cx - p.x) * 0.0003;
        p.vy += (cy - p.y) * 0.0003;
      }

      const ci = randInt(0, Math.min(tier + 1, 3));
      const radius = p.r * (1 + intensity * 0.5 + tier * 0.3);
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      particleCtx.fillStyle = `rgba(${colors[ci]}, ${clamp(p.alpha + intensity * 0.1 + tier * 0.05, 0, 0.9)})`;
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
    const tier = getMegaTier(clickCount);
    const tearCount = Math.floor(intensity * 8 + tier * 5);
    for (let i = 0; i < tearCount; i++) {
      const y = Math.random() * tearCanvas.height;
      const h = randInt(1, 3 + intensity * 5 + tier * 4);
      const offset = (Math.random() - 0.5) * (intensity * 50 + tier * 30);
      tearCtx.save();
      tearCtx.globalAlpha = clamp(0.2 + intensity * 0.2 + tier * 0.05, 0, 0.85);
      tearCtx.fillStyle = ['#00ffd5', '#ff00ff', '#ff3333', '#ffffff'][randInt(0, tier >= 2 ? 3 : 1)];
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
      const ci = getIntensity(clickCount);
      const interval = Math.max(200 - ci * 80 - getMegaTier(clickCount) * 20, 16);
      if (ts - lastTear > interval) { drawTear(ci); lastTear = ts; }
      tearRAF = requestAnimationFrame(loop);
    }
    tearRAF = requestAnimationFrame(loop);
  }

  /* ── Title corruption ──────────────────── */
  function startTitleCorruption() {
    stopTitleCorruption();
    const intensity = getIntensity(clickCount);
    if (intensity < 0.2) { document.title = originalTitle; return; }
    const tier = getMegaTier(clickCount);
    const rate = Math.max(400 - intensity * 150 - tier * 50, 40);
    const chars = Math.min(Math.floor(intensity * 3) + 1 + tier * 2, originalTitle.length);
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
    if (intensity < 0.2) { document.getElementById('favicon').href = originalFavicon; return; }
    const c = document.createElement('canvas');
    c.width = 16; c.height = 16;
    const fx = c.getContext('2d');
    if (!fx) return;
    fx.fillStyle = '#0a0a0a';
    fx.fillRect(0, 0, 16, 16);
    const tier = getMegaTier(clickCount);
    const corruption = Math.min(Math.floor(intensity * 5) + tier * 4, 30);
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
    const tier = getMegaTier(clickCount);
    const maxShake = clamp(intensity * 8 + tier * 6, 1, 40);
    const maxRot = clamp(intensity * 0.8 + tier * 0.5, 0, 5);
    const freq = Math.max(60 - intensity * 10 - tier * 8, 16);
    shakeInterval = setInterval(() => {
      const x = (Math.random() - 0.5) * maxShake;
      const y = (Math.random() - 0.5) * maxShake;
      const r = (Math.random() - 0.5) * maxRot;
      // Tier 3+: add scale oscillation
      const s = tier >= 3 ? (1 + (Math.random() - 0.5) * tier * 0.01) : 1;
      app.style.transform = `translate(${x}px, ${y}px) rotate(${r}deg) scale(${s})`;
    }, freq);
  }

  function stopShake() {
    if (shakeInterval) { clearInterval(shakeInterval); shakeInterval = null; }
    app.style.transform = '';
  }

  /* ── Fake error popups ─────────────────── */
  function spawnError() {
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);
    const maxPopups = Math.min(Math.floor(intensity * 3) + 1 + tier * 2, 15);
    const existing = errorContainer.querySelectorAll('.error-popup');
    if (existing.length >= maxPopups) return;
    const msg = errorMessages[randInt(0, errorMessages.length - 1)];
    const popup = document.createElement('div');
    popup.className = 'error-popup';
    // At high tiers, popups themselves are glitched
    const glitchStyle = tier >= 2 ? `transform:skewX(${(Math.random()-0.5)*10}deg) rotate(${(Math.random()-0.5)*3}deg);` : '';
    popup.innerHTML = `<div class="popup-title"><span>⚠ ${tier >= 3 ? scrambleChar(msg.title, 2) : msg.title}</span><span class="close-x">&times;</span></div><div class="popup-body">${msg.body.replace(/\n/g, '<br>')}</div>`;
    popup.style.cssText = `left:${randInt(10, Math.max(window.innerWidth - 320, 20))}px;top:${randInt(10, Math.max(window.innerHeight - 200, 20))}px;${glitchStyle}`;
    popup.querySelector('.close-x').addEventListener('click', () => dissolvePopup(popup));
    errorContainer.appendChild(popup);
    setTimeout(() => dissolvePopup(popup), Math.max(3000 - intensity * 500 - tier * 300, 400));
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
    document.body.style.cursor = intensity >= 0.8 ? 'none' : 'crosshair';

    function updateCursor() {
      const ci = getIntensity(clickCount);
      const tier = getMegaTier(clickCount);
      let offX = (Math.random() - 0.5) * ci * 6;
      let offY = (Math.random() - 0.5) * ci * 6;
      if (ci >= 0.5 && Math.random() > (0.97 - tier * 0.02)) {
        offX = (Math.random() - 0.5) * (300 + tier * 100);
        offY = (Math.random() - 0.5) * (300 + tier * 100);
      }
      fakeCursor.style.left = (mouseX + offX - 10) + 'px';
      fakeCursor.style.top = (mouseY + offY - 10) + 'px';
      const hue = tier >= 3 ? '#ff3333' : ci > 0.7 ? '#ff3333' : ci > 0.4 ? '#ff00ff' : '#00ffd5';
      fakeCursor.style.borderColor = hue;
      const size = 20 + ci * 6 + tier * 4;
      fakeCursor.style.width = size + 'px';
      fakeCursor.style.height = size + 'px';
      cursorRAF = requestAnimationFrame(updateCursor);
    }
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    cursorRAF = requestAnimationFrame(updateCursor);
  }

  /* ── Dead pixels ───────────────────────── */
  function updateDeadPixels() {
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);
    const count = Math.min(Math.floor(intensity * 3) + tier * 5, 30);
    const existing = document.querySelectorAll('.dead-pixel-dot');
    if (existing.length < count && clickCount > 10) {
      const dp = document.createElement('div');
      dp.className = 'dead-pixel-dot';
      const size = tier >= 3 ? randInt(2, 8) : randInt(2, 4);
      dp.style.cssText = `position:fixed;width:${size}px;height:${size}px;background:${['#ff00ff','#00ffd5','#ff3333','#ffffff'][randInt(0,3)]};pointer-events:none;z-index:150;left:${randInt(20,window.innerWidth-20)}px;top:${randInt(20,window.innerHeight-20)}px;`;
      app.appendChild(dp);
    }
  }

  /* ── Screen invert flash ───────────────── */
  function triggerInvert() {
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);
    if (intensity < 0.5 || Math.random() > (0.3 + tier * 0.1)) return;
    // At high tiers, more dramatic filters
    const filters = [
      'invert(1)',
      'invert(1) hue-rotate(90deg)',
      'invert(1) saturate(3)',
      'hue-rotate(180deg) contrast(2)',
      'sepia(1) saturate(5) hue-rotate(300deg)',
    ];
    app.style.filter = filters[randInt(0, Math.min(tier + 1, filters.length - 1))];
    const duration = Math.min(30 + intensity * 20 + tier * 30, 200);
    if (invertTimeout) clearTimeout(invertTimeout);
    invertTimeout = setTimeout(() => { app.style.filter = ''; }, duration);
  }

  /* ── Glitch memory ─────────────────────── */
  function startGlitchMemory() {
    stopGlitchMemory();
    if (clickCount < 20) return;
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);
    glitchMemoryInterval = setInterval(() => {
      if (Math.random() > (0.7 - tier * 0.1)) {
        const oldText = btn.textContent;
        btn.textContent = buttonTexts[randInt(0, Math.min(clickCount / 5, buttonTexts.length - 1))];
        setTimeout(() => { btn.textContent = oldText; }, 50 + tier * 10);
      }
    }, Math.max(2000 - intensity * 300 - tier * 200, 200));
  }

  function stopGlitchMemory() {
    if (glitchMemoryInterval) { clearInterval(glitchMemoryInterval); glitchMemoryInterval = null; }
  }

  /* ── Subtitle ──────────────────────────── */
  function updateSubtitle() {
    const idx = Math.min(Math.floor(clickCount / 3), subtitleLines.length - 1);
    const tier = getMegaTier(clickCount);
    let text = subtitleLines[idx];
    if (tier >= 1) {
      text = scrambleChar(text || '████████', Math.floor(getIntensity(clickCount)) + tier);
    }
    subtitle.textContent = text;
  }

  /* ── Button text ───────────────────────── */
  function updateButtonText() {
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);
    if (clickCount === 0) {
      btn.textContent = "Don't.";
    } else if (tier >= 3) {
      btn.textContent = scrambleChar(buttonTexts[randInt(15, buttonTexts.length - 1)], tier + 2);
    } else if (intensity >= 1.0) {
      btn.textContent = scrambleChar(buttonTexts[randInt(10, buttonTexts.length - 1)], Math.floor(intensity));
    } else if (intensity >= 0.6) {
      btn.textContent = buttonTexts[randInt(7, 14)];
    } else if (intensity >= 0.3) {
      btn.textContent = buttonTexts[randInt(3, 9)];
    } else {
      btn.textContent = buttonTexts[randInt(0, 4)];
    }
  }

  /* ── Progress bar ──────────────────────── */
  function updateProgressBar() {
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);
    if (clickCount >= 1) {
      progressBar.style.opacity = '1';
      let pct = Math.min(intensity * 60, 98);
      if (tier >= 1) pct = 98 + Math.sin(Date.now() * 0.005) * 2; // Oscillates near full
      if (tier >= 3) progressFill.style.width = (pct + (Math.random() - 0.5) * 20) + '%';
      else progressFill.style.width = pct + '%';

      if (tier >= 3) progressFill.style.background = `hsl(${Date.now() * 0.1 % 360}, 100%, 50%)`;
      else if (intensity > 0.8) progressFill.style.background = 'var(--error-red)';
      else if (intensity > 0.4) progressFill.style.background = 'var(--magenta)';
      else progressFill.style.background = 'var(--fg)';
    } else {
      progressBar.style.opacity = '0';
      progressFill.style.width = '0%';
    }
  }

  /* ── Mega tier CSS classes ─────────────── */
  function applyMegaTierCSS() {
    const tier = getMegaTier(clickCount);
    // Remove old tier classes
    for (let i = 1; i <= 5; i++) app.classList.remove(`mega-${i}`);
    if (tier >= 1) app.classList.add(`mega-${tier}`);

    // Tier 3+: content splits with color channel separation
    if (tier >= 3) {
      title.style.textShadow = `${5+tier*2}px ${tier}px var(--cyan), ${-5-tier*2}px ${-tier}px var(--magenta), 0 0 ${tier*10}px rgba(255,0,255,0.5), 0 ${tier*2}px ${tier*5}px rgba(255,51,51,0.3)`;
    }

    // Tier 4+: background color shifts
    if (tier >= 4) {
      const hue = (Date.now() * 0.01 + clickCount) % 360;
      document.body.style.background = `hsl(${hue}, 15%, ${Math.max(4 - tier, 2)}%)`;
    } else {
      document.body.style.background = '';
    }

    // Tier 5: singularity — content contracts
    if (tier >= 5) {
      const scale = Math.max(1 - (clickCount - 500) * 0.0005, 0.6);
      const contentEl = document.getElementById('content');
      if (contentEl) contentEl.style.transform = `scale(${scale})`;
    }
  }

  /* ── Apply all effects ─────────────────── */
  function applyEffects() {
    const stage = getStage(clickCount);
    const intensity = getIntensity(clickCount);
    const tier = getMegaTier(clickCount);

    app.className = `stage-${stage}`;
    if (tier >= 1) app.classList.add(`mega-${tier}`);

    if (clickCount >= 1) {
      counter.classList.remove('hidden');
      counter.textContent = clickCount;
    } else {
      counter.classList.add('hidden');
    }

    updateButtonText();
    updateSubtitle();
    updateProgressBar();
    applyMegaTierCSS();

    AudioEngine.setDroneIntensity(intensity + tier * 0.3);

    startTearLoop();
    startShake();
    startParticleLoop();
    startTitleCorruption();
    corruptFavicon();
    startFakeCursor();
    updateDeadPixels();
    startGlitchMemory();
    startEchos();

    // Mega effects canvas
    if (tier >= 1) startMegaLoop();

    if (stage >= 3) {
      spawnError();
      if (intensity > 0.8 || tier >= 1) spawnError();
      if (tier >= 2) spawnError();
    }
  }

  /* ── Heartbeat on hover ────────────────── */
  btn.addEventListener('mouseenter', () => {
    isHovering = true;
    AudioEngine.ensureResumed();
    AudioEngine.startDrone();
    const bpm = Math.min(40 + clickCount * 2, 200);
    AudioEngine.startHeartbeat(bpm);
  });

  btn.addEventListener('mouseleave', () => {
    isHovering = false;
    AudioEngine.stopHeartbeat();
  });

  /* ── Full Reset ────────────────────────── */
  function fullReset() {
    clickCount = 0;
    save();

    stopTitleCorruption();
    stopShake();
    stopGlitchMemory();
    stopEchos();
    AudioEngine.stopHeartbeat();
    if (tearRAF) cancelAnimationFrame(tearRAF);
    tearCtx.clearRect(0, 0, tearCanvas.width, tearCanvas.height);
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    if (particleRAF) cancelAnimationFrame(particleRAF);
    if (megaRAF) cancelAnimationFrame(megaRAF);
    if (megaCtx) megaCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (invertTimeout) clearTimeout(invertTimeout);
    clearErrors();

    // Clear mega state
    cracks.length = 0;
    shards.length = 0;
    rifts.length = 0;
    voidPulsePhase = 0;

    document.querySelectorAll('.dead-pixel-dot').forEach(d => d.remove());
    document.querySelectorAll('.reality-echo').forEach(d => d.remove());
    deadPixel.classList.add('hidden');

    document.body.style.cursor = '';
    document.body.style.background = '';
    fakeCursor.classList.add('hidden');
    app.style.filter = '';
    title.style.textShadow = '';
    const contentEl = document.getElementById('content');
    if (contentEl) contentEl.style.transform = '';
    progressBar.style.opacity = '0';
    progressFill.style.width = '0%';

    for (let i = 1; i <= 5; i++) app.classList.remove(`mega-${i}`);

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

    const stage = getStage(clickCount);
    if (stage <= 2) {
      app.classList.add('chroma-flash');
      setTimeout(() => app.classList.remove('chroma-flash'), 120);
    }

    const intensity = getIntensity(clickCount);
    if (intensity > 0) {
      const chars = Math.min(Math.floor(intensity * 3) + 1 + getMegaTier(clickCount) * 2, originalTitle.length);
      title.textContent = scrambleChar(originalTitle, chars);
      setTimeout(() => { title.textContent = intensity > 0.6 ? scrambleChar(originalTitle, 2) : originalTitle; }, 80);
    }

    triggerInvert();

    if (isHovering) {
      AudioEngine.startHeartbeat(Math.min(40 + clickCount * 2, 200));
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
        clickCount = Math.max(clickCount, 100);
        save();
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
