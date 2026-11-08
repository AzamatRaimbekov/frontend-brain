// «Просто» tab: tiles and one big button. No JSON, no tokens, no settings to understand.
import EXAMPLE from '../../../examples/credit-crm.spec.json';
import { screenTiles, PIECES, easySpec } from '../../../core/easy.js';

const QUICK = {
  starter: ['login', 'dashboard', 'apps', 'app-card', 'app-new'],
  all: EXAMPLE.screens.map((s) => s.id),
};

export function initEasy({ $, esc, send, getStatus }) {
  const picked = new Set(QUICK.starter);
  const pieces = [];
  const choice = { device: 'desktop', theme: 'light' };
  let running = null; // 'screens' | 'custom' | 'kit' while a build of this tab runs

  const tiles = screenTiles(EXAMPLE);
  function drawTiles() {
    $('eTiles').innerHTML = tiles.map((t) => `<button class="tile${picked.has(t.id) ? ' on' : ''}" data-id="${esc(t.id)}">
      <span class="em">${t.emoji}</span><b>${esc(t.title)}</b><span class="muted">${esc(t.hint)}</span></button>`).join('');
    const n = picked.size;
    $('eGo').disabled = !n || !!running;
    $('eGo').textContent = n ? `🎨 Нарисовать ${n} ${plural(n, 'экран', 'экрана', 'экранов')}` : 'Выбери хотя бы один экран 👆';
  }
  $('eTiles').onclick = (e) => {
    const b = e.target.closest('.tile');
    if (!b) return;
    if (picked.has(b.dataset.id)) picked.delete(b.dataset.id); else picked.add(b.dataset.id);
    drawTiles();
  };
  $('eStarter').onclick = () => { picked.clear(); QUICK.starter.forEach((id) => picked.add(id)); drawTiles(); };
  $('eAll').onclick = () => { QUICK.all.forEach((id) => picked.add(id)); drawTiles(); };
  $('eNone').onclick = () => { picked.clear(); drawTiles(); };

  // Big two/three-way switches: device and theme.
  document.querySelectorAll('.seg').forEach((seg) => seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    choice[seg.dataset.key] = b.dataset.v;
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
  }));

  function drawPieces() {
    $('ePieces').innerHTML = PIECES.map((p) => {
      const at = pieces.indexOf(p.type);
      return `<button class="chip${at >= 0 ? ' on' : ''}" data-t="${p.type}">${at >= 0 ? `<i>${at + 1}</i>` : p.emoji} ${esc(p.label)}</button>`;
    }).join('');
    $('eMine').disabled = !pieces.length || !!running;
    $('eOrder').textContent = pieces.length
      ? `Сверху вниз: ${pieces.map((t) => PIECES.find((p) => p.type === t).label).join(' → ')}`
      : 'Нажимай кусочки в том порядке, в каком они будут на экране сверху вниз.';
  }
  $('ePieces').onclick = (e) => {
    const b = e.target.closest('.chip');
    if (!b) return;
    const at = pieces.indexOf(b.dataset.t);
    if (at >= 0) pieces.splice(at, 1); else pieces.push(b.dataset.t);
    drawPieces();
  };
  $('ePiecesClear').onclick = () => { pieces.length = 0; drawPieces(); };

  function say(html, kind) {
    const out = $('eOut');
    out.className = `say ${kind || ''}`;
    out.innerHTML = html;
    out.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function build(kind, pick) {
    const { spec, only } = easySpec(EXAMPLE, { ...pick, device: choice.device, states: $('eStates').checked, product: $('eProduct').value });
    const s = getStatus();
    running = kind;
    lock(true);
    $('eBar').style.width = '0';
    say('⏳ Рисую… Не закрывай окно, это займёт до минуты.');
    send('build', { spec, only, brand: s?.brands[0] || 'bank', style: s?.styles[0], theme: choice.theme, font: 'Inter' });
  }
  function lock(on) {
    for (const id of ['eGo', 'eMine', 'eKit']) $(id).disabled = on;
    if (!on) { drawTiles(); drawPieces(); }
  }

  $('eGo').onclick = () => build('screens', { screens: [...picked] });
  $('eMine').onclick = () => build('custom', { screens: [], custom: { title: $('eTitle').value, pieces: [...pieces] } });
  $('eKit').onclick = () => {
    running = 'kit';
    lock(true);
    say('⏳ Собираю все компоненты на одну страницу…');
    send('contract-render-all', { create: false });
  };

  const handlers = {
    progress: (m) => {
      $('eBar').style.width = `${Math.round((m.done / m.total) * 100)}%`;
      say(`⏳ Рисую ${m.done} из ${m.total}: ${esc(m.label)}`);
    },
    'build:done': (m) => {
      running = null;
      lock(false);
      $('eBar').style.width = m.errors ? '0' : '100%';
      if (m.errors) return say(`😕 Не получилось: ${esc(m.errors[0])}`, 'bad');
      const r = m.result;
      const pages = [...new Set(r.frames.map((f) => f.page))];
      say(`✅ <b>Готово!</b> Нарисовано экранов: ${r.frames.length}.<br>
        👈 Смотри слева страницы: <b>${esc(pages.join(', '))}</b>.<br>
        ${r.prototype ? '▶️ Нажми Present (треугольник вверху справа), чтобы прокликать как настоящее приложение.' : ''}`, 'good');
    },
    'contract-render-all:done': (m) => {
      running = null;
      lock(false);
      say(`✅ <b>Готово!</b> Компонентов: ${m.built}. Они на странице «${esc(m.page)}» слева 👈${m.failed?.length ? `<br>Не собрались: ${esc(m.failed.join(', '))}` : ''}`, 'good');
    },
  };

  drawTiles();
  drawPieces();
  return {
    handlers,
    get busy() { return running; },
    onError(m) {
      running = null;
      lock(false);
      say(`😕 Что-то пошло не так: ${esc(m.message)}<br>Попробуй ещё раз. Не помогло — позови того, кто ставил плагин.`, 'bad');
    },
  };
}

function plural(n, one, few, many) {
  const a = n % 10;
  const b = n % 100;
  if (a === 1 && b !== 11) return one;
  if (a >= 2 && a <= 4 && (b < 12 || b > 14)) return few;
  return many;
}
