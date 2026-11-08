// «Просто» mode: a person picks screens and pieces with clicks, no JSON. Everything here turns
// those clicks into a normal spec@1 built from a ready example (the credit CRM), so links,
// navigation and realistic texts come for free.
import { walkBlocks } from './links.js';

// Friendly face of each example screen: emoji, what a non-designer sees on it, and a plain tile title
// when the screen's own title is a sample record ("Заявка CL-240118").
export const SCREEN_INFO = {
  login: ['🔑', 'Вход по почте и паролю'],
  dashboard: ['📊', 'Цифры, графики и последние заявки'],
  apps: ['📋', 'Таблица с вкладками и фильтрами'],
  pipeline: ['🗂️', 'Доска с колонками, как в Trello'],
  'app-card': ['📄', 'Всё про одну заявку', 'Карточка заявки'],
  'app-new': ['✍️', 'Форма по шагам'],
  underwriting: ['🧮', 'Очередь на проверку'],
  'uw-decision': ['⚖️', 'Одобрить или отказать', 'Решение'],
  security: ['🛡️', 'Проверки безопасности'],
  clients: ['👥', 'Список клиентов'],
  'client-card': ['🙂', 'Профиль клиента', 'Карточка клиента'],
  'client-new': ['➕', 'Форма нового клиента'],
  loans: ['💳', 'Портфель кредитов'],
  'loan-card': ['🧾', 'Всё про один кредит', 'Карточка кредита'],
  collection: ['⏰', 'Должники и просрочка'],
  reports: ['📈', 'Отчёты и воронка'],
  products: ['🛍️', 'Карточки продуктов'],
  staff: ['🧑‍💼', 'Сотрудники и роли'],
  settings: ['⚙️', 'Настройки и переключатели'],
};

// Pieces for «Собери свой экран», in the order a screen usually reads top to bottom.
export const PIECES = [
  ['header', '🏷️', 'Заголовок и кнопки'],
  ['profile', '🙂', 'Шапка профиля'],
  ['stats', '🔢', 'Цифры (KPI)'],
  ['tabs', '📑', 'Вкладки'],
  ['stepper', '👣', 'Шаги'],
  ['toolbar', '🔍', 'Поиск и фильтры'],
  ['alert', '⚠️', 'Предупреждение'],
  ['table', '📋', 'Таблица'],
  ['pagination', '🔢', 'Страницы 1 2 3'],
  ['cards', '🃏', 'Карточки'],
  ['kanban', '🗂️', 'Доска (канбан)'],
  ['chart', '📈', 'График'],
  ['funnel', '🔻', 'Воронка'],
  ['breakdown', '🥧', 'Разбивка по долям'],
  ['meters', '📶', 'Шкалы'],
  ['list', '📃', 'Список'],
  ['details', '🗒️', 'Поля «название — значение»'],
  ['form', '✍️', 'Форма'],
  ['score', '🎯', 'Скоринг'],
  ['checks', '✅', 'Проверки'],
  ['decision', '⚖️', 'Кнопки решения'],
  ['timeline', '🕓', 'История событий'],
  ['files', '📎', 'Файлы'],
  ['comments', '💬', 'Комментарии'],
  ['empty', '🫙', 'Пусто (ничего не найдено)'],
].map(([type, emoji, label]) => ({ type, emoji, label }));

// Pieces the example has no sample of.
const FALLBACK = {
  alert: { type: 'alert', title: 'Внимание', text: 'Проверьте данные клиента перед отправкой', variant: 'warning' },
  empty: { type: 'empty', title: 'Здесь пока пусто', text: 'Создайте первую запись', action: '+ Создать' },
};

/** Screens of the base spec as tiles: { id, title, emoji, hint }. */
export function screenTiles(base) {
  return base.screens.map((s) => {
    const [emoji, hint, title] = SCREEN_INFO[s.id] || ['🖼️', ''];
    return { id: s.id, title: title || s.title, emoji, hint };
  });
}

/** First sample of each block type in the base spec (deep copy), so a piece looks real. */
export function pieceSamples(base) {
  const out = { ...FALLBACK };
  for (const s of base.screens) walkBlocks(s.blocks, (b) => { if (b.type !== 'split' && !out[b.type]) out[b.type] = JSON.parse(JSON.stringify(b)); });
  return out;
}

export const DEVICES = { desktop: ['desktop'], mobile: ['mobile'], both: ['desktop', 'mobile'] };

/**
 * Clicks -> { spec, only }. pick: { screens: [id], device: desktop|mobile|both, states: bool,
 * product?: string, custom?: { title, pieces: [type] } }. Build with opts.only so links to
 * screens that were not picked still resolve.
 */
export function easySpec(base, pick) {
  const viewports = DEVICES[pick.device] || DEVICES.desktop;
  const screens = base.screens.map((s) => ({ ...s, viewports, states: pick.states ? s.states : ['default'] }));
  const only = [...(pick.screens || [])].filter((id) => screens.some((s) => s.id === id));
  const custom = pick.custom;
  if (custom && custom.pieces?.length) {
    const samples = pieceSamples(base);
    const title = String(custom.title || '').trim() || 'Мой экран';
    let n = 1;
    while (screens.some((s) => s.id === `my-screen-${n}`)) n += 1;
    const id = `my-screen-${n}`;
    const blocks = custom.pieces.filter((t) => samples[t]).map((t) => {
      const b = JSON.parse(JSON.stringify(samples[t]));
      if (t === 'header') b.title = title;
      return b;
    });
    if (!blocks.some((b) => b.type === 'header' || b.type === 'profile')) blocks.unshift({ type: 'header', title });
    screens.push({ id, title, page: title, viewports, states: ['default'], blocks });
    only.push(id);
  }
  const product = String(pick.product || '').trim();
  return { spec: { ...base, project: product || base.project, viewports, screens }, only };
}
