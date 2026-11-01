// Iframe of the Mbank Tokens widget: plain DOM, talks to the sandbox (src/ui-bridge.js) by messages.
// Tabs: tokens, project tokens, brand from one colour, components, code sync, Figma apply.
import { validateExtra, KINDS } from '../../core/checks.js';
import { renderGenerate, renderCode, renderFigma, onDone } from './views.js';
import { renderBind, propagationBox } from './components-view.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`);
export const send = (type, data = {}) => parent.postMessage({ pluginMessage: { type, ...data } }, '*');
export const ui = { state: null, tab: 'tokens', focus: null, group: 'all', query: '' };

export const STATUS = {
  bound: ['✓ в файле', 'success'], differs: ['≠ файл', 'warning'], missing: ['нет в файле', 'error'],
  library: ['в библиотеке', 'info'], unknown: ['не проверено', 'neutral'],
};
export const chip = (label, tone) => `<span class="chip t-${tone}">${esc(label)}</span>`;
export const swatch = (v) => (/^#[0-9a-f]{3,8}$/i.test(String(v)) ? `<span class="sw" style="background:${esc(v)}"></span>` : '<span class="sw"></span>');

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
  const rows = s.rows.filter((r) => (ui.group === 'all' || r.group === ui.group) && (!q || r.css.includes(q) || r.figma.toLowerCase().includes(q)));
  const issues = s.issues.map((i) => `<li><b>--${esc(i.fg)}</b> на --${esc(i.bg)} (${i.mode}): ${i.ratio} &lt; ${i.min}</li>`).join('');
  const opt = (id, label) => `<option value="${id}" ${ui.group === id ? 'selected' : ''}>${esc(label)}</option>`;
  $('#tab-tokens').innerHTML = `
    <div class="row">
      <select id="group">${opt('all', 'Все группы')}${s.groups.map((g) => opt(g.id, g.label)).join('')}</select>
      <input id="query" placeholder="Поиск: primary, text/default…" value="${esc(ui.query)}">
      <span class="muted">${rows.length} из ${s.rows.length}</span>
      <span style="flex:1"></span>
      <button class="btn" id="reset-all">Сбросить все правки</button>
    </div>
    ${issues ? `<div class="box"><b>Контраст AA (бренд ${esc(s.brand)}): ${s.issues.length}</b><ul>${issues}</ul></div>` : ''}
    <table><thead><tr><th>light</th><th>dark</th><th>CSS-токен</th><th>Переменная Figma</th><th>Статус</th><th></th></tr></thead><tbody>
    ${rows.map((r) => {
      const [label, tone] = STATUS[r.status] || STATUS.unknown;
      const input = (mode) => `${r.kind === 'color' ? swatch(r[mode]) : ''} <input class="hex" data-key="${esc(r.key)}" data-mode="${mode}" value="${esc(r[mode])}" ${r.derivedFrom ? 'disabled' : ''}>`;
      return `<tr class="${ui.focus === r.key ? 'focus' : ''}" id="row-${esc(r.key)}">
        <td>${input('light')}</td><td>${input('dark')}</td>
        <td class="mono">--${esc(r.css)}${r.note ? `<div class="muted">${esc(r.note)}</div>` : ''}${r.derivedFrom ? `<div class="muted">следует за ${esc(r.derivedFrom)}</div>` : ''}</td>
        <td class="muted">${esc(r.collection)} / ${esc(r.figma)}</td>
        <td>${chip(label, tone)} ${r.edited ? chip(r.extra ? 'новый' : 'изменён', 'brand') : ''}</td>
        <td>${r.extra ? `<button class="btn" data-remove="${esc(r.css)}">Удалить</button>` : r.edited ? `<button class="btn" data-reset="${esc(r.key)}" title="Вернуть значение из tokens.json">↺</button>` : ''}</td>
      </tr>`;
    }).join('')}
    </tbody></table>`;
  $('#group').onchange = (e) => { ui.group = e.target.value; renderTokens(); };
  $('#query').oninput = (e) => { ui.query = e.target.value; renderTokens(); $('#query').focus(); };
  $('#reset-all').onclick = () => send('reset-all');
  for (const el of document.querySelectorAll('#tab-tokens input.hex')) {
    el.onchange = () => {
      const key = el.dataset.key;
      const other = document.querySelector(`#tab-tokens input[data-key="${CSS.escape(key)}"][data-mode="${el.dataset.mode === 'light' ? 'dark' : 'light'}"]`);
      const values = { [el.dataset.mode]: el.value, [other.dataset.mode]: other.value };
      if (key.startsWith('extra:')) send('set-extra', { token: { name: key.slice(6), ...values } });
      else send('set-token', { key, ...values });
    };
  }
  for (const b of document.querySelectorAll('[data-reset]')) b.onclick = () => send('reset-token', { key: b.dataset.reset });
  for (const b of document.querySelectorAll('[data-remove]')) b.onclick = () => send('remove-extra', { name: b.dataset.remove });
  if (ui.focus) { const el = document.getElementById(`row-${ui.focus}`); if (el) el.scrollIntoView({ block: 'center' }); ui.focus = null; }
}

