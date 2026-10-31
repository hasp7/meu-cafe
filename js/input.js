'use strict';
// Toque (arrastar relativo + botão da onda), rato e teclado.
(function (MC) {
  const input = MC.input = {
    dx: 0, dy: 0,
    moveId: null, lastX: 0, lastY: 0,
    charging: false, chargeId: null,
    keys: {},
    taps: [],
  };

  MC.bindInput = function (canvas) {
    const toLogical = (e) => {
      const r = canvas.getBoundingClientRect();
      return { x: (e.clientX - r.left) / r.width * MC.W, y: (e.clientY - r.top) / r.height * MC.H };
    };

    canvas.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      if (MC.audio.ac && MC.audio.ac.state === 'suspended') MC.audio.ac.resume();
      const p = toLogical(e);
      try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* nem todos os browsers */ }
      const g = MC.game;
      if (g.state === 'play') {
        if (MC.ui.hitPause(p)) { g.pause(); return; }
        if (MC.ui.hitCharge(p)) { input.chargeId = e.pointerId; input.charging = true; return; }
        if (input.moveId === null) { input.moveId = e.pointerId; input.lastX = p.x; input.lastY = p.y; }
        return;
      }
      // no cartão do nível, o mesmo dedo já fica a conduzir quando o jogo arranca
      if (g.state === 'card' && input.moveId === null) { input.moveId = e.pointerId; input.lastX = p.x; input.lastY = p.y; }
      input.taps.push(p);
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== input.moveId) return;
      e.preventDefault();
      const p = toLogical(e);
      input.dx += p.x - input.lastX;
      input.dy += p.y - input.lastY;
      input.lastX = p.x;
      input.lastY = p.y;
    }, { passive: false });

    const end = (e) => {
      if (e.pointerId === input.moveId) input.moveId = null;
      if (e.pointerId === input.chargeId) { input.chargeId = null; input.charging = false; }
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('lostpointercapture', end);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    const GAME_KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'];
    window.addEventListener('keydown', (e) => {
      if (GAME_KEYS.includes(e.code)) e.preventDefault();
      if (e.repeat) return;
      input.keys[e.code] = true;
      const g = MC.game;
      if (e.code === 'Space' && g.state === 'play') input.charging = true;
      else if (e.code === 'KeyP' || e.code === 'Escape') { if (g.state === 'play') g.pause(); else if (g.state === 'paused') g.resume(); }
      else if (e.code === 'KeyM') MC.audio.toggle();
      else if ((e.code === 'Enter' || e.code === 'Space') && g.state !== 'play') input.taps.push({ key: true });
    });
    window.addEventListener('keyup', (e) => {
      input.keys[e.code] = false;
      if (e.code === 'Space') input.charging = false;
    });
    window.addEventListener('blur', () => { input.keys = {}; input.charging = false; input.moveId = null; });
  };
})(window.MC);
