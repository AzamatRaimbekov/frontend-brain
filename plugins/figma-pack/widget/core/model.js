// Board model of the shadcn Tokens widget: shadcn-tokens.json (schema shadcn/tokens@1, the only token set
// of the design system) + the team's value edits -> rows the canvas board, the exports and "apply" read.
// A project changes values of these names only; names are never added or removed.
// Pure: no Figma API, runs in node:test and inside the widget sandbox.
import { parseColor, colorKey } from './oklch.js';

export const SCHEMA = 'shadcn/tokens@1';
export const COLLECTION = 'shadcn';
export const MODES = ['light', 'dark'];
/** Figma mode name of each mode of the `shadcn` collection. */
export const FIGMA_MODES = { light: 'Light', dark: 'Dark' };
export const RADIUS = 'radius';

export const GROUPS = [
  { id: 'base', label: 'Фон и текст' },
  { id: 'action', label: 'Акценты' },
  { id: 'border', label: 'Границы' },
  { id: 'chart', label: 'Графики' },
  { id: 'sidebar', label: 'Сайдбар' },
  { id: 'radius', label: 'Радиус' },
];

/** Board group of a token name. */
export function groupOf(name) {
  if (name === RADIUS) return 'radius';
  if (/^chart-/.test(name)) return 'chart';
  if (/^sidebar/.test(name)) return 'sidebar';
  if (/^(border|input|ring)$/.test(name)) return 'border';
  if (/^(primary|secondary|muted|accent|destructive)/.test(name)) return 'action';
  return 'base';
}

/** Figma mode name -> 'light' | 'dark' | the lower-cased name (case and spaces ignored). */
export const modeName = (name) => String(name).trim().toLowerCase();

const LENGTH = /^(\d+(?:\.\d+)?|\.\d+)(px|rem)?$/;

/** "0.625rem" | "10px" | 10 -> px number (rem = 16px); null when not a length. */
export function toPx(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  const m = LENGTH.exec(String(value == null ? '' : value).trim());
  if (!m) return null;
  return Number(m[1]) * (m[2] === 'rem' ? 16 : 1);
}

/** Canonical form of an edited value: colours stay CSS strings (oklch() / #hex lower-case), radius stays a length. */
export function normValue(kind, value) {
  if (value == null || String(value).trim() === '') return undefined;
  const s = String(value).trim();
  if (kind === 'color') return parseColor(s) ? (s.startsWith('#') ? s.toLowerCase() : s.replace(/\s+/g, ' ')) : NaN;
  if (typeof value === 'number') return toPx(value) === null ? NaN : `${value}px`;
  return toPx(s) === null ? NaN : (LENGTH.exec(s)[2] ? s : `${s}px`);
}

/** Same colour (compared in 8-bit sRGB + alpha) or same length in px. */
export function sameValue(a, b, kind = 'color') {
  if (a == null || b == null) return a == b; // eslint-disable-line eqeqeq
  if (kind === 'color') return colorKey(a) !== null && colorKey(a) === colorKey(b);
  return toPx(a) !== null && toPx(a) === toPx(b);
}

/** Checks that a JSON document is shadcn/tokens@1; returns errors (Russian). */
export function checkTokens(data) {
  if (!data || typeof data !== 'object') return ['Нужен JSON-объект shadcn/tokens@1'];
  const errors = [];
  if (data.$schema !== SCHEMA) errors.push(`$schema: нужен «${SCHEMA}»`);
  if (!data.colors || typeof data.colors !== 'object') errors.push('colors: нужен объект { имя: { light, dark } }');
  if (data.radius !== undefined && toPx(data.radius) === null) errors.push('radius: нужна длина в rem или px');
  return errors;
}

/** Rows of the source only (no edits): one per colour + the radius. */
export function sourceRows(tokens) {
  const rows = Object.entries(tokens.colors).map(([name, v]) => ({
    key: name, name, kind: 'color', group: groupOf(name), source: { light: v.light, dark: v.dark },
  }));
  rows.push({ key: RADIUS, name: RADIUS, kind: 'radius', group: 'radius', source: { light: tokens.radius, dark: tokens.radius } });
  return rows;
}

/** Full board model. edits: { [name]: { light?, dark? } } (radius: light only, dark follows). */
export function buildModel(tokens, { edits = {} } = {}) {
  const rows = sourceRows(tokens).map((r) => {
    const e = edits[r.key] || {};
    const light = e.light !== undefined ? e.light : r.source.light;
    const dark = r.kind === 'radius' ? light : e.dark !== undefined ? e.dark : r.source.dark;
    const edited = !sameValue(light, r.source.light, r.kind) || !sameValue(dark, r.source.dark, r.kind);
    return { ...r, light, dark, edited };
  });
  return { rows };
}

export const rowsByName = (rows) => new Map(rows.map((r) => [r.name, r]));

/** Counters for the board header. */
export function counters(model, issues = []) {
  return {
    tokens: model.rows.length,
    edited: model.rows.filter((r) => r.edited).length,
    contrast: issues.filter((i) => !i.ok).length,
  };
}
