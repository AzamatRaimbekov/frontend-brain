// Data side of the credit pipeline CRM blocks (figma-pack builder blocks-crm.js): fixtures from the
// spec items, zod schemas of the payload, copy for lib/messages.ts. Components: blocks-crm.mjs.
import { actionText, clean } from './blocks-ui.mjs';

/** Blocks with data from the screen query (spec DATA_BLOCKS) and static ones (copy only). */
export const CRM_DATA = ['funnel', 'meters', 'score', 'files', 'checks', 'comments', 'breakdown'];
export const CRM_STATIC = ['decision', 'profile'];
export const CRM_TYPES = [...CRM_DATA, ...CRM_STATIC];

// "1,12 млрд" -> 1.12, "312" -> 312, "39%" -> 39.
export const num = (v) => Number(String(v ?? '').replace(/[\s ]/g, '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
export const pairOf = (it) => (Array.isArray(it) ? it : typeof it === 'string' ? it.split(':') : [it?.label, it?.value]);
const str = (v) => (v == null || v === '' ? undefined : String(v));
// Spec tone (success | warning | danger | info) -> kit Progress tone (brand | success | warning | error).
const METER_TONE = { success: 'success', warning: 'warning', danger: 'error', destructive: 'error', error: 'error', info: 'brand', default: 'brand' };
const CHECK_STATUS = ['ok', 'warn', 'fail', 'wait'];
const round = (x, d = 1) => Math.round(x * 10 ** d) / 10 ** d;

/** Deterministic payload of one CRM data block, straight from the spec items. */
export function crmFixture(b) {
  const items = b.items || [];
  switch (b.type) {
    case 'funnel': {
      const max = Math.max(1, ...items.map((it) => num(it.value)));
      return items.map((it, i) => ({ id: `stage${i + 1}`, label: String(it.label), value: String(it.value ?? ''), rate: str(it.rate), hint: str(it.hint), share: round(num(it.value) / max, 3) }));
    }
    case 'meters':
      return items.map((it, i) => {
        const percent = Math.min(100, num(it.percent ?? it.value));
        const tone = METER_TONE[it.tone] || (percent >= 90 ? 'error' : percent >= 75 ? 'warning' : 'brand');
        return { id: `meter${i + 1}`, label: String(it.label), value: String(it.value ?? `${percent}%`), percent, hint: str(it.hint), tone };
      });
    case 'score':
      return {
        value: num(b.value), max: num(b.max) || 850, grade: str(b.grade),
        factors: items.map((it, i) => {
          const [label, impact] = pairOf(it);
          return { id: `factor${i + 1}`, label: String(label), impact: String(impact ?? ''), good: /^[+▲↑]/.test(String(impact ?? '').trim()) };
        }),
      };
    case 'files':
      return items.map((it, i) => {
        const f = typeof it === 'string' ? { name: it } : it;
        return { id: `file${i + 1}`, name: String(f.name), meta: str(f.meta), status: str(f.status) };
      });
    case 'checks':
      return items.map((it, i) => {
        const c = typeof it === 'string' ? { label: it } : it;
        return { id: `check${i + 1}`, label: String(c.label), hint: str(c.hint), result: str(c.result), status: CHECK_STATUS.includes(c.status) ? c.status : 'ok' };
      });
    case 'comments':
      return items.map((it, i) => {
        const [who, time, text] = Array.isArray(it) ? it : [it.who, it.time, it.text];
        return { id: `comment${i + 1}`, who: String(who), time: str(time), text: String(text ?? '') };
      });
    case 'breakdown': {
      const shares = items.map((it) => num(it.share));
      const total = shares.reduce((a, x) => a + x, 0) || 1;
      return items.map((it, i) => ({ id: `part${i + 1}`, label: String(it.label), value: str(it.value), share: String(it.share ?? ''), percent: round((shares[i] / total) * 100) }));
    }
    default:
      return null;
  }
}

/** Zod schema of one CRM data block's payload (api/schemas.ts). */
export function crmSchema(b) {
  const s = 'z.string()';
  const o = `${s}.optional()`;
  switch (b.type) {
    case 'funnel': return `z.array(z.object({ id: ${s}, label: ${s}, value: ${s}, rate: ${o}, hint: ${o}, share: z.number() }))`;
    case 'meters': return `z.array(z.object({ id: ${s}, label: ${s}, value: ${s}, percent: z.number(), hint: ${o}, tone: z.enum(['brand', 'success', 'warning', 'error']) }))`;
    case 'score': return `z.object({ value: z.number(), max: z.number(), grade: ${o}, factors: z.array(z.object({ id: ${s}, label: ${s}, impact: ${s}, good: z.boolean() })) })`;
    case 'files': return `z.array(z.object({ id: ${s}, name: ${s}, meta: ${o}, status: ${o} }))`;
    case 'checks': return `z.array(z.object({ id: ${s}, label: ${s}, hint: ${o}, result: ${o}, status: z.enum(['ok', 'warn', 'fail', 'wait']) }))`;
    case 'comments': return `z.array(z.object({ id: ${s}, who: ${s}, time: ${o}, text: ${s} }))`;
    case 'breakdown': return `z.array(z.object({ id: ${s}, label: ${s}, value: ${o}, share: ${s}, percent: z.number() }))`;
    default: return 'z.unknown()';
  }
}

const DESTRUCTIVE = /отказ|отклон|reject|удал|заблок/i;

/** Button look of a static block action: "Отказать" destructive, "+ …" (or the first, for decision) primary, the rest outline. */
export function crmActions(actions, firstPrimary = false) {
  return (actions || []).map((a, i) => {
    const label = clean(a);
    const variant = DESTRUCTIVE.test(label) ? 'destructive' : /^\+/.test(actionText(a)) || (firstPrimary && i === 0) ? 'primary' : 'outline';
    return { label, variant };
  });
}

/** Actions of a decision block: spec default when absent, none for an explicit []. */
export const decisionActions = (b) => crmActions(b.spec.actions ?? ['Одобрить', 'На доработку', 'Отказать'], true);

const initials = (name) => String(name).split(/\s+/).map((w) => w[0] || '').join('').slice(0, 2).toUpperCase();
const head = (b, title) => ({ title: b.spec.title || title, subtitle: str(b.spec.subtitle), more: b.spec.more ? clean(b.spec.more) : undefined });
const terms = (items) => (items || []).map((it) => { const [label, value] = pairOf(it); return { label: String(label), value: String(value ?? '') }; });

/** Strings of each CRM block for lib/messages.ts (react-security-i18n: copy out of JSX). */
export const CRM_TEXTS = {
  funnel: (b) => ({ ...head(b, 'Воронка'), label: 'Этапы воронки' }),
  meters: (b) => head(b, 'Показатели'),
  score: (b) => ({ ...head(b, 'Скоринг'), of: 'из', scale: 'Шкала риска', high: 'Высокий риск', low: 'Низкий риск', factors: b.spec.factorsTitle || 'Что повлияло' }),
  files: (b) => ({ ...head(b, 'Документы'), actions: 'Действия с файлом' }),
  checks: (b) => ({ ...head(b, 'Проверки'), status: { ok: 'Пройдена', warn: 'Внимание', fail: 'Не пройдена', wait: 'Ожидает' } }),
  comments: (b) => ({ ...head(b, 'Комментарии'), placeholder: b.spec.placeholder || 'Написать комментарий…', field: 'Новый комментарий', send: 'Отправить', you: 'Вы', empty: 'Комментариев пока нет' }),
  breakdown: (b) => head(b, 'Структура'),
  decision: (b) => ({ ...head(b, 'Решение'), terms: terms(b.spec.items), note: str(b.spec.note), actions: decisionActions(b).map((a) => ({ label: a.label })) }),
  profile: (b) => ({
    name: String(b.spec.name), initials: initials(b.spec.name), meta: str(b.spec.meta), badges: (b.spec.badges || []).map(String),
    badgesLabel: 'Метки клиента', facts: terms(b.spec.items), actions: crmActions(b.spec.actions).map((a) => ({ label: a.label })),
  }),
};

/** Status labels a CRM block shows as badges (model statusesOf -> lib/status.ts). */
export function crmStatuses(b) {
  if (b.type === 'files') return b.fixture.map((f) => f.status);
  if (b.type === 'score') return [b.fixture.grade];
  if (b.type === 'profile') return (b.spec.badges || []).map(String);
  return [];
}
