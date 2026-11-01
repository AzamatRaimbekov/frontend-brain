// Sandbox side of the widget: reads the file's variables (scan) and writes the plan of
// core/sync.js planWrites (apply). Runs only inside event handlers (never during render).
import { hexToRgb } from '../../builder/core/color.js';
import { THEME, BRAND, BRANDS, MODES, modeName, normHex, sameValue } from '../core/model.js';
import { plainValue } from '../core/sync.js';

const isAlias = (x) => x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS';
const OURS = [THEME, BRAND];
const MODES_OF = { [THEME]: MODES, [BRAND]: BRANDS };

async function loadLocal() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const vars = await figma.variables.getLocalVariablesAsync();
  const colById = new Map(cols.map((c) => [c.id, c]));
  const col = {};
  for (const c of cols) col[c.name.trim()] = c;
  const named = {};
  for (const name of OURS) named[name] = new Map();
  for (const v of vars) {
    const c = colById.get(v.variableCollectionId);
    if (c && named[c.name.trim()]) named[c.name.trim()].set(v.name, v);
  }
  return { cols, vars, colById, col, named };
}

// Follows an alias chain; the target is read in the mode with the same name, else its default mode.
async function resolve(value, mode, depth = 0) {
  if (!isAlias(value)) return value;
  if (depth > 10) return null;
  const target = await figma.variables.getVariableByIdAsync(value.id);
  if (!target) return null;
  const c = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
  const m = (c && (c.modes.find((x) => modeName(x.name) === modeName(mode)) || c.modes.find((x) => x.modeId === c.defaultModeId))) || null;
  return m ? resolve(target.valuesByMode[m.modeId], mode, depth + 1) : null;
}

/** Snapshot of 2.theme and 1.brand: { scannedAt, vars: { '<col>/<name>': { <mode>: value } }, library, collections }. */
export async function scanFile() {
  const ix = await loadLocal();
  const vars = {};
  for (const name of OURS) {
    const c = ix.col[name];
    if (!c) continue;
    for (const [vName, v] of ix.named[name]) {
      const entry = {};
      for (const m of c.modes) entry[modeName(m.name)] = plainValue(await resolve(v.valuesByMode[m.modeId], m.name));
      vars[`${name}/${vName}`] = entry;
    }
  }
  const library = {};
  const missingLocal = OURS.filter((n) => !ix.col[n]);
  if (missingLocal.length && figma.teamLibrary) {
    try {
      const libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      for (const lib of libs.filter((l) => missingLocal.includes(String(l.name).trim()))) {
        for (const ref of await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lib.key)) library[`${lib.name.trim()}/${ref.name}`] = true;
      }
    } catch (e) { /* no teamlibrary access: statuses stay "missing" */ }
  }
  return {
    scannedAt: new Date().toISOString(),
    collections: Object.fromEntries(OURS.map((n) => [n, !!ix.col[n]])),
    count: Object.keys(vars).length,
    libraryCount: Object.keys(library).length,
    vars,
    library,
  };
}

// Local primitives (any collection other than ours) by exact colour, so a write can stay an alias.
async function primitiveIndex(ix) {
  const out = new Map();
  for (const v of ix.vars) {
    const c = ix.colById.get(v.variableCollectionId);
    if (!c || OURS.includes(c.name.trim()) || v.resolvedType !== 'COLOR') continue;
    const val = v.valuesByMode[c.defaultModeId];
    if (isAlias(val)) continue;
    const hex = plainValue(val);
    if (hex && !out.has(hex)) out.set(hex, v);
  }
  return out;
}

// A plan with a mode limit (free/Starter drafts: 1 mode) refuses every addMode the same way: one line in the
// report per collection, the rest of that collection's modes are skipped quietly.
function modeFailed(report, collection, mode, e) {
  report.modesFailed = report.modesFailed || {};
  const list = report.modesFailed[collection] || (report.modesFailed[collection] = []);
  if (list.includes(mode)) return;
  list.push(mode);
  const limit = /Limited to (\d+) modes?/i.exec(e.message || '');
  if (list.length > 1) return;
  report.errors.push(limit
    ? `${collection}: тариф файла разрешает ${limit[1]} режим(а) переменных — записан только «${collection === THEME ? 'light' : 'первый бренд'}». Нужен файл в команде Professional+ (или Foundation), чтобы были dark и все бренды.`
    : `${collection}: режим «${mode}» не добавлен (${e.message})`);
}

function ensureCollection(ix, name, report, dryRun) {
  if (ix.col[name]) return ix.col[name];
  if (report.collectionsCreated.includes(name)) return null; // dry run: already counted
  report.collectionsCreated.push(name);
  if (dryRun) return null;
  const c = figma.variables.createVariableCollection(name);
  const modes = MODES_OF[name];
  c.renameMode(c.modes[0].modeId, modes[0]);
  for (const m of modes.slice(1)) {
    try { c.addMode(m); } catch (e) { modeFailed(report, name, m, e); }
  }
  ix.col[name] = c;
  return c;
}

function modeIdsFor(c, key, report, dryRun) {
  if (!c) return [key];
  if (key === '*') return c.modes.map((m) => m.modeId);
  const hit = c.modes.find((m) => modeName(m.name) === modeName(key));
  if (hit) return [hit.modeId];
  if (dryRun) {
    if (!report.modesAdded.includes(`${c.name}/${key}`)) report.modesAdded.push(`${c.name}/${key}`);
    return [];
  }
  if (report.modesFailed && report.modesFailed[c.name]) { modeFailed(report, c.name, key, {}); return []; }
  try { const id = c.addMode(key); report.modesAdded.push(`${c.name}/${key}`); return [id]; } catch (e) { modeFailed(report, c.name, key, e); return []; }
}

