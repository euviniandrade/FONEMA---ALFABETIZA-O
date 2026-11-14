/* FONEMA · Espelho do Som (v3) — entrada do iframe (embed.html) e contrato com o app.
 *
 * URL:  embed.html?f=m&quem=sofia|tales&compacto=1&lento=1&rotulos=0|1&sons=../audio/sons/mapa.json
 * Mensagens que o iframe ACEITA (window.postMessage):
 *   { tipo: 'espelho:fonema', f: 'l' }            troca o som (mesmo contrato da versão anterior)
 *   { tipo: 'espelho:falando', ativo: true|false, duracao?: segundos }
 *                                                 o app avisa que a voz está fazendo o som AGORA: a boca recomeça
 *                                                 junto e segura o som enquanto durar (sincronia com o áudio do app)
 *   { tipo: 'espelho:repetir' }   { tipo: 'espelho:lento', lento: true }   { tipo: 'espelho:rotulos', rotulos: false }
 *   { tipo: 'espelho:quem', quem: 'tales' }       { tipo: 'espelho:ouvir' }  (toca o arquivo do mapa de sons, se houver)
 *   'espelho:vista' é aceito e ignorado: as duas vistas ficam sempre na tela.
 * Mensagens que o iframe ENVIA ao app:
 *   { tipo: 'espelho:pronto', fonemas: [...], webgl: true|false, versao: 3 }   { tipo: 'espelho:mudou', f, quem }
 *   { tipo: 'espelho:audio', f, tocou: true|false }
 *
 * PONTO DO ÁUDIO: `sons` aponta para um JSON { "<fonema ou letra>": "arquivo.mp3" | { arquivo, duracao } } (caminhos
 * relativos ao próprio JSON, ou ao campo "base"). Se o mapa tiver o som, o botão de repetir toca o arquivo e a boca
 * segura o som pela duração do áudio. Sem mapa, o áudio continua vindo do app (que avisa com 'espelho:falando').
 */
import { montar, idFonema } from './espelho3d.js';

const q = new URLSearchParams(location.search);
const compacto = q.get('compacto') === '1' || q.get('compacto') === 'true';
if (compacto) document.body.classList.add('compacto');
let manda = () => {};
const alvo = window.parent;
const api = await montar(document.getElementById('espelho'), {
  fonema: q.get('f') || q.get('fonema') || 'a', quem: q.get('quem'), compacto,
  lento: q.get('lento') === '1', rotulos: q.has('rotulos') ? q.get('rotulos') !== '0' : undefined,
  sons: q.has('sons') ? q.get('sons') : '../audio/sons/mapa.json',
  semWebGL: q.get('semwebgl') === '1', menosMovimento: q.has('menosmov') ? q.get('menosmov') === '1' : undefined,
  aoMudar: (e) => manda({ tipo: 'espelho:mudou', f: e.f, quem: e.quem }),
  aoAudio: (e) => manda({ tipo: 'espelho:audio', f: e.f, tocou: e.tocou })
});
manda = (m) => { if (alvo && alvo !== window) { try { alvo.postMessage(m, '*'); } catch (e) { /* nada */ } } };
window.addEventListener('message', (ev) => {
  const m = ev.data; if (!m || typeof m !== 'object' || typeof m.tipo !== 'string' || m.tipo.indexOf('espelho:') !== 0) return;
  if (m.tipo === 'espelho:fonema') api.fonema(m.f !== undefined ? m.f : m.fonema);
  else if (m.tipo === 'espelho:falando') api.falando(!!m.ativo, m.duracao);
  else if (m.tipo === 'espelho:repetir') api.repetir();
  else if (m.tipo === 'espelho:lento') api.lento(m.lento);
  else if (m.tipo === 'espelho:rotulos') api.rotulos(m.rotulos);
  else if (m.tipo === 'espelho:quem') api.quem(m.quem);
  else if (m.tipo === 'espelho:ouvir') api.ouvir();
});
if (q.has('congela')) api.congelar(isNaN(+q.get('congela')) ? q.get('congela') : +q.get('congela'));
window.ESPELHO = api; window.idFonema = idFonema;
manda({ tipo: 'espelho:pronto', fonemas: Object.keys(globalThis.FonemasPT.F), webgl: api.estado().webgl, versao: 3 });
document.documentElement.dataset.pronto = '1';
