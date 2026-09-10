/* ═══════════════════════════════════════════
   Reality Glitch — Audio Engine
   Web Audio API: drone + click FX + distortion
   ═══════════════════════════════════════════ */

const AudioEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let droneGain = null;
  let osc1 = null, osc2 = null, osc3 = null;
  let started = false;

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
    osc2.frequency.value = 55.5; // slight detune
    osc2.connect(droneGain);
    osc2.start();
  }

  function setDroneIntensity(stage) {
    if (!droneGain) return;
    const now = ctx.currentTime;
    const volumes = [0.04, 0.06, 0.1, 0.16, 0];
    droneGain.gain.linearRampToValueAtTime(volumes[stage] || 0.04, now + 0.3);

    // Stage 3+: add dissonant third oscillator
    if (stage >= 3 && !osc3) {
      osc3 = ctx.createOscillator();
      osc3.type = 'sawtooth';
      osc3.frequency.value = 82.5; // dissonant
      const osc3Gain = ctx.createGain();
      osc3Gain.gain.value = 0.03;
      osc3.connect(osc3Gain);
      osc3Gain.connect(droneGain);
      osc3.start();
    }
    if (stage < 3 && osc3) {
      osc3.stop();
      osc3.disconnect();
      osc3 = null;
    }
  }

  /* ── Click sound ─────────────────────── */
  function playClick(stage) {
    init();
    ensureResumed();
    startDrone();

    const now = ctx.currentTime;
    const duration = 0.06;

    // White noise burst
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    // Bandpass filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200 + stage * 400;
    filter.Q.value = 1 + stage * 2;

    // Distortion (scales with stage)
    const distortion = ctx.createWaveShaper();
    const curve = makeDistortionCurve(stage * 100);
    distortion.curve = curve;
    distortion.oversample = '4x';

    // Click gain envelope
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.15 + stage * 0.05, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + duration + stage * 0.02);

    // Pitch shift via playbackRate
    noise.playbackRate.value = 1.0 - stage * 0.15;

    noise.connect(filter);
    filter.connect(distortion);
    distortion.connect(clickGain);
    clickGain.connect(masterGain);

    noise.start(now);
    noise.stop(now + duration + stage * 0.03);

    // Stage 3+: random static bursts
    if (stage >= 3 && Math.random() > 0.5) {
      setTimeout(() => playStaticBurst(), Math.random() * 300 + 100);
    }
  }

  function playStaticBurst() {
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.03;
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    g.gain.value = 0.08;
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

  /* ── Climax silence ──────────────────── */
  function silenceAll() {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  }

  function restoreAudio() {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.5);
    setDroneIntensity(0);
  }

  /* ── Cleanup ─────────────────────────── */
  function reset() {
    if (osc3) { osc3.stop(); osc3.disconnect(); osc3 = null; }
    setDroneIntensity(0);
  }

  return { init, playClick, setDroneIntensity, silenceAll, restoreAudio, reset, ensureResumed, startDrone };
})();
