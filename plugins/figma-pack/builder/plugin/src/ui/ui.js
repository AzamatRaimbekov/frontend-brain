// Plugin window. Pure DOM; talks to code.js through postMessage.
import { contrastReport } from '../../../core/tokens.js';
import { validateSpec, framePlan } from '../../../core/spec.js';
import { initComponents } from './components-ui.js';
import { initEasy } from './easy-ui.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const send = (type, data = {}) => parent.postMessage({ pluginMessage: { type, ...data } }, '*');
let status = null;
let kitMap = null;

function toast(text, bad) {
  const t = $('toast');
  t.textContent = text;
  t.style.background = bad ? 'var(--danger)' : '';
  t.style.display = 'block';
  clearTimeout(toast.t);
  toast.t = setTimeout(() => { t.style.display = 'none'; }, bad ? 6000 : 2500);
}

function busy(btn, on) { if (btn) btn.disabled = on; }

// Plugin iframes block window.confirm: a dangerous button asks for a second click instead.
function confirmClick(btn, question, fn) {
  btn.onclick = () => {
    if (btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = btn.dataset.label; fn(); return; }
    btn.dataset.label = btn.textContent;
    btn.dataset.armed = '1';
    btn.textContent = question;
    setTimeout(() => { if (btn.dataset.armed) { delete btn.dataset.armed; btn.textContent = btn.dataset.label; } }, 4000);
  };
}

document.querySelectorAll('nav button[data-tab]').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('nav button[data-tab], section').forEach((x) => x.classList.remove('on'));
  b.classList.add('on');
  $(b.dataset.tab).classList.add('on');
}));

function renderStatus(s) {
  status = s;
  $('status').innerHTML = s.collection
    ? `<b>Коллекция shadcn</b> · режимы: ${esc(s.modes.join(', '))} · цветов ${s.colors}/${s.total}${s.missing.length ? ` · <span class="err">нет: ${esc(s.missing.join(', '))}</span>` : ' · <span class="ok">все переменные на месте</span>'}`
    : '<b class="err">Коллекции shadcn нет.</b> Нажмите «Создать / обновить переменные» — или просто рисуйте: плагин создаст её сам.';
  if (s.collection) send('tokens-read');
}

