// Spec -> code model: names, routes, search params and deterministic fixtures per screen.
// The same spec drives the Figma frames (figma-pack/builder); fixtures reuse its fake data.
import { BLOCKS, DATA_BLOCKS, normalizeSpec, validateSpec } from './spec.mjs';
import { DEFAULT_STATUSES, fakeRows, fakeValue, FIELD_TYPES, parseColumn, rng } from './fake.mjs';
import { camel, kebab, keyOf, pascal } from './util.mjs';

export const LIST_BLOCKS = ['table', 'list', 'kanban', 'cards'];
export const FIELD_KINDS = ['text', 'email', 'password', 'phone', 'money', 'number', 'date', 'select', 'checkbox', 'textarea'];
const RESERVED = ['q', 'tab', 'page', 'mock'];
const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

/** Validation split: unknown block types are warnings (TODO component), the rest are errors. */
export function checkSpec(spec) {
  const all = validateSpec(spec);
  const unknown = (e) => /\.type: unknown "/.test(e);
  return { errors: all.filter((e) => !unknown(e)), warnings: all.filter(unknown).map((e) => e.replace(/ \(use .*\)$/, '')) };
}

export function toneOf(label) {
  const s = String(label).toLowerCase();
  if (/отказ|отклон|просроч|ошиб|блок/.test(s)) return 'error';
  if (/одобр|выдан|готов|успеш|заверш|активн|оплач/.test(s)) return 'success';
  if (/риск|провер|скоринг|андеррайт|ожид|жд[её]т|работе|важно/.test(s)) return 'warning';
  if (/нов|sla|ежеднев|еженед/.test(s)) return 'info';
  return 'neutral';
}

const distinct = (values) => [...new Set(values.filter(Boolean))];
const sampleOf = (type, n = 40) => { const r = rng(3); return distinct(Array.from({ length: n }, (_, i) => fakeValue(type, r, i))); };

function fixture(b, seed, ctx) {
  const r = rng(seed);
  switch (b.type) {
    case 'stats':
      return b.items.map((it, i) => (typeof it === 'object'
        ? { id: `kpi${i + 1}`, label: String(it.label), value: String(it.value ?? ''), delta: it.delta, tone: it.tone || 'neutral' }
        : { id: `kpi${i + 1}`, label: String(it), value: fakeValue('number', r), tone: 'neutral' }));
    case 'table': {
      const cols = ctx.columns.filter((c) => c.type !== 'actions');
      const total = b.data?.length ?? ctx.pageSize * 3;
      const raw = b.data || fakeRows(cols.map((c) => `${c.label}:${c.type}`), total, seed, b.statuses);
      const idCol = cols.find((c) => c.type === 'id');
      return raw.map((row, i) => Object.fromEntries([['id', idCol ? String(row[cols.indexOf(idCol)]) : `row-${i + 1}`],
        ...cols.filter((c) => c !== idCol).map((c) => [c.key, String(row[cols.indexOf(c)] ?? '')])]));
    }
    case 'kanban':
      return b.columns.map((col, ci) => {
        const title = typeof col === 'string' ? col : col.title;
        const total = typeof col === 'object' && col.count != null ? col.count : 2 + Math.floor(r() * 6);
        const items = Array.from({ length: Math.min(total, 3) }, (_, i) => {
          const [id, who, sum, when, product] = fakeRows([':id', ':person', ':money', ':datetime', ':product'], 1, 31 + ci * 5 + i + seed)[0];
          return { id, title: who, amount: sum, time: when.split(', ')[1], meta: product, status: i === 0 && ci === 1 ? 'Просрочено' : `SLA ${10 + i * 7} мин` };
        });
        return { id: `col${ci + 1}`, title, total, items };
      });
    case 'chart': {
      const n = b.points || 12;
      const hourly = /час/i.test(`${b.title} ${b.subtitle}`);
      return Array.from({ length: n }, (_, i) => ({ label: hourly ? `${String(8 + i).padStart(2, '0')}:00` : MONTHS[i % 12], value: Math.round(40 + r() * 150) }));
    }
    case 'list': {
      const rows = b.items || fakeRows([':person', ':text', ':status'], b.rows || 5, seed, b.statuses);
      return rows.map((it, i) => {
        const [title, subtitle, status] = Array.isArray(it) ? it : [it.title, it.subtitle, it.status];
        return { id: `item${i + 1}`, title: String(title), subtitle: subtitle && String(subtitle), status: status && String(status) };
      });
    }
    case 'timeline': {
      const items = b.items || [['Заявка создана', '21.10.2026, 09:12'], ['Скоринг пройден', '21.10.2026, 09:40'], ['Передана в СБ', '21.10.2026, 10:05']];
      return items.map((it, i) => { const [title, time] = Array.isArray(it) ? it : [it.title, it.time]; return { id: `event${i + 1}`, title: String(title), time: String(time ?? '') }; });
    }
    case 'cards':
      return b.items.map((it, i) => ({ id: `card${i + 1}`, title: String(it.title), text: it.text, badge: it.badge }));
    case 'details':
      return b.items.map((it, i) => {
        const [label, value] = Array.isArray(it) ? it : typeof it === 'string' ? it.split(':') : [it.label, it.value];
        const v = value && FIELD_TYPES.includes(value) ? fakeValue(value, rng(String(label).length + seed), i) : value ?? fakeValue('text', r);
        return { id: `field${i + 1}`, label: String(label), value: String(v) };
      });
    default:
      return null;
  }
}

