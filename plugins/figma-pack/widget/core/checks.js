// WCAG AA contrast for text/fill pairs of the board and validation of extra project tokens.
// Same rules as apps/ds-configurator src/lib/extra-tokens.ts, on the builder colour math.
import { contrast } from '../../builder/core/color.js';
import { normHex, resolveValue, rowsByCss, MODES } from './model.js';

export const MIN_TEXT = 4.5;
const KEBAB = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const LENGTH = /^(0|\d+(\.\d+)?(px|rem)?)$/;
export const KINDS = ['color', 'radius', 'size'];

// Text tokens read on a fill other than "<name minus -foreground>": [fill, minimum].
const PAIR_OVERRIDES = {
  foreground: ['background', MIN_TEXT],
  'muted-foreground': ['background', 3],
  'soft-foreground': ['background', 3],
  'inverse-foreground': ['surface-inverse', MIN_TEXT],
  'disabled-foreground': null, // disabled text is exempt (WCAG 1.4.3)
  'primary-foreground-muted': null,
  'brand-foreground-muted': null,
  'brand-ghost-foreground-muted': null,
};

/** Fill a text token is read on, or null: [fill, min]. */
export function pairFor(css, byCss, pairWith) {
  if (pairWith) return [pairWith, MIN_TEXT];
  if (css in PAIR_OVERRIDES) return PAIR_OVERRIDES[css];
  let m = /^status-(\w+)-foreground$/.exec(css);
  if (m) return byCss.has(`status-${m[1]}-muted`) ? [`status-${m[1]}-muted`, MIN_TEXT] : null;
  m = /^(.+)-foreground$/.exec(css);
  if (m && byCss.has(m[1])) return [m[1], MIN_TEXT];
  return null;
}

/** Every text/fill pair of the model in both modes: [{ fg, bg, mode, ratio, min, ok }]. */
export function contrastIssues(rows) {
  const byCss = rowsByCss(rows);
  const out = [];
  for (const r of rows) {
    if (r.kind !== 'color') continue;
    const pair = pairFor(r.css, byCss, r.pairWith);
    if (!pair || !byCss.has(pair[0])) continue;
    for (const mode of MODES) {
      const fg = normHex(resolveValue(r[mode], mode, byCss));
      const bg = normHex(resolveValue(byCss.get(pair[0])[mode], mode, byCss));
      const ratio = fg && bg ? Math.round(contrast(fg, bg) * 100) / 100 : null;
      out.push({ fg: r.css, bg: pair[0], mode, ratio, min: pair[1], ok: ratio !== null && ratio >= pair[1] });
    }
  }
  return out;
}

/** px number from "12", "12px" or "0.75rem". */
export const toPx = (value) => {
  const s = String(value).trim();
  return s.endsWith('rem') ? parseFloat(s) * 16 : parseFloat(s);
};

/**
 * Errors (Russian) for one extra token.
 * token: { name, kind, light, dark, pairWith? }; prefix: project prefix; taken: Set of CSS names in use.
 */
export function validateExtra(token, prefix, taken = new Set()) {
  const errors = [];
  if (!KEBAB.test(prefix || '')) errors.push('Префикс проекта: латиница в нижнем регистре, цифры и дефисы');
  if (!KEBAB.test(token.name || '')) errors.push('Имя: kebab-case (например mb-promo-surface)');
  else if (!token.name.startsWith(`${prefix}-`)) errors.push(`Имя должно начинаться с префикса «${prefix}-»`);
  else if (token.name === `${prefix}-`) errors.push('Имя: после префикса нужна роль');
  if (taken.has(token.name)) errors.push(`Токен «${token.name}» уже есть`);
  if (!KINDS.includes(token.kind)) errors.push(`Тип: ${KINDS.join(' | ')}`);
  for (const mode of MODES) {
    const value = String(token[mode] == null ? '' : token[mode]).trim();
    if (!value) { if (mode === 'light') errors.push('light: нужно значение'); continue; }
    if (token.kind === 'color' && !normHex(value) && !/^var\(--[\w-]+\)$/.test(value)) {
      errors.push(`${mode}: не цвет (hex #rrggbb или var(--токен))`);
    } else if (token.kind !== 'color' && !LENGTH.test(value)) {
      errors.push(`${mode}: нужна длина в px или rem (например 12px)`);
    }
  }
  if (token.pairWith && token.kind !== 'color') errors.push('Пара для контраста бывает только у цвета');
  return errors;
}

/** Extra token as stored: values normalised (hex lower-case, lengths in px numbers). */
export function normalizeExtra(token) {
  const norm = (v) => {
    if (v == null || String(v).trim() === '') return null;
    if (token.kind === 'color') return normHex(v) || String(v).trim();
    return toPx(v);
  };
  const light = norm(token.light);
  const dark = norm(token.dark);
  return { name: token.name, kind: token.kind, light, dark: dark == null ? light : dark, ...(token.pairWith ? { pairWith: token.pairWith } : {}) };
}
