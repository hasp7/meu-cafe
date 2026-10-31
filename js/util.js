'use strict';
// Utilitários partilhados: matemática, desenho, armazenamento e som.
window.MC = window.MC || {};

(function (MC) {
  MC.W = 360;
  MC.H = 640;
  MC.FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
  MC.INK = '#1d2340';

  MC.rand = (a, b) => a + Math.random() * (b - a);
  MC.randi = (a, b) => Math.floor(a + Math.random() * (b - a + 1));
  MC.choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  MC.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  MC.lerp = (a, b, t) => a + (b - a) * t;
  MC.hit = (a, b, extra = 0) => {
    const dx = a.x - b.x, dy = a.y - b.y, r = a.r + b.r + extra;
    return dx * dx + dy * dy < r * r;
  };
  MC.shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  // table: [[chave, peso], ...]
  MC.weighted = (table) => {
    let total = 0;
    for (const [, w] of table) total += w;
    let r = Math.random() * total;
    for (const [k, w] of table) { r -= w; if (r <= 0) return k; }
    return table[table.length - 1][0];
  };
  MC.rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  };

  MC.reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  const params = new URLSearchParams(window.location.search);
  MC.params = {
    // ?nivel=1..7 começa nesse nível; ?demo=1 joga sozinho (para apresentações)
    stage: params.has('nivel') ? MC.clamp(parseInt(params.get('nivel'), 10) - 1 || 0, 0, 6) : null,
    demo: params.get('demo') === '1',
  };

  MC.store = {
    get(key, fallback) {
      try {
        const v = window.localStorage.getItem('meu-cafe:' + key);
        return v === null ? fallback : JSON.parse(v);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { window.localStorage.setItem('meu-cafe:' + key, JSON.stringify(value)); } catch (e) { /* sem armazenamento: segue sem gravar */ }
    },
  };

  MC.d = {
    circle(ctx, x, y, r, fill, stroke, lw) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.lineWidth = lw || 2; ctx.strokeStyle = stroke; ctx.stroke(); }
    },
    rrect(ctx, x, y, w, h, r) {
      r = Math.min(r, w / 2, h / 2);
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    },
    // circles: [[cx, cy, r], ...] num só caminho, sem linhas a ligar os arcos
    blob(ctx, circles) {
      ctx.beginPath();
      for (const [cx, cy, r] of circles) { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, Math.PI * 2); }
    },
    puff(ctx, x, y, w, color) {
      const r = w / 4;
      MC.d.blob(ctx, [[x - r * 1.2, y, r * 0.9], [x, y - r * 0.5, r * 1.15], [x + r * 1.25, y, r * 0.85], [x, y + r * 0.3, r]]);
      ctx.fillStyle = color;
      ctx.fill();
    },
    text(ctx, s, x, y, size, color, o = {}) {
      ctx.font = `${o.weight || 800} ${size}px ${MC.FONT}`;
      ctx.textAlign = o.align || 'center';
      ctx.textBaseline = o.baseline || 'middle';
      if (o.outline !== false) {
        ctx.lineJoin = 'round';
        ctx.lineWidth = o.lw || Math.max(2, size / 5);
        ctx.strokeStyle = o.outline || MC.INK;
        ctx.strokeText(s, x, y);
      }
      ctx.fillStyle = color;
      ctx.fillText(s, x, y);
    },
    eyes(ctx, x, y, s = 1, look = 0) {
      for (const dx of [-3.4 * s, 3.4 * s]) {
        MC.d.circle(ctx, x + dx, y, 2.7 * s, '#fff', MC.INK, 1);
        MC.d.circle(ctx, x + dx + look * s, y + 0.6 * s, 1.3 * s, MC.INK);
      }
    },
  };

  MC.audio = {
    muted: MC.store.get('muted', true),
    ac: null,
    ensure() {
      if (this.ac) return;
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ac = new AC();
      } catch (e) { this.ac = null; }
    },
    toggle() {
      this.muted = !this.muted;
      MC.store.set('muted', this.muted);
      if (!this.muted) {
        this.ensure();
        if (this.ac && this.ac.state === 'suspended') this.ac.resume();
      }
    },
    tone(freq, dur, type = 'square', vol = 0.04, slide = 0) {
      if (this.muted || !this.ac) return;
      const ac = this.ac, t0 = ac.currentTime;
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
      g.gain.setValueAtTime(vol, t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g);
      g.connect(ac.destination);
      o.start(t0);
      o.stop(t0 + dur + 0.02);
    },
  };
  const later = (ms, fn) => window.setTimeout(fn, ms);
  MC.sfx = {
    pop() { MC.audio.tone(520, 0.07, 'square', 0.025, -300); },
    good() { MC.audio.tone(660, 0.09, 'triangle', 0.05, 400); later(70, () => MC.audio.tone(990, 0.08, 'triangle', 0.04)); },
    bad() { MC.audio.tone(240, 0.22, 'sawtooth', 0.035, -120); },
    hurt() { MC.audio.tone(180, 0.35, 'square', 0.05, -120); },
    wave() { MC.audio.tone(300, 0.5, 'sawtooth', 0.04, 600); },
    boss() { MC.audio.tone(140, 0.6, 'square', 0.05, -80); },
    win() { [523, 659, 784, 1046].forEach((f, i) => later(i * 120, () => MC.audio.tone(f, 0.16, 'triangle', 0.05))); },
  };
})(window.MC);
