// FONEMA · Mundo 3D — "5D": áudio espacial com Web Audio PannerNode (sem arquivos:
// todos os sons são sintetizados). HRTF no nível alto; equalpower no médio/leve.
// A voz da Sofia NUNCA é espacializada (fica no centro, clara) — aqui não há voz.
export class WorldAudio {
  constructor(quality = 'alto') { this.q = quality; this.on = false; this.ctx = null; this.sources = []; }
  setQuality(q) { this.q = q; for (const s of this.sources) if (s.panner) s.panner.panningModel = q === 'alto' ? 'HRTF' : 'equalpower'; }
  async start() {
    if (this.ctx) { await this.ctx.resume(); this.on = true; this.master.gain.setTargetAtTime(0.9, this.ctx.currentTime, 0.3); return; }
    const ctx = this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.master = ctx.createGain(); this.master.gain.value = 0.0; this.master.connect(ctx.destination);
    this.master.gain.setTargetAtTime(0.9, ctx.currentTime, 0.4);
    const max = { alto: 16, medio: 8, leve: 4 }[this.q] || 4;
    // ruído base (mar)
    const len = ctx.sampleRate * 3, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
    const shore = [[8, 0, 54], [52, 0, -12], [-48, 0, 10], [-6, 0, -50]];
    shore.slice(0, Math.min(shore.length, max >= 8 ? 4 : 2)).forEach(([x, y, z], i) => {
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520;
      const g = ctx.createGain(); g.gain.value = 0.5;
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.11 + i * 0.03; const lg = ctx.createGain(); lg.gain.value = 0.35; lfo.connect(lg); lg.connect(g.gain); lfo.start();
      const p = this.panner(x, y, z, 14);
      src.connect(lp); lp.connect(g); g.connect(p); src.start(0, i * 0.7);
    });
    // passarinhos nas árvores
    [[-10.5, 8, -6.5], [30, 8, 22], [-36, 8, 12]].slice(0, max >= 8 ? 3 : 1).forEach(([x, y, z], i) => {
      const p = this.panner(x, y, z, 6);
      const chirp = () => {
        if (!this.on) return setTimeout(chirp, 1500);
        const t0 = ctx.currentTime + 0.05, n = 2 + Math.floor(Math.random() * 4);
        for (let k = 0; k < n; k++) {
          const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine';
          const t = t0 + k * 0.13, f = 2600 + Math.random() * 1400;
          o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 1.45, t + 0.07);
          g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
          o.connect(g); g.connect(p); o.start(t); o.stop(t + 0.12);
        }
        setTimeout(chirp, 2500 + Math.random() * 5000 + i * 700);
      };
      setTimeout(chirp, 800 + i * 1300);
    });
    // sino da escola
    { const p = this.panner(-21, 10, -14, 10);
      const bell = () => { if (this.on) { const t = ctx.currentTime + 0.05; [523, 1046, 1318, 1568].forEach((f, k) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f; g.gain.setValueAtTime(0.22 / (k + 1), t); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6 - k * 0.4); o.connect(g); g.connect(p); o.start(t); o.stop(t + 2.7); }); } setTimeout(bell, 18000); };
      setTimeout(bell, 4000); }
    // caixinha de música no coreto (só alto/médio)
    if (max >= 8) {
      const p = this.panner(0, 5, 2, 7), notes = [523, 587, 659, 784, 880, 784, 659, 587];
      let k = 0; const tick = () => { if (this.on) { const t = ctx.currentTime + 0.02, o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.value = notes[k++ % notes.length]; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55); o.connect(g); g.connect(p); o.start(t); o.stop(t + 0.6); } setTimeout(tick, k % 4 === 3 ? 900 : 450); };
      tick();
    }
    this.on = true;
  }
  panner(x, y, z, ref) {
    const p = this.ctx.createPanner();
    p.panningModel = this.q === 'alto' ? 'HRTF' : 'equalpower'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = 1.1; p.maxDistance = 400;
    p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z;
    p.connect(this.master); this.sources.push({ panner: p }); return p;
  }
  stop() { if (!this.ctx) return; this.on = false; this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2); }
  update(camera) {
    if (!this.ctx || !this.on) return;
    const L = this.ctx.listener, p = camera.position, t = this.ctx.currentTime;
    const f = [0, 0, -1], u = [0, 1, 0]; const e = camera.matrixWorld.elements;
    f[0] = -e[8]; f[1] = -e[9]; f[2] = -e[10]; u[0] = e[4]; u[1] = e[5]; u[2] = e[6];
    if (L.positionX) {
      L.positionX.setTargetAtTime(p.x, t, 0.05); L.positionY.setTargetAtTime(p.y, t, 0.05); L.positionZ.setTargetAtTime(p.z, t, 0.05);
      L.forwardX.setTargetAtTime(f[0], t, 0.05); L.forwardY.setTargetAtTime(f[1], t, 0.05); L.forwardZ.setTargetAtTime(f[2], t, 0.05);
      L.upX.setTargetAtTime(u[0], t, 0.05); L.upY.setTargetAtTime(u[1], t, 0.05); L.upZ.setTargetAtTime(u[2], t, 0.05);
    } else { L.setPosition(p.x, p.y, p.z); L.setOrientation(f[0], f[1], f[2], u[0], u[1], u[2]); }
  }
}
