'use strict';
// Níveis, inimigos das vagas e desenho das balas inimigas.
(function (MC) {
  const { W, H, INK } = MC;

  MC.STAGES = [
    { label: 'Nível 1', name: 'Jardim de Infância', enemies: ['crayon', 'block'], boss: 'educadora', bullet: '#ff5d5d',
      tip: 'Arrasta o dedo para voar. Apanha os cafés, foge das cervejas.' },
    { label: 'Nível 2', name: '1.º Ciclo', enemies: ['chalk', 'notebook'], boss: 'primaria', bullet: '#ffffff',
      tip: 'Segura o botão ⚡ para carregar a onda de energia e larga para disparar.' },
    { label: 'Nível 3', name: '2.º e 3.º Ciclos', enemies: ['triangle', 'protractor'], boss: 'matematica', bullet: '#ffd34d',
      tip: 'O expresso é curto e forte. O americano dura mais.' },
    { label: 'Especial', name: 'Dia de Jogo', enemies: ['ball', 'whistle'], boss: 'arbitro', bullet: '#ffffff', matchDay: true,
      tip: 'Amarelo abranda, vermelho tira uma vida. O árbitro guarda a bola de ouro.' },
    { label: 'Nível 4', name: 'Secundário', enemies: ['flask', 'atom'], boss: 'fisica', bullet: '#52d273', mids: ['impostos'], phaseB: true,
      tip: 'Vida adulta: agora cada vício tem um lado bom… e um preço.' },
    { label: 'Nível 5', name: 'Licenciatura', enemies: ['slide', 'clock'], boss: 'professor', bullet: '#ff8a3d', mids: ['acidente', 'viagens'], phaseB: true,
      tip: 'O laser do professor avisa antes de disparar. Sai da linha!' },
    { label: 'Nível 6', name: 'Mestrado', enemies: ['pen', 'book'], boss: 'juri', bullet: '#e5484d', mids: ['credito'], phaseB: true, final: true,
      tip: 'O júri tem um escudo de “revisão pedida”. Só a onda de energia o parte.' },
  ];

  const COLORS = ['#ff5d5d', '#4dabff', '#52d273', '#ffb02e', '#b77bff'];
  const line = (ctx, lw = 1.5) => { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };

  // Desenhos dos inimigos (~24 px), à volta da origem. e = inimigo (cor, fase), t = tempo.
  const ART = MC.ENEMY_ART = {
    crayon(ctx, e) {
      line(ctx);
      ctx.fillStyle = e.color; MC.d.rrect(ctx, -6, -12, 12, 17, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-6, -6, 12, 6); ctx.strokeRect(-6, -6, 12, 6);
      ctx.fillStyle = e.color; ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(6, 5); ctx.lineTo(0, 13); ctx.closePath(); ctx.fill(); ctx.stroke();
      MC.d.eyes(ctx, 0, -3, 0.75);
    },
    block(ctx, e) {
      line(ctx);
      ctx.fillStyle = e.color; MC.d.rrect(ctx, -11, -11, 22, 22, 3); ctx.fill(); ctx.stroke();
      MC.d.text(ctx, e.letter, 0, 4, 11, '#ffffff', { lw: 3 });
      MC.d.eyes(ctx, 0, -5, 0.75);
    },
    chalk(ctx, e, t) {
      line(ctx);
      ctx.save(); ctx.rotate(0.4 * Math.sin(t * 2 + e.phase));
      ctx.fillStyle = '#f6f6f2'; MC.d.rrect(ctx, -5, -13, 10, 26, 4); ctx.fill(); ctx.stroke();
      MC.d.eyes(ctx, 0, -3, 0.7);
      ctx.restore();
    },
    notebook(ctx, e) {
      line(ctx);
      ctx.fillStyle = e.color; MC.d.rrect(ctx, -10, -12, 20, 24, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-4, 4, 11, 4);
      for (let y = -9; y <= 9; y += 4.5) MC.d.circle(ctx, -10, y, 1.6, '#c7d0db', INK, 1);
      MC.d.eyes(ctx, 1, -4, 0.8);
    },
    triangle(ctx, e) {
      line(ctx);
      ctx.fillStyle = '#ffd34d'; ctx.beginPath(); ctx.moveTo(0, 13); ctx.lineTo(-12, -9); ctx.lineTo(12, -9); ctx.closePath(); ctx.fill(); ctx.stroke();
      MC.d.eyes(ctx, 0, -3, 0.75);
    },
    protractor(ctx, e) {
      line(ctx);
      ctx.fillStyle = 'rgba(160,220,255,0.9)'; ctx.beginPath(); ctx.arc(0, 4, 12, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 1;
      for (let a = Math.PI; a <= Math.PI * 2 + 0.01; a += Math.PI / 6) { ctx.beginPath(); ctx.moveTo(Math.cos(a) * 12, 4 + Math.sin(a) * 12); ctx.lineTo(Math.cos(a) * 9, 4 + Math.sin(a) * 9); ctx.stroke(); }
      MC.d.eyes(ctx, 0, -1, 0.7);
    },
    flask(ctx, e) {
      line(ctx);
      ctx.fillStyle = 'rgba(235,250,255,0.95)';
      ctx.beginPath(); ctx.moveTo(-3, -12); ctx.lineTo(3, -12); ctx.lineTo(3, -4); ctx.lineTo(11, 10); ctx.lineTo(-11, 10); ctx.lineTo(-3, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#52d273'; ctx.beginPath(); ctx.moveTo(-6.8, 2.5); ctx.lineTo(6.8, 2.5); ctx.lineTo(10, 9); ctx.lineTo(-10, 9); ctx.closePath(); ctx.fill();
      MC.d.eyes(ctx, 0, -1, 0.7);
    },
    atom(ctx, e, t) {
      ctx.strokeStyle = '#4dabff'; ctx.lineWidth = 1.8;
      for (const a of [0, 1.05, 2.1]) { ctx.beginPath(); ctx.ellipse(0, 0, 13, 5, a + t, 0, Math.PI * 2); ctx.stroke(); }
      MC.d.circle(ctx, 0, 0, 6, '#ff5d5d', INK, 1.4);
      MC.d.eyes(ctx, 0, 0, 0.55);
    },
    slide(ctx, e) {
      line(ctx);
      ctx.fillStyle = '#ffffff'; MC.d.rrect(ctx, -13, -11, 26, 18, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = e.color; ctx.fillRect(-9, -1, 4, 5); ctx.fillRect(-3, -5, 4, 9); ctx.fillRect(3, -3, 4, 7);
      ctx.beginPath(); ctx.moveTo(0, 7); ctx.lineTo(0, 12); ctx.moveTo(-5, 12); ctx.lineTo(5, 12); ctx.stroke();
      MC.d.eyes(ctx, 0, -7, 0.55);
    },
    clock(ctx, e, t) {
      MC.d.circle(ctx, 0, 0, 12, '#ffffff', INK, 1.6);
      MC.d.circle(ctx, -8, -10, 3.5, '#ff5d5d', INK, 1.2);
      MC.d.circle(ctx, 8, -10, 3.5, '#ff5d5d', INK, 1.2);
      line(ctx, 1.6);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 3) * 8, Math.sin(t * 3) * 8); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t * 0.5) * 5, Math.sin(t * 0.5) * 5); ctx.stroke();
      MC.d.eyes(ctx, 0, 4, 0.55);
    },
    pen(ctx, e) {
      line(ctx);
      ctx.fillStyle = '#e5484d'; MC.d.rrect(ctx, -4.5, -13, 9, 21, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f2e3b3'; ctx.beginPath(); ctx.moveTo(-4.5, 8); ctx.lineTo(4.5, 8); ctx.lineTo(0, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
      MC.d.circle(ctx, 0, 13.5, 1.3, '#e5484d');
      MC.d.eyes(ctx, 0, -5, 0.6);
    },
    book(ctx, e) {
      line(ctx);
      ctx.fillStyle = '#8a5cf6'; MC.d.rrect(ctx, -11, -12, 22, 24, 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-11, 8, 22, 4);
      MC.d.text(ctx, e.ref, 0, 2, 9, '#ffffff', { lw: 2.5 });
      MC.d.eyes(ctx, 0, -6, 0.65);
    },
    ball(ctx, e, t) {
      MC.d.circle(ctx, 0, 0, 12, '#ffffff', INK, 1.6);
      ctx.save(); ctx.rotate(t * 2 + e.phase);
      ctx.fillStyle = INK;
      ctx.beginPath(); for (let i = 0; i < 5; i++) { const a = i * 1.2566; ctx.lineTo(Math.cos(a) * 4.5, Math.sin(a) * 4.5); } ctx.closePath(); ctx.fill();
      for (let i = 0; i < 5; i++) { const a = i * 1.2566 + 0.63; MC.d.circle(ctx, Math.cos(a) * 10.5, Math.sin(a) * 10.5, 2.4, INK); }
      ctx.restore();
    },
    whistle(ctx, e) {
      line(ctx);
      ctx.fillStyle = '#c7d0db';
      MC.d.blob(ctx, [[2, 2, 9]]); ctx.fill(); ctx.stroke();
      MC.d.rrect(ctx, -13, -6, 12, 7, 2); ctx.fill(); ctx.stroke();
      MC.d.circle(ctx, 2, 2, 3, '#7c8a9b');
      MC.d.eyes(ctx, 3, -3, 0.6);
    },
    form(ctx, e) {
      line(ctx);
      ctx.fillStyle = '#fffdf3'; MC.d.rrect(ctx, -10, -12, 20, 24, 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#9aa6b5'; ctx.lineWidth = 1;
      ctx.beginPath(); for (let y = 2; y <= 9; y += 3.5) { ctx.moveTo(-6, y); ctx.lineTo(6, y); } ctx.stroke();
      MC.d.text(ctx, '€', 6, -7, 8, '#e5484d', { outline: false });
      MC.d.eyes(ctx, -2, -4, 0.6);
    },
  };

  MC.drawEnemy = function (ctx, e, t, glow) {
    ctx.save();
    ctx.translate(e.x, e.y);
    if (glow) MC.d.circle(ctx, 0, 0, e.r + 7, 'rgba(160,200,255,0.18)');
    ART[e.kind](ctx, e, t);
    if (e.flash > 0) MC.d.circle(ctx, 0, 0, e.r + 2, 'rgba(255,255,255,0.55)');
    ctx.restore();
  };

  MC.makeEnemy = function (kind, x, y, o = {}) {
    return Object.assign({
      kind, x, y, r: 12, hp: 1, state: 'form',
      color: MC.choice(COLORS), letter: MC.choice(['A', 'B', 'C']), ref: `[${MC.randi(1, 99)}]`,
      phase: Math.random() * 6.28, fireCD: MC.rand(2, 5), flash: 0, value: 50,
      slotX: x, slotY: y, p0x: x, p0y: y, et: 0, delay: 0, vx: 0, vy: 0, shot: false,
    }, o);
  };

  MC.makeWave = function (g, waveNo) {
    const st = g.stage, si = g.stageIdx;
    const rows = waveNo === 0 ? 2 : 3;
    const cols = si < 2 ? 6 : 7;
    const sx = 42, sy = 36;
    const left = W / 2 - (cols - 1) * sx / 2;
    const fromLeftFirst = Math.random() < 0.5;
    const list = [];
    let n = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const leftSide = (c < cols / 2) === fromLeftFirst;
        const startX = leftSide ? -30 : W + 30;
        const startY = MC.rand(150, 260);
        list.push(MC.makeEnemy(st.enemies[(r + waveNo) % st.enemies.length], startX, startY, {
          state: 'enter',
          hp: 1 + (si >= 4 && r === 0 ? 1 : 0),
          slotX: left + c * sx, slotY: 96 + r * sy,
          p0x: startX, p0y: startY,
          delay: n * 0.09,
        }));
        n++;
      }
    }
    return list;
  };

  MC.updateEnemies = function (g, dt) {
    const diff = 1 + g.stageIdx * 0.12;
    g.formX = Math.sin(g.t * 0.8) * 22;
    g.diveT -= dt;
    if (g.diveT <= 0) {
      const ready = g.enemies.filter((e) => e.state === 'form');
      if (ready.length) {
        const e = MC.choice(ready);
        e.state = 'dive';
        e.vy = 150 + g.stageIdx * 14;
        e.shot = false;
      }
      g.diveT = MC.rand(1.3, 2.6) / diff;
    }
    const p = g.player;
    for (const e of g.enemies) {
      e.flash = Math.max(0, e.flash - dt);
      if (e.state === 'enter') {
        if (e.delay > 0) { e.delay -= dt; continue; }
        e.et = Math.min(1, e.et + dt / 1.5);
        const t = e.et, u = 1 - t;
        const tx = e.slotX + g.formX, ty = e.slotY;
        const cx = W / 2 + (e.p0x < 0 ? 70 : -70), cy = H * 0.46;
        e.x = u * u * e.p0x + 2 * u * t * cx + t * t * tx;
        e.y = u * u * e.p0y + 2 * u * t * cy + t * t * ty;
        if (t >= 1) e.state = 'form';
      } else if (e.state === 'form') {
        e.x = e.slotX + g.formX;
        e.y = e.slotY + Math.sin(g.t * 2 + e.phase) * 2.5;
        e.fireCD -= dt;
        if (e.fireCD <= 0) {
          e.fireCD = MC.rand(2.5, 6) / diff;
          if (Math.random() < 0.5) g.enemyShoot(e);
        }
      } else if (e.state === 'dive') {
        e.vx = MC.clamp((p.x - e.x) * 1.4, -130, 130) + Math.sin(g.t * 4 + e.phase) * 50;
        e.x = MC.clamp(e.x + e.vx * dt, 12, W - 12);
        e.y += e.vy * dt;
        if (!e.shot && e.y > 220) { e.shot = true; g.enemyShoot(e); }
        if (e.y > H + 30) {
          if (e.noReturn) e.dead = true;
          else { e.state = 'return'; e.y = -30; }
        }
      } else if (e.state === 'return') {
        e.x += (e.slotX + g.formX - e.x) * Math.min(1, dt * 3);
        e.y += 150 * dt;
        if (e.y >= e.slotY) { e.y = e.slotY; e.state = 'form'; }
      }
    }
    g.enemies = g.enemies.filter((e) => !e.dead);
  };

  // ——— Balas inimigas ———
  MC.drawBullet = function (ctx, b, t, glow) {
    ctx.save();
    ctx.translate(b.x, b.y);
    if (glow) MC.d.circle(ctx, 0, 0, b.r + 5, 'rgba(255,240,180,0.25)');
    line(ctx, 1.3);
    switch (b.kind) {
      case 'block':
        ctx.rotate(t * 3); ctx.fillStyle = b.color; MC.d.rrect(ctx, -b.r, -b.r, b.r * 2, b.r * 2, 2); ctx.fill(); ctx.stroke(); break;
      case 'glitter':
        ctx.rotate(t * 6 + b.x); ctx.fillStyle = b.color; ctx.fillRect(-b.r, -b.r, b.r * 2, b.r * 2); break;
      case 'chalk':
        ctx.rotate(Math.atan2(b.vy, b.vx)); ctx.fillStyle = '#f6f6f2'; MC.d.rrect(ctx, -7, -2.5, 14, 5, 2); ctx.fill(); ctx.stroke(); break;
      case 'bubble':
        MC.d.circle(ctx, 0, 0, b.r, 'rgba(255,255,255,0.85)', '#4dabff', 2.5);
        MC.d.text(ctx, b.text, 0, 0.5, 9, MC.INK, { outline: false, weight: 900 }); break;
      case 'tri':
        ctx.rotate(Math.atan2(b.vy, b.vx) - Math.PI / 2); ctx.fillStyle = '#ffd34d';
        ctx.beginPath(); ctx.moveTo(0, b.r + 2); ctx.lineTo(-b.r, -b.r); ctx.lineTo(b.r, -b.r); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      case 'protr':
        ctx.rotate(t * 4); ctx.fillStyle = 'rgba(160,220,255,0.95)';
        ctx.beginPath(); ctx.arc(0, 2, b.r, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); break;
      case 'arc':
        ctx.rotate(Math.atan2(b.vy, b.vx)); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(-4, 0, b.r + 2, -1, 1); ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(); break;
      case 'card':
        ctx.rotate(Math.sin(t * 8 + b.x) * 0.4); ctx.fillStyle = b.effect === 'yellow' ? '#ffd400' : '#e5484d';
        MC.d.rrect(ctx, -5, -7.5, 10, 15, 1.5); ctx.fill(); ctx.stroke(); break;
      case 'flask':
        ctx.rotate(t * 5); ctx.fillStyle = 'rgba(235,250,255,0.95)';
        ctx.beginPath(); ctx.moveTo(-2, -7); ctx.lineTo(2, -7); ctx.lineTo(2, -2); ctx.lineTo(7, 6); ctx.lineTo(-7, 6); ctx.lineTo(-2, -2); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#52d273'; ctx.fillRect(-5.5, 2, 11, 3.5); break;
      case 'paper':
        ctx.rotate(Math.sin(t * 3 + b.x) * 0.5); ctx.fillStyle = '#fffdf3'; ctx.fillRect(-7, -9, 14, 18); ctx.strokeRect(-7, -9, 14, 18);
        MC.d.text(ctx, 'EXAME', 0, -3, 4.5, '#e5484d', { outline: false, weight: 900 });
        ctx.strokeStyle = '#9aa6b5'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-4, 2); ctx.lineTo(4, 2); ctx.moveTo(-4, 5); ctx.lineTo(4, 5); ctx.stroke(); break;
      case 'clock':
        MC.d.circle(ctx, 0, 0, b.r, '#ffffff', INK, 1.3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -b.r + 2); ctx.moveTo(0, 0); ctx.lineTo(b.r - 3, 0); ctx.stroke(); break;
      case 'pen':
        ctx.rotate(Math.atan2(b.vy, b.vx)); ctx.fillStyle = '#e5484d'; MC.d.rrect(ctx, -6, -2.2, 12, 4.4, 2); ctx.fill(); ctx.stroke(); break;
      case 'ref':
        MC.d.circle(ctx, 0, 0, b.r, '#f1eaff', '#8a5cf6', 2); MC.d.text(ctx, b.text, 0, 0.5, 7.5, '#5b3cc4', { outline: false, weight: 900 }); break;
      case 'invoice':
        ctx.rotate(Math.sin(t * 6 + b.y) * 0.3); ctx.fillStyle = '#fffdf3'; ctx.fillRect(-6, -8, 12, 16); ctx.strokeRect(-6, -8, 12, 16);
        MC.d.text(ctx, '€', 0, 0.5, 9, '#e5484d', { outline: false, weight: 900 }); break;
      case 'car':
        ctx.fillStyle = b.color; MC.d.rrect(ctx, -11, -17, 22, 34, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#bfe6ff'; MC.d.rrect(ctx, -8, 3, 16, 8, 2); ctx.fill(); ctx.stroke();
        MC.d.circle(ctx, -6, 15, 2.2, '#ffe066'); MC.d.circle(ctx, 6, 15, 2.2, '#ffe066'); break;
      case 'cone':
        ctx.fillStyle = '#ff8a3d'; ctx.beginPath(); ctx.moveTo(0, -9); ctx.lineTo(7, 7); ctx.lineTo(-7, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffffff'; ctx.fillRect(-3.5, -1, 7, 2.5); break;
      case 'board':
        ctx.fillStyle = '#1d2340'; MC.d.rrect(ctx, -18, -8, 36, 16, 2); ctx.fill();
        ctx.strokeStyle = '#ffd34d'; ctx.lineWidth = 1.5; ctx.stroke();
        MC.d.text(ctx, 'ATRASADO', 0, 0.5, 7, '#ffd34d', { outline: false, weight: 900 }); break;
      case 'pct':
        MC.d.text(ctx, '%', 0, 0, b.r * 2.2, '#e5484d', { lw: 3, weight: 900 }); break;
      default:
        MC.d.circle(ctx, 0, 0, b.r, b.color || '#ff5d5d', INK, 1.3);
        MC.d.circle(ctx, -b.r * 0.3, -b.r * 0.3, b.r * 0.35, 'rgba(255,255,255,0.8)');
    }
    ctx.restore();
  };
})(window.MC);