const rgba = (hex) => { const { r, g, b, a } = hexToRgb(hex); return { r, g, b, a }; };

/**
 * The tokens live in Foundation. A file that only connects Foundation as a library must not get local copies of
 * 2.theme / 1.brand: they would shadow the library and drift. Returns the reason to refuse, or null.
 */
export async function libraryGuard(ix) {
  if (OURS.every((n) => ix.col[n])) return null; // Foundation itself or its branch: collections are local
  if (!figma.teamLibrary) return null;
  let libs = [];
  try { libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync(); } catch (e) { return null; }
  const connected = libs.filter((l) => OURS.includes(String(l.name).trim()));
  if (!connected.length) return null;
  const from = [...new Set(connected.map((l) => l.libraryName).filter(Boolean))].join(', ') || 'Foundation';
  return `Файл подключает токены из библиотеки «${from}». Применять нужно в самом файле Foundation или в его ветке, иначе здесь появятся локальные копии коллекций ${OURS.join(' и ')}. Проверка (пробный прогон) доступна.`;
}

/**
 * Executes planWrites().writes. Every created variable, raw hex and replaced alias is in the report;
 * nothing is written silently. opts.dryRun: same report, no writes.
 */
export async function applyWrites(writes, opts = {}) {
  if (figma.editorType && figma.editorType !== 'figma') throw new Error('Применить можно только в файле Figma Design (не FigJam)');
  const dryRun = !!opts.dryRun;
  const ix = await loadLocal();
  if (!dryRun) {
    const reason = await libraryGuard(ix);
    if (reason) throw new Error(reason);
  }
  const prims = await primitiveIndex(ix);
  // changed: '<collection>/<name>' of every variable this run creates or changes (the propagation report reads it).
  const report = { dryRun, collectionsCreated: [], modesAdded: [], created: [], updated: [], aliased: [], raw: [], unchanged: 0, errors: [], changed: [] };
  for (const w of writes) {
    const key = `${w.collection}/${w.name}`;
    const touched = () => { if (!report.changed.includes(key)) report.changed.push(key); };
    const c = ensureCollection(ix, w.collection, report, dryRun);
    let v = ix.named[w.collection].get(w.name);
    if (v && v.resolvedType !== w.type) { report.errors.push(`${w.collection}/${w.name}: тип ${v.resolvedType}, а нужен ${w.type}`); continue; }
    const fresh = !v;
    if (fresh) {
      report.created.push(key);
      touched();
      if (!dryRun) {
        v = figma.variables.createVariable(w.name, c, w.type);
        v.scopes = w.scopes && w.scopes.length ? w.scopes : [];
        if (w.css && (w.collection === THEME || /^custom\//.test(w.name)) && !/^brand\//.test(w.name)) v.setVariableCodeSyntax('WEB', `var(--${w.css})`);
        ix.named[w.collection].set(w.name, v);
        // Modes the plan does not name (other brands) start from the same value, not Figma's default.
        const first = Object.values(w.values)[0];
        if (!(first && first.aliasOf)) for (const m of c.modes) v.setValueForMode(m.modeId, w.type === 'COLOR' ? rgba(first) : Number(first));
      }
    }
    for (const [modeKey, wanted] of Object.entries(w.values)) {
      for (const modeId of modeIdsFor(c, modeKey, report, dryRun)) {
        const label = `${w.collection}/${w.name} (${modeKey === '*' ? 'все режимы' : modeKey})`;
        const current = v && !fresh ? v.valuesByMode[modeId] : undefined;
        if (wanted && wanted.aliasOf) {
          const target = ix.named[wanted.aliasOf.collection] && ix.named[wanted.aliasOf.collection].get(wanted.aliasOf.name);
          if (!target && !dryRun) { report.errors.push(`${label}: нет переменной ${wanted.aliasOf.collection}/${wanted.aliasOf.name} для ссылки`); continue; }
          if (isAlias(current) && target && current.id === target.id) { report.unchanged++; continue; }
          report.aliased.push(`${label} → ${wanted.aliasOf.name}`);
          touched();
          if (!dryRun) v.setValueForMode(modeId, figma.variables.createVariableAlias(target));
          continue;
        }
        const now = current === undefined ? undefined : plainValue(await resolve(current, modeKey));
        if (!fresh && current !== undefined && sameValue(now, w.type === 'COLOR' ? normHex(wanted) : wanted)) { report.unchanged++; continue; }
        const before = isAlias(current) ? 'ссылка' : now;
        touched();
        if (w.type === 'COLOR') {
          const prim = prims.get(normHex(wanted));
          if (prim) {
            report.aliased.push(`${label} → ${prim.name}`);
            if (!dryRun) v.setValueForMode(modeId, figma.variables.createVariableAlias(prim));
          } else {
            report.raw.push(`${label}: ${normHex(wanted)}${before !== undefined ? ` (было ${before})` : ''}`);
            if (!dryRun) v.setValueForMode(modeId, rgba(wanted));
          }
        } else if (!dryRun) v.setValueForMode(modeId, Number(wanted));
        if (!fresh && current !== undefined) report.updated.push(`${label}: ${before} → ${wanted}`);
      }
    }
  }
  return report;
}

/** One line for the board: what the last apply did. */
export function reportLine(r) {
  if (!r) return '';
  const parts = [`создано ${r.created.length}`, `изменено ${r.updated.length}`, `ссылок ${r.aliased.length}`, `hex без примитива ${r.raw.length}`, `без изменений ${r.unchanged}`];
  if (r.collectionsCreated.length) parts.push(`новые коллекции: ${r.collectionsCreated.join(', ')}`);
  if (r.errors.length) parts.push(`ошибок ${r.errors.length}`);
  return `${r.dryRun ? 'Проверка' : 'Применено'}: ${parts.join(' · ')}`;
}
