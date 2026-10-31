'use strict';
// O herói. Tudo o que define a aparência vive aqui — muda estes valores e o jogo segue-os.
// A cara definitiva fica para depois: por agora são marcadores de posição.
window.MC = window.MC || {};

window.MC.CHARACTER = {
  // Cabeça
  skin: '#f2c9a0',
  hair: '#2b2b33',
  hairStyle: 'spiky',      // 'spiky' | 'short' | 'bald'
  beard: false,
  beardColor: '#2b2b33',
  glasses: false,
  glassesColor: '#1d2340',

  // Fato de artes marciais
  gi: '#f08a24',           // cor principal
  giTrim: '#1f4fa0',       // cinto, punhos, botas

  // Nuvem e aura
  cloud: '#ffd84d',
  cloudShade: '#f2b632',
  aura: '#8fe3ff',

  // Emblema ao peito (logótipo HC) e variante de dia de jogo (desenho original, não é um emblema oficial)
  emblem: 'assets/hc-fenix.png',
  matchDay: { stripeA: '#1f4fa0', stripeB: '#ffffff' },

  // Frase-assinatura (fica em inglês de propósito)
  catchphrase: 'Where is my coffee?',
};
