// «Компоненты» tab: contracts list, build in Figma, bindings table with a token picker,
// new component from an anatomy template, export of contract JSON for the code generator.
import { validateContract, statesAllowed, PROPS, propKind } from '../../../core/contract.js';

export function initComponents({ $, esc, send, toast }) {
  let contracts = [];
  let current = null; // { name, contract, rows, vars }
  const sel = () => $('cSel').value;
  const busy = (on) => { for (const id of ['cRender', 'cCreateNew']) $(id).disabled = on; };

  // State checkboxes follow the selected contract: the 5 standard ones plus its own (checked, invalid…).
  function renderStates(c) {
    const on = new Set(c.states && c.states.length ? c.states : ['default']);
    $('cStates').innerHTML = statesAllowed(c).map((s) => `<label><input type="checkbox" value="${esc(s)}"${on.has(s) ? ' checked' : ''}> ${esc(s)}</label>`).join(' ');
    $('cAddState').innerHTML = statesAllowed(c).map((s) => `<option>${esc(s)}</option>`).join('');
  }
  const statesChosen = () => [...$('cStates').querySelectorAll('input:checked')].map((x) => x.value);

  function renderList() {
    const prev = sel();
    $('cSel').innerHTML = contracts.map((c) => `<option value="${esc(c.name)}">${esc(c.title)} (${esc(c.name)})</option>`).join('');
    if (contracts.some((c) => c.name === prev)) $('cSel').value = prev;
    const tag = { bundled: 'из сборки', example: 'пример', file: 'из файла', edited: 'изменён' };
    $('cList').innerHTML = contracts.length
      ? `<table><tr><th>Компонент</th><th>Источник</th><th>Вариантов</th><th>В Figma</th></tr>${contracts.map((c) => `<tr><td>${esc(c.title)}</td>
        <td><span class="tag">${tag[c.source] || c.source}</span></td><td>${c.errors.length ? `<span class="err" title="${esc(c.errors.join('\n'))}">ошибки: ${c.errors.length}</span>` : c.variants}</td>
        <td>${c.rendered ? '<span class="ok">да</span>' : '—'}</td></tr>`).join('')}</table>`
      : '<span class="muted">Контрактов нет: импортируйте JSON или создайте компонент ниже.</span>';
    if (sel()) send('contract-rows', { name: sel() });
  }

  function renderReport(r) {
    if (!r) return;
    const missing = r.missing.map((x) => `${x.kind}: ${x.token}`);
    const created = r.createdTokens.map((x) => (x.like ? `${x.token} (= ${x.like})` : `${x.token} (заглушка)`));
    $('cOut').innerHTML = `<b class="ok">Вариантов: ${r.variants}</b> · новых ${r.created}, обновлено ${r.updated} · привязок ${r.bound}<br>
      ${r.stale.length ? `<span class="err">Нет в контракте (${r.pruned ? 'удалены' : 'оставлены, экземпляры не сломаны'}): ${r.stale.length}</span><br>` : ''}
      ${created.length ? `<span class="err">Созданы токены, задайте значения на вкладке «Токены»: ${esc(created.join(', '))}</span><br>` : ''}
      ${missing.length ? `<span class="err">Без переменной (${r.unbound}): ${esc(missing.join(', '))}</span><br>` : ''}
      ${r.imported && r.imported.length ? `<span class="muted">Из библиотек Mbank подключено переменных: ${r.imported.length}</span><br>` : ''}
      ${r.missingComponents && r.missingComponents.length ? `<span class="err">Не найден компонент библиотеки (подключите Web components): ${esc(r.missingComponents.join(', '))}</span><br>` : ''}
      ${r.fallbackFonts ? '<span class="muted">Шрифт стилей не установлен: использованы ds/* стили</span>' : ''}`;
  }

  function tokenLists(vars) {
    const opt = (v) => `<option value="${esc(v.token)}">${esc(v.collection)} / ${esc(v.name)}${v.placeholder ? ' · заглушка' : ''}</option>`;
    $('cTokColor').innerHTML = vars.filter((v) => v.type === 'COLOR').map(opt).join('');
    $('cTokFloat').innerHTML = vars.filter((v) => v.type === 'FLOAT').map(opt).join('');
  }

  const listFor = (kind) => (kind === 'color' ? 'cTokColor' : kind === 'radius' || kind === 'space' ? 'cTokFloat' : '');

  function renderRows() {
    if (!current) return;
    const q = $('cFilter').value.trim().toLowerCase();
    const rows = current.rows.filter((r) => !q || `${r.source} ${r.part} ${r.prop} ${r.state} ${r.value}`.toLowerCase().includes(q));
    $('cRows').innerHTML = `<table><tr><th>Где</th><th>Часть</th><th>Свойство</th><th>Состояние</th><th>Токен</th></tr>${rows.map((r) => `<tr>
      <td>${esc(r.source)}</td><td>${esc(r.part)}</td><td>${esc(r.prop)}</td><td>${esc(r.state)}</td>
      <td><input data-row="${esc(r.id)}" value="${esc(r.value)}" list="${listFor(r.kind)}" size="18"></td></tr>`).join('')}</table>`;
    $('cRows').querySelectorAll('input[data-row]').forEach((inp) => {
      inp.onchange = () => {
        const r = current.rows.find((x) => x.id === inp.dataset.row);
        bind(r.path, r.key, r.kind, inp.value.trim());
      };
    });
    const c = current.contract;
    const sources = [['base', 'base'], ...Object.entries(c.variants || {}).flatMap(([p, byV]) => Object.keys(byV).map((v) => [`variants.${p}.${v}`, `${p}=${v}`]))];
    $('cAddWhere').innerHTML = sources.map(([v, l]) => `<option value="${esc(v)}">${esc(l)}</option>`).join('');
    $('cAddPart').innerHTML = c.parts.map((p) => `<option>${esc(p)}</option>`).join('');
  }

  function bind(path, key, kind, raw) {
    const value = raw === '' ? null : kind === 'space' ? Number(raw) : raw;
    if (kind === 'space' && raw !== '' && !(value >= 0)) { toast('Отступы и высоты — шаг сетки числом: 11 = 44 px', true); return; }
    send('contract-bind', { name: current.name, path, key, value });
  }

  $('cAddProp').innerHTML = PROPS.filter((p) => ['color', 'radius', 'space', 'text', 'weight'].includes(propKind(p))).map((p) => `<option>${p}</option>`).join('');
  $('cAddProp').onchange = () => $('cAddValue').setAttribute('list', listFor(propKind($('cAddProp').value)));
  $('cAdd').onclick = () => {
    const prop = $('cAddProp').value;
    const state = $('cAddState').value;
    bind([...$('cAddWhere').value.split('.'), $('cAddPart').value], state === 'default' ? prop : `${prop}:${state}`, propKind(prop), $('cAddValue').value.trim());
  };
  $('cFilter').oninput = renderRows;
  $('cSel').onchange = () => send('contract-rows', { name: sel() });
  $('cRefresh').onclick = () => send('contracts-list');
  $('cRender').onclick = () => {
    if (!sel()) return;
    busy(true);
    $('cOut').textContent = 'Собираю…';
    send('contract-render', { name: sel(), states: statesChosen(), prune: $('cPrune').checked, create: $('cCreate').checked });
  };
  $('cFile').onchange = async (e) => {
    const json = [];
    for (const f of e.target.files) {
      try { const x = JSON.parse(await f.text()); json.push(...(Array.isArray(x) ? x : x.contracts || [x])); } catch (err) { toast(`${f.name}: не JSON`, true); }
    }
    if (json.length) send('contract-import', { json });
    e.target.value = '';
  };
  $('cCreateNew').onclick = () => {
    const name = $('cNewName').value.trim();
    if (!name) { toast('Укажите имя компонента', true); return; }
    busy(true);
    send('contract-new', { name, title: $('cNewTitle').value.trim() || undefined, template: $('cNewTemplate').value, props: $('cNewProps').value, create: $('cCreate').checked });
  };

  function download(name, data) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([`${JSON.stringify(data, null, 2)}\n`], { type: 'application/json' }));
    a.download = name;
    a.click();
  }
  let exportMode = null;
  $('cExportOne').onclick = () => { exportMode = 'one'; send('contract-export', { name: sel() }); };
  $('cRenderAll').onclick = () => { busy(true); send('contract-render-all', { create: $('cCreate').checked }); };
  $('cExportAll').onclick = () => { exportMode = 'all'; send('contract-export', {}); };
  $('cCopy').onclick = () => { $('cJson').select(); document.execCommand('copy'); toast('JSON скопирован'); };
  $('cReset').onclick = () => sel() && send('contract-reset', { name: sel() });

  const handlers = {
    'contracts-list:done': (m) => {
      contracts = m.contracts;
      $('cNewTemplate').innerHTML = m.templates.map((t) => `<option value="${t.id}">${esc(t.id)} — ${esc(t.title)}</option>`).join('');
      renderList();
    },
    'contract-import:done': (m) => {
      contracts = m.contracts;
      renderList();
      const bad = Object.entries(m.errors);
      toast(bad.length ? `Не импортированы: ${bad.map(([n, e]) => `${n} (${e[0]})`).join('; ')}` : 'Контракты импортированы', bad.length > 0);
    },
    'contract-render:done': (m) => {
      busy(false);
      if (m.errors) { $('cOut').innerHTML = `<span class="err">${m.errors.map(esc).join('<br>')}</span>`; return; }
      contracts = m.contracts;
      renderList();
      renderReport(m.report);
    },
    'contract-render-all:done': (m) => {
      busy(false);
      contracts = m.contracts;
      renderList();
      $('cOut').textContent = `Страница «${m.page}»: собрано ${m.built}${m.failed.length ? `, не собраны: ${m.failed.join(', ')}` : ''}.${m.missing.length ? ` Нет токенов (${m.missing.length}): ${m.missing.join(', ')}.` : ' Все токены найдены.'} Меняй привязки ниже — компонент обновится на месте.`;
      toast(`Собрано компонентов: ${m.built}`);
    },
    'contract-new:done': (m) => { handlers['contract-render:done'](m); if (m.contract) { $('cSel').value = m.contract.name; send('contract-rows', { name: m.contract.name }); toast(`Создан ${m.contract.name}`); } },
    'contract-rows:done': (m) => { current = m; renderStates(m.contract); tokenLists(m.vars); renderRows(); },
    'contract-bind:done': (m) => {
      if (m.errors) { toast(m.errors[0], true); return; }
      current = { ...current, contract: m.contract, rows: m.rows };
      renderRows();
      renderReport(m.report);
      toast(m.report ? 'Привязка обновлена в Figma и в контракте' : 'Контракт обновлён (в Figma ещё не собран)');
    },
    'contract-reset:done': (m) => { contracts = m.contracts; renderList(); toast('Возвращён контракт из сборки'); },
    'contract-export:done': (m) => {
      const errs = m.contracts.filter((c) => validateContract(c).length);
      $('cJson').value = JSON.stringify(exportMode === 'one' ? m.contracts[0] : m.contracts, null, 2);
      if (exportMode === 'one' && m.contracts[0]) download(`${m.contracts[0].name}.json`, m.contracts[0]);
      if (exportMode === 'all') m.contracts.forEach((c, i) => setTimeout(() => download(`${c.name}.json`, c), i * 150));
      if (errs.length) toast(`С ошибками: ${errs.map((c) => c.name).join(', ')}`, true);
    },
  };
  return { handlers, onError: () => busy(false), start: () => send('contracts-list') };
}
