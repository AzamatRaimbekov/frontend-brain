// Screen archetypes and spec@1 blocks detected from layer names, component names and texts of a REST frame.
import { walk, resolveInstance, textsOf, posOf, sizeOf } from './walk.mjs';

export const ARCHETYPES = ['list', 'record', 'form', 'dashboard', 'login', 'wizard', 'board'];
export const ARCHETYPE_LABELS = {
  list: 'список / таблица', record: 'карточка записи', form: 'форма', dashboard: 'дашборд',
  login: 'вход', wizard: 'мастер по шагам', board: 'доска (канбан)', other: 'прочее',
};

// Name of a node for matching: own name plus, for instances, the library component (set) name.
const label = (n, maps) => (n.type === 'INSTANCE' ? `${n.name} ${resolveInstance(n, maps).name}` : n.name || '').toLowerCase();

const SIGNALS = {
  nav: /sidemenu|side menu|sidebar|боковое меню|навигац/,
  header: /topheader|top header|page header|^header\b|заголовок страницы|шапка/,
  table: /tablesection|table\/row|tablecell|\btable\b|таблиц|item\/cell/,
  pagination: /pagination|пагинац/,
  search: /input\/search|\bsearch\b|поиск/,
  filter: /filter|фильтр|toolbar/,
  input: /^input\/|input\/(default|dropdown|phone|password|calendar|time)|textarea|\bfield\b|поле ввода/,
  password: /password|пароль/,
  stepper: /stepper|steps?\b|шаг/,
  timeline: /timeline|истори|history/,
  details: /key-value|details|детали|реквизит|данные (клиента|заёмщика|заявки)/,
  chart: /chart|график|диаграм/,
  kpi: /kpi|stat card|метрик|показател/,
  kanban: /kanban|канбан|board column|колонка доски/,
  appCard: /application card|карточка заявки|deal card|lead card/,
  listItem: /cell\/list item|list item|transfer row|operation row|строка операц/,
  tabs: /tabs?\b|tab-|segment|вкладк/,
  alert: /alert|warning|предупрежд|уведомлен/,
  empty: /empty|пусто|нет данных/,
  button: /button|bttn|кнопк/,
  card: /\bcard\b|карточк/,
};

/** Feature counts of a frame: how many nodes match each signal, plus the texts. */
export function features(frame, maps) {
  const f = Object.fromEntries(Object.keys(SIGNALS).map((k) => [k, 0]));
  walk(frame, (n, ctx) => {
    if (n.visible === false) return false;
    if (ctx.depth === 0) return true;
    const name = label(n, maps);
    for (const [k, re] of Object.entries(SIGNALS)) if (re.test(name)) f[k]++;
    // inside an instance only the instance itself counts, its internals would double-count
    return n.type !== 'INSTANCE';
  });
  f.texts = textsOf(frame).map((t) => t.text);
  return f;
}

const has = (texts, re) => texts.some((t) => re.test(t));

/** Scores per archetype; the best one wins when its score is >= 2, else "other". */
export function classify(frame, maps, title = frame.name) {
  const f = features(frame, maps);
  const t = f.texts;
  const name = String(title).toLowerCase();
  const s = Object.fromEntries(ARCHETYPES.map((a) => [a, 0]));
  if (/вход|login|sign in|авториз/.test(name)) s.login += 3;
  if (f.password && f.input <= 4) s.login += 2;
  if (has(t, /^(войти|вход|sign in|log in)$/i)) s.login += 2;
  if (f.table) s.list += 3;
  if (f.pagination) s.list += 1;
  if (f.search || f.filter) s.list += 1;
  if (/список|реестр|все |list|журнал/.test(name)) s.list += 1;
  if (/карточк|card|детал|details|профил|просмотр|заявка [a-zа-я]*-?\d/.test(name)) s.record += 2;
  if (f.details) s.record += 2;
  if (f.timeline) s.record += 1;
  if (f.stepper && !f.input) s.record += 1;
  if (f.input >= 3) s.form += 2;
  if (/форм|form|новый|новая|создан|new|редакт|edit|анкет/.test(name)) s.form += 2;
  if (/дашборд|dashboard|обзор|overview|главная|аналитик/.test(name)) s.dashboard += 2;
  if (f.chart) s.dashboard += 1;
  if (f.kpi >= 2) s.dashboard += 2;
  if (/мастер|wizard|шаг \d|step \d/.test(name)) s.wizard += 2;
  if (f.stepper && f.input >= 2) s.wizard += 2;
  if (/канбан|kanban|доска|board|конвейер|pipeline/.test(name)) s.board += 2;
  if (f.kanban >= 2) s.board += 2;
  // A pipeline of application cards in columns is a board even with KPI cards above it.
  if (f.appCard >= 4) s.board += 3;
  // Mobile and web lists without a table: repeated list rows.
  if (f.listItem >= 3) s.list += 3;
  if (f.table) s.record -= 1;
  const [best, score] = Object.entries(s).sort((a, b) => b[1] - a[1])[0];
  return { archetype: score >= 2 ? best : 'other', scores: s, features: f };
}

