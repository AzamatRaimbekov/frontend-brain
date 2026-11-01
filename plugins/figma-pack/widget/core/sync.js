// Board <-> Figma file: status of each row against a scan of the file's variables, and the plan of
// variable writes "Apply to Figma" executes. Pure; the sandbox side is src/figma-io.js.
import { scopesFor } from '../../builder/core/tokens.js';
import { normHex, sameValue, rowsByCss, THEME, BRAND } from './model.js';

export const STATUS = {
  bound: { label: '✓ в файле', tone: 'success' },
  differs: { label: '≠ файл', tone: 'warning' },
  missing: { label: 'нет в файле', tone: 'error' },
  library: { label: 'в библиотеке', tone: 'info' },
  unknown: { label: 'не проверено', tone: 'neutral' },
};

const varKey = (collection, name) => `${collection}/${name}`;

// Not local, but the connected library publishes a variable with this name (values are not read).
const inLibrary = (snapshot, collection, name) => !!(snapshot.library && snapshot.library[varKey(collection, name)]);

/**
 * Status of one row against a scan snapshot { vars: { '<collection>/<name>': { <mode>: value } } }.
 * Brand colours: light = 1.brand mode <brand>, dark = 2.theme brand/<brand>/* (when that variable exists).
 */
export function statusOf(row, snapshot) {
  if (!snapshot || !snapshot.vars) return 'unknown';
  const vars = snapshot.vars;
  if (row.collection === BRAND && row.kind === 'color') {
    const v = vars[varKey(BRAND, row.figma)];
    if (!v || v[row.brand] === undefined) return inLibrary(snapshot, BRAND, row.figma) ? 'library' : 'missing';
    const dark = vars[varKey(THEME, row.darkFigma)];
    const ok = sameValue(v[row.brand], row.light) && (!dark || sameValue(dark.dark, row.dark));
    return ok ? 'bound' : 'differs';
  }
  const v = vars[varKey(row.collection, row.figma)];
  if (!v) return inLibrary(snapshot, row.collection, row.figma) ? 'library' : 'missing';
  if (row.kind === 'radius') return Object.values(v).every((x) => Number(x) === Number(row.light)) ? 'bound' : 'differs';
  return sameValue(v.light, row.light) && sameValue(v.dark, row.dark) ? 'bound' : 'differs';
}

/** Status per row key plus totals: { byKey, totals: { bound, differs, missing, unknown } }. */
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

export function scopesOf(row) {
  if (row.kind === 'radius') return ['CORNER_RADIUS'];
  if (row.kind === 'size') return ['WIDTH_HEIGHT', 'GAP'];
  return scopesFor(row.css);
}

// var(--x) -> alias to the variable of token x; plain values pass through.
function valueFor(raw, byCss) {
  const m = /^var\(--([\w-]+)\)$/.exec(String(raw == null ? '' : raw).trim());
  if (!m) return raw;
  const t = byCss.get(m[1]);
  if (!t) return { error: `var(--${m[1]}): такого токена нет` };
  return { aliasOf: { collection: t.collection, name: t.figma } };
}

/**
 * Variable writes for "Apply to Figma".
 * opts.all: every row (fresh file); default only edited rows and extra tokens.
 * -> { writes: [{ collection, name, type, values: { <mode>|'*': value }, scopes, css, rowKey }], skipped: [{ css, reason }] }
 */