function formField(f, taken, warnings, where) {
  const field = typeof f === 'string' ? { label: f } : { ...f };
  let type = field.type || 'text';
  if (!FIELD_KINDS.includes(type)) { warnings.push(`${where}: field type "${type}" is rendered as text`); type = 'text'; }
  const key = keyOf(field.label, taken, 'field');
  let options = field.options;
  if (type === 'select' && !options) {
    const lower = String(field.label).toLowerCase();
    options = /город|city/.test(lower) ? sampleOf('city') : /продукт|product/.test(lower) ? sampleOf('product') : ['Вариант 1', 'Вариант 2', 'Вариант 3'];
  }
  return { key, label: String(field.label), type, required: Boolean(field.required), hint: field.hint, placeholder: field.placeholder, options };
}

function blockModel(b, screen, counters, warnings, where) {
  const type = BLOCKS[b.type] ? b.type : 'todo';
  if (type === 'todo') warnings.push(`${where}: unknown block "${b.type}" -> TODO component`);
  const base = b.type ? camel(b.type) || 'block' : 'block';
  counters[base] = (counters[base] || 0) + 1;
  const n = counters[base];
  const key = n > 1 ? `${base}${n}` : base;
  const part = pascal(base) === screen.pascal ? (type === 'login' || type === 'form' ? 'Form' : 'Block') : pascal(base);
  const m = { type, rawType: b.type, key, comp: `${screen.pascal}${part}${n > 1 ? n : ''}`, spec: b, data: DATA_BLOCKS.includes(type), list: LIST_BLOCKS.includes(type) };
  if (type === 'split') m.children = b.columns.map((col, i) => (col || []).map((x, j) => blockModel(x, screen, counters, warnings, `${where}.columns[${i}][${j}]`)));
  if (type === 'table') {
    const taken = new Set(['id']);
    m.columns = b.columns.map(parseColumn).map((c) => ({ ...c, key: c.type === 'id' ? 'id' : c.type === 'actions' ? 'actions' : keyOf(c.label, taken, 'col') }));
    m.pageSize = b.rows || 8;
  }
  if (type === 'form' || type === 'login') {
    const taken = new Set();
    m.fields = type === 'form' ? b.fields.map((f, i) => formField(f, taken, warnings, `${where}.fields[${i}]`)) : [];
  }
  return m;
}

const flatten = (blocks) => blocks.flatMap((b) => (b.children ? [b, ...b.children.flat().flatMap((x) => flatten([x]))] : [b]));

function searchModel(flat, warnings, where) {
  const taken = new Set(RESERVED);
  const table = flat.find((b) => b.type === 'table');
  const toolbar = flat.find((b) => b.type === 'toolbar');
  const tabs = flat.find((b) => b.type === 'tabs');
  const s = { q: null, filters: [], tabs: null, page: Boolean(table || flat.some((b) => b.type === 'pagination')) };
  if (toolbar) {
    s.q = toolbar.spec.search ?? null;
    for (const label of toolbar.spec.filters || []) {
      const column = table?.columns.find((c) => c.label.toLowerCase() === String(label).toLowerCase() && c.type !== 'actions');
      const options = column ? distinct(table.fixture.map((row) => row[column.key])) : /период|дата|date|period/i.test(label) ? ['Сегодня', 'Неделя', 'Месяц'] : [];
      if (!options.length) { warnings.push(`${where}: filter "${label}" has no options (no table column with that label), skipped`); continue; }
      s.filters.push({ key: keyOf(label, taken, 'filter'), label: String(label), column: column?.key, options });
    }
  }
  if (tabs) {
    const keys = new Set();
    s.tabs = tabs.spec.items.map((label, i) => ({ value: i === 0 ? 'all' : keyOf(label, keys, 'tab'), label: String(label) }));
  }
  return s;
}