// ---- blocks for spec@1 templates ----

const COLUMN_TYPES = [
  [/номер|№|\bid\b|код/i, 'id'], [/клиент|фио|заёмщик|заемщик|имя|менеджер|ответствен/i, 'person'],
  [/компан|организац|работодат/i, 'company'], [/телефон|phone/i, 'phone'], [/почта|e-?mail/i, 'email'],
  [/сумм|баланс|лимит|доход|платёж|платеж|amount/i, 'money'], [/дата.*время|создан|обновл/i, 'datetime'],
  [/дата|срок|date/i, 'date'], [/статус|status|этап/i, 'status'], [/процент|ставк|%/i, 'percent'],
  [/продукт|product/i, 'product'], [/город|city|регион/i, 'city'], [/кол-во|количеств|число/i, 'number'],
];
export function columnType(text) {
  for (const [re, type] of COLUMN_TYPES) if (re.test(text)) return type;
  return 'text';
}
const FIELD_KIND = { phone: 'phone', money: 'money', date: 'date', datetime: 'date', email: 'email' };

const uniq = (list) => [...new Set(list.filter(Boolean))];
const short = (list, n) => uniq(list).filter((s) => s.length <= 40).slice(0, n);
const buttons = (node, maps) => {
  const out = [];
  walk(node, (n) => {
    if (n.visible === false) return false;
    if (n.type === 'INSTANCE' && SIGNALS.button.test(label(n, maps))) { out.push(textsOf(n)[0]?.text); return false; }
    return true;
  });
  return short(out, 3);
};
const inputs = (node, maps) => {
  const out = [];
  walk(node, (n) => {
    if (n.visible === false) return false;
    if (n.type === 'INSTANCE' && SIGNALS.input.test(label(n, maps)) && !SIGNALS.search.test(label(n, maps))) {
      const texts = textsOf(n);
      const labelText = (texts.find((t) => /label/i.test(t.name)) || texts[0])?.text;
      const kind = /password|парол/i.test(label(n, maps) + labelText) ? 'password' : /dropdown|select/i.test(label(n, maps)) ? 'select' : FIELD_KIND[columnType(labelText || '')] || 'text';
      if (labelText) out.push({ label: labelText.replace(/\s*\*$/, ''), type: kind, required: /\*$/.test(labelText) || undefined });
      return false;
    }
    return true;
  });
  return out;
};

