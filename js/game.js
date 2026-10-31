'use strict';
// Ciclo do jogo: estados, níveis, colisões, pontuação e desenho.
(function (MC) {
  const { W, H } = MC;
  const canvas = document.getElementById('jogo');
  const ctx = canvas.getContext('2d');
  const input = MC.input;

  const g = MC.game = {
    state: 'title', t: 0, stageT: 0,
    score: 0, best: MC.store.get('best', 0), newBest: false,
    stageIdx: 0, stage: MC.STAGES[0], phaseB: false,
    player: new MC.Player(),
    shots: [], ebullets: [], enemies: [], items: [], particles: [], popups: [], confetti: [],
    boss: null, plan: [], planIdx: -1, stepWait: 0, waveNo: 0, clearT: 0,
    weather: MC.makeWeather('clear'), skyBag: [],
    itemT: 4, shake: 0, cardT: 0, endT: 0, diveT: 2, formX: 0, blockT: 0,
    bannerInfo: null, demo: MC.params.demo, demoT: 0, pxScale: 1,
  };

  // ——— fluxo ———
  g.newGame = function () {
    g.score = 0; g.newBest = false;
    g.player.reset();
    g.player.god = g.demo;
    g.skyBag = MC.shuffle(MC.WEATHER_TYPES);
    g.startStage(MC.params.stage !== null ? MC.params.stage : 0);
  };

  g.startStage = function (i) {
    g.stageIdx = i;
    g.stage = MC.STAGES[i];
    g.phaseB = !!g.stage.phaseB;
    if (!g.skyBag.length) g.skyBag = MC.shuffle(MC.WEATHER_TYPES);
    g.weather = MC.makeWeather(g.skyBag.pop());
    g.player.matchDay = !!g.stage.matchDay;
    g.shots = []; g.ebullets = []; g.enemies = []; g.items = [];
    g.boss = null;
    g.plan = buildPlan(g.stage);
    g.planIdx = -1; g.stepWait = 0.6; g.waveNo = 0; g.clearT = 0;
    g.stageT = 0; g.itemT = 3; g.bannerInfo = null;
    g.state = 'card';
    g.cardT = g.demo ? 2 : 4.5;
  };

  function buildPlan(st) {
    const m = st.mids || [];
    if (m.length === 2) return ['wave', 'mid:' + m[0], 'wave', 'mid:' + m[1], 'wave', 'boss'];
    if (m.length === 1) return ['wave', 'wave', 'mid:' + m[0], 'wave', 'boss'];
    return ['wave', 'wave', 'wave', 'boss'];
  }
  const stepDone = () => g.planIdx < 0 || (g.plan[g.planIdx] === 'wave' ? g.enemies.length === 0 : !g.boss && g.enemies.length === 0);

  function nextStep() {
    g.planIdx++;
    if (g.planIdx >= g.plan.length) { stageClear(); return; }
    const step = g.plan[g.planIdx];
    if (step === 'wave') {
      g.enemies = MC.makeWave(g, g.waveNo++);
      g.diveT = 2.5;
    } else if (step.startsWith('mid:')) {
      g.boss = MC.makeBoss(step.slice(4));
      g.banner('Vida adulta!', g.boss.name);
      MC.sfx.boss();
    } else {
      g.boss = MC.makeBoss(g.stage.boss);
      g.banner(g.stage.final ? 'Chefe final' : 'Chefe', g.boss.name);
      MC.sfx.boss();
    }
  }

  function stageClear() {
    const bonus = 1000 * (g.stageIdx + 1);
    g.addScore(bonus);
    if (g.stage.final) { win(); return; }
    g.banner(g.stage.matchDay ? 'Jogo ganho!' : 'Nível concluído!', `+${bonus}`);
    g.clearT = 2.6;
  }

  function saveBest() {
    if (g.score > g.best) { g.best = g.score; g.newBest = true; MC.store.set('best', g.best); }
  }
  function win() {
    g.state = 'victory'; g.endT = 0;
    g.shots = []; g.ebullets = []; g.enemies = []; g.items = [];
    saveBest();
    g.confetti = [];
    const colors = ['#ffd34d', '#ff5d5d', '#4dabff', '#52d273', '#f08a24', '#ffffff'];
    for (let i = 0; i < (MC.reducedMotion ? 40 : 90); i++) {
      g.confetti.push({ x: MC.rand(0, W), y: MC.rand(-H, 0), vy: MC.rand(60, 140), vx: MC.rand(-30, 30), a: MC.rand(0, 6), va: MC.rand(-4, 4), color: MC.choice(colors) });
    }
    MC.sfx.win();
  }
  function gameOver() { g.state = 'gameover'; g.endT = 0; saveBest(); }

  g.pause = function () { if (g.state === 'play') { g.state = 'paused'; input.charging = false; input.moveId = null; } };
  g.resume = function () { if (g.state === 'paused') { g.state = 'play'; input.dx = 0; input.dy = 0; } };
  g.toTitle = function () { g.state = 'title'; g.weather = MC.makeWeather('clear'); };

  // ——— serviços usados pelos outros módulos ———
  g.addScore = (n) => { g.score += Math.round(n); };
  g.banner = (text, sub, dur = 2.2) => { g.bannerInfo = { text, sub, t: dur, dur }; };
  g.popup = (text, x, y, color = '#ffffff') => { g.popups.push({ text, x: MC.clamp(x, 70, W - 70), y, t: 1.3, color }); };
  g.bullet = (o) => {
    if (g.ebullets.length > 240) return;
    g.ebullets.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, r: 5, kind: 'dot', color: g.stage.bullet, life: 12, effect: 'hit' }, o));
  };
  g.dropItem = (type, x, y) => { g.items.push({ type, x: MC.clamp(x, 20, W - 20), y, vy: 85, r: 13, t: 0 }); };
  g.enemyShoot = (e) => {
    const p = g.player;
    const speed = 165 + g.stageIdx * 10;
    const a = Math.atan2(p.y - 10 - e.y, p.x - e.x) + MC.rand(-0.12, 0.12);
    const o = { x: e.x, y: e.y + 10, vx: Math.cos(a) * speed, vy: Math.max(60, Math.sin(a) * speed) };
    if (g.stage.matchDay && Math.random() < 0.2) {
      const yellow = Math.random() < 0.85;
      g.bullet(Object.assign(o, { kind: 'card', r: 7, effect: yellow ? 'yellow' : 'hit' }));
    } else g.bullet(o);
  };
  g.hurtPlayer = () => {
    const p = g.player;
    if (!p.hit()) return;
    g.shake = 8;
    burst(p.x, p.y - 10, MC.CHARACTER.cloud, 18);
    // limpa as balas à volta do herói para o regresso ser justo
    g.ebullets = g.ebullets.filter((b) => Math.abs(b.x - p.x) > 90 || Math.abs(b.y - p.y) > 140);
    if (p.lives <= 0) gameOver();
  };

  function burst(x, y, color, n) {
    const count = MC.reducedMotion ? Math.ceil(n / 2) : n;
    for (let i = 0; i < count; i++) {
      const a = MC.rand(0, Math.PI * 2), s = MC.rand(40, 170);
      g.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, t: 0, dur: MC.rand(0.35, 0.7), r: MC.rand(2, 4.5), color });
    }
  }

  function damageEnemy(e, n) {
    if (e.dead) return;
    e.hp -= n;
    e.flash = 0.06;
    if (e.hp > 0) return;
    e.dead = true;
    g.addScore(e.state === 'dive' ? e.value * 2 : e.value);
    burst(e.x, e.y, e.color || '#ffffff', 10);
    MC.sfx.pop();
    const r = Math.random();
    if (r < 0.035) g.dropItem(MC.weighted(MC.UPGRADES), e.x, e.y);
    else if (r < 0.09) g.dropItem(MC.weighted(MC.SKY_DROPS), e.x, e.y);
  }

  function bossDown() {
    const B = g.boss;
    g.addScore(B.mid ? 1500 : 3000 + g.stageIdx * 500);
    burst(B.x, B.y, '#ffd34d', 30);
    burst(B.x, B.y, '#ffffff', 20);
    g.shake = 10;
    g.ebullets = [];
    if (B.onDeath) B.onDeath(g);
    g.dropItem(MC.weighted(MC.UPGRADES), B.x + 20, B.y);
    g.popup(B.mid ? 'Vencido!' : 'Chefe vencido!', B.x, B.y + 40, '#ffd34d');
    g.boss = null;
    MC.sfx.boss();
  }

  function collect(it) {
    const def = MC.ITEMS[it.type];
    const label = def.apply(g.player, g) || def.label;
    const color = def.cls === 'bad' ? '#ff8a8a' : def.cls === 'up' ? '#ffd34d' : '#7dffb0';
    g.popup(label, it.x, it.y - 16, color);
    if (def.cls === 'bad') MC.sfx.bad(); else { MC.sfx.good(); g.addScore(100); }
  }

  // ——— atualização ———
  function updatePlay(dt) {
    g.t += dt; g.stageT += dt;
    g.blockT = Math.max(0, g.blockT - dt);
    MC.updateWeather(g.weather, dt);
    const p = g.player;
    p.update(dt, g);

    for (const s of g.shots) { s.x += s.vx * dt; s.y += s.vy * dt; }
    g.shots = g.shots.filter((s) => !s.dead && s.y > -20 && s.x > -20 && s.x < W + 20);

    MC.updateEnemies(g, dt);
    if (g.boss) MC.updateBoss(g.boss, g, dt);

    for (const b of g.ebullets) {
      b.life -= dt;
      if (b.gravity) b.vy += b.gravity * dt;
      if (b.homing) b.vx = MC.clamp(b.vx + Math.sign(p.x - b.x) * b.homing * dt, -90, 90);
      if (b.sway) b.x += Math.sin(g.t * 3 + b.y * 0.02) * 30 * dt;
      b.x += b.vx * dt; b.y += b.vy * dt;
      if (b.bounce && (b.x < b.r || b.x > W - b.r)) { b.vx *= -1; b.x = MC.clamp(b.x, b.r, W - b.r); }
    }
    g.ebullets = g.ebullets.filter((b) => !b.dead && b.life > 0 && b.y < H + 40 && b.y > -160 && b.x > -40 && b.x < W + 40);

    for (const it of g.items) { it.y += it.vy * dt; it.t += dt; }
    g.items = g.items.filter((it) => !it.dead && it.y < H + 20);
    g.itemT -= dt;
    if (g.itemT <= 0 && g.clearT <= 0) {
      g.itemT = MC.rand(3.5, 5.5);
      g.dropItem(MC.weighted(MC.SKY_DROPS), MC.rand(24, W - 24), -16);
    }

    collisions(dt);
    if (g.state !== 'play') return;
    if (g.boss && g.boss.dead) bossDown();

    if (g.clearT > 0) {
      g.clearT -= dt;
      if (g.clearT <= 0) g.startStage(g.stageIdx + 1);
    } else if (stepDone()) {
      g.stepWait -= dt;
      if (g.stepWait <= 0) { g.stepWait = 1.0; nextStep(); }
    }
  }

  function collisions(dt) {
    const p = g.player;
    const B = g.boss && !g.boss.hidden && !g.boss.dead ? g.boss : null;
    const active = (e) => !(e.state === 'enter' && e.delay > 0) && !e.dead;

    for (const s of g.shots) {
      for (const e of g.enemies) {
        if (!active(e) || (s.hitList && s.hitList.includes(e))) continue;
        if (MC.hit(s, e)) {
          damageEnemy(e, 1);
          if (s.pierce) { if (!s.hitList) s.hitList = []; s.hitList.push(e); }
          else { s.dead = true; break; }
        }
      }
      if (s.dead) continue;
      for (const b of g.ebullets) {
        if (b.hp && !b.dead && MC.hit(s, b)) {
          b.hp--;
          if (b.hp <= 0) { b.dead = true; burst(b.x, b.y, '#ffffff', 5); g.addScore(10); }
          s.dead = true;
          break;
        }
      }
      if (s.dead || !B) continue;
      if (MC.hit(s, B)) {
        const r = MC.damageBoss(B, g, 1, false);
        if (r === 'blocked') {
          s.dead = true;
          burst(s.x, s.y, '#ffffff', 3);
          if (g.blockT <= 0) { g.blockT = 2.5; g.popup('Bloqueado! Usa a onda ⚡', B.x, B.y + 70, '#ffffff'); }
        } else if (r === 'hit') s.dead = true;
      }
    }

    const beam = p.beam;
    if (beam) {
      const half = beam.w / 2;
      const inCol = (o) => Math.abs(o.x - p.x) < half + o.r && o.y < p.y;
      for (const e of g.enemies) if (active(e) && inCol(e)) damageEnemy(e, beam.dps * dt);
      for (const b of g.ebullets) if (inCol(b)) b.dead = true;
      if (B && inCol(B)) MC.damageBoss(B, g, beam.dps * dt, true);
    }

    const hb = { x: p.x, y: p.y - 10, r: p.r };
    for (const b of g.ebullets) {
      if (b.dead || !MC.hit(hb, b, -b.r * 0.2)) continue;
      b.dead = true;
      if (b.effect === 'yellow') {
        p.addBuff({ id: 'amarelo', art: 'yellowcard', dur: 4, speed: 0.6 });
        g.popup('Cartão amarelo!', p.x, p.y - 60, '#ffd400');
        MC.sfx.bad();
      } else {
        if (b.kind === 'card') g.popup('Cartão vermelho!', p.x, p.y - 60, '#ff8a8a');
        g.hurtPlayer();
      }
    }
    for (const e of g.enemies) {
      if (active(e) && MC.hit(hb, e, -4)) { g.hurtPlayer(); damageEnemy(e, 99); }
    }
    if (B && !B.entering && MC.hit(hb, B, -10)) g.hurtPlayer();

    const grab = { x: p.x, y: p.y - 6, r: 16 };
    for (const it of g.items) if (!it.dead && MC.hit(grab, it)) { it.dead = true; collect(it); }

    g.enemies = g.enemies.filter((e) => !e.dead);
  }

  function updateFx(dt) {
    g.shake = Math.max(0, g.shake - dt * 20);
    for (const q of g.particles) { q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.96; q.vy *= 0.96; }
    g.particles = g.particles.filter((q) => q.t < q.dur);
    for (const q of g.popups) { q.t -= dt; q.y -= 28 * dt; }
    g.popups = g.popups.filter((q) => q.t > 0);
    if (g.bannerInfo) { g.bannerInfo.t -= dt; if (g.bannerInfo.t <= 0) g.bannerInfo = null; }
    for (const c of g.confetti) { c.y += c.vy * dt; c.x += c.vx * dt; c.a += c.va * dt; if (c.y > H + 10) { c.y = -10; c.x = MC.rand(0, W); } }
  }

  // modo demonstração: foge das balas, apanha o que é bom, dispara a onda de vez em quando
  g.demoSteer = function (p) {
    let tx = g.boss && !g.boss.hidden ? g.boss.x : (g.enemies[0] ? g.enemies[0].x : W / 2);
    const good = g.items.find((it) => MC.ITEMS[it.type].cls !== 'bad' && it.y > H * 0.25);
    if (good) tx = good.x;
    let threat = null, best = 1e9;
    for (const b of g.ebullets) {
      const dy = p.y - b.y;
      if (dy > -10 && dy < 170 && Math.abs(b.x - p.x) < 34 + b.r && dy < best) { best = dy; threat = b; }
    }
    const bad = g.items.find((it) => MC.ITEMS[it.type].cls === 'bad' && Math.abs(it.x - p.x) < 34 && p.y - it.y < 140 && p.y > it.y);
    const avoid = threat || bad;
    if (avoid) tx = p.x + (p.x >= avoid.x ? 1 : -1) * 90;
    if (tx < 30 || tx > W - 30) tx = p.x < W / 2 ? p.x + 120 : p.x - 120;
    p.tx = tx;
    p.ty = H - 112;
    g.demoT += 1 / 60;
    input.charging = g.demoT % 6 > 4.6;
  };

  // ——— desenho ———
  function render() {
    ctx.setTransform(g.pxScale, 0, 0, g.pxScale, 0, 0);
    MC.drawWeatherBack(ctx, g.weather);
    if (g.state === 'title') { MC.ui.drawTitle(ctx, g); return; }

    ctx.save();
    if (g.shake > 0 && !MC.reducedMotion) ctx.translate(MC.rand(-g.shake, g.shake), MC.rand(-g.shake, g.shake));
    const glow = g.weather.glow;
    for (const it of g.items) MC.drawItem(ctx, it.type, it.x, it.y, it.t);
    for (const e of g.enemies) if (!(e.state === 'enter' && e.delay > 0)) MC.drawEnemy(ctx, e, g.t, glow);
    if (g.boss) MC.drawBoss(ctx, g.boss, g);
    for (const s of g.shots) {
      ctx.fillStyle = s.pierce ? '#52d273' : MC.CHARACTER.aura;
      MC.d.rrect(ctx, s.x - 3, s.y - 9, 6, 16, 3); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.fillRect(s.x - 1, s.y - 7, 2, 11);
    }
    g.player.drawBeam(ctx);
    if (g.state !== 'victory') g.player.draw(ctx);
    for (const b of g.ebullets) MC.drawBullet(ctx, b, g.t, glow);
    for (const q of g.particles) {
      ctx.globalAlpha = 1 - q.t / q.dur;
      MC.d.circle(ctx, q.x, q.y, q.r, q.color);
    }
    ctx.globalAlpha = 1;
    ctx.restore();

    MC.drawWeatherFront(ctx, g.weather);
    for (const q of g.popups) {
      ctx.globalAlpha = Math.min(1, q.t / 0.3);
      MC.d.text(ctx, q.text, q.x, q.y, 13, q.color, { lw: 4 });
    }
    ctx.globalAlpha = 1;

    if (g.state === 'play' || g.state === 'paused' || g.state === 'card') {
      MC.ui.drawHUD(ctx, g);
      MC.ui.drawBanner(ctx, g);
    }
    if (g.state === 'card') MC.ui.drawCard(ctx, g);
    else if (g.state === 'paused') MC.ui.drawPaused(ctx);
    else if (g.state === 'gameover') MC.ui.drawEnd(ctx, g, false);
    else if (g.state === 'victory') MC.ui.drawEnd(ctx, g, true);
  }

  function step(dt) {
    while (input.taps.length) MC.ui.handleTap(g, input.taps.shift());
    switch (g.state) {
      case 'title':
        g.t += dt;
        MC.updateWeather(g.weather, dt);
        if (g.demo && g.t > 2) g.newGame();
        break;
      case 'card':
        g.t += dt;
        g.player.t += dt;
        MC.updateWeather(g.weather, dt);
        updateFx(dt);
        g.cardT -= dt;
        if (g.cardT <= 0) {
          g.state = 'play';
          input.dx = 0; input.dy = 0;
          g.player.tx = g.player.x; g.player.ty = g.player.y;
          g.player.say(MC.CHARACTER.catchphrase);
        }
        break;
      case 'play':
        updatePlay(dt);
        updateFx(dt);
        break;
      case 'gameover':
      case 'victory':
        g.t += dt; g.endT += dt;
        MC.updateWeather(g.weather, dt);
        updateFx(dt);
        if (g.demo && g.endT > 8) g.newGame();
        break;
      default:
        break;
    }
  }

  function resize() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.style.width = `${Math.floor(W * scale)}px`;
    canvas.style.height = `${Math.floor(H * scale)}px`;
    canvas.width = Math.max(1, Math.round(W * scale * dpr));
    canvas.height = Math.max(1, Math.round(H * scale * dpr));
    g.pxScale = canvas.width / W;
  }

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt);
    render();
    window.requestAnimationFrame(frame);
  }

  MC.step = step;
  MC.render = render;

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { if (document.hidden) g.pause(); });
  window.addEventListener('blur', () => g.pause());
  MC.bindInput(canvas);
  resize();
  window.requestAnimationFrame(frame);
})(window.MC);
