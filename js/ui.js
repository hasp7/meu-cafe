'use strict';
// Interface: HUD, botões, ecrãs de título, pausa, fim e vitória.
(function (MC) {
  const { W, H, INK } = MC;
  const T = MC.d.text;

  const CHARGE = { x: W - 50, y: H - 56, r: 34 };
  const PAUSE = { x: W - 24, y: 24, r: 17 };
  const rect = (x, y, w, h) => ({ x, y, w, h });
  const BTN = {
    play: rect(W / 2 - 95, 446, 190, 58),
    mute: rect(W / 2 - 80, 518, 160, 38),
    resume: rect(W / 2 - 95, 300, 190, 56),
    menu: rect(W / 2 - 95, 372, 190, 50),
    again: rect(W / 2 - 95, 440, 190, 56),
    home: rect(W / 2 - 95, 510, 190, 46),
  };
  const inRect = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const inCircle = (p, c, pad = 10) => (p.x - c.x) ** 2 + (p.y - c.y) ** 2 < (c.r + pad) ** 2;

  function button(ctx, r, label, color, size = 22) {
    ctx.save();
    MC.d.rrect(ctx, r.x, r.y + 4, r.w, r.h, 16);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fill();
    MC.d.rrect(ctx, r.x, r.y, r.w, r.h, 16);
    ctx.fillStyle = color; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
    T(ctx, label, r.x + r.w / 2, r.y + r.h / 2 + 1, size, '#ffffff');
    ctx.restore();
  }
  function bolt(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(3, -12); ctx.lineTo(-7, 2); ctx.lineTo(-1, 2); ctx.lineTo(-4, 12); ctx.lineTo(7, -3); ctx.lineTo(1, -3); ctx.closePath();
    ctx.fillStyle = color; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke();
    ctx.restore();
  }
  function panel(ctx, y, h) {
    MC.d.rrect(ctx, 22, y, W - 44, h, 22);
    ctx.fillStyle = 'rgba(255,255,255,0.93)'; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = INK; ctx.stroke();
  }
  function bubble(ctx, x, y, text) {
    ctx.font = `800 12px ${MC.FONT}`;
    const w = ctx.measureText(text).width + 18, h = 26;
    const bx = MC.clamp(x - w / 2, 6, W - w - 6), by = y - h;
    MC.d.rrect(ctx, bx, by, w, h, 10);
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = INK; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - 5, by + h - 1); ctx.lineTo(x + 5, by + h - 1); ctx.lineTo(x, by + h + 7); ctx.closePath();
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
    ctx.fillRect(x - 4, by + h - 3, 8, 3);
    T(ctx, text, bx + w / 2, by + h / 2 + 0.5, 12, INK, { outline: false });
  }

  MC.ui = {
    hitPause: (p) => inCircle(p, PAUSE, 8),
    hitCharge: (p) => inCircle(p, CHARGE, 14),

    handleTap(g, p) {
      const primary = !!p.key;
      if (g.state === 'title') {
        if (!primary && inRect(p, BTN.mute)) { MC.audio.toggle(); return; }
        if (primary || inRect(p, BTN.play)) g.newGame();
      } else if (g.state === 'card') {
        g.cardT = Math.min(g.cardT, 0.3);
      } else if (g.state === 'paused') {
        if (!primary && inRect(p, BTN.menu)) g.toTitle();
        else if (primary || inRect(p, BTN.resume)) g.resume();
      } else if (g.state === 'gameover' || g.state === 'victory') {
        if (g.endT < 0.8) return;
        if (!primary && inRect(p, BTN.home)) g.toTitle();
        else if (primary || inRect(p, BTN.again)) g.newGame();
      }
    },

    drawHUD(ctx, g) {
      const p = g.player;
      T(ctx, String(g.score), 12, 20, 20, '#ffffff', { align: 'left' });
      T(ctx, `Recorde ${Math.max(g.best, g.score)}`, 12, 40, 10, '#ffffff', { align: 'left', lw: 3 });
      for (let i = 0; i < p.lives; i++) {
        const lx = 20 + i * 24;
        MC.d.blob(ctx, [[lx - 5, 58, 4.5], [lx, 55, 5.5], [lx + 5, 58, 4.5]]);
        ctx.fillStyle = MC.CHARACTER.cloud; ctx.fill(); ctx.lineWidth = 1.3; ctx.strokeStyle = INK; ctx.stroke();
      }

      // estado do herói: efeitos ativos com o tempo que falta
      const icons = [];
      for (const b of p.buffs) icons.push({ art: b.art, frac: b.t / b.dur, cls: b.good ? 'good' : 'bad' });
      if (p.drone > 0) icons.push({ art: 'laptop', frac: p.drone / 20, cls: 'up' });
      if (p.spread > 0) icons.push({ art: 'antenna', frac: p.spread / 15, cls: 'up' });
      if (p.pierce > 0) icons.push({ art: 'syringe', frac: p.pierce / 10, cls: 'up' });
      icons.slice(0, 7).forEach((ic, i) => {
        const x = 20 + i * 30, y = 84;
        const ring = ic.cls === 'good' ? '#22a861' : ic.cls === 'bad' ? '#e5484d' : '#e0a000';
        MC.d.circle(ctx, x, y, 12, 'rgba(255,255,255,0.85)');
        ctx.beginPath(); ctx.arc(x, y, 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ic.frac);
        ctx.lineWidth = 3; ctx.strokeStyle = ring; ctx.stroke();
        ctx.save(); ctx.translate(x, y); ctx.scale(0.6, 0.6); MC.ITEM_ART[ic.art](ctx, g.t); ctx.restore();
      });

      const st = g.stage;
      T(ctx, st.label, W / 2, 16, 10, '#ffffff', { lw: 3 });
      T(ctx, st.name, W / 2, 30, 12, '#ffffff', { lw: 3 });

      if (g.boss && !g.boss.entering && !g.boss.hidden) {
        const b = g.boss, bw = 150, bx = W / 2 - bw / 2, by = 46;
        T(ctx, b.name, W / 2, by - 1, 9, '#ffffff', { lw: 3 });
        MC.d.rrect(ctx, bx, by + 6, bw, 8, 4); ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fill();
        MC.d.rrect(ctx, bx, by + 6, Math.max(4, bw * b.hp / b.hpMax), 8, 4); ctx.fillStyle = b.shieldUp ? '#8a5cf6' : '#e5484d'; ctx.fill();
        MC.d.rrect(ctx, bx, by + 6, bw, 8, 4); ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke();
      }

      // pausa
      MC.d.circle(ctx, PAUSE.x, PAUSE.y, PAUSE.r, 'rgba(255,255,255,0.85)', INK, 2);
      ctx.fillStyle = INK; ctx.fillRect(PAUSE.x - 5, PAUSE.y - 6, 3.5, 12); ctx.fillRect(PAUSE.x + 1.5, PAUSE.y - 6, 3.5, 12);

      // botão da onda de energia
      const c = CHARGE;
      MC.d.circle(ctx, c.x, c.y, c.r, p.cooldown > 0 ? 'rgba(60,64,90,0.55)' : 'rgba(29,35,64,0.6)', INK, 2.5);
      if (p.cooldown > 0) {
        ctx.beginPath(); ctx.moveTo(c.x, c.y); ctx.arc(c.x, c.y, c.r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (1 - p.cooldown / 3.5)); ctx.closePath();
        ctx.fillStyle = 'rgba(143,227,255,0.25)'; ctx.fill();
      } else if (p.charge > 0) {
        ctx.beginPath(); ctx.arc(c.x, c.y, c.r - 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p.charge);
        ctx.lineWidth = 6; ctx.strokeStyle = MC.CHARACTER.aura; ctx.stroke();
      }
      bolt(ctx, c.x, c.y, 1.25, p.cooldown > 0 ? '#9aa6b5' : '#ffd34d');

      // ajudas do primeiro nível
      if (g.stageIdx === 0 && g.stageT < 7) {
        const a = Math.min(1, (7 - g.stageT) / 1.5);
        ctx.globalAlpha = a;
        T(ctx, '← arrasta o dedo para voar →', W / 2 - 30, H - 18, 12, '#ffffff', { lw: 3 });
        T(ctx, 'segura e larga', c.x, c.y - c.r - 12, 10, '#ffffff', { lw: 3 });
        ctx.globalAlpha = 1;
      }
      if (g.demo) T(ctx, 'DEMO', W / 2, H - 14, 12, '#ffd34d', { lw: 3 });

      if (p.bubble) bubble(ctx, p.x, p.y - 50, p.bubble.text);
    },

    drawBanner(ctx, g) {
      const b = g.bannerInfo;
      if (!b) return;
      const a = Math.min(1, b.t / 0.4, (b.dur - b.t) / 0.3 + 0.001);
      ctx.globalAlpha = MC.clamp(a, 0, 1);
      T(ctx, b.text, W / 2, H * 0.42, 26, '#ffd34d', { lw: 6 });
      if (b.sub) T(ctx, b.sub, W / 2, H * 0.42 + 30, 15, '#ffffff', { lw: 4 });
      ctx.globalAlpha = 1;
    },

    drawCard(ctx, g) {
      ctx.fillStyle = 'rgba(14,20,48,0.35)'; ctx.fillRect(0, 0, W, H);
      panel(ctx, 150, 250);
      const st = g.stage, w = g.weather.info;
      T(ctx, st.label.toUpperCase(), W / 2, 186, 16, '#f08a24', { outline: false, weight: 900 });
      T(ctx, st.name, W / 2, 220, 26, INK, { outline: false, weight: 900 });
      T(ctx, `Céu: ${w.name}`, W / 2, 262, 14, '#1f4fa0', { outline: false });
      wrap(ctx, w.tip, W / 2, 284, W - 80, 12, '#46506e');
      wrap(ctx, st.tip, W / 2, 330, W - 80, 13, INK);
      T(ctx, 'toca para começar', W / 2, 382, 11, '#7c8a9b', { outline: false, weight: 700 });
    },

    drawTitle(ctx, g) {
      T(ctx, 'Onde Está', W / 2, 92, 34, '#ffffff', { lw: 8 });
      T(ctx, 'o Meu Café?', W / 2, 134, 38, '#ffd34d', { lw: 8 });
      ctx.save(); ctx.translate(W / 2, 318); ctx.scale(2.7, 2.7);
      MC.drawHero(ctx, 0, 0, g.t, { charge: (Math.sin(g.t * 1.2) + 1) / 2 * 0.6 });
      ctx.restore();
      // bons à esquerda, maus à direita, com o centro livre para a onda de energia
      const items = [['espresso', 40, 205], ['americano', 74, 262], ['chocolate', 40, 319], ['beer', 320, 205], ['mug', 286, 262], ['francesinha', 320, 319]];
      items.forEach(([k, x, y], i) => MC.drawItem(ctx, k, x, y + Math.sin(g.t * 2 + i) * 4, g.t + i, 0.85));
      button(ctx, BTN.play, 'Jogar', '#f08a24', 26);
      button(ctx, BTN.mute, MC.audio.muted ? 'Som: desligado' : 'Som: ligado', '#1f4fa0', 15);
      T(ctx, `Recorde: ${g.best}`, W / 2, 578, 13, '#ffffff', { lw: 3 });
      T(ctx, 'Arrasta para voar · Segura ⚡ para a onda de energia', W / 2, 602, 10, '#ffffff', { lw: 3 });
      T(ctx, 'Feito com IA generativa · Claude Code', W / 2, 624, 9, 'rgba(255,255,255,0.85)', { lw: 2.5, weight: 700 });
    },

    drawPaused(ctx) {
      ctx.fillStyle = 'rgba(14,20,48,0.55)'; ctx.fillRect(0, 0, W, H);
      T(ctx, 'Pausa', W / 2, 240, 40, '#ffffff', { lw: 8 });
      button(ctx, BTN.resume, 'Continuar', '#f08a24');
      button(ctx, BTN.menu, 'Menu', '#1f4fa0', 18);
    },

    drawEnd(ctx, g, won) {
      ctx.fillStyle = won ? 'rgba(14,20,48,0.25)' : 'rgba(14,20,48,0.55)'; ctx.fillRect(0, 0, W, H);
      if (won) {
        for (const c of g.confetti) { ctx.fillStyle = c.color; ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.fillRect(-3, -5, 6, 10); ctx.restore(); }
        T(ctx, 'Mestre!', W / 2, 92, 46, '#ffd34d', { lw: 9 });
        T(ctx, 'Finalmente… café.', W / 2, 136, 18, '#ffffff', { lw: 5 });
        ctx.save(); ctx.translate(W / 2, 262); ctx.scale(2.1, 2.1);
        MC.drawHero(ctx, 0, 0, g.t, { coffee: true });
        ctx.restore();
      } else {
        T(ctx, 'Fim de jogo', W / 2, 180, 38, '#ffffff', { lw: 8 });
        T(ctx, 'Ainda sem café…', W / 2, 222, 17, '#ffd34d', { lw: 5 });
        T(ctx, `Chegaste a: ${g.stage.name}`, W / 2, 262, 14, '#ffffff', { lw: 4 });
      }
      T(ctx, `Pontuação ${g.score}`, W / 2, 374, 24, '#ffffff', { lw: 6 });
      T(ctx, g.newBest ? 'Novo recorde!' : `Recorde ${g.best}`, W / 2, 406, 15, g.newBest ? '#ffd34d' : '#ffffff', { lw: 4 });
      button(ctx, BTN.again, won ? 'Jogar outra vez' : 'Recomeçar', '#f08a24', won ? 18 : 22);
      button(ctx, BTN.home, 'Menu', '#1f4fa0', 17);
    },
  };

  function wrap(ctx, text, x, y, maxW, size, color) {
    ctx.font = `700 ${size}px ${MC.FONT}`;
    const words = text.split(' ');
    const lines = [];
    let cur = '';
    for (const w of words) {
      const test = cur ? cur + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
    lines.forEach((l, i) => T(ctx, l, x, y + i * (size + 5), size, color, { outline: false, weight: 700 }));
  }
})(window.MC);
