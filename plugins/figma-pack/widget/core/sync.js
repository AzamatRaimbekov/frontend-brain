// Board <-> Figma file: status of each row against a scan of the `shadcn` collection, and the plan of
// variable writes "Apply to Figma" executes. Pure; the sandbox side is src/figma-io.js.
import { parseColor, colorKey } from './oklch.js';
import { toPx, MODES } from './model.js';

export const STATUS = {
  bound: { label: '✓ в файле', tone: 'success' },
  differs: { label: '≠ файл', tone: 'warning' },
  missing: { label: 'нет в файле', tone: 'error' },
  library: { label: 'в библиотеке', tone: 'info' },
  unknown: { label: 'не проверено', tone: 'neutral' },
};

const FILLS = ['FRAME_FILL', 'SHAPE_FILL'];
const STROKES = ['STROKE_COLOR'];

/**
 * Figma scopes of a shadcn variable: *-foreground -> text; border / input / ring (and the sidebar ones)
 * -> strokes (input is also the dark field fill); destructive is a fill, a text and a stroke colour;
 * chart-* -> fills and strokes; every other colour -> fills; radius -> corner radius.
 */
export function scopesOf(name, kind = 'color') {
  if (kind === 'radius') return ['CORNER_RADIUS'];
  if (/-foreground$/.test(name)) return ['TEXT_FILL'];
  if (/^(sidebar-)?(border|ring)$/.test(name)) return [...STROKES];
  if (name === 'input') return [...STROKES, ...FILLS];
  if (name === 'destructive') return [...FILLS, 'TEXT_FILL', ...STROKES];
  if (/^chart-/.test(name)) return [...FILLS, ...STROKES];
  return [...FILLS];
}

export const codeSyntaxOf = (name) => `var(--${name})`;

/** A row value as Figma writes it: COLOR -> RGBA, radius -> px number. */
export function figmaValue(kind, value) {
  return kind === 'color' ? parseColor(value) : toPx(value);
}

/** A scan value (Figma RGBA or number) -> comparable plain value (#hex / number). */
export function plainValue(v) {
  if (v && typeof v === 'object' && 'r' in v) return colorKey(v);
  return v;
}

/**
 * Status of one row against a scan snapshot { vars: { <name>: { light, dark } }, library: { <name>: true } }.
 */
export function statusOf(row, snapshot) {
  if (!snapshot || !snapshot.vars) return 'unknown';
  const v = snapshot.vars[row.name];
  if (!v) return snapshot.library && snapshot.library[row.name] ? 'library' : 'missing';
  const same = (mode) => (row.kind === 'color' ? colorKey(row[mode]) === v[mode] : toPx(row[mode]) === Number(v[mode]));
  return MODES.every(same) ? 'bound' : 'differs';
}

/** Status per row key plus totals: { byKey, totals: { bound, differs, missing, library, unknown } }. */
export function fileStatus(rows, snapshot) {
  const byKey = {};
  const totals = { bound: 0, differs: 0, missing: 0, library: 0, unknown: 0 };
  for (const r of rows) {
    const s = statusOf(r, snapshot);
    byKey[r.key] = s;
    totals[s]++;
  }
  return { byKey, totals };
}

/**
 * Variable writes for "Apply to Figma".
 * opts.all: every row (fresh file); default only edited rows and rows that differ from / miss in the scan.
 * -> { writes: [{ name, type, values: { light, dark }, scopes, codeSyntax }], skipped: [{ name, reason }] }
 */
export function planWrites(model, opts = {}) {
  const writes = [];
  const skipped = [];
  for (const r of model.rows) {
    const status = statusOf(r, opts.snapshot);
    if (!opts.all && !r.edited && (status === 'bound' || status === 'unknown')) continue;
    const light = figmaValue(r.kind, r.light);
    const dark = figmaValue(r.kind, r.dark);
    if (light == null || dark == null) { skipped.push({ name: r.name, reason: 'значение не читается' }); continue; }
    writes.push({ name: r.name, type: r.kind === 'color' ? 'COLOR' : 'FLOAT', values: { light, dark }, scopes: scopesOf(r.name, r.kind), codeSyntax: codeSyntaxOf(r.name) });
  }
  return { writes, skipped };
}