export function planWrites(model, opts = {}) {
  const byCss = rowsByCss(model.rows);
  const writes = [];
  const skipped = [];
  for (const r of model.rows) {
    if (!opts.all && !r.edited) continue;
    if (r.light == null) { skipped.push({ css: r.css, reason: 'нет значения' }); continue; }
    const base = { css: r.css, rowKey: r.key, scopes: scopesOf(r) };
    if (r.kind === 'radius' && !r.extra) { // project radius tokens live in 2.theme like every custom/* token
      writes.push({ ...base, collection: BRAND, name: r.figma, type: 'FLOAT', values: { '*': Number(r.light) } });
      continue;
    }
    const light = r.kind === 'color' ? valueFor(r.light, byCss) : Number(r.light);
    const dark = r.kind === 'color' ? valueFor(r.dark == null ? r.light : r.dark, byCss) : Number(r.dark == null ? r.light : r.dark);
    const bad = [light, dark].find((v) => v && v.error);
    if (bad) { skipped.push({ css: r.css, reason: bad.error }); continue; }
    const type = r.kind === 'color' ? 'COLOR' : 'FLOAT';
    if (r.collection === BRAND) {
      writes.push({ ...base, collection: BRAND, name: r.figma, type, values: { [r.brand]: light } });
      writes.push({ ...base, collection: THEME, name: r.darkFigma, type, values: { light, dark }, scopes: [] });
    } else {
      writes.push({ ...base, collection: THEME, name: r.figma, type, values: { light, dark } });
    }
  }
  return { writes, skipped };
}

/** A scan value (Figma RGBA or number) -> comparable plain value. */
export function plainValue(v) {
  if (v && typeof v === 'object' && 'r' in v) {
    const b = (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0');
    return normHex(`#${b(v.r)}${b(v.g)}${b(v.b)}${v.a === undefined || v.a >= 1 ? '' : b(v.a)}`);
  }
  return v;
}

/**
 * Plan for every brand at once: brand rows of each brand, 2.theme / radius / extra rows once.
 * build(brand) -> model (core/model.js buildModel with the widget state).
 */
export function planAllBrands(build, brands, opts = {}) {
  const writes = [];
  const skipped = [];
  brands.forEach((brand, i) => {
    const model = build(brand);
    if (i > 0) model.rows = model.rows.filter((r) => r.collection === BRAND && r.kind === 'color');
    const plan = planWrites(model, opts);
    writes.push(...plan.writes);
    skipped.push(...plan.skipped);
  });
  return { writes, skipped };
}

const SOURCE = { apply: 'Применить в Figma', component: 'Обновить компонент в файле', build: 'Собрать компонент' };

/**
 * "Changed once -> changed everywhere" in words, for the board and the window.
 * p: { kind, at, dryRun?, variables, variableCount?, components: [{ title, instances, inFile, library, variants?, kept? }], setsUpdated, instances }.
 * -> { title, summary, components: [line], variables: line | null, note }
 */
export function propagationLines(p) {
  if (!p) return null;
  const at = String(p.at || '').slice(0, 16).replace('T', ' ');
  const vars = p.variableCount !== undefined ? p.variableCount : (p.variables || []).length;
  const summary = [
    ...(p.kind === 'apply' ? [`переменных ${vars}`] : []),
    `компонентов ${p.components.length}`,
    ...(p.setsUpdated ? [`обновлено наборов ${p.setsUpdated}`] : []),
    `экземпляров в файле ${p.instances}`,
  ].join(' · ');
  const components = p.components.slice(0, 8).map((x) => {
    const where = x.inFile ? '' : x.library ? ' (из библиотеки)' : ' (компонента нет в файле)';
    const same = x.kept !== undefined ? ` · вариантов ${x.variants}, те же узлы ${x.kept}` : '';
    return `${x.title}: ${x.instances} экз.${where}${same}`;
  });
  if (p.components.length > 8) components.push(`…и ещё ${p.components.length - 8}`);
  const names = p.variables || [];
  return {
    title: `${p.dryRun ? 'Что поменяется' : 'Где поменялось'} — ${SOURCE[p.kind] || p.kind}${at ? `, ${at}` : ''}`,
    summary,
    components,
    variables: names.length ? `Переменные: ${names.slice(0, 6).join(', ')}${vars > 6 ? ` и ещё ${vars - 6}` : ''}` : null,
    note: p.kind === 'apply'
      ? (p.components.length ? 'Компоненты привязаны к этим переменным: они и все их экземпляры уже показывают новые значения.' : 'Ни один контракт компонента не использует эти токены.')
      : 'Главный компонент обновлён на месте: все его экземпляры в файле уже показывают изменения.',
  };
}