// Values as the window shows them: oklch() is rendered by the iframe browser itself.
function renderTokens(t) {
  const bad = contrastReport(t).filter((r) => !r.ok);
  const cell = (v) => `<span class="sw" style="background:${esc(v)}"></span>${esc(v)}`;
  $('tTable').innerHTML = `<table><tr><th>Токен</th><th>Light</th><th>Dark</th></tr>${Object.entries(t.colors).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${cell(v.light)}</td><td>${cell(v.dark)}</td></tr>`).join('')}</table>
    <p>radius ${esc(t.radius)}</p>
    <p class="${bad.length ? 'err' : 'ok'}">${bad.length ? `Контраст ниже нормы: ${bad.map((r) => `${r.fg} на ${r.bg} (${r.mode}) ${r.ratio}`).join('; ')}` : 'Контраст всех пар в норме (WCAG AA)'}</p>`;
}

$('tApply').onclick = () => { busy($('tApply'), true); send('tokens-apply', { reset: $('tReset').checked }); };
$('exportCss').onclick = () => send('export-css');
$('copyCss').onclick = () => { $('cssOut').select(); document.execCommand('copy'); toast('CSS скопирован'); };

function checkSpec() {
  const raw = $('spec').value.trim();
  if (!raw) { $('specInfo').textContent = ''; $('build').disabled = true; return null; }
  let spec;
  try { spec = JSON.parse(raw); } catch (e) { $('specInfo').innerHTML = `<span class="err">Не JSON: ${esc(e.message)}</span>`; $('build').disabled = true; return null; }
  const errors = validateSpec(spec);
  if (errors.length) { $('specInfo').innerHTML = `<span class="err">${errors.slice(0, 8).map(esc).join('<br>')}</span>`; $('build').disabled = true; return null; }
  const plan = framePlan(spec);
  $('specInfo').innerHTML = `<span class="ok">Ок:</span> ${spec.screens.length} экранов → ${plan.length} фреймов`;
  $('build').disabled = false;
  return spec;
}
$('spec').addEventListener('input', checkSpec);
$('specFile').onchange = async (e) => { const f = e.target.files[0]; if (f) { $('spec').value = await f.text(); checkSpec(); } };
$('build').onclick = () => {
  const spec = checkSpec();
  if (!spec) return;
  busy($('build'), true);
  $('progress').style.width = '0';
  send('build', { spec, theme: $('bTheme').value, font: $('bFont').value || 'Inter' });
};

$('scanKit').onclick = () => { busy($('scanKit'), true); $('kitOut').textContent = 'Сканирую все страницы…'; send('scan-kit'); };
$('saveKit').onclick = () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(kitMap, null, 2)], { type: 'application/json' }));
  a.download = 'kit-map.json';
  a.click();
};

const on = {
  'init:done': (m) => renderStatus(m.status),
  'tokens-apply:done': (m) => {
    busy($('tApply'), false);
    renderStatus(m.status);
    renderTokens(m.tokens);
    toast(`Готово: создано ${m.report.created.length}, сброшено ${m.report.reset}`);
  },
  'tokens-read:done': (m) => renderTokens(m.tokens),
  'export-css:done': (m) => {
    $('cssOut').value = m.css;
    $('copyCss').disabled = false;
    if (m.tokens.missing.length) toast(`Нет значений для: ${m.tokens.missing.join(', ')}`, true);
  },
  progress: (m) => { $('progress').style.width = `${Math.round((m.done / m.total) * 100)}%`; $('buildOut').textContent = `${m.done}/${m.total} · ${m.label}`; },
  'build:done': (m) => {
    busy($('build'), false);
    if (m.errors) { $('buildOut').innerHTML = `<span class="err">${m.errors.map(esc).join('<br>')}</span>`; return; }
    const r = m.result;
    const a = m.audit;
    $('buildOut').innerHTML = `<b class="ok">Собрано фреймов: ${r.frames.length}</b> на страницах: ${esc([...new Set(r.frames.map((f) => f.page))].join(', '))}<br>
      Компоненты кита: ${r.stats.instances}, нарисовано плагином: ${r.stats.fallbacks}<br>
      ${r.prototype ? `Прототип: страница «${esc(r.prototype.page)}», экранов ${r.prototype.frames.length}, переходов ${r.prototype.wired} — Present (▶) чтобы прокликать<br>${r.prototype.missing.length ? `<span class="err">Не нашёл, куда кликать: ${esc(r.prototype.missing.join('; '))}</span><br>` : ''}` : ''}
      ${r.fallbackFonts ? '<span class="err">Шрифт стилей кита не установлен — использованы запасные стили ds/* на ' + esc(r.font) + '</span><br>' : ''}
      Проверка: ${a.ok ? '<span class="ok">все цвета на токенах, весь текст на стилях</span>' : `<span class="err">цвета без токена ${a.rawFills + a.rawStrokes}, текст без стиля ${a.unstyledText}</span> ${esc(a.samples.join(', '))}`}`;
  },
  'scan-kit:done': (m) => {
    busy($('scanKit'), false);
    kitMap = m;
    $('saveKit').disabled = false;
    const roles = Object.entries(m.kit);
    $('kitOut').innerHTML = `Компонентов в файле: ${m.count}<br>${roles.length ? roles.map(([r, c]) => `<b>${esc(r)}</b> → ${esc(c.name)}`).join('<br>') : 'Совпадений по ролям нет'}`;
  },
  error: (m) => {
    for (const id of ['tApply', 'build', 'scanKit']) busy($(id), false);
    components.onError(m);
    if (m.for === 'build') checkSpec();
    toast(`Ошибка (${m.for}): ${m.message}`, true);
  },
};

const components = initComponents({ $, esc, send, toast });
Object.assign(on, components.handlers);

// «Просто» tab owns the replies to the builds it started; the pro tabs get the rest.
const easy = initEasy({ $, esc, send, getStatus: () => status });
for (const k of Object.keys(easy.handlers)) {
  const pro = on[k];
  on[k] = (m) => (easy.busy ? easy.handlers[k](m) : pro(m));
}
const proError = on.error;
on.error = (m) => (easy.busy ? easy.onError(m) : proError(m));
// Pro tabs (tokens, JSON spec, contracts) stay hidden until asked for.
function setPro(v) {
  document.body.classList.toggle('pro', v);
  $('proToggle').textContent = v ? '✕ Скрыть настройки' : '⚙️ Для профи';
  if (!v && !$('easy').classList.contains('on')) document.querySelector('nav button[data-tab="easy"]').click();
}
$('proToggle').onclick = () => setPro(!document.body.classList.contains('pro'));

window.onmessage = (e) => { const m = e.data.pluginMessage; if (m && on[m.type]) on[m.type](m); };
send('init');
components.start();
