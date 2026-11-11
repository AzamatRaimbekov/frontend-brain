// Tabs of the iframe that talk to the sandbox per action: code sync (exports + import) and Figma apply.
// Results arrive as '<type>:done' (onDone).
import { $, esc, send, ui, chip, toast } from './ui.js';

const view = { exports: null, report: null };

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
    ${x ? `<table><tbody>${x.files.map((f, i) => `<tr><td class="mono">${esc(f.name)}</td><td class="muted">${(f.text.length / 1024).toFixed(1)} КБ</td>
      <td><button class="btn" data-dl="${i}">Скачать</button> <button class="btn" data-cp="${i}">Копировать</button> <button class="btn" data-pv="${i}">Показать</button></td></tr>`).join('')}</tbody></table>
      <textarea id="c-preview" readonly placeholder="Нажмите «Показать»"></textarea>
      <h3>Что сделать с файлами</h3>
      ${x.commands.map((c) => `<div class="box"><div>${esc(c.title)}</div><pre>${esc(c.cmd)}</pre><button class="btn" data-cmd="${esc(c.cmd)}">Копировать команду</button></div>`).join('')}` : '<p class="muted">Собираю файлы…</p>'}
    <h3>Загрузить shadcn-tokens.json</h3>
    <p class="muted">Вставьте shadcn-tokens.json (schema shadcn/tokens@1): отличия от значений по умолчанию станут правками доски. Незнакомые имена не добавляются. Текущие правки заменятся.</p>
    <textarea id="c-import" placeholder='{ "$schema": "shadcn/tokens@1", "radius": "0.625rem", "colors": { "primary": { "light": "oklch(…)", "dark": "oklch(…)" } } }'></textarea>
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
const list = (title, items, tone) => (items && items.length ? `<div class="box"><b>${esc(title)}: ${items.length}</b> ${tone ? chip(tone[0], tone[1]) : ''}<ul>${items.slice(0, 200).map((i) => `<li>${esc(typeof i === 'string' ? i : `${i.name}: ${i.reason}`)}</li>`).join('')}</ul></div>` : '');

export function renderFigma() {
  const s = ui.state;
  const r = view.report;
  const t = s.totals;
  $('#tab-figma').innerHTML = `
    <p class="muted">Записывает доску в коллекцию переменных <span class="mono">shadcn</span> (режимы Light / Dark): имена как в CSS (background, primary, chart-1, sidebar-primary-foreground…), радиус — <span class="mono">radius</span> в px. Нет коллекции или режима — создаются. Значения oklch переводятся в цвет Figma, прозрачность сохраняется. Ничего не удаляется.</p>
    <div class="box">${s.scan ? `Файл проверен ${esc(s.scan.scannedAt.slice(0, 16).replace('T', ' '))}: ${s.scan.exists ? `${s.scan.count} переменных shadcn` : 'коллекции shadcn нет'}. ${chip(`✓ ${t.bound}`, 'success')} ${chip(`≠ ${t.differs}`, 'warning')} ${chip(`нет ${t.missing}`, 'error')} ${t.library ? chip(`в библиотеке ${t.library}`, 'info') : ''}` : 'Файл ещё не проверяли.'}</div>
    <div class="row"><button class="btn" id="f-scan">Проверить файл</button>
      <label><input type="checkbox" id="f-all"> все токены (новый файл), а не только изменённые и расходящиеся</label></div>
    <div class="row"><button class="btn" id="f-dry">Что изменится (без записи)</button><button class="btn primary" id="f-apply">Применить в Figma</button></div>
    ${r ? `<h3>${r.dryRun ? 'Предпросмотр' : 'Отчёт'}: создано ${r.created.length}, изменено значений ${r.updated.length}, без изменений ${r.unchanged}</h3>
      ${list('Ошибки', r.errors, ['проверьте', 'error'])}${r.collectionCreated ? list('Новая коллекция', ['shadcn (Light, Dark)']) : ''}${list('Новые режимы', r.modesAdded)}
      ${list('Новые переменные', r.created)}${list('Изменены', r.updated)}${list('Пропущено', r.skipped)}` : ''}`;
  $('#f-scan').onclick = () => send('scan');
  $('#f-dry').onclick = () => send('apply', { dryRun: true, all: $('#f-all').checked });
  $('#f-apply').onclick = () => send('apply', { all: $('#f-all').checked });
}

/** '<type>:done' from the sandbox. */
export function onDone(type, m) {
  if (m.errors && m.errors.length) { toast(m.errors.join('; '), 'error'); return; }
  if (type === 'export') { view.exports = { files: m.files, commands: m.commands }; renderCode(); }
  else if (type === 'import') {
    const res = m.result;
    if (res.errors.length) toast(res.errors.join('; '), 'error');
    else { toast(`Импорт: ${res.changed} правок${res.ignored.length ? `, не добавлены незнакомые имена: ${res.ignored.join(', ')}` : ''}`, 'success'); view.exports = null; }
  } else if (type === 'apply' && m.report) {
    view.report = m.report; // the 'state' message that follows re-renders
    if (!m.report.dryRun) toast(`Применено: изменено переменных ${m.report.changed.length}`, 'success');
  }
  if (['set-token', 'reset-token', 'reset-all', 'import'].includes(type)) view.exports = null;
}
