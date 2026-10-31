'use strict';
// Chefes (professores-tipo, nunca pessoas reais) e mini-chefes da vida adulta.
(function (MC) {
  const { W, H, INK } = MC;
  const line = (ctx, lw = 1.8) => { ctx.lineWidth = lw; ctx.strokeStyle = INK; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; };

  // ——— desenho genérico de professor ———
  function drawTeacher(ctx, b, o) {
    line(ctx);
    // braços
    ctx.strokeStyle = INK; ctx.lineWidth = 9;
    ctx.beginPath(); ctx.moveTo(-22, 2); ctx.lineTo(-34, 18); ctx.moveTo(22, 2); ctx.lineTo(34, 14); ctx.stroke();
    ctx.strokeStyle = o.coat; ctx.lineWidth = 6.5; ctx.stroke();
    MC.d.circle(ctx, -34, 18, 5, o.skin, INK, 1.5);
    // corpo
    line(ctx);
    ctx.fillStyle = o.coat;
    ctx.beginPath(); ctx.moveTo(-22, -2); ctx.lineTo(22, -2); ctx.lineTo(28, 38); ctx.lineTo(-28, 38); ctx.closePath(); ctx.fill(); ctx.stroke();
    if (o.coat2) { ctx.fillStyle = o.coat2; ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(7, -2); ctx.lineTo(4, 38); ctx.lineTo(-4, 38); ctx.closePath(); ctx.fill(); }
    // cabeça
    if (o.hairStyle === 'long') { ctx.fillStyle = o.hair; MC.d.rrect(ctx, -20, -40, 40, 40, 14); ctx.fill(); }
    MC.d.circle(ctx, 0, -22, 18, o.skin, INK, 1.8);
    ctx.fillStyle = o.hair;
    if (o.hairStyle === 'bun') {
      MC.d.circle(ctx, 0, -46, 8, o.hair, INK, 1.5);
      ctx.beginPath(); ctx.arc(0, -24, 18.5, Math.PI * 1.05, Math.PI * 1.95); ctx.quadraticCurveTo(0, -30, -18, -27); ctx.fill();
    } else if (o.hairStyle === 'short' || o.hairStyle === 'long') {
      ctx.beginPath(); ctx.arc(0, -24, 19, Math.PI * 1.0, Math.PI * 2.0); ctx.quadraticCurveTo(6, -33, -19, -25); ctx.fill();
    } else if (o.hairStyle === 'bald') {
      ctx.beginPath(); ctx.arc(-15, -20, 5, 0, 7); ctx.arc(15, -20, 5, 0, 7); ctx.fill();
    }
    MC.d.eyes(ctx, 0, -22, 1.5, MC.clamp((b.lookX || 0) / 60, -1, 1));
    if (o.glasses) {
      ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
      for (const ex of [-5.5, 5.5]) { ctx.beginPath(); ctx.arc(ex, -22, 5.5, 0, 7); ctx.stroke(); }
    }
    ctx.strokeStyle = INK; ctx.lineWidth = 2;
    const stern = b.hp < b.hpMax / 2;
    ctx.beginPath(); ctx.moveTo(-10, stern ? -31 : -32); ctx.lineTo(-3, stern ? -29 : -31); ctx.moveTo(10, stern ? -31 : -32); ctx.lineTo(3, stern ? -29 : -31); ctx.stroke();
    ctx.beginPath();
    if (stern) { ctx.moveTo(-5, -11); ctx.quadraticCurveTo(0, -15, 5, -11); }
    else { ctx.arc(0, -15, 5, 0.15 * Math.PI, 0.85 * Math.PI); }
    ctx.stroke();
    if (o.prop) { ctx.save(); ctx.translate(36, 10); o.prop(ctx, b); ctx.restore(); }
  }

  function aim(g, x, y, speed, offsets, o) {
    const a = Math.atan2(g.player.y - y, g.player.x - x);
    for (const off of offsets) g.bullet(Object.assign({ x, y, vx: Math.cos(a + off) * speed, vy: Math.sin(a + off) * speed }, o));
  }
  const sway = (b, speed, amp) => { b.x = W / 2 + Math.sin(b.t * speed) * amp; };
  const timer = (b, key, dt, every, fn) => { b[key] -= dt; if (b[key] <= 0) { b[key] = every; fn(); } };

  const BOSSES = {
    educadora: () => ({
      name: 'A Educadora', hp: 60, r: 38,
      update(g, dt) {
        sway(this, 0.8, 110);
        const e = this.hp < this.hpMax / 2;
        timer(this, 'a1', dt, e ? 0.95 : 1.5, () => aim(g, this.x, this.y + 20, 150, [-0.28, 0, 0.28], { kind: 'block', r: 7, color: MC.choice(['#ff5d5d', '#4dabff', '#52d273', '#ffb02e']) }));
        timer(this, 'a2', dt, 3.6, () => {
          for (let i = 0; i < 14; i++) {
            const a = Math.PI / 2 + (i - 6.5) * 0.13, s = MC.rand(90, 130);
            g.bullet({ x: this.x, y: this.y + 20, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 3, kind: 'glitter', color: MC.choice(['#ff5dc8', '#ffd34d', '#4dabff', '#52d273']) });
          }
        });
      },
      draw(ctx) {
        drawTeacher(ctx, this, {
          skin: '#f5d0b0', hair: '#8a4b2a', hairStyle: 'bun', coat: '#ff8fc7', coat2: '#ffd1e8',
          prop(c) { c.rotate(-0.5); line(c); c.fillStyle = '#4dabff'; MC.d.rrect(c, -5, -22, 10, 30, 2); c.fill(); c.stroke(); c.fillStyle = '#ffffff'; c.fillRect(-5, -10, 10, 8); c.fillStyle = '#4dabff'; c.beginPath(); c.moveTo(-5, -22); c.lineTo(5, -22); c.lineTo(0, -32); c.closePath(); c.fill(); c.stroke(); },
        });
      },
    }),

    primaria: () => ({
      name: 'A Professora Primária', hp: 85, r: 38,
      update(g, dt) {
        sway(this, 0.9, 115);
        const e = this.hp < this.hpMax / 2;
        timer(this, 'a1', dt, e ? 0.6 : 0.9, () => aim(g, this.x - 30, this.y + 25, 250, [0], { kind: 'chalk', r: 4 }));
        timer(this, 'a2', dt, e ? 2.4 : 3.2, () => {
          const [a, b2] = MC.choice([[7, 8], [6, 9], [8, 7], [9, 6], [7, 6], [8, 9]]);
          g.bullet({ x: this.x, y: this.y + 30, vx: 0, vy: 60, r: 15, kind: 'bubble', text: `${a}×${b2}?`, homing: 25, hp: 3, life: 9 });
        });
      },
      draw(ctx) {
        line(ctx);
        ctx.fillStyle = '#2f5d3a'; MC.d.rrect(ctx, -58, -52, 116, 46, 4); ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#a0643a'; ctx.stroke();
        MC.d.text(ctx, '7 × 8 = ?', 0, -30, 14, '#f6f6f2', { outline: false });
        drawTeacher(ctx, this, {
          skin: '#e8b98f', hair: '#2b2b33', hairStyle: 'short', glasses: true, coat: '#4dabff', coat2: '#ffffff',
          prop(c) { line(c); c.fillStyle = '#f6f6f2'; MC.d.rrect(c, -3, -10, 6, 16, 2); c.fill(); c.stroke(); },
        });
      },
    }),

    matematica: () => ({
      name: 'O Professor de Matemática', hp: 110, r: 38,
      update(g, dt) {
        sway(this, 1.0, 120);
        const e = this.hp < this.hpMax / 2;
        timer(this, 'a1', dt, e ? 1.9 : 2.6, () => {
          for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6 + this.t; g.bullet({ x: this.x, y: this.y + 10, vx: Math.cos(a) * 115, vy: Math.sin(a) * 115, r: 6, kind: 'tri' }); }
        });
        timer(this, 'a2', dt, e ? 1.5 : 2.0, () => g.bullet({ x: this.x, y: this.y + 30, vx: MC.choice([-130, 130]), vy: 140, r: 9, kind: 'protr', bounce: true }));
      },
      draw(ctx) {
        drawTeacher(ctx, this, {
          skin: '#f0c8a0', hair: '#6b6b75', hairStyle: 'bald', glasses: true, coat: '#6b8e23', coat2: '#e9edf2',
          prop(c) { c.rotate(-0.3); line(c); c.fillStyle = '#ffd34d'; MC.d.rrect(c, -4, -36, 8, 44, 1.5); c.fill(); c.stroke(); c.lineWidth = 1; for (let y = -32; y < 6; y += 5) { c.beginPath(); c.moveTo(-4, y); c.lineTo(0, y); c.stroke(); } },
        });
      },
    }),

    arbitro: () => ({
      name: 'O Árbitro-Robô', hp: 100, r: 38,
      update(g, dt) {
        sway(this, 1.1, 120);
        const e = this.hp < this.hpMax / 2;
        timer(this, 'a1', dt, e ? 1.4 : 1.9, () => aim(g, this.x, this.y + 20, 160, [-0.3, -0.15, 0, 0.15, 0.3], { kind: 'arc', r: 6 }));
        timer(this, 'a2', dt, e ? 0.9 : 1.2, () => {
          const yellow = Math.random() < 0.75;
          aim(g, this.x + 30, this.y + 10, 190, [MC.rand(-0.15, 0.15)], { kind: 'card', r: 7, effect: yellow ? 'yellow' : 'hit' });
        });
      },
      onDeath(g) { g.dropItem('goldball', this.x - 20, this.y); },
      draw(ctx) {
        line(ctx);
        // corpo às riscas pretas e brancas
        ctx.save();
        ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(26, -2); ctx.lineTo(30, 38); ctx.lineTo(-30, 38); ctx.closePath();
        ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.clip();
        ctx.fillStyle = '#1d2340'; for (let x = -30; x < 30; x += 12) ctx.fillRect(x, -2, 6, 40);
        ctx.restore();
        ctx.beginPath(); ctx.moveTo(-26, -2); ctx.lineTo(26, -2); ctx.lineTo(30, 38); ctx.lineTo(-30, 38); ctx.closePath(); ctx.stroke();
        // cabeça de robô
        ctx.fillStyle = '#c7d0db'; MC.d.rrect(ctx, -22, -42, 44, 36, 8); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, -42); ctx.lineTo(0, -52); ctx.stroke();
        MC.d.circle(ctx, 0, -54, 4, this.hp < this.hpMax / 2 ? '#e5484d' : '#ffd400', INK, 1.5);
        ctx.fillStyle = '#1d2340'; MC.d.rrect(ctx, -16, -34, 32, 13, 5); ctx.fill();
        MC.d.circle(ctx, -7, -27.5, 3.5, '#8fe3ff'); MC.d.circle(ctx, 7, -27.5, 3.5, '#8fe3ff');
        // apito e cartões
        ctx.save(); ctx.translate(0, 12); MC.ENEMY_ART.whistle(ctx, {}, 0); ctx.restore();
        ctx.save(); ctx.translate(36, 8); ctx.rotate(0.3); ctx.fillStyle = '#ffd400'; MC.d.rrect(ctx, -6, -9, 12, 18, 2); ctx.fill(); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.translate(-36, 10); ctx.rotate(-0.3); ctx.fillStyle = '#e5484d'; MC.d.rrect(ctx, -6, -9, 12, 18, 2); ctx.fill(); ctx.stroke(); ctx.restore();
      },
    }),

    fisica: () => ({
      name: 'A Professora de Física e Química', hp: 130, r: 38,
      update(g, dt) {
        sway(this, 0.85, 120);
        const e = this.hp < this.hpMax / 2;
        timer(this, 'a1', dt, e ? 0.7 : 1.0, () => g.bullet({ x: this.x + 30, y: this.y + 10, vx: MC.rand(-110, 110), vy: MC.rand(-80, -30), gravity: 240, r: 8, kind: 'flask' }));
        timer(this, 'a2', dt, e ? 2.4 : 3.2, () => {
          for (let i = 0; i < 6; i++) g.bullet({ x: MC.rand(20, W - 20), y: -10 - i * 18, vx: 0, vy: MC.rand(100, 140), r: 9, kind: 'paper', sway: true });
        });
      },
      draw(ctx) {
        drawTeacher(ctx, this, {
          skin: '#d9a77c', hair: '#3b2a20', hairStyle: 'long', glasses: true, coat: '#ffffff', coat2: '#52d273',
          prop(c) { c.scale(1.4, 1.4); MC.ENEMY_ART.flask(c, {}, 0); },
        });
        // óculos de proteção
        ctx.fillStyle = 'rgba(143,227,255,0.35)'; MC.d.rrect(ctx, -14, -28, 28, 12, 5); ctx.fill();
      },
    }),

    professor: () => ({
      name: 'O Professor Universitário', hp: 150, r: 38, laser: null,
      update(g, dt) {
        sway(this, 0.75, 115);
        const e = this.hp < this.hpMax / 2;
        if (this.laser) {
          const L = this.laser;
          L.t -= dt;
          if (L.phase === 'aim' && L.t <= 0) { L.phase = 'fire'; L.t = 0.45; MC.sfx.bad(); }
          else if (L.phase === 'fire') {
            if (Math.abs(g.player.x - L.x) < 9 + g.player.r) g.hurtPlayer();
            if (L.t <= 0) this.laser = null;
          }
        }
        timer(this, 'a1', dt, e ? 3.0 : 4.0, () => { if (!this.laser) this.laser = { phase: 'aim', t: 1.0, x: g.player.x }; });
        timer(this, 'a2', dt, e ? 1.2 : 1.7, () => aim(g, this.x, this.y + 25, 150, [-0.4, -0.2, 0, 0.2, 0.4], { kind: 'clock', r: 7 }));
      },
      drawFx(ctx) {
        const L = this.laser;
        if (!L) return;
        if (L.phase === 'aim') {
          ctx.strokeStyle = 'rgba(229,72,77,0.8)'; ctx.lineWidth = 2; ctx.setLineDash([8, 8]);
          ctx.beginPath(); ctx.moveTo(L.x, this.y + 30); ctx.lineTo(L.x, H); ctx.stroke(); ctx.setLineDash([]);
          MC.d.text(ctx, '!', L.x, this.y + 52, 18, '#e5484d');
        } else {
          ctx.fillStyle = 'rgba(229,72,77,0.55)'; ctx.fillRect(L.x - 9, this.y + 30, 18, H);
          ctx.fillStyle = 'rgba(255,220,220,0.9)'; ctx.fillRect(L.x - 3, this.y + 30, 6, H);
        }
      },
      draw(ctx) {
        line(ctx);
        ctx.fillStyle = '#ffffff'; MC.d.rrect(ctx, -60, -56, 120, 44, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#4dabff'; ctx.fillRect(-48, -40, 26, 5); ctx.fillRect(-48, -31, 40, 5);
        ctx.fillStyle = '#ff8a3d'; ctx.fillRect(18, -46, 8, 28); ctx.fillRect(30, -38, 8, 20); ctx.fillRect(42, -30, 8, 12);
        drawTeacher(ctx, this, {
          skin: '#f0c8a0', hair: '#d0d4da', hairStyle: 'short', glasses: true, coat: '#6b4f3a', coat2: '#e9edf2',
          prop(c) { c.rotate(-0.6); line(c); c.fillStyle = '#c7d0db'; MC.d.rrect(c, -2.5, -22, 5, 26, 2); c.fill(); c.stroke(); MC.d.circle(c, 0, -23, 3, '#e5484d'); },
        });
      },
    }),

    juri: () => ({
      name: 'O Júri do Mestrado', hp: 210, r: 50, shieldUp: true, shieldT: 0, storm: 0, stormCD: 2, spiral: 0, emitT: 0,
      breakShield(g) {
        this.shieldUp = false; this.shieldT = 6;
        g.popup('Escudo partido!', this.x, this.y + 60, '#8fe3ff');
      },
      update(g, dt) {
        sway(this, 0.5, 90);
        const e = this.hp < this.hpMax / 2;
        if (!this.shieldUp) {
          this.shieldT -= dt;
          if (this.shieldT <= 0) { this.shieldUp = true; g.popup('Nova revisão pedida!', this.x, this.y + 60, '#e5484d'); }
        }
        if (this.storm > 0) {
          this.storm -= dt;
          this.emitT -= dt;
          if (this.emitT <= 0) {
            this.emitT = e ? 0.09 : 0.12;
            this.spiral += 0.38;
            for (const off of [0, Math.PI]) {
              const a = this.spiral + off;
              g.bullet({ x: this.x, y: this.y + 10, vx: Math.cos(a) * 125, vy: Math.abs(Math.sin(a)) * 125 + 30, r: 4, kind: 'pen' });
            }
          }
        } else {
          this.stormCD -= dt;
          if (this.stormCD <= 0) { this.storm = 2.5; this.stormCD = 6; }
        }
        timer(this, 'a2', dt, e ? 2.2 : 3.0, () => {
          for (let i = 0; i < 5; i++) {
            g.bullet({ x: this.x + (i - 2) * 22, y: this.y + 30, vx: (i - 2) * 30, vy: 70, r: 8, kind: 'ref', text: `[${MC.randi(1, 99)}]`, homing: 30, hp: 1, life: 8 });
          }
        });
      },
      draw(ctx, g) {
        line(ctx);
        const heads = [[-34, '#e8b98f', '#2b2b33', 'short'], [0, '#f0c8a0', '#d0d4da', 'bald'], [34, '#d9a77c', '#6b3a1e', 'bun']];
        for (const [hx, skin, hair, style] of heads) {
          ctx.save(); ctx.translate(hx, -4); ctx.scale(0.62, 0.62);
          drawTeacher(ctx, this, { skin, hair, hairStyle: style, glasses: hx === 0, coat: '#3b3f63' });
          ctx.restore();
        }
        ctx.fillStyle = '#8a5a3a'; MC.d.rrect(ctx, -62, 6, 124, 28, 3); ctx.fill(); ctx.stroke();
        MC.d.text(ctx, 'JÚRI', 0, 20, 13, '#ffd34d', { lw: 3 });
        if (this.shieldUp) {
          const pulse = 0.5 + 0.15 * Math.sin(this.t * 3);
          ctx.beginPath(); ctx.ellipse(0, -4, 76, 56, 0, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(229,72,77,${0.12 * pulse + 0.05})`; ctx.fill();
          ctx.lineWidth = 3; ctx.strokeStyle = `rgba(229,72,77,${pulse + 0.2})`; ctx.stroke();
          MC.d.text(ctx, 'revisão pedida', 0, -66, 11, '#ffffff', { outline: '#e5484d', lw: 3 });
        }
      },
    }),

    // ——— mini-chefes da vida adulta ———
    impostos: () => ({
      name: 'Impostos', hp: 50, r: 30, mid: true,
      update(g, dt) {
        sway(this, 1.2, 120);
        timer(this, 'a1', dt, 1.5, () => aim(g, this.x, this.y + 20, 160, [-0.22, 0, 0.22], { kind: 'invoice', r: 7 }));
      },
      onDeath(g) {
        for (let i = -1; i <= 1; i++) {
          g.enemies.push(MC.makeEnemy('form', this.x + i * 24, this.y, { state: 'dive', vy: 170, noReturn: true, value: 80 }));
        }
        g.popup('Divide-se em formulários!', this.x, this.y + 40, '#ffd34d');
      },
      draw(ctx) {
        line(ctx);
        for (let i = 3; i >= 0; i--) {
          ctx.save(); ctx.translate(i * 3 - 4, -i * 4); ctx.rotate((i - 1.5) * 0.08);
          ctx.fillStyle = i ? '#f2eee0' : '#fffdf3'; MC.d.rrect(ctx, -26, -30, 52, 60, 3); ctx.fill(); ctx.stroke();
          ctx.restore();
        }
        ctx.strokeStyle = '#9aa6b5'; ctx.lineWidth = 1.5;
        ctx.beginPath(); for (let y = 6; y <= 22; y += 5) { ctx.moveTo(-18, y); ctx.lineTo(18, y); } ctx.stroke();
        MC.d.text(ctx, 'IRS', 12, -18, 12, '#e5484d', { outline: false, weight: 900 });
        MC.d.eyes(ctx, -6, -6, 1.6, MC.clamp((this.lookX || 0) / 60, -1, 1));
        ctx.strokeStyle = INK; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(-16, -15); ctx.lineTo(-9, -12); ctx.moveTo(4, -15); ctx.lineTo(-3, -12); ctx.stroke();
      },
    }),

    acidente: () => ({
      name: 'Acidente de carro', hp: 45, r: 30, mid: true, phase: 'cars', carsT: 9, lane: -1, pending: [], invulnerable: true, hidden: true, ty: 110,
      update(g, dt) {
        if (this.phase === 'cars') {
          this.carsT -= dt;
          timer(this, 'a1', dt, 0.85, () => {
            if (this.carsT <= 0) return;
            let lane;
            do { lane = MC.randi(0, 4); } while (lane === this.lane);
            this.lane = lane;
            this.pending.push({ x: 36 + 72 * lane, t: 0.7 });
          });
          for (const p of this.pending) {
            p.t -= dt;
            if (p.t <= 0) g.bullet({ x: p.x, y: -20, vx: 0, vy: 340, r: 14, kind: 'car', color: MC.choice(['#ff5d5d', '#4dabff', '#52d273', '#ffb02e']) });
          }
          this.pending = this.pending.filter((p) => p.t > 0);
          if (this.carsT <= 0 && !this.pending.length) {
            this.phase = 'tow'; this.invulnerable = false; this.hidden = false;
            this.y = -60; this.entering = true; this.t = 0;
            g.banner('Agora o reboque!', '');
          }
          return;
        }
        sway(this, 1.1, 120);
        timer(this, 'a2', dt, 1.4, () => g.bullet({ x: this.x, y: this.y + 20, vx: MC.rand(-40, 40), vy: 150, r: 7, kind: 'cone' }));
      },
      drawFx(ctx) {
        for (const p of this.pending) {
          ctx.fillStyle = 'rgba(255,212,0,0.9)';
          ctx.beginPath(); ctx.moveTo(p.x, 66); ctx.lineTo(p.x + 13, 88); ctx.lineTo(p.x - 13, 88); ctx.closePath(); ctx.fill();
          ctx.lineWidth = 1.5; ctx.strokeStyle = INK; ctx.stroke();
          MC.d.text(ctx, '!', p.x, 80, 13, INK, { outline: false, weight: 900 });
        }
      },
      draw(ctx) {
        if (this.hidden) return;
        line(ctx);
        ctx.fillStyle = '#ffb02e'; MC.d.rrect(ctx, -34, -16, 68, 30, 6); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#bfe6ff'; MC.d.rrect(ctx, 6, -10, 22, 14, 3); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-44, 16); ctx.stroke();
        ctx.beginPath(); ctx.arc(-44, 20, 4, 0, Math.PI); ctx.stroke();
        MC.d.circle(ctx, -18, 16, 7, '#1d2340'); MC.d.circle(ctx, 20, 16, 7, '#1d2340');
        MC.d.circle(ctx, -6, -22, 4, this.t % 0.6 < 0.3 ? '#ff8a3d' : '#ffd34d', INK, 1.2);
        MC.d.text(ctx, 'REBOQUE', -10, -2, 8, '#1d2340', { outline: false, weight: 900 });
      },
    }),

    viagens: () => ({
      name: 'Caos nas viagens', hp: 55, r: 30, mid: true, vx: 110, vy: 70,
      update(g, dt) {
        this.x += this.vx * dt; this.y += this.vy * dt;
        if (this.x < 44 || this.x > W - 44) { this.vx *= -1; this.x = MC.clamp(this.x, 44, W - 44); }
        if (this.y < 80 || this.y > 250) { this.vy *= -1; this.y = MC.clamp(this.y, 80, 250); }
        timer(this, 'a1', dt, 1.6, () => g.bullet({ x: MC.clamp(g.player.x + MC.rand(-40, 40), 20, W - 20), y: -10, vx: 0, vy: 95, r: 12, kind: 'board' }));
        timer(this, 'a2', dt, 2.2, () => aim(g, this.x, this.y, 150, [-0.3, -0.1, 0.1, 0.3], { kind: 'dot', r: 5, color: '#ffb02e' }));
      },
      draw(ctx) {
        line(ctx);
        ctx.beginPath(); ctx.moveTo(-10, -24); ctx.lineTo(-10, -32); ctx.lineTo(10, -32); ctx.lineTo(10, -24); ctx.lineWidth = 4; ctx.stroke(); line(ctx);
        ctx.fillStyle = '#4dabff'; MC.d.rrect(ctx, -32, -24, 64, 48, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ffd34d'; MC.d.rrect(ctx, -26, 6, 18, 12, 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#ff5d5d'; MC.d.rrect(ctx, 8, 8, 18, 10, 2); ctx.fill(); ctx.stroke();
        MC.d.text(ctx, '✈', 17, 13, 8, '#ffffff', { outline: false });
        MC.d.eyes(ctx, 0, -8, 1.6, MC.clamp((this.lookX || 0) / 60, -1, 1));
        MC.d.circle(ctx, -18, 28, 4, '#1d2340'); MC.d.circle(ctx, 18, 28, 4, '#1d2340');
      },
    }),

    credito: () => ({
      name: 'Crédito à habitação', hp: 60, r: 34, mid: true, interest: 0,
      update(g, dt) {
        sway(this, 0.9, 110);
        this.interest = Math.min(1, this.interest + dt / 25);
        const n = 3 + Math.floor(this.interest * 4);
        timer(this, 'a1', dt, 1.9 - this.interest * 0.8, () => {
          const offs = []; for (let i = 0; i < n; i++) offs.push((i - (n - 1) / 2) * 0.2);
          aim(g, this.x, this.y + 20, 140, offs, { kind: 'pct', r: 7 });
        });
      },
      draw(ctx) {
        line(ctx);
        ctx.fillStyle = '#fff1d6'; ctx.fillRect(-28, -6, 56, 38); ctx.strokeRect(-28, -6, 56, 38);
        ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.moveTo(-36, -4); ctx.lineTo(0, -34); ctx.lineTo(36, -4); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8a5a3a'; ctx.fillRect(-7, 12, 14, 20); ctx.strokeRect(-7, 12, 14, 20);
        MC.d.eyes(ctx, 0, 2, 1.5, MC.clamp((this.lookX || 0) / 60, -1, 1));
        // gráfico dos juros
        ctx.fillStyle = '#ffffff'; MC.d.rrect(ctx, 32, -30, 30, 50, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e5484d'; const hh = 6 + this.interest * 38; ctx.fillRect(38, 16 - hh, 18, hh);
        MC.d.text(ctx, 'Juros', 47, 28, 8, INK, { outline: false });
      },
    }),
  };

  MC.makeBoss = function (type) {
    const def = BOSSES[type]();
    const b = Object.assign({
      type, x: W / 2, y: -90, ty: 118, r: 40, t: 0, flash: 0, entering: true, dead: false, mid: false,
      shieldUp: false, invulnerable: false, hidden: false, a1: 1.4, a2: 2.8, lookX: 0,
    }, def);
    b.hpMax = b.hp;
    if (b.hidden) { b.entering = false; b.y = -120; }
    return b;
  };

  MC.updateBoss = function (b, g, dt) {
    b.t += dt;
    b.flash = Math.max(0, b.flash - dt);
    b.lookX = g.player.x - b.x;
    if (b.entering) {
      b.y += (b.ty - b.y) * Math.min(1, dt * 2.2);
      if (Math.abs(b.y - b.ty) < 2) { b.entering = false; b.t = 0; }
      return;
    }
    b.update(g, dt);
  };

  // devolve 'none' | 'blocked' | 'hit'
  MC.damageBoss = function (b, g, n, byBeam) {
    if (b.entering || b.invulnerable || b.dead) return 'none';
    if (b.shieldUp) {
      if (!byBeam) return 'blocked';
      if (b.breakShield) b.breakShield(g);
    }
    b.hp -= n;
    b.flash = 0.06;
    if (b.hp <= 0) { b.hp = 0; b.dead = true; }
    return 'hit';
  };

  MC.drawBoss = function (ctx, b, g) {
    if (b.drawFx) b.drawFx(ctx, g);
    if (b.hidden) return;
    ctx.save();
    ctx.translate(b.x, b.y);
    b.draw(ctx, g);
    if (b.flash > 0) MC.d.circle(ctx, 0, 0, b.r + 6, 'rgba(255,255,255,0.35)');
    ctx.restore();
  };
})(window.MC);
