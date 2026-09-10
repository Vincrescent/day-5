/* ═══════════════════════════════════════════
   Reality Glitch — Audio Engine (Infinite)
   Web Audio API: drone + heartbeat + click FX
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
    masterGain.gain.value = 1.0;
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

  /* Intensity now takes a continuous value (0-1+) not just stage int */
  function setDroneIntensity(intensity) {
    if (!droneGain || !ctx) return;
    const now = ctx.currentTime;
    const vol = Math.min(0.04 + intensity * 0.15, 0.35);
    droneGain.gain.linearRampToValueAtTime(vol, now + 0.3);

    // Add dissonant oscillators as intensity grows
    if (intensity >= 0.5 && !osc3) {
      osc3 = ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.value = 82.5;
      const g3 = ctx.createGain();
      g3.gain.value = 0.03;
      osc3.connect(g3);
      g3.connect(droneGain);
      osc3.start();
    }
    if (intensity >= 0.8 && !osc4) {
      osc4 = ctx.createOscillator();
      osc4.type = 'triangle';
      osc4.frequency.value = 41.2; // sub-bass rumble
      const g4 = ctx.createGain();
      g4.gain.value = 0.04;
      osc4.connect(g4);
      g4.connect(droneGain);
      osc4.start();
    }
    // Detune existing oscillators based on intensity
    if (osc1) osc1.frequency.value = 55 + intensity * 5;
    if (osc2) osc2.frequency.value = 55.5 - intensity * 3;
  }

  /* ── Heartbeat (hover sound) ─────────── */
  function startHeartbeat(bpm) {
    stopHeartbeat();
    if (!ctx) return;
    const interval = 60000 / Math.max(bpm, 30);
    heartbeatInterval = setInterval(() => {
      if (!ctx) return;
      const now = ctx.currentTime;
      // Low thump
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.15);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
    }, interval);
  }

  function stopHeartbeat() {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
  }

  /* ── Click sound (pitch descends with clicks) ── */
  function playClick(clickCount) {
    init();
    ensureResumed();
    startDrone();

    const now = ctx.currentTime;
    const intensity = Math.min(clickCount / 50, 1.5);
    const duration = 0.06 + intensity * 0.04;

    // White noise burst
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass — center freq drops (high click → deep bass rumble)
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = Math.max(1800 - clickCount * 30, 200);
    filter.Q.value = 1 + intensity * 4;

    // Distortion scales continuously
    const distortion = ctx.createWaveShaper();
    distortion.curve = makeDistortionCurve(clickCount * 15);
    distortion.oversample = '4x';

    // Gain envelope
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.12 + intensity * 0.08, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Pitch drops with click count
    noise.playbackRate.value = Math.max(1.2 - clickCount * 0.02, 0.3);

    noise.connect(filter);
    filter.connect(distortion);
    distortion.connect(clickGain);
    clickGain.connect(masterGain);

    noise.start(now);
    noise.stop(now + duration + 0.05);

    // Random static bursts at higher click counts
    if (clickCount >= 13 && Math.random() > 0.4) {
      setTimeout(() => playStaticBurst(intensity), Math.random() * 200 + 50);
    }
  }

  function playStaticBurst(intensity) {
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.02 + (intensity || 0) * 0.02;
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * dur), ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.06 + (intensity || 0) * 0.04;
    src.connect(g);
    g.connect(masterGain);
    src.start(now);
    src.stop(now + dur);
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

  /* ── Silence/Restore ──────────────────── */
  function silenceAll() {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  }

  function restoreAudio() {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.5);
  }

  /* ── Cleanup ─────────────────────────── */
  function reset() {
    stopHeartbeat();
    if (osc3) { try { osc3.stop(); } catch(e){} osc3.disconnect(); osc3 = null; }
    if (osc4) { try { osc4.stop(); } catch(e){} osc4.disconnect(); osc4 = null; }
    setDroneIntensity(0);
  }

  return { init, playClick, setDroneIntensity, silenceAll, restoreAudio, reset, ensureResumed, startDrone, startHeartbeat, stopHeartbeat };
})();
