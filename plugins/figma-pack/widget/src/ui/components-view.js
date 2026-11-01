// «Компоненты» tab: pick a component contract, bind any token (project tokens included) to a property
// row, then «Обновить компонент в файле» re-renders the component in place (instances follow) and the
// report shows where the change reached; «Вставить на холст» drops an instance next to the widget.
import { $, esc, send, ui, chip, toast } from './ui.js';
import { propagationLines } from '../../core/sync.js';

const comp = { name: null, contract: null, component: null, result: null, kind: 'all' };
const STEPS = [0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16];
const PROP = {
  bg: 'заливка', fg: 'цвет текста', border: 'обводка', 'focus-ring': 'кольцо фокуса', radius: 'радиус',
  px: 'отступ слева/справа', py: 'отступ сверху/снизу', pt: 'отступ сверху', pb: 'отступ снизу', gap: 'промежуток',
  height: 'высота', 'min-height': 'мин. высота', size: 'размер',
};

/** "Changed once -> changed everywhere" box (Apply and component update share it). */
export function propagationBox(p) {
  const l = propagationLines(p);
  if (!l) return '';
  const items = l.components.length ? `<ul>${l.components.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  return `<div class="box t-success"><b>${esc(l.title)}</b><div>${esc(l.summary)}</div>${items}${l.variables ? `<div>${esc(l.variables)}</div>` : ''}<div>${esc(l.note)}</div></div>`;
}

// Token picker of one row: project tokens first (marked when not yet applied to the file), then Mbank.
function options(r, s) {
  const opt = (value, label, on) => `<option value="${esc(value)}" ${on ? 'selected' : ''}>${esc(label)}</option>`;
  const cur = r.value == null ? '' : String(r.value);
  let groups;
  if (r.kind === 'space') groups = [['Шаг сетки 4 px', STEPS.map((n) => [String(n), `${n} · ${n * 4}px`])]];
  else {
    const kind = r.kind === 'radius' ? 'radius' : 'color';
    const extras = s.rows.filter((x) => x.extra && x.kind === kind)
      .map((x) => [x.css, `${x.css}${x.status === 'bound' || x.status === 'differs' ? '' : ' · ещё не применён'}`]);
    const base = [...new Set(s.rows.filter((x) => !x.extra && x.kind === kind).map((x) => (kind === 'radius' ? x.css.replace(/^radius-/, '') : x.css)))];
    groups = [['Токены проекта', extras], ['Mbank', base.map((x) => [x, x])]];
  }
  const known = groups.some(([, list]) => list.some(([v]) => v === cur));
  return `${opt('', '— нет —', !cur)}${cur && !known ? opt(cur, `${cur} (сейчас)`, true) : ''}${groups.filter(([, list]) => list.length)
    .map(([label, list]) => `<optgroup label="${esc(label)}">${list.map(([v, t]) => opt(v, t, v === cur)).join('')}</optgroup>`).join('')}`;
}

function statusBox(st) {
  if (!st) return '<div class="box muted">Проверяю файл…</div>';
  const pages = Object.entries(st.pages || {}).map(([p, n]) => `${p}: ${n}`).join(', ');
  if (st.state === 'local') {
    return `<div class="box">${chip('в файле', 'success')} «${esc(st.title)}»: вариантов ${st.variants}, экземпляров в файле ${st.instances}${pages ? ` (${esc(pages)})` : ''}.
      <div class="row"><button class="btn primary" id="b-update">Обновить компонент в файле</button><button class="btn" id="b-insert">Вставить на холст</button></div>
      <div class="muted">Обновление перерисовывает главный компонент на месте: узлы вариантов те же, все экземпляры обновятся сами.</div></div>`;
  }
  if (st.state === 'library') {
    return `<div class="box">${chip('из библиотеки', 'info')} «${esc(st.title)}» в этом файле — экземпляры библиотеки (${st.instances}). Менять его нужно в файле библиотеки и публиковать; здесь — Accept updates.
      <div class="row"><button class="btn" id="b-insert">Вставить на холст</button></div></div>`;
  }
  return `<div class="box">${chip('нет в файле', 'warning')} Компонента «${esc(st.title)}» в файле ещё нет.
    <div class="row"><button class="btn primary" id="b-build">Собрать компонент</button><button class="btn" id="b-insert">Вставить на холст</button></div>
    <div class="muted">«Собрать» создаёт набор вариантов по контракту на его странице (по умолчанию Components). «Вставить» без сборки работает, если компонент есть в подключённой библиотеке.</div></div>`;
}

function resultBox(r) {
  if (!r) return '';
  const warn = [
    ...(r.notApplied.length ? [`Токены проекта ещё не в файле: ${r.notApplied.join(', ')} — вкладка «Токены проекта» → «Применить в Figma», потом обновите компонент снова.`] : []),
    ...(r.missing.length ? [`Не найдены переменные: ${r.missing.join(', ')} (свойство осталось без привязки, пурпурная заливка).`] : []),
  ];
  return `<div class="box"><b>${r.built ? 'Собран' : 'Обновлён'} «${esc(r.title)}»</b> на странице ${esc(r.page)}: вариантов ${r.variants}, те же узлы ${r.kept}, новых ${r.created}, привязок ${r.bound}${r.extraBound ? ` (токенов проекта ${r.extraBound})` : ''}.
    ${warn.length ? `<div class="err">${warn.map(esc).join('<br>')}</div>` : ''}</div>`;
}

export function renderBind() {
  const s = ui.state;
  const c = comp.contract;
  const kinds = { all: 'все свойства', color: 'цвета', radius: 'радиусы', space: 'отступы и размеры' };
  const rows = c ? c.rows.filter((r) => comp.kind === 'all' || r.kind === comp.kind) : [];
  $('#tab-bind').innerHTML = `
    <p class="muted">1) Выберите компонент. 2) В строке свойства выберите токен — в списке есть и токены проекта. 3) «Обновить компонент в файле»: главный компонент перерисуется на месте, все экземпляры в файле изменятся сами. Привязка общая с DS Builder и выгружается во вкладке «Код».</p>
    <div class="row"><select id="b-contract"><option value="">— компонент —</option>${s.contracts.map((x) => `<option value="${esc(x.name)}" ${comp.name === x.name ? 'selected' : ''}>${esc(x.title)}</option>`).join('')}</select>
      ${c ? `<select id="b-kind">${Object.entries(kinds).map(([k, l]) => `<option value="${k}" ${comp.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}
      ${c && c.edited ? `<button class="btn" id="b-reset">Сбросить правки (${c.edited})</button>` : ''}</div>
    ${c ? `${statusBox(comp.component)}${resultBox(comp.result)}${comp.result || (s.propagation && s.propagation.kind !== 'apply') ? propagationBox(s.propagation) : ''}
      ${c.errors.length ? `<div class="box err">${c.errors.map(esc).join('<br>')}</div>` : ''}
      <table><thead><tr><th>Где</th><th>Часть</th><th>Свойство</th><th>Состояние</th><th>Токен</th></tr></thead><tbody>
      ${rows.map((r) => `<tr><td class="muted">${esc(r.source)}</td><td>${esc(r.part)}</td><td>${esc(PROP[r.prop] || r.prop)} <span class="muted mono">${esc(r.prop)}</span></td><td>${esc(r.state)}</td>
        <td><select data-row="${esc(r.id)}">${options(r, s)}</select></td></tr>`).join('')}
      </tbody></table>` : ''}`;
  $('#b-contract').onchange = (e) => {
    Object.assign(comp, { name: e.target.value || null, contract: null, component: null, result: null });
    if (comp.name) send('contract', { name: comp.name }); else renderBind();
  };
  if (!c) return;
  $('#b-kind').onchange = (e) => { comp.kind = e.target.value; renderBind(); };
  if ($('#b-reset')) $('#b-reset').onclick = () => send('binding-reset', { contract: c.name });
  if ($('#b-update')) $('#b-update').onclick = () => send('component-update', { name: c.name });
  if ($('#b-build')) $('#b-build').onclick = () => send('component-update', { name: c.name, build: true });
  if ($('#b-insert')) $('#b-insert').onclick = () => send('component-insert', { name: c.name });
  for (const el of document.querySelectorAll('#tab-bind select[data-row]')) {
    el.onchange = () => {
      const r = c.rows.find((x) => x.id === el.dataset.row);
      send('binding', { contract: c.name, rowId: r.id, path: r.path, key: r.key, kind: r.kind, value: el.value });
    };
  }
}

/** '<type>:done' of this tab; false when the message is not ours. */
export function onComponentDone(type, m) {
  if (type === 'contract') Object.assign(comp, { contract: m.contract, component: m.component, result: null });
  else if (type === 'binding' || type === 'binding-reset') {
    comp.contract = m.contract;
    if (type === 'binding' && comp.component && comp.component.state === 'local') toast('Привязка сохранена. Нажмите «Обновить компонент в файле»', 'success');
  } else if (type === 'component-update') {
    if (m.result.needsBuild) { toast('Компонента нет в файле: «Собрать компонент»', 'warning'); return true; }
    Object.assign(comp, { result: m.result, component: m.component });
    toast(`${m.result.built ? 'Собран' : 'Обновлён'} «${m.result.title}»: экземпляров в файле ${m.result.instances}`, 'success');
  } else if (type === 'component-insert') toast(`Вставлен «${m.inserted.title}» рядом с виджетом (${m.inserted.source === 'local' ? 'компонент файла' : 'из библиотеки'})`, 'success');
  else return false;
  renderBind();
  return true;
}
