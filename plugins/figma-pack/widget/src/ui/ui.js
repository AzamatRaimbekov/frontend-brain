// Iframe of the shadcn Tokens widget: plain DOM, talks to the sandbox (src/ui-bridge.js) by messages.
// Tabs: tokens (values of the fixed shadcn names), code (exports + import), Figma apply, site sync.
import { colorKey } from '../../core/oklch.js';
import { renderCode, renderFigma, onDone } from './views.js';
import { renderSite, onSiteDone } from './site-view.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
export const send = (type, data = {}) => parent.postMessage({ pluginMessage: { type, ...data } }, '*');
export const ui = { state: null, tab: 'tokens', focus: null, group: 'all', query: '' };

export const STATUS = {
  bound: ['✓ в файле', 'success'], differs: ['≠ файл', 'warning'], missing: ['нет в файле', 'error'],
  library: ['в библиотеке', 'info'], unknown: ['не проверено', 'neutral'],
};
export const chip = (label, tone) => `<span class="chip t-${tone}">${esc(label)}</span>`;
// Only a parsed colour reaches the style attribute (8-bit #hex, alpha kept).
export const swatch = (v) => { const hex = colorKey(v); return hex ? `<span class="sw" style="background:${hex}"></span>` : '<span class="sw"></span>'; };

export function toast(text, tone = 'neutral') {
  const t = $('#toast');
  t.className = `t-${tone}`;
  t.textContent = text;
  t.style.display = 'block';
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { t.style.display = 'none'; }, 4000);
}

function renderTokens() {
  const s = ui.state;
  const q = ui.query.toLowerCase();
  const rows = s.rows.filter((r) => (ui.group === 'all' || r.group === ui.group) && (!q || r.name.includes(q)));
  const issues = s.issues.map((i) => `<li><b>--${esc(i.fg)}</b> на --${esc(i.bg)} (${i.mode}): ${i.ratio} &lt; ${i.min}</li>`).join('');
  const opt = (id, label) => `<option value="${id}" ${ui.group === id ? 'selected' : ''}>${esc(label)}</option>`;
  $('#tab-tokens').innerHTML = `
    <p class="muted">Набор shadcn/ui фиксирован: меняются только значения (light / dark). Цвет — <span class="mono">oklch(L C H)</span>, <span class="mono">oklch(L C H / 10%)</span> или #hex; радиус — rem или px.</p>
    <div class="row">
      <select id="group">${opt('all', 'Все группы')}${s.groups.map((g) => opt(g.id, g.label)).join('')}</select>
      <input id="query" placeholder="Поиск: primary, sidebar…" value="${esc(ui.query)}">
      <span class="muted">${rows.length} из ${s.rows.length}</span>
      <span style="flex:1"></span>
      <button class="btn" id="reset-all">Сбросить все правки</button>
    </div>
    ${issues ? `<div class="box"><b>Контраст AA: ${s.issues.length}</b><ul>${issues}</ul></div>` : ''}
    <table><thead><tr><th>light</th><th>dark</th><th>CSS-переменная</th><th>Статус</th><th></th></tr></thead><tbody>
    ${rows.map((r) => {
      const [label, tone] = STATUS[r.status] || STATUS.unknown;
      const input = (mode) => (r.kind === 'radius' && mode === 'dark'
        ? '<span class="muted">как light</span>'
        : `${r.kind === 'color' ? swatch(r[mode]) : ''} <input class="hex" data-key="${esc(r.key)}" data-mode="${mode}" value="${esc(r[mode])}">`);
      return `<tr class="${ui.focus === r.key ? 'focus' : ''}" id="row-${esc(r.key)}">
        <td>${input('light')}</td><td>${input('dark')}</td>
        <td class="mono">--${esc(r.name)}<div class="muted">shadcn / ${esc(r.name)}</div></td>
        <td>${chip(label, tone)} ${r.edited ? chip('изменён', 'brand') : ''}</td>
        <td>${r.edited ? `<button class="btn" data-reset="${esc(r.key)}" title="Вернуть значение shadcn по умолчанию">↺</button>` : ''}</td>
      </tr>`;
    }).join('')}
    </tbody></table>`;
  $('#group').onchange = (e) => { ui.group = e.target.value; renderTokens(); };
  // The re-render replaces the input: keep focus and the caret, or typing lands at the start.
  $('#query').oninput = (e) => {
    const at = e.target.selectionStart;
    ui.query = e.target.value;
    renderTokens();
    $('#query').focus();
    $('#query').setSelectionRange(at, at);
  };
  $('#reset-all').onclick = () => send('reset-all');
  for (const el of document.querySelectorAll('#tab-tokens input.hex')) {
    el.onchange = () => {
      const key = el.dataset.key;
      const other = document.querySelector(`#tab-tokens input[data-key="${CSS.escape(key)}"][data-mode="${el.dataset.mode === 'light' ? 'dark' : 'light'}"]`);
      send('set-token', { key, [el.dataset.mode]: el.value, ...(other ? { [other.dataset.mode]: other.value } : {}) });
    };
  }
  for (const b of document.querySelectorAll('[data-reset]')) b.onclick = () => send('reset-token', { key: b.dataset.reset });
  if (ui.focus) { const el = document.getElementById(`row-${ui.focus}`); if (el) el.scrollIntoView({ block: 'center' }); ui.focus = null; }
}

const RENDER = { tokens: renderTokens, code: renderCode, figma: renderFigma, site: renderSite };

export function show(tab) {
  ui.tab = RENDER[tab] ? tab : 'tokens';
  for (const b of document.querySelectorAll('#tabs button')) b.classList.toggle('on', b.dataset.tab === ui.tab);
  for (const s of document.querySelectorAll('main section')) s.classList.toggle('on', s.id === `tab-${ui.tab}`);
  if (ui.state) RENDER[ui.tab]();
}

window.onmessage = (e) => {
  const m = e.data && e.data.pluginMessage;
  if (!m) return;
  if (m.type === 'open') { ui.focus = m.focus; if (m.focus) ui.group = 'all'; ui.pendingTab = m.tab; return; }
  if (m.type === 'state') {
    ui.state = m.state;
    if (ui.pendingTab) { const t = ui.pendingTab; ui.pendingTab = null; show(t); } else if (['tokens', 'figma'].includes(ui.tab)) RENDER[ui.tab]();
    return;
  }
  if (m.type === 'error') { toast(`${m.for}: ${m.message}`, 'error'); return; }
  if (m.type.startsWith('site-') && m.type.endsWith(':done')) { onSiteDone(m.type.slice(0, -5), m); return; }
  if (m.type.endsWith(':done')) onDone(m.type.slice(0, -5), m);
};

for (const b of document.querySelectorAll('#tabs button')) b.onclick = () => show(b.dataset.tab);
$('#close').onclick = () => send('close');
send('ready');
