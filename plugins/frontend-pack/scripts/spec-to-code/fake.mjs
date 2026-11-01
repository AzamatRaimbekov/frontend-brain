// Deterministic realistic data so a spec only names columns, never rows.
const FIRST = ['Айгуль', 'Бакыт', 'Нурлан', 'Асель', 'Тимур', 'Жылдыз', 'Эмиль', 'Динара', 'Руслан', 'Мээрим', 'Азамат', 'Камила'];
const LAST = ['Токтогулова', 'Асанов', 'Исаков', 'Садыкова', 'Бекмуратов', 'Осмонова', 'Жумабеков', 'Алиева', 'Кадыров', 'Мамытова'];
const COMPANIES = ['ОсОО «Ала-Тоо Трейд»', 'ИП Садыкова', 'ОсОО «Бишкек Логистик»', 'ОсОО «Нур Агро»', 'ОАО «Тянь-Шань»', 'ОсОО «Ош Маркет»'];
const PRODUCTS = ['Потребительский', 'Автокредит', 'Ипотека', 'Бизнес-кредит', 'Кредитная карта', 'Рассрочка'];
const CITIES = ['Бишкек', 'Ош', 'Каракол', 'Джалал-Абад', 'Нарын', 'Токмок'];
const WORDS = ['Проверка документов', 'Звонок клиенту', 'Повторный скоринг', 'Запрос выписки', 'Согласование лимита', 'Выдача средств'];
export const DEFAULT_STATUSES = ['Новая', 'В работе', 'На проверке', 'Одобрена', 'Отказ'];

export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

const pick = (r, list) => list[Math.floor(r() * list.length)];
// Thousands by hand: Figma's sandbox has no locale data, toLocaleString('ru-RU') gave «956000».
const groups = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
const money = (r) => `${groups(Math.round(r() * 2400 + 50) * 1000)} с`;
const date = (r, time) => {
  const d = String(1 + Math.floor(r() * 28)).padStart(2, '0');
  const m = String(1 + Math.floor(r() * 10)).padStart(2, '0');
  const t = `${String(9 + Math.floor(r() * 9)).padStart(2, '0')}:${String(Math.floor(r() * 60)).padStart(2, '0')}`;
  return time ? `${d}.${m}.2026, ${t}` : `${d}.${m}.2026`;
};

const GEN = {
  id: (r, i) => `CL-${240100 + i * 7 + Math.floor(r() * 5)}`,
  person: (r) => `${pick(r, FIRST)} ${pick(r, LAST)}`,
  company: (r) => pick(r, COMPANIES),
  phone: (r) => `+996 ${700 + Math.floor(r() * 99)} ${String(Math.floor(r() * 999)).padStart(3, '0')} ${String(Math.floor(r() * 999)).padStart(3, '0')}`,
  email: (r) => `${pick(r, ['a', 'b', 'n', 't', 'd'])}.${pick(r, ['asanov', 'isakova', 'bekov', 'alieva'])}@mail.kg`,
  money,
  date: (r) => date(r, false),
  datetime: (r) => date(r, true),
  number: (r) => String(Math.floor(r() * 990 + 10)),
  percent: (r) => `${(r() * 40 + 55).toFixed(1)}%`,
  product: (r) => pick(r, PRODUCTS),
  city: (r) => pick(r, CITIES),
  text: (r) => pick(r, WORDS),
};

export const FIELD_TYPES = [...Object.keys(GEN), 'status', 'actions'];

// "Сумма:money" -> { label: 'Сумма', type: 'money' }; type defaults to text.
export function parseColumn(col) {
  if (typeof col === 'object') return { label: col.label, type: col.type || 'text' };
  const [label, type = 'text'] = String(col).split(':');
  return { label: label.trim(), type: type.trim() };
}

export function fakeValue(type, r, i = 0, statuses = DEFAULT_STATUSES) {
  if (type === 'status') return statuses[(i + Math.floor(r() * 2)) % statuses.length];
  if (type === 'actions') return '•••';
  return (GEN[type] || GEN.text)(r, i);
}

export function fakeRows(columns, count, seed = 7, statuses) {
  const r = rng(seed);
  const cols = columns.map(parseColumn);
  return Array.from({ length: count }, (_, i) => cols.map((c) => fakeValue(c.type, r, i, statuses)));
}
