/* ═══════════════════════════════════════════
   Reality Glitch — Audio Engine (REAL SFX)
   Uses actual glass shatter, dimension tear,
   impact boom, glitch horror, debris sounds.
   ═══════════════════════════════════════════ */

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let droneGain = null;
  let osc1 = null, osc2 = null, osc3 = null, osc4 = null;
  let started = false;
  let heartbeatInterval = null;

  // Pre-loaded audio buffers
  const sfxBuffers = {};
  const SFX_FILES = {
    glassShatter:  'sfx/glass-shatter.mp3',
    dimensionTear: 'sfx/dimension-tear.mp3',
    impactBoom:    'sfx/impact-boom.mp3',
    glitchHorror:  'sfx/glitch-horror.mp3',
    glassDebris:   'sfx/glass-debris.mp3',
    explosionBoom: 'sfx/explosion-boom.mp3',
  };

  async function loadSFX() {
    if (!ctx) return;
    for (const [name, url] of Object.entries(SFX_FILES)) {
      try {
        const resp = await fetch(url);
        const arrayBuf = await resp.arrayBuffer();
        sfxBuffers[name] = await ctx.decodeAudioData(arrayBuf);
      } catch (e) {
        console.warn(`Failed to load SFX: ${name}`, e);
      }
    }
  }

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.85;
    masterGain.connect(ctx.destination);
    loadSFX();
  }

  function ensureResumed() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
  }

  /* ── Play a loaded SFX buffer ────────── */
  function playSFX(name, volume, rate, detune) {
    if (!ctx || !sfxBuffers[name]) return;
    const src = ctx.createBufferSource();
    src.buffer = sfxBuffers[name];
    src.playbackRate.value = rate || 1;
    if (detune) src.detune.value = detune;

    const g = ctx.createGain();
    g.gain.value = Math.min(volume || 0.5, 1.0);
    src.connect(g);
    g.connect(masterGain);
    src.start(0);
    return src;
  }

  /* ── Play SFX with random pitch variation ── */
  function playSFXRandom(name, baseVol, volRange, rateMin, rateMax) {
    const vol = (baseVol || 0.5) + (Math.random() - 0.5) * (volRange || 0.2);
    const rate = (rateMin || 0.8) + Math.random() * ((rateMax || 1.3) - (rateMin || 0.8));
    const detune = (Math.random() - 0.5) * 400; // +-200 cents
    return playSFX(name, vol, rate, detune);
  }

  /* ── Drone ────────────────────────────── */
  function startDrone() {
    if (started) return;
    init();
    started = true;

    droneGain = ctx.createGain();
    droneGain.gain.value = 0.04;
    droneGain.connect(masterGain);

    osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 55;
    osc1.connect(droneGain);
    osc1.start();

    osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 55.5;
    osc2.connect(droneGain);
    osc2.start();
  }

  function setDroneIntensity(intensity) {
    if (!droneGain || !ctx) return;
    const now = ctx.currentTime;
    const vol = Math.min(0.04 + intensity * 0.18, 0.5);
    droneGain.gain.linearRampToValueAtTime(vol, now + 0.3);

    if (intensity >= 0.5 && !osc3) {
      osc3 = ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.value = 82.5;
      const g3 = ctx.createGain();
      g3.gain.value = 0.05;
      osc3.connect(g3);
      g3.connect(droneGain);
      osc3.start();
    }
    if (intensity >= 0.8 && !osc4) {
      osc4 = ctx.createOscillator();
      osc4.type = 'triangle';
      osc4.frequency.value = 41.2;
      const g4 = ctx.createGain();
      g4.gain.value = 0.06;
      osc4.connect(g4);
      g4.connect(droneGain);
      osc4.start();
    }
    if (osc1) osc1.frequency.value = 55 + intensity * 12;
    if (osc2) osc2.frequency.value = 55.5 - intensity * 8;
    if (osc3) osc3.frequency.value = 82.5 + Math.sin(intensity * 3) * 20;
    if (osc4) osc4.frequency.value = 41.2 - intensity * 5;
  }

  /* ── Heartbeat ─────────────────────────── */
  function startHeartbeat(bpm) {
    stopHeartbeat();
    if (!ctx) return;
    const interval = 60000 / Math.max(bpm, 30);
    heartbeatInterval = setInterval(() => {
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(65, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.25);
    }, interval);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
  }

  /* ── GLASS SHATTER (real file) ─────────── */
  function playGlassShatter() {
    playSFXRandom('glassShatter', 0.6, 0.2, 0.7, 1.4);
    // Add debris follow-up with delay
    setTimeout(() => {
      playSFXRandom('glassDebris', 0.35, 0.15, 0.6, 1.2);
    }, 80 + Math.random() * 120);
  }

  /* ── DIMENSION TEAR (real file) ────────── */
  function playDimensionTear() {
    playSFXRandom('dimensionTear', 0.5, 0.2, 0.5, 1.5);
  }

  /* ── IMPACT (real file) ────────────────── */
  function playImpact(intensity) {
    const int = intensity || 1;
    playSFX('impactBoom', Math.min(0.4 * int, 0.9), 0.5 + int * 0.3, (Math.random() - 0.5) * 300);
    // Synth sub-bass layer on top
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 * int, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.25);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.2 * int, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  /* ── GLITCH HORROR (real file) ─────────── */
  function playGlitchHorror() {
    playSFXRandom('glitchHorror', 0.4, 0.15, 0.6, 1.5);
  }

  /* ── EXPLOSION BOOM (real file) ─────────── */
  function playExplosion() {
    // Main explosion at full volume, low pitch for that DUAR feel
    playSFX('explosionBoom', 0.9, 0.7, -200);
    // Layered: second hit slightly delayed, different pitch
    setTimeout(() => playSFX('explosionBoom', 0.6, 0.5, -400), 80);
    // Sub-bass rumble on top
    if (!ctx) return;
    const now = ctx.currentTime;
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(40, now);
    sub.frequency.exponentialRampToValueAtTime(15, now + 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    sub.connect(g);
    g.connect(masterGain);
    sub.start(now);
    sub.stop(now + 0.8);
  }

  /* ── CHAOS NOISE BURST (synth, bitcrush) ── */
  function playChaosNoise(duration, vol) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = duration || 0.1;
    const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const t = i / ctx.sampleRate;
        const sample = Math.random() * 2 - 1;
        const crushed = Math.round(sample * 4) / 4; // 2-bit crunch
        d[i] = crushed * Math.exp(-t * (3 / dur));
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const dist = ctx.createWaveShaper();
    dist.curve = makeDistortionCurve(600);
    dist.oversample = '4x';

    const g = ctx.createGain();
    g.gain.value = vol || 0.15;
    src.connect(dist);
    dist.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + dur);
  }

  /* ── CLICK SOUND ─────────────────────────── */
  function playClick(clickCount) {
    init();
    ensureResumed();
    startDrone();

    const now = ctx.currentTime;
    const intensity = Math.min(clickCount / 50, 2.5);
    const tier = clickCount >= 500 ? 5 : clickCount >= 400 ? 4 : clickCount >= 300 ? 3 : clickCount >= 200 ? 2 : clickCount >= 100 ? 1 : 0;

    // Base click — pitch descends
    const duration = 0.08 + intensity * 0.04;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = Math.max(2000 - clickCount * 25, 150);
    filter.Q.value = 1 + intensity * 3;

    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(clickCount * 25);
    distortion.oversample = '4x';

    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.15 + intensity * 0.06, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    noise.playbackRate.value = Math.max(1.3 - clickCount * 0.015, 0.25);

    noise.connect(filter);
    filter.connect(distortion);
    distortion.connect(clickGain);
    clickGain.connect(masterGain);
    noise.start(now);
    noise.stop(now + duration + 0.05);

    // ── Layered REAL SFX based on tier ──

    // Pre-tier: subtle static from stage 3+
    if (clickCount >= 13 && Math.random() > 0.4) {
      setTimeout(() => playChaosNoise(0.04, 0.08), 50 + Math.random() * 80);
    }

    // Tier 1 (100+): glass shatter every 3rd click + glitch horror every 7th
    if (tier >= 1) {
      if (clickCount % 3 === 0) playGlassShatter();
      if (clickCount % 7 === 0) playGlitchHorror();
      if (clickCount % 5 === 0) playImpact(0.5 + tier * 0.3);
    }

    // Tier 2 (200+): dimension tear every 4th + more chaos
    if (tier >= 2) {
      if (clickCount % 4 === 0) playDimensionTear();
      if (clickCount % 3 === 0) playGlitchHorror();
      if (Math.random() > 0.3) {
        setTimeout(() => playChaosNoise(0.06 + tier * 0.03, 0.12 + tier * 0.03), Math.random() * 150);
      }
    }

    // Tier 3 (300+): constant layered destruction
    if (tier >= 3) {
      if (Math.random() > 0.3) playGlassShatter();
      if (Math.random() > 0.4) setTimeout(() => playImpact(1 + tier * 0.2), 80);
      if (Math.random() > 0.5) setTimeout(() => playGlitchHorror(), 120);
      if (Math.random() > 0.5) setTimeout(() => playChaosNoise(0.1, 0.16), 180);
    }

    // Tier 4 (400+): heavy layered every click + random explosions
    if (tier >= 4) {
      playImpact(1.5);
      if (clickCount % 5 === 0) playExplosion();
      setTimeout(() => playDimensionTear(), 40);
      setTimeout(() => playGlassShatter(), 100);
      setTimeout(() => playChaosNoise(0.12, 0.14), 160);
      setTimeout(() => playGlitchHorror(), 200);
    }

    // Tier 5 (500+): ABSOLUTE CHAOS every single click
    if (tier >= 5) {
      playGlassShatter();
      playImpact(2);
      playGlitchHorror();
      if (clickCount % 2 === 0) playExplosion();
      setTimeout(() => playDimensionTear(), 30);
      setTimeout(() => playGlassShatter(), 80);
      setTimeout(() => playImpact(1.5), 130);
      setTimeout(() => playChaosNoise(0.18, 0.2), 180);
      setTimeout(() => playGlitchHorror(), 230);
    }
  }

  function makeDistortionCurve(amount) {
    const k = typeof amount === 'number' ? amount : 50;
    const samples = 44100;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }

  function silenceAll() {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  }

  function restoreAudio() {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(0.85, ctx.currentTime + 0.5);
  }

  function reset() {
    stopHeartbeat();
    if (osc3) { try { osc3.stop(); } catch(e){} osc3.disconnect(); osc3 = null; }
    if (osc4) { try { osc4.stop(); } catch(e){} osc4.disconnect(); osc4 = null; }
    setDroneIntensity(0);
  }

  return {
    init, playClick, setDroneIntensity, silenceAll, restoreAudio, reset,
    ensureResumed, startDrone, startHeartbeat, stopHeartbeat,
    playGlassShatter, playDimensionTear, playImpact, playChaosNoise, playGlitchHorror, playExplosion
  };
})();
