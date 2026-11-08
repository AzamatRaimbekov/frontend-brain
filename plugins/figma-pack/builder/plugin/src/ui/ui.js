// Plugin window. Pure DOM; talks to code.js through postMessage.
import { generateTokens, contrastReport, BRAND_KEYS, COLOR_TOKENS } from '../../../core/tokens.js';
import { validateSpec, framePlan } from '../../../core/spec.js';
import { initComponents } from './components-ui.js';
import { initEasy } from './easy-ui.js';

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const send = (type, data = {}) => parent.postMessage({ pluginMessage: { type, ...data } }, '*');
let status = null;
let generated = null;
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

const fillSelect = (sel, items, keep) => {
  const prev = keep ? sel.value : null;
  sel.innerHTML = items.map((x) => `<option>${esc(x)}</option>`).join('');
  if (prev && items.includes(prev)) sel.value = prev;
};

function renderStatus(s) {
  status = s;
  const on = s.brands.length > 0;
  $('status').innerHTML = !s.kit
    ? '<b class="err">shadcn-кит не найден.</b> Нужны коллекции Style и Mode: откройте копию файла shadcn_ui-kit.'
    : `<b>Кит найден</b> · стилей: ${s.styles.length} · коллекции: ${esc(s.collections.join(', '))}<br>
       Слой Brand: ${on ? `<span class="ok">включён</span>, связано ${s.migrated}/${s.total} токенов, брендов: ${s.brands.length}` : '<span class="err">не включён</span>'}<br>
       ${s.legacyNames.length ? `Имена с пробелами: ${s.legacyNames.length}<br>` : ''}
       ${s.missingExtensions.length ? `Нет статусов: ${esc(s.missingExtensions.join(', '))}` : 'Статусы success / warning / info есть'}`;
  $('setup').textContent = on ? 'Обновить слой Brand' : 'Включить слой Brand';
  $('rollback').disabled = !on;
  for (const id of ['brandSel', 'bBrand']) fillSelect($(id), s.brands, true);
  for (const id of ['styleSel', 'bStyle']) fillSelect($(id), s.styles, true);
  if (on) send('read-brand', { brand: $('brandSel').value, style: $('styleSel').value });
  send('list-custom');
}

