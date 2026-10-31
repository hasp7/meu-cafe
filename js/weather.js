'use strict';
// Céus aleatórios por nível. Cada um muda um pouco o jogo, sempre de forma justa.
// Sem clarões nem piscas: o encandeamento é uma faixa suave e lenta.
(function (MC) {
  const { W, H } = MC;
  MC.WEATHER_TYPES = ['clear', 'cloudy', 'rain', 'fog', 'sunrise', 'night'];
  const INFO = MC.WEATHER_INFO = {
    clear:   { name: 'Céu limpo',     tip: 'Bom dia para voar.',                            sky: ['#4aa8f0', '#bfe6ff'],            cloud: '#ffffff', cloudA: 0.55 },
    cloudy:  { name: 'Nublado',       tip: 'As nuvens da frente escondem alguns disparos.', sky: ['#7f97b3', '#d3dde7'],            cloud: '#eef2f6', cloudA: 0.6 },
    rain:    { name: 'Chuva',         tip: 'Com chuva, a nuvem escorrega um pouco.',        sky: ['#4b5b70', '#95a6b8'],            cloud: '#7d8a99', cloudA: 0.7 },
    fog:     { name: 'Nevoeiro',      tip: 'Com nevoeiro, vês pior lá em cima.',            sky: ['#9aa6b2', '#dde3e8'],            cloud: '#f2f4f6', cloudA: 0.5 },
    sunrise: { name: 'Nascer do sol', tip: 'Cuidado com o encandeamento do sol.',           sky: ['#5b67b0', '#ff9e6e', '#ffe2a6'], cloud: '#ffd2c0', cloudA: 0.55 },
    night:   { name: 'Noite',         tip: 'À noite, os disparos brilham no escuro.',       sky: ['#090d27', '#252d5c'],            cloud: '#3a4377', cloudA: 0.6 },
  };
  const many = (n) => (MC.reducedMotion ? Math.ceil(n / 2) : n);

  MC.makeWeather = function (type) {
    const w = {
      type, info: INFO[type], t: 0,
      back: [], front: [], drops: [], stars: [], blobs: [],
      glare: { t: MC.rand(4, 7), on: 0 },
      inertia: type === 'rain',
      glow: type === 'night',
    };
    for (let i = 0; i < 6; i++) w.back.push({ x: MC.rand(0, W), y: MC.rand(-40, H), s: MC.rand(40, 90), v: MC.rand(18, 40) });
    if (type === 'cloudy') for (let i = 0; i < 3; i++) w.front.push({ x: MC.rand(30, W - 30), y: MC.rand(-200, H * 0.6), s: MC.rand(110, 150), v: MC.rand(22, 34) });
    if (type === 'rain') for (let i = 0; i < many(70); i++) w.drops.push({ x: MC.rand(0, W + 60), y: MC.rand(0, H), l: MC.rand(8, 16), v: MC.rand(420, 560) });
    if (type === 'night') for (let i = 0; i < 60; i++) w.stars.push({ x: MC.rand(0, W), y: MC.rand(0, H), r: MC.rand(0.6, 1.8), p: MC.rand(0, 6.28) });
    if (type === 'fog') for (let i = 0; i < 5; i++) w.blobs.push({ x: MC.rand(0, W), y: MC.rand(0, H * 0.45), s: MC.rand(120, 200), v: MC.rand(6, 14) * (Math.random() < 0.5 ? -1 : 1) });
    return w;
  };

  MC.updateWeather = function (w, dt) {
    w.t += dt;
    for (const c of w.back) { c.y += c.v * dt; if (c.y - c.s > H) { c.y = -c.s; c.x = MC.rand(0, W); } }
    for (const c of w.front) { c.y += c.v * dt; if (c.y - c.s > H) { c.y = -c.s - MC.rand(0, 200); c.x = MC.rand(30, W - 30); } }
    for (const d of w.drops) { d.y += d.v * dt; d.x -= d.v * 0.18 * dt; if (d.y > H) { d.y = -d.l; d.x = MC.rand(0, W + 60); } }
    for (const b of w.blobs) { b.x += b.v * dt; if (b.x < -b.s) b.x = W + b.s; if (b.x > W + b.s) b.x = -b.s; }
    for (const s of w.stars) { s.y += 6 * dt; if (s.y > H) s.y = 0; }
    if (w.type === 'sunrise') {
      const g = w.glare;
      if (g.on > 0) { g.on -= dt; if (g.on <= 0) g.t = MC.rand(6, 10); }
      else { g.t -= dt; if (g.t <= 0) g.on = 2.8; }
    }
  };

  MC.drawWeatherBack = function (ctx, w) {
    const sky = w.info.sky;
    const gr = ctx.createLinearGradient(0, 0, 0, H);
    sky.forEach((c, i) => gr.addColorStop(i / (sky.length - 1), c));
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, W, H);

    if (w.type === 'night') {
      for (const s of w.stars) {
        ctx.globalAlpha = 0.55 + 0.45 * Math.sin(w.t * 1.2 + s.p);
        MC.d.circle(ctx, s.x, s.y, s.r, '#fff8dc');
      }
      ctx.globalAlpha = 1;
      MC.d.circle(ctx, 70, 110, 22, '#fff3c4');
      MC.d.circle(ctx, 80, 104, 19, '#0f1534');
    } else if (w.type === 'sunrise') {
      const sg = ctx.createRadialGradient(W * 0.78, H * 0.6, 10, W * 0.78, H * 0.6, 140);
      sg.addColorStop(0, 'rgba(255,245,200,0.75)');
      sg.addColorStop(1, 'rgba(255,245,200,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, W, H);
      MC.d.circle(ctx, W * 0.78, H * 0.6, 34, '#fff1b8');
    } else if (w.type === 'clear') {
      const sg = ctx.createRadialGradient(W - 52, 74, 6, W - 52, 74, 70);
      sg.addColorStop(0, 'rgba(255,250,210,0.9)');
      sg.addColorStop(1, 'rgba(255,250,210,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(W - 140, 0, 140, 160);
      MC.d.circle(ctx, W - 52, 74, 20, '#fff6b0');
    }

    ctx.globalAlpha = w.info.cloudA;
    for (const c of w.back) MC.d.puff(ctx, c.x, c.y, c.s, w.info.cloud);
    ctx.globalAlpha = 1;
  };

  MC.drawWeatherFront = function (ctx, w) {
    if (w.front.length) {
      // mais transparentes na zona do herói, para nunca o esconderem
      for (const c of w.front) {
        ctx.globalAlpha = c.y < H * 0.5 ? 0.82 : 0.45;
        MC.d.puff(ctx, c.x, c.y, c.s, '#f4f7fa');
      }
      ctx.globalAlpha = 1;
    }
    if (w.type === 'rain') {
      ctx.strokeStyle = 'rgba(215,228,255,0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (const d of w.drops) { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - d.l * 0.18, d.y + d.l); }
      ctx.stroke();
    } else if (w.type === 'fog') {
      const fg = ctx.createLinearGradient(0, 0, 0, H * 0.62);
      fg.addColorStop(0, 'rgba(228,232,236,0.9)');
      fg.addColorStop(0.4, 'rgba(228,232,236,0.7)');
      fg.addColorStop(1, 'rgba(228,232,236,0)');
      ctx.fillStyle = fg;
      ctx.fillRect(0, 0, W, H * 0.62);
      ctx.globalAlpha = 0.35;
      for (const b of w.blobs) MC.d.puff(ctx, b.x, b.y, b.s, '#eef1f4');
      ctx.globalAlpha = 1;
    } else if (w.type === 'sunrise' && w.glare.on > 0) {
      const p = 1 - w.glare.on / 2.8;
      ctx.save();
      ctx.translate(MC.lerp(-260, W + 260, p), H / 2);
      ctx.rotate(-0.45);
      const bg = ctx.createLinearGradient(-80, 0, 80, 0);
      const a = Math.sin(p * Math.PI) * 0.4;
      bg.addColorStop(0, 'rgba(255,250,225,0)');
      bg.addColorStop(0.5, `rgba(255,250,225,${a})`);
      bg.addColorStop(1, 'rgba(255,250,225,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(-80, -H, 160, H * 2);
      ctx.restore();
    } else if (w.type === 'night') {
      const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, 'rgba(0,0,10,0)');
      vg.addColorStop(1, 'rgba(0,0,10,0.4)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }
  };
})(window.MC);
