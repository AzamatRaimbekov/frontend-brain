#!/usr/bin/env node
// Writes the fake team used by the figma-learn tests as Figma REST JSON: team.json + file-<key>.json.
// 2 projects, 3 files: CRM list (+ empty, mobile), record card with a detached topHeader, client form with a raw hex
// and an unbound text, dashboard with local KPI cards, login (mobile + desktop + error). Keys of kit components are
// real catalog.json keys. Re-run after editing: node build-fixtures.mjs
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
let seq = 0;
const nid = () => `${Math.floor(seq / 100) + 10}:${seq++ % 100}`;
const BOUND = (id) => ({ type: 'VARIABLE_ALIAS', id: `VariableID:${id}` });
const solid = (hex, bound) => ({
  type: 'SOLID', color: { r: parseInt(hex.slice(1, 3), 16) / 255, g: parseInt(hex.slice(3, 5), 16) / 255, b: parseInt(hex.slice(5, 7), 16) / 255, a: 1 },
  ...(bound ? { boundVariables: { color: BOUND(bound) } } : {}),
});

// Kit components (remote) by real catalog keys; id -> { key, name, set }.
const KIT = {
  sideMenu: ['f4eb0421b47f6a98550fb1e5a9427fdcbaad5335', 'type=default'],
  topHeader: ['8514e4cd79d37507aef1d987b894992d25dc3054', 'Type=default'],
  tableRow: ['f4eabde91e54b41e81dc0b4c79586e95c7f586be', 'Type=Base, Hover=False', 'TableSection 2.0'],
  cellHeader: ['e28abae96eaece6a3a3ca39eb048b04f138c2c0c', null, 'item/cell/header'],
  pagination: ['f225fc7301819bdf5d4639de39604f192c04269a', 'type=basic, size=m, align=right', 'pagination/basic'],
  search: ['bdc52ccb245ef127e0ce609859f7b0347207a94b', 'Size=M, State=Default', 'input/search'],
  input: ['9b99d128100afd0ac499d5fc2cfdedf0ae6aa44b', 'Size=M, State=Default, Label Outside=True', 'input/default'],
  dropdown: ['a51f7990a9914a36e511d08aeb2684c412634c09', 'Size=M, State=Default, Label Outside=True', 'input/dropdown'],
  password: ['28499b52ef0b00c99f15315ec205677625186bca', 'OnLight=True, Size=M, State=Default', 'input/password'],
  button: ['713c90401df3b5d7ddf00e3af4d7ea5870c4c120', 'size=m, variant=primary, state=default', 'button/default'],
  tabs: ['d0547d5ac6a08cbc75567cb43a878d83741241a3', 'size=m, quantity=3', 'tab-outline'],
  stepper: ['4d8a0444a6560bc8ada48924a2f84fbb1bc08ccf', 'Vertical=False, Property 1=4', 'stepper-horizontal'],
  alert: ['862527fc2fc9aad902f137eb72e3d82620897a9d', 'Property 1=warning', 'alert-text'],
  chart: ['4dd645cff5f12816e37f1f0d833971b9b7ede939', 'Type=Bar, Time=Day', 'Widget-Chart'],
  fab: ['96fa4021714f90b4166f85319df56d308b274670', 'Type=Icon, Size=L', 'FloatButton'],
  oldIcon: ['0000000000000000000000000000000000000abc', null, 'Old Icons/arrow'],
};
const LOCAL = { kpi: 'CRM / KPI card', kv: 'CRM / Key-value row', timeline: 'CRM / Timeline item' };

function libraryFor(used) {
  const components = {};
  const componentSets = {};
  for (const k of used) {
    if (KIT[k]) {
      const [key, variant, setName] = KIT[k];
      const setId = variant ? `set:${k}` : null;
      components[`c:${k}`] = { key: `${key.slice(0, 30)}v${k.length}`.padEnd(40, '0'), name: variant || setName || k, remote: true, ...(setId ? { componentSetId: setId } : {}) };
      if (!variant) components[`c:${k}`].key = key;
      if (setId) componentSets[setId] = { key, name: setName || k, remote: true };
    } else if (LOCAL[k]) {
      components[`c:${k}`] = { key: `local${k}`.padEnd(40, '1'), name: LOCAL[k], remote: false, description: '' };
    }
  }
  return { components, componentSets };
}

