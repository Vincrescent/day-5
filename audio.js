/* ═══════════════════════════════════════════
   Reality Glitch — Audio Engine (DESTRUCTIVE)
   Glass shattering, dimension tears, rumble,
   chaos noise, impact hits, distortion.
   ═══════════════════════════════════════════ */

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let droneGain = null;
  let osc1 = null, osc2 = null, osc3 = null, osc4 = null;
  let started = false;
  let heartbeatInterval = null;

  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.8;
    masterGain.connect(ctx.destination);
  }

  function ensureResumed() {
    if (ctx && ctx.state === 'suspended') ctx.resume();
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
    const vol = Math.min(0.04 + intensity * 0.14, 0.45);
    droneGain.gain.linearRampToValueAtTime(vol, now + 0.3);

    if (intensity >= 0.5 && !osc3) {
      osc3 = ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.value = 82.5;
      const g3 = ctx.createGain();
      g3.gain.value = 0.04;
      osc3.connect(g3);
      g3.connect(droneGain);
      osc3.start();
    }
    if (intensity >= 0.8 && !osc4) {
      osc4 = ctx.createOscillator();
      osc4.type = 'triangle';
      osc4.frequency.value = 41.2;
      const g4 = ctx.createGain();
      g4.gain.value = 0.05;
      osc4.connect(g4);
      g4.connect(droneGain);
      osc4.start();
    }
    if (osc1) osc1.frequency.value = 55 + intensity * 10;
    if (osc2) osc2.frequency.value = 55.5 - intensity * 7;
    if (osc3) osc3.frequency.value = 82.5 + Math.sin(intensity * 2) * 15;
    if (osc4) osc4.frequency.value = 41.2 - intensity * 3;
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
      g.gain.setValueAtTime(0.08, now);
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

  /* ── GLASS SHATTER SFX ─────────────────── */
  function playGlassShatter() {
    if (!ctx) return;
    const now = ctx.currentTime;

    // High-freq burst (tinkling glass)
    const dur = 0.3;
    const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const t = i / ctx.sampleRate;
        // Layered noise with high-freq emphasis + metallic ring
        const noise = (Math.random() * 2 - 1) * Math.exp(-t * 12);
        const ring = Math.sin(t * 4500 * Math.PI * 2) * Math.exp(-t * 20) * 0.3;
        const ring2 = Math.sin(t * 7200 * Math.PI * 2) * Math.exp(-t * 25) * 0.15;
        const crack = Math.sin(t * 800 * Math.PI * 2) * Math.exp(-t * 30) * 0.4;
        d[i] = (noise + ring + ring2 + crack) * 0.6;
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    // Highpass to make it "glassy"
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 2000;
    hp.Q.value = 0.7;

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.35, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);

    src.connect(hp);
    hp.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + dur);

    // Secondary: falling debris (lower pitched crackle)
    setTimeout(() => playDebrisCrackle(), 80);
  }

  function playDebrisCrackle() {
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.15;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      const t = i / ctx.sampleRate;
      // Crackling sound — random impulses
      d[i] = (Math.random() > 0.85 ? (Math.random() * 2 - 1) : 0) * Math.exp(-t * 8) * 0.5;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.2;
    src.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + dur);
  }

  /* ── DIMENSION TEAR SFX ────────────────── */
  function playDimensionTear() {
    if (!ctx) return;
    const now = ctx.currentTime;

    // Low frequency sweep + noise (ripping sound)
    const dur = 0.5;
    const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const t = i / ctx.sampleRate;
        // Sweep from low to high (tearing)
        const sweep = Math.sin(t * (200 + t * 3000) * Math.PI * 2) * Math.exp(-t * 4) * 0.4;
        // Rumble underneath
        const rumble = Math.sin(t * 40 * Math.PI * 2) * Math.exp(-t * 3) * 0.5;
        // Crackle overlay
        const crackle = (Math.random() * 2 - 1) * Math.exp(-t * 6) * 0.2;
        d[i] = (sweep + rumble + crackle) * (ch === 0 ? 1 : -1) * 0.5; // stereo split
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(200);
    distortion.oversample = '4x';

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.3, now);
    g.gain.exponentialRampToValueAtTime(0.01, now + dur);

    src.connect(distortion);
    distortion.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + dur);
  }

  /* ── IMPACT HIT SFX ───────────────────── */
  function playImpact(intensity) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const int = intensity || 1;

    // Sub-bass thump
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(80 * int, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.25 * int, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(g);
    g.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.3);

    // Transient snap on top
    const dur = 0.04;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.1)) * 0.5;
    }
    const snap = ctx.createBufferSource();
    snap.buffer = buf;
    const sg = ctx.createGain();
    sg.gain.value = 0.2 * int;
    snap.connect(sg);
    sg.connect(masterGain);
    snap.start(now);
    snap.stop(now + dur);
  }

  /* ── CHAOS NOISE BURST ─────────────────── */
  function playChaosNoise(duration, vol) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = duration || 0.1;
    const buf = ctx.createBuffer(2, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < d.length; i++) {
        const t = i / ctx.sampleRate;
        // Harsh digital noise with bitcrushing feel
        const sample = Math.random() * 2 - 1;
        const crushed = Math.round(sample * 8) / 8; // 3-bit quantize
        d[i] = crushed * Math.exp(-t * (3 / dur));
      }
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const dist = ctx.createWaveShaper();
    dist.curve = makeDistortionCurve(400);
    dist.oversample = '4x';

    const g = ctx.createGain();
    g.gain.value = vol || 0.15;
    src.connect(dist);
    dist.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + dur);
  }

  /* ── CLICK SOUND (now layered + destructive) ── */
  function playClick(clickCount) {
    init();
    ensureResumed();
    startDrone();

    const now = ctx.currentTime;
    const intensity = Math.min(clickCount / 50, 2.5);
    const tier = clickCount >= 500 ? 5 : clickCount >= 400 ? 4 : clickCount >= 300 ? 3 : clickCount >= 200 ? 2 : clickCount >= 100 ? 1 : 0;

    // Base click — pitch descends with count
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
    distortion.curve = makeDistortionCurve(clickCount * 20);
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

    // ── Layered SFX based on tier ──
    // Tier 0 (0-99): occasional static
    if (clickCount >= 13 && Math.random() > 0.4) {
      setTimeout(() => playChaosNoise(0.04, 0.08), 50 + Math.random() * 100);
    }

    // Tier 1 (100+): glass shatter on every 3rd click
    if (tier >= 1 && clickCount % 3 === 0) {
      playGlassShatter();
    }

    // Tier 1+: impact hit on every 5th click
    if (tier >= 1 && clickCount % 5 === 0) {
      playImpact(0.5 + tier * 0.3);
    }

    // Tier 2 (200+): dimension tear on every 4th click
    if (tier >= 2 && clickCount % 4 === 0) {
      playDimensionTear();
    }

    // Tier 2+: random chaos noise bursts
    if (tier >= 2 && Math.random() > 0.3) {
      const delay = Math.random() * 200;
      setTimeout(() => playChaosNoise(0.05 + tier * 0.03, 0.1 + tier * 0.03), delay);
    }

    // Tier 3 (300+): constant destruction — shatter + impact
    if (tier >= 3) {
      if (Math.random() > 0.4) playGlassShatter();
      if (Math.random() > 0.5) setTimeout(() => playImpact(1 + tier * 0.2), 100);
      if (Math.random() > 0.6) setTimeout(() => playChaosNoise(0.1, 0.15), 150);
    }

    // Tier 4 (400+): layered destruction every click
    if (tier >= 4) {
      playImpact(1.5);
      setTimeout(() => playDimensionTear(), 50);
      setTimeout(() => playChaosNoise(0.12, 0.12), 200);
    }

    // Tier 5 (500+): EVERYTHING every click
    if (tier >= 5) {
      playGlassShatter();
      playImpact(2);
      setTimeout(() => playDimensionTear(), 30);
      setTimeout(() => playGlassShatter(), 100);
      setTimeout(() => playChaosNoise(0.15, 0.18), 150);
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
    masterGain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.5);
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
    playGlassShatter, playDimensionTear, playImpact, playChaosNoise
  };
})();