const NAV_ICONS = [
  [/dash|home|обзор|главн/, 'HomeIcon'], [/app|заявк|request/, 'FileIcon'], [/client|клиент|user|пользоват/, 'UsersIcon'],
  [/report|отч[её]т|analyt|аналит/, 'ChartIcon'], [/setting|настро/, 'SettingsIcon'], [/pipeline|конвейер/, 'LayersIcon'],
  [/audit|журнал/, 'EyeIcon'], [/doc|документ/, 'FileCheckIcon'], [/role|доступ/, 'ShieldIcon'], [/help|помощ|поддерж/, 'LifeBuoyIcon'],
];
const iconOf = (item) => NAV_ICONS.find(([re]) => re.test(`${item.id} ${item.label}`.toLowerCase()))?.[1] || 'ListIcon';

export function buildModel(input) {
  const warnings = [];
  const spec = normalizeSpec(input);
  const screens = spec.screens.map((s, si) => {
    const dir = kebab(s.id) || `screen-${si + 1}`;
    const screen = { id: s.id, title: s.title, dir, pascal: pascal(s.id) || `Screen${si + 1}`, camel: camel(s.id) || `screen${si + 1}`, path: `/${dir}`,
      navId: s.nav || s.id, plain: s.shell === 'plain', states: s.states, empty: s.empty || {}, goal: s.goal, primaryAction: s.primaryAction, spec: s };
    const counters = {};
    screen.blocks = s.blocks.map((b, j) => blockModel(b, screen, counters, warnings, `screens[${si}].blocks[${j}]`));
    screen.flat = flatten(screen.blocks);
    for (const type of ['form', 'login']) {
      screen.flat.filter((b) => b.type === type).slice(1).forEach((b) => {
        warnings.push(`screens[${si}]: only one ${type} block per screen is generated, "${b.key}" -> TODO component`);
        Object.assign(b, { type: 'todo', rawType: `${type} (second on the screen)` });
      });
    }
    screen.flat.forEach((b, j) => { if (b.data) b.fixture = fixture(b.spec, 7 + si * 13 + j, b); });
    screen.data = screen.flat.filter((b) => b.data);
    screen.lists = screen.flat.filter((b) => b.list);
    screen.header = screen.flat.find((b) => b.type === 'header') || null;
    screen.form = screen.flat.find((b) => b.type === 'form') || null;
    screen.login = screen.flat.find((b) => b.type === 'login') || null;
    screen.search = searchModel(screen.flat, warnings, `screens[${si}]`);
    screen.statuses = statusesOf(screen);
    return screen;
  });
  const byNav = (id) => screens.find((s) => s.id === id && !s.plain) || screens.find((s) => s.spec.nav === id && !s.plain);
  const nav = spec.nav.map((item) => {
    const screen = byNav(item.id);
    return { id: item.id, label: item.label, group: item.group, icon: iconOf(item), href: screen ? screen.path : `/${kebab(item.id) || item.id}`, implemented: Boolean(screen) };
  });
  const home = nav.find((n) => n.implemented)?.href || screens.find((s) => !s.plain)?.path || screens[0].path;
  for (const s of screens) {
    s.crumbs = s.header?.spec.breadcrumbs?.map((label, i, all) => {
      const target = nav.find((n) => n.label === label) || screens.find((x) => x.title === label && x !== s);
      const href = target ? target.href || target.path : undefined;
      return { label: String(label), href: i < all.length - 1 && href !== s.path ? href : undefined };
    });
    const kanban = s.flat.find((b) => b.type === 'kanban');
    if (kanban) kanban.href = screens.find((x) => x !== s && x.spec.nav === s.spec.nav && x.flat.some((b) => b.type === 'details' || b.type === 'stepper'))?.path || s.path;
  }
  const searchable = screens.find((s) => s.search.q && !s.plain);
  return { project: spec.project, subtitle: spec.subtitle, user: spec.user, nav, screens, home, searchable, warnings };
}

function statusesOf(screen) {
  const labels = [];
  for (const b of screen.flat) {
    if (b.type === 'table') { const st = b.columns.find((c) => c.type === 'status'); if (st) labels.push(...b.fixture.map((r) => r[st.key]), ...(b.spec.statuses || DEFAULT_STATUSES)); }
    if (b.type === 'list') labels.push(...b.fixture.map((it) => it.status));
    if (b.type === 'kanban') labels.push(...b.fixture.flatMap((c) => c.items.map((it) => it.status)));
    if (b.type === 'cards') labels.push(...b.fixture.map((it) => it.badge));
    if (b.type === 'header' && b.spec.badge) labels.push(b.spec.badge);
  }
  return Object.fromEntries(distinct(labels).map((l) => [l, toneOf(l)]));
}
