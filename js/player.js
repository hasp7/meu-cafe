'use strict';
// O herói: lutador numa nuvem, com onda de energia carregada.
(function (MC) {
  const { W, H, INK } = MC;

  const emblem = new Image();
  let emblemOk = false;
  emblem.onload = () => { emblemOk = true; };
  emblem.src = MC.CHARACTER.emblem;

  function drawCloudSeat(ctx, t, c) {
    ctx.globalAlpha = 0.55;
    for (let i = 0; i < 3; i++) {
      const k = (t * 1.6 + i / 3) % 1;
      MC.d.circle(ctx, Math.sin(i * 2.1) * 8, 20 + k * 22, 6 * (1 - k) + 2, c.cloud);
    }
    ctx.globalAlpha = 1;
    MC.d.blob(ctx, [[-19, 16, 9], [-7, 14, 11], [7, 14, 11], [19, 16, 9], [0, 19, 10]]);
    ctx.fillStyle = c.cloudShade;
    ctx.fill();
    MC.d.blob(ctx, [[-19, 13, 9], [-7, 10, 11], [7, 10, 11], [19, 13, 9], [0, 15, 10]]);
    ctx.fillStyle = c.cloud;
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = MC.rgba('#a8740a', 0.6);
    ctx.stroke();
  }

  function drawMatchEmblem(ctx, c, r) {
    ctx.save();
    MC.d.circle(ctx, 0, 0, r, c.matchDay.stripeB);
    ctx.clip();
    ctx.fillStyle = c.matchDay.stripeA;
    for (let x = -r; x < r; x += r * 0.7) ctx.fillRect(x, -r, r * 0.35, r * 2);
    // silhueta de dragão, desenho original
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.35); ctx.lineTo(-r * 0.1, -r * 0.45); ctx.lineTo(r * 0.15, -r * 0.2);
    ctx.lineTo(r * 0.6, -r * 0.55); ctx.lineTo(r * 0.35, -r * 0.05); ctx.lineTo(r * 0.55, r * 0.3);
    ctx.lineTo(r * 0.05, r * 0.1); ctx.closePath();
    ctx.fill();
    ctx.restore();
    MC.d.circle(ctx, 0, 0, r, null, INK, 1);
  }

  // o: { charge 0..1, matchDay, coffee }
  MC.drawHero = function (ctx, x, y, t, o = {}) {
    const c = MC.CHARACTER;
    const md = !!o.matchDay;
    const ch = o.charge || 0;
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 3) * 1.5);

    if (ch > 0) {
      const rr = 26 + ch * 16;
      const gr = ctx.createRadialGradient(0, -14, 4, 0, -14, rr);
      gr.addColorStop(0, MC.rgba(c.aura, 0.6 * ch));
      gr.addColorStop(1, MC.rgba(c.aura, 0));
      ctx.fillStyle = gr;
      ctx.beginPath(); ctx.arc(0, -14, rr, 0, Math.PI * 2); ctx.fill();
    }

    drawCloudSeat(ctx, t, c);

    ctx.lineWidth = 1.4;
    ctx.strokeStyle = INK;
    // pernas de joelhos na nuvem
    ctx.fillStyle = md ? c.matchDay.stripeB : c.gi;
    MC.d.rrect(ctx, -13, 1, 26, 10, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = c.giTrim;
    MC.d.rrect(ctx, -16, 6, 9, 6, 3); ctx.fill(); ctx.stroke();
    MC.d.rrect(ctx, 7, 6, 9, 6, 3); ctx.fill(); ctx.stroke();

    // tronco
    ctx.beginPath();
    ctx.moveTo(-12, -16); ctx.lineTo(12, -16); ctx.lineTo(9, 3); ctx.lineTo(-9, 3); ctx.closePath();
    if (md) {
      ctx.fillStyle = c.matchDay.stripeB; ctx.fill();
      ctx.save(); ctx.clip();
      ctx.fillStyle = c.matchDay.stripeA;
      for (let sx = -12; sx < 12; sx += 8) ctx.fillRect(sx, -16, 4, 20);
      ctx.restore();
    } else {
      ctx.fillStyle = c.gi; ctx.fill();
      ctx.fillStyle = c.giTrim;
      ctx.beginPath(); ctx.moveTo(-4, -16); ctx.lineTo(0, -10); ctx.lineTo(4, -16); ctx.closePath(); ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(-12, -16); ctx.lineTo(12, -16); ctx.lineTo(9, 3); ctx.lineTo(-9, 3); ctx.closePath();
    ctx.stroke();
    ctx.fillStyle = c.giTrim;
    ctx.fillRect(-9.5, -1, 19, 3.5);

    // emblema
    ctx.save();
    ctx.translate(0, -7);
    if (md) drawMatchEmblem(ctx, c, 5.5);
    else {
      MC.d.circle(ctx, 0, 0, 5.8, '#ffffff', INK, 1);
      if (emblemOk) ctx.drawImage(emblem, -4.6, -4.6, 9.2, 9.2);
      else MC.d.text(ctx, 'HC', 0, 0.5, 5, '#7a2fb0', { outline: false });
    }
    ctx.restore();

    // braços
    ctx.lineCap = 'round';
    const sleeve = md ? c.matchDay.stripeA : c.gi;
    const arms = ch > 0 ? [[-11, -14, -8, -44], [11, -14, 8, -44]] : [[-11, -14, -17, -2], [11, -14, 17, -2]];
    for (const [ax, ay, hx, hy] of arms) {
      ctx.strokeStyle = INK; ctx.lineWidth = 7.5;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
      ctx.strokeStyle = sleeve; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(hx, hy); ctx.stroke();
      MC.d.circle(ctx, hx, hy, 3.4, c.skin, INK, 1.2);
    }
    if (ch > 0) {
      MC.d.circle(ctx, 0, -50, 3 + ch * 6, MC.rgba(c.aura, 0.9));
      MC.d.circle(ctx, 0, -50, 1.5 + ch * 3, '#ffffff');
    }
    if (o.coffee) {
      ctx.save(); ctx.translate(21, -8); ctx.scale(0.75, 0.75);
      MC.ITEM_ART.espresso(ctx, t);
      ctx.restore();
    }

    // cabeça
    MC.d.circle(ctx, 0, -26, 9.5, c.skin, INK, 1.4);
    ctx.fillStyle = c.hair;
    if (c.hairStyle === 'spiky') {
      ctx.beginPath();
      ctx.moveTo(-10, -25);
      ctx.lineTo(-13, -33); ctx.lineTo(-7, -31); ctx.lineTo(-6, -41); ctx.lineTo(-1, -33);
      ctx.lineTo(3, -43); ctx.lineTo(5, -33); ctx.lineTo(11, -38); ctx.lineTo(9.5, -29);
      ctx.lineTo(10.5, -25); ctx.quadraticCurveTo(4, -31, -2, -29); ctx.quadraticCurveTo(-7, -28, -10, -25);
      ctx.closePath(); ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = INK; ctx.stroke();
    } else if (c.hairStyle === 'short') {
      ctx.beginPath(); ctx.arc(0, -27, 10, Math.PI * 1.02, Math.PI * 1.98); ctx.quadraticCurveTo(0, -31, -10, -28); ctx.fill();
    }
    if (c.beard) {
      ctx.fillStyle = c.beardColor;
      ctx.beginPath(); ctx.arc(0, -26, 9.5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.quadraticCurveTo(0, -18, 8.4, -21.6); ctx.fill();
    }
    const sun = c.glasses === 'sun';
    if (!sun) MC.d.eyes(ctx, 0, -26, 0.85, 0);
    ctx.strokeStyle = INK; ctx.lineWidth = 1.3;
    const by = sun ? -1.2 : 0;
    ctx.beginPath(); ctx.moveTo(-6, -30 + by); ctx.lineTo(-1.5, -29 + by); ctx.moveTo(6, -30 + by); ctx.lineTo(1.5, -29 + by); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -22.5, 2.6, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    if (sun) {
      // óculos de sol: hastes, lentes escuras com reflexo e ponte
      ctx.strokeStyle = INK; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(-7.6, -27.6); ctx.lineTo(-9.4, -27); ctx.moveTo(7.6, -27.6); ctx.lineTo(9.4, -27); ctx.stroke();
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s * 0.9, -28.6); ctx.lineTo(s * 7.9, -28.6); ctx.lineTo(s * 7.3, -25.2);
        ctx.quadraticCurveTo(s * 6.6, -22.8, s * 4.2, -22.9); ctx.quadraticCurveTo(s * 1.3, -23.1, s * 0.9, -25.6);
        ctx.closePath();
        ctx.fillStyle = c.glassesColor; ctx.fill();
        ctx.lineWidth = 1; ctx.strokeStyle = INK; ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(s * 2.6, -27.4); ctx.lineTo(s * 4.4, -27.4); ctx.moveTo(s * 2.2, -26.2); ctx.lineTo(s * 3, -26.2); ctx.stroke();
      }
      ctx.strokeStyle = INK; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(-1, -27.8); ctx.quadraticCurveTo(0, -28.6, 1, -27.8); ctx.stroke();
    } else if (c.glasses) {
      ctx.strokeStyle = c.glassesColor; ctx.lineWidth = 1.2;
      for (const ex of [-2.9, 2.9]) { ctx.beginPath(); ctx.arc(ex, -26, 3, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(-0.2, -26); ctx.lineTo(0.2, -26); ctx.stroke();
    }
    ctx.restore();
  };

  MC.Player = class {
    constructor() { this.reset(); }

    reset() {
      this.x = W / 2; this.y = H - 112;
      this.tx = this.x; this.ty = this.y;
      this.vx = 0; this.vy = 0;
      this.r = 7;
      this.lives = 3;
      this.invuln = 0;
      this.fireT = 0;
      this.buffs = [];
      this.shield = 0; this.tempShield = 0;
      this.charge = 0; this.wasCharging = false; this.cooldown = 0; this.beam = null;
      this.drone = 0; this.spread = 0; this.pierce = 0;
      this.bubble = null; this.noCoffee = 0;
      this.matchDay = false;
      this.t = 0;
      this.god = false;
    }

    addBuff(b) {
      const same = this.buffs.find((x) => x.id === b.id);
      if (same) { same.t = b.dur; return; }
      this.buffs.push(Object.assign({}, b, { t: b.dur }));
    }
    mult(key) { let m = 1; for (const b of this.buffs) if (b[key]) m *= b[key]; return m; }
    wobbly() { return this.buffs.some((b) => b.wobble); }
    coffee() { this.noCoffee = 0; }
    say(text, dur = 2.6) { this.bubble = { text, t: dur }; }

    update(dt, g) {
      this.t += dt;
      const inp = MC.input;

      for (const b of this.buffs) {
        b.t -= dt;
        if (b.t <= 0 && b.then) this.addBuff(b.then);
      }
      this.buffs = this.buffs.filter((b) => b.t > 0);
      this.invuln = Math.max(0, this.invuln - dt);
      this.tempShield = Math.max(0, this.tempShield - dt);
      this.drone = Math.max(0, this.drone - dt);
      this.spread = Math.max(0, this.spread - dt);
      this.pierce = Math.max(0, this.pierce - dt);
      this.cooldown = Math.max(0, this.cooldown - dt);
      if (this.bubble) { this.bubble.t -= dt; if (this.bubble.t <= 0) this.bubble = null; }

      // movimento: o dedo arrasta um alvo; o herói persegue-o à velocidade que tem
      const speed = 330 * this.mult('speed');
      this.tx += inp.dx; this.ty += inp.dy;
      inp.dx = 0; inp.dy = 0;
      const k = inp.keys;
      const kx = (k.ArrowRight || k.KeyD ? 1 : 0) - (k.ArrowLeft || k.KeyA ? 1 : 0);
      const ky = (k.ArrowDown || k.KeyS ? 1 : 0) - (k.ArrowUp || k.KeyW ? 1 : 0);
      if (kx || ky) { this.tx = this.x + kx * 60; this.ty = this.y + ky * 60; }
      if (g.demo) g.demoSteer(this);
      this.tx = MC.clamp(this.tx, 18, W - 18);
      this.ty = MC.clamp(this.ty, H * 0.52, H - 46);

      let wantX = MC.clamp((this.tx - this.x) * 12, -speed, speed);
      const wantY = MC.clamp((this.ty - this.y) * 12, -speed, speed);
      if (this.wobbly()) wantX += Math.sin(this.t * 7) * 70;
      const grip = g.weather && g.weather.inertia ? 5 : 22;
      const a = 1 - Math.exp(-grip * dt);
      this.vx += (wantX - this.vx) * a;
      this.vy += (wantY - this.vy) * a;
      this.x = MC.clamp(this.x + this.vx * dt, 14, W - 14);
      this.y = MC.clamp(this.y + this.vy * dt, H * 0.5, H - 40);

      // tiro automático
      this.fireT -= dt;
      if (this.fireT <= 0) {
        this.fireT = 0.24 / this.mult('fire');
        const shot = (x, y, vx) => g.shots.push({ x, y, vx, vy: -540, r: 4, pierce: this.pierce > 0, hitList: null });
        shot(this.x, this.y - 30, 0);
        if (this.spread > 0) { shot(this.x - 6, this.y - 26, -150); shot(this.x + 6, this.y - 26, 150); }
        if (this.drone > 0) shot(this.x + 28, this.y - 16, 0);
      }

      // onda de energia: segurar carrega, largar dispara
      const holding = inp.charging && this.cooldown <= 0 && !this.beam;
      if (holding) this.charge = Math.min(1, this.charge + dt / 1.1);
      if (!inp.charging && this.wasCharging && this.charge >= 0.3) {
        this.beam = { t: 0.75, dur: 0.75, w: 14 + 30 * this.charge, dps: 14 + 46 * this.charge };
        this.cooldown = 3.5;
        MC.sfx.wave();
        g.shake = Math.max(g.shake, 4);
      }
      if (!holding) this.charge = Math.max(0, this.charge - dt * 3);
      this.wasCharging = inp.charging;
      if (this.beam) { this.beam.t -= dt; if (this.beam.t <= 0) this.beam = null; }

      this.noCoffee += dt;
      if (this.noCoffee > 25) { this.noCoffee = 0; this.say(MC.CHARACTER.catchphrase); }
    }

    // devolve true se perdeu uma vida
    hit() {
      if (this.invuln > 0 || this.god) return false;
      if (this.tempShield > 0) { this.tempShield = 0; this.invuln = 0.8; MC.sfx.pop(); return false; }
      if (this.shield > 0) { this.shield--; this.invuln = 1; MC.sfx.pop(); return false; }
      this.lives--;
      this.invuln = 2.2;
      this.buffs = [];
      this.charge = 0;
      this.say(MC.CHARACTER.catchphrase);
      MC.sfx.hurt();
      return true;
    }

    drawBeam(ctx) {
      const b = this.beam;
      if (!b) return;
      const fade = Math.min(1, b.t / 0.2, (b.dur - b.t) / 0.08 + 0.2);
      const w = b.w * (0.9 + 0.1 * Math.sin(this.t * 40));
      const top = 0, bottom = this.y - 30;
      const gr = ctx.createLinearGradient(this.x - w / 2, 0, this.x + w / 2, 0);
      gr.addColorStop(0, MC.rgba(MC.CHARACTER.aura, 0));
      gr.addColorStop(0.3, MC.rgba(MC.CHARACTER.aura, 0.75 * fade));
      gr.addColorStop(0.5, `rgba(255,255,255,${0.95 * fade})`);
      gr.addColorStop(0.7, MC.rgba(MC.CHARACTER.aura, 0.75 * fade));
      gr.addColorStop(1, MC.rgba(MC.CHARACTER.aura, 0));
      ctx.fillStyle = gr;
      ctx.fillRect(this.x - w / 2, top, w, bottom - top);
      MC.d.circle(ctx, this.x, bottom, w * 0.45, `rgba(255,255,255,${0.8 * fade})`);
    }

    draw(ctx) {
      if (this.invuln > 0 && Math.floor(this.invuln * 10) % 2 === 0) return;
      if (this.drone > 0) {
        ctx.save();
        ctx.translate(this.x + 28, this.y - 10 + Math.sin(this.t * 4) * 3);
        ctx.scale(0.8, 0.8);
        MC.ITEM_ART.laptop(ctx, this.t);
        ctx.restore();
      }
      MC.drawHero(ctx, this.x, this.y, this.t, { charge: this.charge, matchDay: this.matchDay });
      if (this.tempShield > 0 || this.shield > 0) {
        const col = this.shield > 0 ? '#ffd34d' : '#ffb02e';
        MC.d.circle(ctx, this.x, this.y - 10, 30, MC.rgba(col, 0.12), MC.rgba(col, 0.8), 2.5);
      }
    }
  };
})(window.MC);