function renderTable(t) {
  const by = {};
  for (const r of t.rows) (by[r.token] = by[r.token] || {})[r.theme] = r;
  const cell = (r) => (r ? `<span class="sw" style="background:${esc(r.hex)}"></span>${esc(r.value)}${r.inherited ? ' <span class="tag">из стиля</span>' : ''}` : '—');
  $('brandTable').innerHTML = `<p>Бренд <b>${esc(t.brand)}</b> · стиль ${esc(t.style)} · шрифт ${esc(t.font || '—')}</p>
    <table><tr><th>Токен</th><th>Light</th><th>Dark</th></tr>${Object.entries(by).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${cell(v.light)}</td><td>${cell(v.dark)}</td></tr>`).join('')}</table>`;
}

function keysToApply() {
  return $('withNeutrals').checked ? COLOR_TOKENS : BRAND_KEYS;
}

function renderPreview() {
  const keys = keysToApply();
  const report = contrastReport(generated).filter((r) => keys.includes(r.fg) || keys.includes(r.bg));
  const bad = report.filter((r) => !r.ok);
  $('preview').innerHTML = `<table><tr><th>Токен</th><th>Light</th><th>Dark</th></tr>${keys.map((k) => `<tr><td>${esc(k)}</td>
    <td><span class="sw" style="background:${generated.colors.light[k]}"></span>${generated.colors.light[k]}</td>
    <td><span class="sw" style="background:${generated.colors.dark[k]}"></span>${generated.colors.dark[k]}</td></tr>`).join('')}</table>
    <p class="${bad.length ? 'err' : 'ok'}">${bad.length ? `Контраст ниже нормы: ${bad.map((r) => `${r.fg} на ${r.bg} (${r.mode}) ${r.ratio}`).join('; ')}` : 'Контраст всех пар в норме (WCAG AA)'}</p>`;
}

$('brandColor').addEventListener('input', (e) => { $('brandHex').value = e.target.value; });
$('brandHex').addEventListener('change', (e) => { if (/^#[0-9a-f]{6}$/i.test(e.target.value)) $('brandColor').value = e.target.value; });
$('generate').onclick = () => {
  try {
    generated = generateTokens({ name: $('brandSel').value, brand: $('brandHex').value, neutral: $('neutral').value, font: $('font').value || undefined });
    if ($('font').value) generated.font.heading = $('font').value;
    renderPreview();
    $('apply').disabled = !status?.brands.length;
  } catch (e) { toast(e.message, true); }
};
$('withNeutrals').onchange = () => generated && renderPreview();
$('apply').onclick = () => {
  busy($('apply'), true);
  send('apply-brand', { brand: $('brandSel').value, style: $('styleSel').value, tokens: generated, keys: keysToApply(), reset: true, snap: $('snap').checked });
};

$('setup').onclick = () => { busy($('setup'), true); send('setup', { fixScopes: $('fixScopes').checked, fixNames: $('fixNames').checked }); };
confirmClick($('rollback'), 'Точно откатить? Нажмите ещё раз', () => send('rollback'));
$('addBrand').onclick = () => { const name = $('newBrand').value.trim(); if (name) send('add-brand', { name }); };
confirmClick($('removeBrand'), 'Точно удалить? Ещё раз', () => send('remove-brand', { name: $('brandSel').value }));
for (const id of ['brandSel', 'styleSel']) $(id).onchange = () => send('read-brand', { brand: $('brandSel').value, style: $('styleSel').value });

$('addToken').onclick = () => send('add-token', { token: { project: $('tProject').value, role: $('tRole').value, light: $('tLight').value.trim(), dark: $('tDark').value.trim() || undefined } });
$('exportCss').onclick = () => send('export-css', { brand: $('brandSel').value, style: $('styleSel').value });
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
  send('build', { spec, brand: $('bBrand').value, style: $('bStyle').value, theme: $('bTheme').value, font: $('bFont').value || 'Inter' });
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
  'setup:done': (m) => { busy($('setup'), false); renderStatus(m.status); toast(`Готово: связано ${m.report.linked}, создано ${m.report.created}, переименовано ${m.report.renamed}`); },
  'rollback:done': (m) => { renderStatus(m.status); toast(`Откат: восстановлено ${m.report.restored} ссылок`); },
  'add-brand:done': (m) => { $('newBrand').value = ''; renderStatus(m.status); toast('Бренд добавлен'); },
  'remove-brand:done': (m) => renderStatus(m.status),
  'read-brand:done': (m) => renderTable(m.table),
  'apply-brand:done': (m) => {
    busy($('apply'), false);
    renderTable(m.table);
    const snapped = m.rows.filter((r) => r.alias).length;
    toast(`Применено ${m.rows.length} значений, ${snapped} привязаны к Tailwind`);
  },
  'add-token:done': (m) => { on['list-custom:done'](m); toast(`Создан ${m.token.name} → ${m.token.css}`); },
  'list-custom:done': (m) => { $('customList').innerHTML = m.custom.length ? `Проектные токены (${m.custom.length}):<br>${m.custom.map(esc).join('<br>')}` : 'Проектных токенов пока нет'; },
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
    for (const id of ['setup', 'apply', 'build', 'scanKit']) busy($(id), false);
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
// Pro tabs (brand layer, JSON spec, contracts) stay hidden until asked for.
function setPro(v) {
  document.body.classList.toggle('pro', v);
  $('proToggle').textContent = v ? '✕ Скрыть настройки' : '⚙️ Для профи';
  if (!v && !$('easy').classList.contains('on')) document.querySelector('nav button[data-tab="easy"]').click();
}
$('proToggle').onclick = () => setPro(!document.body.classList.contains('pro'));

window.onmessage = (e) => { const m = e.data.pluginMessage; if (m && on[m.type]) on[m.type](m); };
send('init');
components.start();
