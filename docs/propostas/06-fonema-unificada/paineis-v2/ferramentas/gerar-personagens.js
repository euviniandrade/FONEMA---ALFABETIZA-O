// Gera SVGs da Sofia (uniforme, sem adornos) e do Bolota a partir da fonte v2 dos personagens.
// node ferramentas/gerar-personagens.js
const fs = require('fs'), path = require('path');
const src = path.join(__dirname, '..', '..', 'personagens-v2', 'fonte');
const { defs, groundShadow } = require(path.join(src, 'core'));
const S = require(path.join(src, 'sofia'));
const B = require(path.join(src, 'bolota'));
const out = path.join(__dirname, '..', 'img');
const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${defs()}${body}</svg>`;
const fontes = `<style>text{font-family:Andika,Fredoka,sans-serif}</style>`;
const poses = {
  'sofia-acena': { expr: 'alegre', letter: 'R', headTilt: -5, armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } },
  'sofia-aponta': { expr: 'alegre', turn: 1, letter: 'R', armR: { t: [236, 300], hand: 'point', hrot: -50, bend: 'out' }, headTilt: 6 },
  'sofia-explica': { expr: 'falando', letter: 'R', armL: { t: [-196, 520], hand: 'open', hrot: 140, bend: 'in' }, armR: { t: [196, 520], hand: 'open', hrot: 40, bend: 'in' } },
  'sofia-comemora': { expr: 'comemorando', letter: 'R', legs: 'jump', armL: { t: [-180, 210], hand: 'wave', hrot: 160 }, armR: { t: [180, 210], hand: 'wave', hrot: 200 } },
  'sofia-convida': { expr: 'encorajadora', turn: 1, letter: 'R', armR: { t: [230, 470], hand: 'open', hrot: -10, bend: 'in' } },
};
for (const [n, o] of Object.entries(poses)) {
  fs.writeFileSync(path.join(out, n + '.svg'), svg('-330 40 660 1000', fontes + groundShadow(0, 1000, 210) + S.sofia(o)));
}
// busto (para miniaturas de vídeo e avatares)
fs.writeFileSync(path.join(out, 'sofia-busto.svg'), svg('-260 40 520 600', fontes + S.sofia({ expr: 'alegre', letter: 'R', armR: { t: [188, 250], hand: 'wave', hrot: -100, bend: 'out' } })));
fs.writeFileSync(path.join(out, 'sofia-busto-explica.svg'), svg('-260 40 520 600', fontes + S.sofia({ expr: 'falando', letter: 'R', armR: { t: [236, 300], hand: 'point', hrot: -50, bend: 'out' } })));
// Bolota (tatu-bola, animal da vila)
fs.writeFileSync(path.join(out, 'bolota.svg'), svg('-240 -310 520 340', B.bolota({ expr: 'alegre' })));
console.log('ok');
