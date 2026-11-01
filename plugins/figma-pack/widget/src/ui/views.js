// Tabs of the iframe that talk to the sandbox per action: brand generator, contract bindings,
// code sync (exports + import) and Figma apply. Results arrive as '<type>:done' messages (onDone).
import { $, esc, send, ui, chip, swatch, toast } from './ui.js';
import { contrast } from '../../../builder/core/color.js';

const view = { preview: null, contract: null, exports: null, report: null, contractName: null };

// ---- brand from one colour ----
export function renderGenerate() {
  const p = view.preview;
  const ratio = (fg, bg) => {
    try { return Math.round(contrast(fg, bg) * 100) / 100; } catch (e) { return null; }
  };
  const slot = (name) => p && p.slots.find((x) => x.slot === name);
  const pairs = p ? [['on-accent', 'default'], ['ghost-on-accent', 'ghost-default']].flatMap(([fg, bg]) => ['light', 'dark'].map((mode) => {
    const r = ratio(slot(fg)[mode], slot(bg)[mode]);
    return `<li>${fg} на ${bg} (${mode}): ${r} ${r !== null && r >= 4.5 ? chip('AA', 'success') : chip('ниже AA', 'error')}</li>`;
  })).join('') : '';
  $('#tab-generate').innerHTML = `
    <p class="muted">Один цвет → 12 слотов бренда (1.brand light + 2.theme brand/&lt;бренд&gt;/* dark). Основа — генератор DS Builder (OKLCH, контраст текста), состояния и ghost-оттенки — шаги того же тона.</p>
    <div class="row"><label>Цвет бренда <input id="g-color" type="color" value="${esc(p ? p.hex : (ui.state.rows.find((r) => r.css === 'brand') || {}).light || '')}"></label>
      <input id="g-hex" class="hex" value="${esc(p ? p.hex : '')}" placeholder="#rrggbb">
      <button class="btn" id="g-preview">Предпросмотр</button>
      <button class="btn primary" id="g-apply" ${p ? '' : 'disabled'}>Записать в бренд ${esc(ui.state.brand)}</button></div>
    ${p ? `<table><thead><tr><th>Слот</th><th>light</th><th>dark</th></tr></thead><tbody>${p.slots.map((s) => `<tr><td class="mono">brand/${esc(s.slot)}</td><td>${swatch(s.light)} <span class="mono">${esc(s.light)}</span></td><td>${swatch(s.dark)} <span class="mono">${esc(s.dark)}</span></td></tr>`).join('')}</tbody></table>
    <div class="box"><b>Контраст</b><ul>${pairs}</ul></div>
    <p class="muted">Запись меняет только доску виджета (правки бренда). В файл Figma — вкладка «Figma» → «Применить».</p>` : ''}`;
  $('#g-color').oninput = (e) => { $('#g-hex').value = e.target.value; };
  $('#g-preview').onclick = () => send('gen-preview', { hex: $('#g-hex').value || $('#g-color').value });
  $('#g-apply').onclick = () => p && send('gen-apply', { hex: p.hex });
}

