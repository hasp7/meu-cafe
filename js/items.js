'use strict';
// Itens que caem: cafés e chocolate (bons), cervejas e francesinha (maus) e melhorias.
// Bons vêm num círculo verde, maus num losango vermelho, melhorias num hexágono dourado:
// distinguem-se pela forma, não só pela cor.
(function (MC) {
  const INK = MC.INK;
  const line = (ctx, lw = 1.5) => { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };
  const steam = (ctx, x, y, t) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 1.4;
    for (const dx of [-2.5, 2.5]) {
      ctx.beginPath();
      ctx.moveTo(x + dx, y);
      ctx.quadraticCurveTo(x + dx + 2.5 * Math.sin(t * 4 + dx), y - 3, x + dx, y - 6);
      ctx.stroke();
    }
  };

  // Desenhos à volta da origem, com ~20 px.
  const A = MC.ITEM_ART = {
    espresso(ctx, t) {
      line(ctx);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(0, 7, 10, 2.6, 0, 0, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(6.5, 1, 3, -1.4, 1.4); ctx.stroke();
      MC.d.rrect(ctx, -6, -3, 12, 9.5, 3); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#6b3e1f'; ctx.beginPath(); ctx.ellipse(0, -2.6, 5, 1.5, 0, 0, 7); ctx.fill();
      steam(ctx, 0, -5, t);
    },
    americano(ctx, t) {
      line(ctx);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.moveTo(-6.5, -8); ctx.lineTo(6.5, -8); ctx.lineTo(5, 9); ctx.lineTo(-5, 9); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a0643a'; ctx.fillRect(-6, -2, 12, 6); ctx.strokeRect(-6, -2, 12, 6);
      ctx.fillStyle = '#3b2a20'; MC.d.rrect(ctx, -7.5, -11, 15, 3.5, 1.5); ctx.fill(); ctx.stroke();
      steam(ctx, 0, -12, t);
    },
    chocolate(ctx) {
      line(ctx);
      ctx.save(); ctx.rotate(-0.25);
      ctx.fillStyle = '#6b3a1e'; MC.d.rrect(ctx, -9, -6, 18, 12, 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = '#4a2612'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-3, -6); ctx.lineTo(-3, 6); ctx.moveTo(3, -6); ctx.lineTo(3, 6); ctx.moveTo(-9, 0); ctx.lineTo(9, 0); ctx.stroke();
      ctx.fillStyle = '#d6dbe3'; ctx.beginPath(); ctx.moveTo(3, -6); ctx.lineTo(9, -6); ctx.lineTo(9, 6); ctx.lineTo(5, 6); ctx.closePath(); ctx.fill();
      line(ctx); ctx.stroke();
      ctx.restore();
    },
    beer(ctx) {
      line(ctx);
      ctx.fillStyle = '#f7b928'; ctx.beginPath(); ctx.moveTo(-5.5, -6); ctx.lineTo(5.5, -6); ctx.lineTo(4.5, 10); ctx.lineTo(-4.5, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
      MC.d.blob(ctx, [[-3.5, -7, 3.2], [0.5, -8.5, 3.6], [4, -7, 3]]); ctx.fillStyle = '#fffaf0'; ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.fillRect(-3, -2, 1.6, 9);
    },
    mug(ctx) {
      line(ctx);
      ctx.beginPath(); ctx.arc(8.5, 2, 4, -1.5, 1.5); ctx.lineWidth = 3; ctx.strokeStyle = '#c9d3dd'; ctx.stroke(); line(ctx);
      ctx.fillStyle = '#f7b928'; MC.d.rrect(ctx, -8, -5, 16, 15, 2.5); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(-4, 8); ctx.moveTo(0, -2); ctx.lineTo(0, 8); ctx.moveTo(4, -2); ctx.lineTo(4, 8); ctx.stroke();
      MC.d.blob(ctx, [[-5, -6, 3.5], [0, -8, 4], [5, -6, 3.5]]); ctx.fillStyle = '#fffaf0'; ctx.fill();
    },
    bottle(ctx) {
      line(ctx);
      ctx.fillStyle = '#3f8c46';
      ctx.beginPath(); ctx.moveTo(-2.2, -11); ctx.lineTo(2.2, -11); ctx.lineTo(2.2, -5); ctx.quadraticCurveTo(6, -3, 6, 1); ctx.lineTo(6, 10); ctx.lineTo(-6, 10); ctx.lineTo(-6, 1); ctx.quadraticCurveTo(-6, -3, -2.2, -5); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f2e3b3'; ctx.fillRect(-5, 1, 10, 5); ctx.strokeRect(-5, 1, 10, 5);
      ctx.fillStyle = '#d4a017'; ctx.fillRect(-2.6, -12.5, 5.2, 2);
    },
    francesinha(ctx) {
      line(ctx);
      // molho
      ctx.fillStyle = '#e8661e';
      ctx.beginPath(); ctx.ellipse(0, 6, 12, 4, 0, 0, 7); ctx.fill();
      // camadas: pão, carne, pão
      ctx.fillStyle = '#e9c27a'; MC.d.rrect(ctx, -9, 1, 18, 4, 1.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#9a4a2a'; MC.d.rrect(ctx, -9.5, -2, 19, 3, 1.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#e9c27a'; MC.d.rrect(ctx, -9, -6, 18, 4, 1.5); ctx.fill(); ctx.stroke();
      // queijo derretido e molho a escorrer
      ctx.fillStyle = '#ffd34d';
      ctx.beginPath(); ctx.moveTo(-10, -6); ctx.lineTo(10, -6); ctx.lineTo(10, -3); ctx.quadraticCurveTo(7, 1, 6, -3); ctx.quadraticCurveTo(2, 2, 0, -3); ctx.quadraticCurveTo(-4, 1, -6, -3); ctx.lineTo(-10, -3); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#e8661e';
      MC.d.blob(ctx, [[-7, 0, 1.3], [3, 1, 1.2], [8, -1, 1.1]]); ctx.fill();
      // ovo estrelado
      MC.d.blob(ctx, [[-1.5, -8, 4], [2, -8.5, 3.6]]); ctx.fillStyle = '#ffffff'; ctx.fill();
      MC.d.circle(ctx, 0.5, -8.3, 2, '#ffb000');
    },
    laptop(ctx) {
      line(ctx);
      ctx.fillStyle = '#9aa6b5'; MC.d.rrect(ctx, -8, -9, 16, 11, 1.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4dabff'; ctx.fillRect(-6, -7, 12, 7);
      ctx.fillStyle = '#ffffff'; ctx.fillRect(-4.5, -5.5, 6, 1.2); ctx.fillRect(-4.5, -3.5, 8, 1.2);
      ctx.fillStyle = '#c7d0db'; ctx.beginPath(); ctx.moveTo(-10, 3); ctx.lineTo(10, 3); ctx.lineTo(11.5, 7); ctx.lineTo(-11.5, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    },
    antenna(ctx, t) {
      line(ctx, 2);
      ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(-5, 10); ctx.moveTo(0, -1); ctx.lineTo(5, 10); ctx.moveTo(-3, 5); ctx.lineTo(3, 5); ctx.stroke();
      MC.d.circle(ctx, 0, -2, 2.5, '#ff5d5d', INK, 1.2);
      ctx.strokeStyle = '#4dabff'; ctx.lineWidth = 1.6;
      const k = (Math.sin(t * 5) + 1) / 2;
      for (const r of [5 + k, 9 + k]) {
        ctx.beginPath(); ctx.arc(0, -2, r, -2.5, -0.64); ctx.stroke();
      }
    },
    syringe(ctx) {
      ctx.save(); ctx.rotate(-0.7);
      line(ctx);
      ctx.fillStyle = '#e8f6ff'; MC.d.rrect(ctx, -8, -3.5, 13, 7, 1.5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#52d273'; ctx.fillRect(-3, -2.4, 7, 4.8);
      ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-12, 0); ctx.moveTo(-12, -3.5); ctx.lineTo(-12, 3.5); ctx.moveTo(5, 0); ctx.lineTo(12, 0); ctx.stroke();
      ctx.strokeStyle = '#9aa6b5'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(5, 0); ctx.lineTo(12, 0); ctx.stroke();
      ctx.restore();
    },
    stethoscope(ctx) {
      ctx.lineCap = 'round';
      ctx.strokeStyle = INK; ctx.lineWidth = 3.4;
      ctx.beginPath(); ctx.moveTo(-6, -9); ctx.quadraticCurveTo(-7, 3, 0, 3); ctx.quadraticCurveTo(7, 3, 6, -9); ctx.moveTo(0, 3); ctx.quadraticCurveTo(1, 9, 6, 8); ctx.stroke();
      ctx.strokeStyle = '#3d6fd9'; ctx.lineWidth = 2;
      ctx.stroke();
      MC.d.circle(ctx, 7.5, 7.5, 3.2, '#c7d0db', INK, 1.4);
      MC.d.circle(ctx, -6, -9.5, 1.5, INK);
      MC.d.circle(ctx, 6, -9.5, 1.5, INK);
    },
    yellowcard(ctx) {
      line(ctx);
      ctx.save(); ctx.rotate(0.2);
      ctx.fillStyle = '#ffd400'; MC.d.rrect(ctx, -6, -9, 12, 18, 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    },
    goldball(ctx, t) {
      MC.d.circle(ctx, 0, 0, 10, '#ffd34d', INK, 1.6);
      ctx.save(); ctx.rotate(t * 2);
      ctx.fillStyle = '#c98a00';
      ctx.beginPath();
      for (let i = 0; i < 5; i++) { const a = i * 1.2566 - 1.57; ctx.lineTo(Math.cos(a) * 3.8, Math.sin(a) * 3.8); }
      ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(-3.5, -4, 2.2, 0, 7); ctx.fill();
    },
  };

  // Efeitos. apply(jogador, jogo) pode devolver um texto que substitui o rótulo.
  MC.ITEMS = {
    espresso: { cls: 'good', label: 'Expresso!', apply(p) { p.addBuff({ id: 'espresso', art: 'espresso', dur: 5, speed: 1.35, fire: 1.7, good: true }); p.coffee(); } },
    americano: { cls: 'good', label: 'Americano!', apply(p) { p.addBuff({ id: 'americano', art: 'americano', dur: 12, speed: 1.18, fire: 1.3, good: true }); p.coffee(); } },
    chocolate: {
      cls: 'good', label: 'Chocolate!',
      apply(p, g) {
        if (!g.phaseB) { p.addBuff({ id: 'chocolate', art: 'chocolate', dur: 8, speed: 1.3, good: true }); return; }
        p.addBuff({ id: 'acucar', art: 'chocolate', dur: 5, speed: 1.55, fire: 1.3, good: true, then: { id: 'quebra', art: 'chocolate', dur: 3, speed: 0.75, good: false } });
        return 'Pico de açúcar!';
      },
    },
    beer: {
      cls: 'bad', label: 'Cerveja…',
      apply(p, g) { p.addBuff({ id: 'cerveja', art: 'beer', dur: 5, speed: 0.72 }); if (g.phaseB) { p.tempShield = 5; return 'Cerveja… mas com escudo'; } },
    },
    mug: {
      cls: 'bad', label: 'Caneca…',
      apply(p, g) { p.addBuff({ id: 'caneca', art: 'mug', dur: 7, speed: 0.6 }); if (g.phaseB) { p.tempShield = 6; return 'Caneca… mas com escudo'; } },
    },
    bottle: {
      cls: 'bad', label: 'Garrafa… tudo a abanar',
      apply(p, g) { p.addBuff({ id: 'garrafa', art: 'bottle', dur: 6, speed: 0.75, wobble: true }); if (g.phaseB) { p.tempShield = 5; return 'Garrafa… mas com escudo'; } },
    },
    francesinha: {
      cls: 'bad', label: 'Francesinha… pesada',
      apply(p, g) {
        if (!g.phaseB) { p.addBuff({ id: 'francesinha', art: 'francesinha', dur: 8, speed: 0.5 }); return; }
        p.addBuff({ id: 'tanque', art: 'francesinha', dur: 8, speed: 0.65 });
        p.shield = Math.max(p.shield, 1);
        return 'Modo tanque!';
      },
    },
    laptop: { cls: 'up', label: 'Portátil: drone ajudante!', apply(p) { p.drone = 20; } },
    antenna: { cls: 'up', label: 'Antena: tiro triplo!', apply(p) { p.spread = 15; } },
    syringe: { cls: 'up', label: 'Seringa: tiro perfurante!', apply(p) { p.pierce = 10; } },
    stethoscope: {
      cls: 'up', label: 'Estetoscópio: +1 vida!',
      apply(p) { if (p.lives < 5) { p.lives++; return; } p.shield = Math.max(p.shield, 1); return 'Estetoscópio: escudo!'; },
    },
    goldball: { cls: 'up', label: 'Bola de ouro! +5000', apply(p, g) { g.addScore(5000); } },
  };

  MC.SKY_DROPS = [['espresso', 17], ['americano', 16], ['chocolate', 15], ['beer', 14], ['mug', 13], ['bottle', 12], ['francesinha', 13]];
  MC.UPGRADES = [['laptop', 3], ['antenna', 3], ['syringe', 3], ['stethoscope', 2]];

  const BADGE = {
    good: { fill: 'rgba(255,255,255,0.88)', ring: '#22a861' },
    bad: { fill: 'rgba(255,238,238,0.92)', ring: '#e5484d' },
    up: { fill: 'rgba(255,249,222,0.94)', ring: '#e0a000' },
  };

  MC.drawBadge = function (ctx, cls, r) {
    const b = BADGE[cls];
    ctx.beginPath();
    if (cls === 'good') ctx.arc(0, 0, r, 0, Math.PI * 2);
    else if (cls === 'bad') { ctx.moveTo(0, -r * 1.15); ctx.lineTo(r * 1.15, 0); ctx.lineTo(0, r * 1.15); ctx.lineTo(-r * 1.15, 0); ctx.closePath(); }
    else for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; ctx.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 1.05); }
    ctx.closePath();
    ctx.fillStyle = b.fill;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = b.ring;
    ctx.stroke();
  };

  MC.drawItem = function (ctx, type, x, y, t, scale = 1) {
    const def = MC.ITEMS[type];
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.rotate(Math.sin(t * 2.5) * 0.12);
    MC.drawBadge(ctx, def.cls, 15);
    A[type](ctx, t);
    ctx.restore();
  };
})(window.MC);