function detect(n, maps) {
  const name = label(n, maps);
  const texts = () => textsOf(n).map((t) => t.text);
  if (SIGNALS.nav.test(name)) return { nav: short(texts(), 7) };
  if (SIGNALS.header.test(name)) {
    const t = texts();
    const b = buttons(n, maps);
    return { block: { type: 'header', title: t.find((x) => !b.includes(x)) || 'Заголовок', ...(b.length ? { actions: b } : {}) } };
  }
  if (SIGNALS.table.test(name) && !SIGNALS.pagination.test(name)) {
    const head = [];
    walk(n, (c) => { if (/header|заголов/i.test(c.name) && c !== n) { head.push(...textsOf(c).map((t) => t.text)); return false; } return true; });
    const cols = short(head.length ? head : texts().slice(0, 7), 8);
    return { block: { type: 'table', columns: cols.length ? cols.map((c) => `${c}:${columnType(c)}`) : ['Название:text'] } };
  }
  if (SIGNALS.pagination.test(name)) return { block: { type: 'pagination' } };
  if (SIGNALS.kanban.test(name)) return { block: { type: 'kanban', columns: short(texts(), 6) } };
  if (SIGNALS.stepper.test(name) && !/^input/.test(name)) return { block: { type: 'stepper', steps: short(texts(), 7), current: 1 } };
  if (SIGNALS.timeline.test(name)) return { block: { type: 'timeline', title: texts()[0] || 'История' } };
  if (SIGNALS.details.test(name)) {
    const t = texts();
    return { block: { type: 'details', title: t[0] || 'Данные', items: short(t.slice(1).filter((_, i) => i % 2 === 0), 8).map((x) => `${x}:${columnType(x)}`) } };
  }
  if (SIGNALS.chart.test(name)) return { block: { type: 'chart', title: texts()[0] || 'График' } };
  if (SIGNALS.alert.test(name)) return { block: { type: 'alert', text: texts().slice(-1)[0] || 'Сообщение', variant: 'warning' } };
  if (SIGNALS.tabs.test(name) && n.type === 'INSTANCE') return { block: { type: 'tabs', items: short(texts(), 6) } };
  if (SIGNALS.empty.test(name)) {
    const t = texts();
    return { block: { type: 'empty', title: t[0] || 'Пока пусто', text: t[1] || '' }, empty: { title: t[0], text: t[1], action: buttons(n, maps)[0] } };
  }
  if (SIGNALS.search.test(name) || SIGNALS.filter.test(name)) {
    const search = n.type === 'INSTANCE' && SIGNALS.search.test(name) ? texts()[0] : null;
    let found = search;
    const filters = [];
    walk(n, (c) => {
      if (c === n) return true;
      const l = label(c, maps);
      if (c.type === 'INSTANCE' && SIGNALS.search.test(l)) { found = found || textsOf(c)[0]?.text; return false; }
      if (c.type === 'INSTANCE') { filters.push(textsOf(c)[0]?.text); return false; }
      return true;
    });
    return { block: { type: 'toolbar', ...(found ? { search: found } : {}), filters: short(filters, 4) } };
  }
  if (/kpi|stat|метрик|показател/.test(name) && (n.children || []).length >= 2) {
    const items = (n.children || []).filter((c) => c.visible !== false).map((c) => {
      const t = textsOf(c).map((x) => x.text);
      return { label: t[0] || 'Показатель', value: t[1] || '0', ...(t[2] ? { delta: t[2] } : {}) };
    });
    return { block: { type: 'stats', items: items.slice(0, 4) } };
  }
  const fields = n.type !== 'INSTANCE' ? inputs(n, maps) : [];
  if (fields.length >= 2 && /form|форм|card|карточк|login|вход|auth|анкет/.test(name)) {
    const b = buttons(n, maps);
    const isLogin = fields.some((x) => x.type === 'password') && fields.length <= 3;
    if (isLogin) return { block: { type: 'login', title: textsOf(n)[0]?.text || 'Вход' } };
    return { block: { type: 'form', title: textsOf(n)[0]?.text || 'Данные', fields: fields.slice(0, 8).map(({ required, ...x }) => (required ? { ...x, required } : x)), ...(b.length ? { submit: b.at(-1) } : {}) } };
  }
  return null;
}

/**
 * Blocks of a frame in reading order. A horizontal container whose 2+ wide children each hold blocks becomes `split`.
 * Returns { blocks, nav, empty }.
 */
export function extractBlocks(frame, maps) {
  const ctx = { nav: null, empty: null };
  const visit = (node, depth) => {
    if (node.visible === false || depth > 8) return [];
    if (depth > 0) {
      const hit = detect(node, maps);
      if (hit?.nav) { ctx.nav = ctx.nav || hit.nav; return []; }
      if (hit?.empty) ctx.empty = ctx.empty || hit.empty;
      if (hit?.block) return [{ ...hit.block, _y: posOf(node).y }];
      if (node.type === 'INSTANCE') return [];
    }
    const kids = (node.children || []).filter((c) => c.visible !== false);
    const parts = kids.map((c) => ({ c, blocks: visit(c, depth + 1) })).filter((p) => p.blocks.length);
    const wide = parts.filter((p) => sizeOf(p.c).width >= 240);
    if (depth > 0 && node.layoutMode === 'HORIZONTAL' && wide.length >= 2 && wide.length === parts.length) {
      const [a, b] = wide.map((p) => sizeOf(p.c).width);
      const ratio = a >= 1.6 * b ? '2:1' : b >= 1.6 * a ? '1:2' : '1:1';
      return [{ type: 'split', ratio, columns: wide.map((p) => p.blocks.map(strip)), _y: posOf(node).y }];
    }
    return parts.flatMap((p) => p.blocks).sort((x, y) => x._y - y._y);
  };
  const blocks = visit(frame, 0).map(strip);
  return { blocks, nav: ctx.nav, empty: ctx.empty };
}

const strip = ({ _y, ...b }) => b;

/** Signature used to find the most common structure: "header>tabs>toolbar>table>pagination". */
export const signature = (blocks) => blocks.map((b) => (b.type === 'split' ? `split(${b.columns.map((c) => c.map((x) => x.type).join('+')).join('|')})` : b.type)).join('>');