// ---- component contract bindings ----
export function renderBind() {
  const s = ui.state;
  const c = view.contract;
  const tokens = s.rows.filter((r) => r.kind === 'color').map((r) => r.css);
  const radius = s.rows.filter((r) => r.kind === 'radius').map((r) => r.css.replace(/^radius-/, ''));
  $('#tab-bind').innerHTML = `
    <p class="muted">Контракт компонента <span class="mono">mbank/component@1</span> (builder/contracts): часть × свойство × состояние → токен. Правка хранится в виджете (видна всей команде), выгружается во вкладке «Код» как <span class="mono">&lt;имя&gt;.json</span>.</p>
    <div class="row"><select id="b-contract"><option value="">— контракт —</option>${s.contracts.map((x) => `<option value="${esc(x.name)}" ${view.contractName === x.name ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select>
      ${c && c.edited ? `<button class="btn" id="b-reset">Сбросить правки (${c.edited})</button>` : ''}</div>
    <datalist id="dl-color">${tokens.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
    <datalist id="dl-radius">${radius.map((t) => `<option value="${esc(t)}">`).join('')}</datalist>
    ${c ? `${c.errors.length ? `<div class="box err">${c.errors.map(esc).join('<br>')}</div>` : ''}
      <table><thead><tr><th>Где</th><th>Часть</th><th>Свойство</th><th>Состояние</th><th>Токен</th></tr></thead><tbody>
      ${c.rows.map((r) => `<tr><td class="muted">${esc(r.source)}</td><td>${esc(r.part)}</td><td>${esc(r.prop)}</td><td>${esc(r.state)}</td>
        <td><input data-row="${esc(r.id)}" list="dl-${r.kind === 'radius' ? 'radius' : 'color'}" value="${esc(r.value)}" size="24"></td></tr>`).join('')}
      </tbody></table>` : ''}`;
  $('#b-contract').onchange = (e) => { view.contractName = e.target.value; view.contract = null; if (e.target.value) send('contract', { name: e.target.value }); else renderBind(); };
  if ($('#b-reset')) $('#b-reset').onclick = () => send('binding-reset', { contract: c.name });
  for (const el of document.querySelectorAll('#tab-bind input[data-row]')) {
    el.onchange = () => {
      const r = c.rows.find((x) => x.id === el.dataset.row);
      send('binding', { contract: c.name, rowId: r.id, path: r.path, key: r.key, value: el.value.trim() });
    };
  }
}

// ---- code sync ----
function download(file) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([file.text], { type: file.mime }));
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function copy(text) {
  const t = document.createElement('textarea');
  t.value = text;
  document.body.appendChild(t);
  t.select();
  try { document.execCommand('copy'); toast('Скопировано', 'success'); } catch (e) { toast('Не скопировалось: выделите текст вручную', 'warning'); }
  t.remove();
}

export function renderCode() {
  const x = view.exports;
  if (!x) send('export');
  $('#tab-code').innerHTML = `
    <h3>Выгрузить</h3>
    ${x ? `<table><tbody>${x.files.map((f, i) => `<tr><td class="mono">${esc(f.name)}</td><td class="muted">${(f.text.length / 1024).toFixed(1)} КБ ${f.errors && f.errors.length ? chip(`ошибок ${f.errors.length}`, 'error') : ''}</td>
      <td><button class="btn" data-dl="${i}">Скачать</button> <button class="btn" data-cp="${i}">Копировать</button> <button class="btn" data-pv="${i}">Показать</button></td></tr>`).join('')}</tbody></table>
      <textarea id="c-preview" readonly placeholder="Нажмите «Показать»"></textarea>
      <h3>Что запустить в репозитории (корень frontend-brain)</h3>
      ${x.commands.map((c) => `<div class="box"><div>${esc(c.title)}</div><pre>${esc(c.cmd)}</pre><button class="btn" data-cmd="${esc(c.cmd)}">Копировать команду</button></div>`).join('')}` : '<p class="muted">Собираю файлы…</p>'}
    <h3>Загрузить tokens.json</h3>
    <p class="muted">Вставьте tokens.json (из репозитория или выгрузки другого файла): отличия от вшитого источника станут правками доски, переменные custom/* — токенами проекта. Текущие правки заменятся.</p>
    <textarea id="c-import" placeholder='{ "theme": { "vars": [...] }, "brand": { ... } }'></textarea>
    <div class="row"><button class="btn primary" id="c-import-go">Импортировать</button> <span id="c-import-res"></span></div>`;
  if (x) {
    for (const b of document.querySelectorAll('[data-dl]')) b.onclick = () => download(x.files[Number(b.dataset.dl)]);
    for (const b of document.querySelectorAll('[data-cp]')) b.onclick = () => copy(x.files[Number(b.dataset.cp)].text);
    for (const b of document.querySelectorAll('[data-pv]')) b.onclick = () => { $('#c-preview').value = x.files[Number(b.dataset.pv)].text; };
    for (const b of document.querySelectorAll('[data-cmd]')) b.onclick = () => copy(b.dataset.cmd);
  }
  $('#c-import-go').onclick = () => send('import', { text: $('#c-import').value });
}

// ---- Figma ----
const list = (title, items, tone) => (items && items.length ? `<div class="box"><b>${esc(title)}: ${items.length}</b> ${tone ? chip(tone[0], tone[1]) : ''}<ul>${items.slice(0, 200).map((i) => `<li>${esc(typeof i === 'string' ? i : `${i.css}: ${i.reason}`)}</li>`).join('')}</ul></div>` : '');

export function renderFigma() {
  const s = ui.state;
  const r = view.report;
  const t = s.totals;
  $('#tab-figma').innerHTML = `
    <p class="muted">Записывает доску в переменные файла: <span class="mono">2.theme</span> (режимы light / dark) и <span class="mono">1.brand</span> (режим на бренд: ${s.brands.join(', ')}). Нет коллекции или режима — создаются. Цвет становится ссылкой на примитив файла с тем же значением, иначе — hex, и каждый такой случай в отчёте.</p>
    <div class="box">${s.scan ? `Файл проверен ${esc(s.scan.scannedAt.slice(0, 16).replace('T', ' '))}: ${s.scan.count} переменных. ${chip(`✓ ${t.bound}`, 'success')} ${chip(`≠ ${t.differs}`, 'warning')} ${chip(`нет ${t.missing}`, 'error')} ${t.library ? chip(`в библиотеке ${t.library}`, 'info') : ''}` : 'Файл ещё не проверяли.'}</div>
    <div class="row"><button class="btn" id="f-scan">Проверить файл</button>
      <label><input type="checkbox" id="f-all"> все токены (новый файл), а не только изменённые</label></div>
    <div class="row"><button class="btn" id="f-dry">Что изменится (без записи)</button><button class="btn primary" id="f-apply">Применить в Figma</button></div>
    ${r ? `<h3>${r.dryRun ? 'Предпросмотр' : 'Отчёт'}: создано ${r.created.length}, изменено ${r.updated.length}, ссылок ${r.aliased.length}, hex ${r.raw.length}, без изменений ${r.unchanged}</h3>
      ${list('Ошибки', r.errors, ['проверьте', 'error'])}${list('Новые коллекции', r.collectionsCreated)}${list('Новые режимы', r.modesAdded)}
      ${list('Новые переменные', r.created)}${list('Изменены', r.updated)}${list('Hex без примитива в файле', r.raw, ['не ссылка', 'warning'])}
      ${list('Ссылки на примитивы', r.aliased)}${list('Пропущено', r.skipped)}` : ''}`;
  $('#f-scan').onclick = () => send('scan');
  $('#f-dry').onclick = () => send('apply', { dryRun: true, all: $('#f-all').checked });
  $('#f-apply').onclick = () => send('apply', { all: $('#f-all').checked });
}

/** '<type>:done' from the sandbox. */
export function onDone(type, m) {
  if (m.errors && m.errors.length) { toast(m.errors.join('; '), 'error'); return; }
  if (type === 'gen-preview') { view.preview = m.preview; renderGenerate(); }
  else if (type === 'gen-apply') toast(`Записано в бренд: ${m.count} токенов`, 'success');
  else if (type === 'add-extra') toast('Токен добавлен', 'success');
  else if (type === 'contract' || type === 'binding' || type === 'binding-reset') { view.contract = m.contract; renderBind(); }
  else if (type === 'export') { view.exports = { files: m.files, commands: m.commands }; renderCode(); }
  else if (type === 'import') {
    const res = m.result;
    if (res.errors.length) toast(res.errors.join('; '), 'error');
    else { toast(`Импорт: ${res.changed} правок, ${res.extras.length} токенов проекта`, 'success'); view.exports = null; }
  } else if (type === 'apply' && m.report) view.report = m.report; // the 'state' message that follows re-renders
  if (['set-token', 'reset-token', 'reset-all', 'gen-apply', 'add-extra', 'remove-extra', 'binding', 'binding-reset', 'import', 'brand'].includes(type)) view.exports = null;
}