// ---- node builders; layout() assigns absoluteBoundingBox from auto layout, like Figma does ----
const text = (name, characters, { styled = true, size = 14 } = {}) => ({ id: nid(), name, type: 'TEXT', characters, style: { fontSize: size }, ...(styled ? { styles: { text: 'S:text-body' } } : {}), w: Math.max(40, characters.length * 8), h: 20 });
const inst = (kit, name, children = [], w = 160, h = 40) => ({ id: nid(), name, type: 'INSTANCE', componentId: `c:${kit}`, children, w, h, _uses: kit });
const frame = (name, children = [], o = {}) => ({
  id: nid(), name, type: 'FRAME', children, layoutMode: o.layout || 'VERTICAL', w: o.w, h: o.h,
  itemSpacing: o.gap ?? 16, paddingLeft: o.pad ?? 0, paddingRight: o.pad ?? 0, paddingTop: o.pad ?? 0, paddingBottom: o.pad ?? 0,
  cornerRadius: o.radius || 0, fills: o.fill ? [solid(o.fill, o.fillVar)] : [], ...(o.devStatus ? { devStatus: { type: o.devStatus } } : {}),
  ...(o.bound === false ? {} : { boundVariables: Object.fromEntries(['itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'cornerRadius'].filter((p) => (p === 'itemSpacing' ? o.gap ?? 16 : p === 'cornerRadius' ? o.radius : o.pad) > 0).map((p) => [p, BOUND(`sp-${p}`)])) }),
  ...(o.manual ? { layoutMode: 'NONE' } : {}),
});

function layout(n, x, y, parentW) {
  const kids = n.children || [];
  const pad = n.paddingLeft || 0;
  const gap = n.itemSpacing || 0;
  const w = n.w || parentW || 200;
  let cx = x + pad;
  let cy = y + pad;
  let maxH = 0;
  for (const c of kids) {
    const cw = c.w || (n.layoutMode === 'HORIZONTAL' ? Math.floor((w - 2 * pad) / kids.length) : w - 2 * pad);
    const ch = layout(c, cx, cy, cw);
    if (n.layoutMode === 'HORIZONTAL') { cx += cw + gap; maxH = Math.max(maxH, ch); } else cy += ch + gap;
  }
  const h = n.h || (n.layoutMode === 'HORIZONTAL' ? maxH + 2 * pad : cy - y - gap + pad) || 20;
  n.absoluteBoundingBox = { x, y, width: w, height: Math.max(h, 1) };
  return n.absoluteBoundingBox.height;
}

const finish = (n, used) => {
  if (n._uses) used.add(n._uses);
  delete n._uses; delete n.w; delete n.h;
  if (n.type !== 'FRAME') { delete n.itemSpacing; }
  for (const c of n.children || []) finish(c, used);
  if (n.children && !n.children.length && n.type !== 'FRAME') delete n.children;
  return n;
};

const nav = () => inst('sideMenu', 'sideMenu', ['Обзор', 'Заявки', 'Клиенты', 'Отчёты'].map((t) => text('text', t)), 280, 1080);
const btn = (label) => inst('button', 'button/default', [text('Button Title', label)], 140, 40);
const header = (title, actions = []) => inst('topHeader', 'topHeader', [text('title', title, { size: 20 }), ...actions.map(btn)], undefined, 68);
const shell = (body, headerNode) => [nav(), frame('Content', [headerNode, frame('Body', body, { pad: 24, gap: 16 })], { gap: 0 })];
const screen = (name, children, w = 1440, h = 1080, o = {}) => frame(name, children, { layout: 'HORIZONTAL', w, h, gap: 0, fill: '#f4f4f5', fillVar: 'bg-soft', ...o });
const field = (kind, label) => inst(kind, label.replace(/\s*\*$/, ''), [text('FieldLabelText', label), text('Text', '')], 360, 64);

function listBody() {
  const cols = ['Номер', 'Клиент', 'Продукт', 'Сумма', 'Статус', 'Дата'];
  const row = (i) => inst('tableRow', 'Row', [text('cell', `CL-24011${i}`), text('cell', 'Айгуль Токтогулова'), text('cell', 'Ипотека'), text('cell', '450 000 с'), text('cell', 'Новая'), text('cell', '12.10.2026')], undefined, 52);
  return [
    inst('tabs', 'Tabs', ['Все', 'Мои', 'На проверке'].map((t) => text('Title', t)), 420, 40),
    frame('Filters', [inst('search', 'Search', [text('Text', 'Поиск по ФИО или номеру')], 360), inst('dropdown', 'Статус', [text('Text', 'Статус')]), inst('dropdown', 'Продукт', [text('Text', 'Продукт')])], { layout: 'HORIZONTAL', gap: 12 }),
    frame('Table card', [frame('Header row', cols.map((c) => inst('cellHeader', 'item/cell/header', [text('title', c)], 180, 44)), { layout: 'HORIZONTAL', gap: 0 }), row(1), row(2), row(3)], { pad: 20, radius: 16, fill: '#ffffff', fillVar: 'bg-surface' }),
    inst('pagination', 'pagination/basic', [text('Title', 'Показано 1–8 из 128')], undefined, 40),
  ];
}

function fileCrm() {
  const listDefault = screen('Кредиты / Список заявок / Default / 1440', shell(listBody(), header('Заявки', ['Экспорт', '+ Новая заявка'])));
  const listEmpty = screen('Кредиты / Список заявок / Empty / 1440', shell([
    frame('Empty state', [text('Title', 'Заявок пока нет', { size: 20 }), text('Text', 'Новые заявки появятся здесь автоматически'), btn('+ Создать заявку')], { pad: 40, gap: 12 }),
  ], header('Заявки', ['+ Новая заявка'])));
  const listMobile = frame('Кредиты / Список заявок / Default / 375', [
    frame('Header', [text('Title', 'Заявки', { size: 20 })], { pad: 16 }),
    frame('List', [1, 2, 3].map((i) => inst('tableRow', 'Row', [text('cell', `CL-24011${i}`), text('cell', '450 000 с')], undefined, 64)), { gap: 0 }),
  ], { w: 375, h: 812, fill: '#ffffff', fillVar: 'bg-surface' });
  const kv = (k, v) => inst('kv', 'Key-value row', [text('Label', k), text('Value', v)], undefined, 36);
  const record = screen('Кредиты / Карточка заявки / Default / 1440', [nav(), frame('Content', [
    frame('topHeader (detached)', [text('title', 'Заявка CL-240118', { size: 20 }), btn('Отклонить'), btn('+ Одобрить кредит')], { layout: 'HORIZONTAL', pad: 16, h: 68 }),
    frame('Body', [
      inst('stepper', 'Stepper', ['Подана', 'Скоринг', 'Проверка СБ', 'Решение'].map((t) => text('Label', t)), undefined, 56),
      frame('Columns', [
        frame('Left', [frame('Details card', [text('Title', 'Заёмщик', { size: 16 }), kv('ФИО', 'Айгуль Токтогулова'), kv('Телефон', '+996 700 123 456'), kv('Сумма', '450 000 с')], { pad: 20, radius: 16, fill: '#ffffff', fillVar: 'bg-surface' })], { w: 760 }),
        frame('Right', [
          inst('alert', 'Alert', [text('Text', 'Средний риск: высокий долг к доходу')], undefined, 64),
          frame('Timeline', [text('Title', 'История', { size: 16 }), inst('timeline', 'Timeline item', [text('Title', 'Заявка подана'), text('Meta', '09:14')]), inst('timeline', 'Timeline item', [text('Title', 'Скоринг 712'), text('Meta', '09:20')])], { pad: 20, radius: 16, fill: '#ffffff', fillVar: 'bg-surface' }),
        ], { w: 360 }),
      ], { layout: 'HORIZONTAL', gap: 24 }),
    ], { pad: 24, gap: 16 }),
  ], { gap: 0 })]);
  const pages = [
    { name: 'Cover', children: [frame('Cover', [text('Title', 'CRM Кредиты', { size: 48 })], { w: 1440, h: 960 })] },
    { name: 'CRM / Заявки', children: [
      { id: nid(), name: 'CRM / Список заявок', type: 'SECTION', devStatus: { type: 'READY_FOR_DEV' }, children: [listDefault, listEmpty, listMobile] },
      { id: nid(), name: 'CRM / Карточка заявки', type: 'SECTION', children: [record] },
    ] },
  ];
  return { key: 'FileCrmCredit01', name: 'CRM Кредиты', lastModified: '2026-10-20T10:00:00Z', pages };
}

function fileClients() {
  const form = screen('[draft] Клиенты / Новый клиент / Default / 1440', shell([
    frame('Form card', [
      text('Title', 'Данные клиента', { styled: false, size: 16 }),
      field('input', 'ФИО *'), field('input', 'Телефон *'), field('dropdown', 'Город'), field('input', 'Ежемесячный доход'),
      btn('Создать клиента'),
      frame('Frame 12', [{ id: nid(), name: 'Rectangle 3', type: 'RECTANGLE', fills: [solid('#123456')], w: 20, h: 20 }, text('Note', 'Подтверждается выпиской')], { manual: true, bound: false }),
    ], { pad: 20, radius: 16, fill: '#16a34a', bound: false, w: 760 }),
  ], header('Новый клиент')));
  const kpi = (l, v, d) => inst('kpi', 'KPI card', [text('Label', l), text('Value', v, { size: 24 }), text('Delta', d)], 300, 120);
  const dash = screen('Клиенты / Обзор / Default / 1440', shell([
    frame('KPI', [kpi('Новых клиентов', '86', '+14% к вчера'), kpi('Активных', '1 204', '+2% к неделе'), kpi('Отток', '1,8%', '−0,2 п.п.')], { layout: 'HORIZONTAL', gap: 16 }),
    inst('chart', 'Widget-Chart', [text('Title', 'Клиенты по дням')], undefined, 320),
    inst('oldIcon', 'arrow', [], 24, 24),
    inst('fab', 'FloatButton', [], 56, 56),
  ], header('Обзор', ['Экспорт'])));
  return { key: 'FileCrmClients02', name: 'CRM Клиенты', lastModified: '2026-10-25T09:30:00Z', pages: [{ name: 'Клиенты', children: [form, dash] }] };
}

function fileAuth() {
  const loginForm = (extra = []) => frame('Login form', [text('Title', 'Вход в Mbank', { size: 24 }), ...extra, field('input', 'Логин'), field('password', 'Пароль'), btn('Войти')], { pad: 16, gap: 12 });
  const mobile = frame('Вход / Логин / Default / 393', [loginForm()], { w: 393, h: 852, fill: '#ffffff', fillVar: 'bg-surface' });
  const error = frame('Вход / Логин / Error / 393', [loginForm([inst('alert', 'Alert', [text('Text', 'Неверный логин или пароль')], undefined, 48)])], { w: 393, h: 852, fill: '#ffffff', fillVar: 'bg-surface' });
  const desktop = frame('Вход / Логин / Default / 1440', [frame('Center', [loginForm()], { w: 480, pad: 32, radius: 16, fill: '#ffffff', fillVar: 'bg-surface' })], { w: 1440, h: 900, fill: '#f4f4f5', fillVar: 'bg-soft' });
  const section = { id: nid(), name: 'Auth / Вход', type: 'SECTION', devStatus: { type: 'READY_FOR_DEV' }, children: [mobile, error, desktop] };
  return { key: 'FileMobileAuth03', name: 'Мобильный банк — Вход', lastModified: '2026-09-01T08:00:00Z', pages: [{ name: 'Auth', children: [section] }] };
}

function toRest({ key, name, lastModified, pages }) {
  const used = new Set();
  let y = 0;
  const canvases = pages.map((p) => ({
    id: nid(), name: p.name, type: 'CANVAS',
    children: p.children.map((n) => {
      if (n.type === 'SECTION') {
        let x = 0;
        for (const f of n.children) { layout(f, x, y, f.w); x += f.absoluteBoundingBox.width + 80; }
        const h = Math.max(...n.children.map((f) => f.absoluteBoundingBox.height));
        n.absoluteBoundingBox = { x: -80, y: y - 80, width: x + 80, height: h + 160 };
        y += h + 320;
      } else { layout(n, 0, y, n.w); y += n.absoluteBoundingBox.height + 160; }
      return finish(n, used);
    }),
  }));
  const { components, componentSets } = libraryFor(used);
  return {
    name, lastModified, version: '1', role: 'viewer', editorType: 'figma',
    document: { id: '0:0', name: 'Document', type: 'DOCUMENT', children: canvases },
    components, componentSets, styles: { 'S:text-body': { key: 'textbodykey', name: 'font/Body/m', styleType: 'TEXT', remote: true } },
    _key: key,
  };
}

const team = {
  id: '1234567890',
  projects: [{ id: '501', name: 'CRM' }, { id: '502', name: 'Mobile' }],
  files: { 501: [], 502: [] },
};
for (const [project, build] of [['501', fileCrm], ['501', fileClients], ['502', fileAuth]]) {
  const rest = toRest(build());
  const key = rest._key;
  delete rest._key;
  team.files[project].push({ key, name: rest.name, thumbnail_url: '', last_modified: rest.lastModified });
  writeFileSync(join(HERE, `file-${key}.json`), JSON.stringify(rest) + '\n');
}
writeFileSync(join(HERE, 'team.json'), JSON.stringify(team, null, 1) + '\n');
console.log('fixtures written');