function renderExtra() {
  const s = ui.state;
  const extras = s.rows.filter((r) => r.extra);
  const colors = s.rows.filter((r) => r.kind === 'color').map((r) => r.css);
  $('#tab-extra').innerHTML = `
    <p class="muted">Токен проекта: <span class="mono">&lt;префикс&gt;-&lt;роль&gt;</span>, kebab-case. В Figma — переменная <span class="mono">2.theme / custom/&lt;префикс&gt;/&lt;роль&gt;</span> с light/dark, в коде — <span class="mono">--&lt;префикс&gt;-&lt;роль&gt;</span>. Сначала проверьте, нет ли подходящего токена Mbank.</p>
    <div class="box">
      <div class="row"><label>Префикс проекта <input id="x-prefix" value="${esc(s.prefix)}" size="8"></label>
        <label>Имя <input id="x-name" value="${esc(s.prefix)}-" size="28"></label>
        <label>Тип <select id="x-kind">${KINDS.map((k) => `<option>${k}</option>`).join('')}</select></label></div>
      <div class="row"><label>light <input id="x-light" class="hex" placeholder="#rrggbb / 12px"></label>
        <label>dark <input id="x-dark" class="hex" placeholder="как light"></label>
        <label>Фон для контраста <select id="x-pair"><option value="">— (по имени *-foreground)</option>${colors.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label></div>
      <div id="x-errors" class="err"></div>
      <button class="btn primary" id="x-add">Добавить токен</button>
    </div>
    <h3>Токены проекта (${extras.length})</h3>
    ${extras.length ? `<table><thead><tr><th>light</th><th>dark</th><th>CSS-токен</th><th>Переменная Figma</th><th>Статус</th><th></th></tr></thead><tbody>${extras.map((r) => {
      const [label, tone] = STATUS[r.status] || STATUS.unknown;
      const input = (mode) => `${r.kind === 'color' ? swatch(r[mode]) : ''} <input class="hex" data-extra="${esc(r.css)}" data-mode="${mode}" value="${esc(r[mode])}">`;
      return `<tr><td>${input('light')}</td><td>${input('dark')}</td><td class="mono">--${esc(r.css)}</td><td class="muted">${esc(r.collection)} / ${esc(r.figma)}</td><td>${chip(label, tone)}</td><td><button class="btn" data-remove="${esc(r.css)}">Удалить</button></td></tr>`;
    }).join('')}</tbody></table>
    <div class="row"><button class="btn primary" id="x-apply">Применить в Figma</button><button class="btn" id="x-dry">Что изменится</button>
      <span class="muted">Создаёт или меняет переменные 2.theme / custom/… (light и dark). Дальше — вкладка «Компоненты».</span></div>
    ${propagationBox(s.propagation && s.propagation.kind === 'apply' ? s.propagation : null)}` : '<p class="muted">Пока нет.</p>'}`;
  const token = () => ({ name: $('#x-name').value.trim(), kind: $('#x-kind').value, light: $('#x-light').value, dark: $('#x-dark').value || $('#x-light').value, pairWith: $('#x-pair').value || undefined });
  const check = () => {
    const taken = new Set(s.rows.map((r) => r.css));
    const errors = validateExtra(token(), $('#x-prefix').value.trim(), taken);
    $('#x-errors').innerHTML = errors.map(esc).join('<br>');
    $('#x-add').disabled = errors.length > 0;
  };
  for (const id of ['#x-name', '#x-kind', '#x-light', '#x-dark', '#x-pair']) $(id).oninput = check;
  $('#x-prefix').onchange = () => send('prefix', { prefix: $('#x-prefix').value });
  $('#x-prefix').oninput = check;
  $('#x-add').onclick = () => send('add-extra', { token: token() });
  for (const b of document.querySelectorAll('#tab-extra [data-remove]')) b.onclick = () => send('remove-extra', { name: b.dataset.remove });
  for (const el of document.querySelectorAll('#tab-extra input[data-extra]')) {
    el.onchange = () => {
      const other = document.querySelector(`#tab-extra input[data-extra="${CSS.escape(el.dataset.extra)}"][data-mode="${el.dataset.mode === 'light' ? 'dark' : 'light'}"]`);
      send('set-extra', { token: { name: el.dataset.extra, [el.dataset.mode]: el.value, [other.dataset.mode]: other.value } });
    };
  }
  if ($('#x-apply')) $('#x-apply').onclick = () => send('apply', {});
  if ($('#x-dry')) $('#x-dry').onclick = () => { send('apply', { dryRun: true }); show('figma'); };
  check();
}

const RENDER = { tokens: renderTokens, extra: renderExtra, generate: renderGenerate, bind: renderBind, code: renderCode, figma: renderFigma };

export function show(tab) {
  ui.tab = tab;
  for (const b of document.querySelectorAll('#tabs button')) b.classList.toggle('on', b.dataset.tab === tab);
  for (const s of document.querySelectorAll('main section')) s.classList.toggle('on', s.id === `tab-${tab}`);
  if (ui.state) RENDER[tab]();
}

window.onmessage = (e) => {
  const m = e.data && e.data.pluginMessage;
  if (!m) return;
  if (m.type === 'open') { ui.focus = m.focus; if (m.focus) ui.group = 'all'; ui.pendingTab = m.tab; return; }
  if (m.type === 'state') {
    ui.state = m.state;
    $('#brand').innerHTML = m.state.brands.map((b) => `<option ${b === m.state.brand ? 'selected' : ''}>${b}</option>`).join('');
    if (ui.pendingTab) { const t = ui.pendingTab; ui.pendingTab = null; show(t); } else if (['tokens', 'extra', 'bind', 'figma'].includes(ui.tab)) RENDER[ui.tab]();
    return;
  }
  if (m.type === 'error') { toast(`${m.for}: ${m.message}`, 'error'); return; }
  if (m.type.endsWith(':done')) onDone(m.type.slice(0, -5), m);
};

$('#brand').onchange = (e) => send('brand', { brand: e.target.value });
for (const b of document.querySelectorAll('#tabs button')) b.onclick = () => show(b.dataset.tab);
$('#close').onclick = () => send('close');
send('ready');
