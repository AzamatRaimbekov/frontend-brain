// Sandbox side of the widget: reads the `shadcn` variable collection (scan) and writes the plan of
// core/sync.js planWrites (apply). Runs only inside event handlers (never during render).
import { COLLECTION, MODES, FIGMA_MODES, modeName } from '../core/model.js';
import { plainValue } from '../core/sync.js';

const isAlias = (x) => x && typeof x === 'object' && x.type === 'VARIABLE_ALIAS';

/** The `shadcn` collection of the file and its variables by name. */
export async function loadShadcn() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const col = cols.find((c) => c.name.trim() === COLLECTION) || null;
  const named = new Map();
  if (col) {
    for (const v of await figma.variables.getLocalVariablesAsync()) if (v.variableCollectionId === col.id) named.set(v.name, v);
  }
  return { col, named };
}

/** Mode id of 'light' / 'dark' in a collection: by name (Light, light…); light falls back to the first mode. */
export function modeIdOf(col, mode) {
  const hit = col.modes.find((m) => modeName(m.name) === mode);
  if (hit) return hit.modeId;
  return mode === 'light' ? col.modes[0].modeId : null;
}

// Follows an alias chain; the target is read in the mode with the same name, else its default mode.
export async function resolve(value, mode, depth = 0) {
  if (!isAlias(value)) return value;
  if (depth > 10) return null;
  const target = await figma.variables.getVariableByIdAsync(value.id);
  if (!target) return null;
  const c = await figma.variables.getVariableCollectionByIdAsync(target.variableCollectionId);
  const m = (c && (c.modes.find((x) => modeName(x.name) === mode) || c.modes.find((x) => x.modeId === c.defaultModeId))) || null;
  return m ? resolve(target.valuesByMode[m.modeId], mode, depth + 1) : null;
}

/** Snapshot of `shadcn`: { scannedAt, exists, count, vars: { <name>: { light, dark } }, library: { <name>: true } }. */
export async function scanFile() {
  const ix = await loadShadcn();
  const vars = {};
  if (ix.col) {
    for (const [name, v] of ix.named) {
      const entry = {};
      for (const mode of MODES) {
        const id = modeIdOf(ix.col, mode) || modeIdOf(ix.col, 'light');
        entry[mode] = plainValue(await resolve(v.valuesByMode[id], mode));
      }
      vars[name] = entry;
    }
  }
  const library = {};
  if (!ix.col && figma.teamLibrary) {
    try {
      const libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
      for (const lib of libs.filter((l) => String(l.name).trim() === COLLECTION)) {
        for (const ref of await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lib.key)) library[ref.name] = true;
      }
    } catch (e) { /* no teamlibrary access: statuses stay "missing" */ }
  }
  return { scannedAt: new Date().toISOString(), exists: !!ix.col, count: Object.keys(vars).length, libraryCount: Object.keys(library).length, vars, library };
}

// A plan with a mode limit (free/Starter drafts: 1 mode) refuses addMode: one line in the report.
function modeFailed(report, e) {
  if (report.modeLimited) return;
  report.modeLimited = true;
  const limit = /Limited to (\d+) modes?/i.exec((e && e.message) || '');
  report.errors.push(limit
    ? `${COLLECTION}: тариф файла разрешает ${limit[1]} режим(а) переменных — записан только Light. Нужен файл в команде Professional+, чтобы был Dark.`
    : `${COLLECTION}: режим Dark не добавлен (${e && e.message})`);
}

function ensureCollection(ix, report, dryRun) {
  if (ix.col) {
    if (!modeIdOf(ix.col, 'dark') && !dryRun) {
      try { ix.col.addMode(FIGMA_MODES.dark); report.modesAdded.push(FIGMA_MODES.dark); } catch (e) { modeFailed(report, e); }
    } else if (!modeIdOf(ix.col, 'dark')) report.modesAdded.push(FIGMA_MODES.dark);
    return ix.col;
  }
  report.collectionCreated = true;
  if (dryRun) return null;
  const c = figma.variables.createVariableCollection(COLLECTION);
  c.renameMode(c.modes[0].modeId, FIGMA_MODES.light);
  try { c.addMode(FIGMA_MODES.dark); } catch (e) { modeFailed(report, e); }
  ix.col = c;
  return c;
}

/**
 * A file that only connects a library with the `shadcn` collection must not get a local copy: it would
 * shadow the library and drift. Returns the reason to refuse, or null.
 */
export async function libraryGuard(ix) {
  if (ix.col || !figma.teamLibrary) return null;
  let libs = [];
  try { libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync(); } catch (e) { return null; }
  const connected = libs.filter((l) => String(l.name).trim() === COLLECTION);
  if (!connected.length) return null;
  const from = [...new Set(connected.map((l) => l.libraryName).filter(Boolean))].join(', ') || 'библиотека';
  return `Файл подключает коллекцию ${COLLECTION} из библиотеки «${from}». Применять нужно в файле библиотеки, иначе здесь появится локальная копия. Проверка (пробный прогон) доступна.`;
}

const show = (v) => (v && typeof v === 'object' ? plainValue(v) : v);

/**
 * Executes planWrites().writes into `shadcn`. Every created variable and changed value is in the report;
 * nothing is written silently, nothing is deleted. opts.dryRun: same report, no writes.
 */
export async function applyWrites(writes, opts = {}) {
  if (figma.editorType && figma.editorType !== 'figma') throw new Error('Применить можно только в файле Figma Design (не FigJam)');
  const dryRun = !!opts.dryRun;
  const ix = await loadShadcn();
  if (!dryRun) {
    const reason = await libraryGuard(ix);
    if (reason) throw new Error(reason);
  }
  const report = { dryRun, collectionCreated: false, modesAdded: [], created: [], updated: [], unchanged: 0, errors: [], changed: [] };
  const col = ensureCollection(ix, report, dryRun);
  for (const w of writes) {
    let v = ix.named.get(w.name);
    if (v && v.resolvedType !== w.type) { report.errors.push(`${w.name}: тип ${v.resolvedType}, а нужен ${w.type}`); continue; }
    const fresh = !v;
    if (fresh) {
      report.created.push(w.name);
      if (!dryRun) {
        v = figma.variables.createVariable(w.name, col, w.type);
        ix.named.set(w.name, v);
      }
    }
    if (v && !dryRun) {
      v.scopes = w.scopes || [];
      if (w.codeSyntax) v.setVariableCodeSyntax('WEB', w.codeSyntax);
    }
    let touched = fresh;
    for (const mode of MODES) {
      const modeId = col ? modeIdOf(col, mode) : mode;
      if (!modeId) continue; // no Dark mode (plan limit): reported once
      const wanted = w.values[mode];
      const current = v && !fresh ? v.valuesByMode[modeId] : undefined;
      const now = current === undefined ? undefined : plainValue(await resolve(current, mode));
      if (!fresh && current !== undefined && !isAlias(current) && now === show(wanted)) { report.unchanged++; continue; }
      touched = true;
      if (!fresh) report.updated.push(`${w.name} (${FIGMA_MODES[mode]}): ${isAlias(current) ? 'ссылка' : now === undefined ? '—' : now} → ${show(wanted)}`);
      if (!dryRun) v.setValueForMode(modeId, wanted);
    }
    if (touched) report.changed.push(w.name);
  }
  return report;
}

/** One line for the board: what the last apply did. */
export function reportLine(r) {
  if (!r) return '';
  const parts = [`создано ${r.created.length}`, `изменено значений ${r.updated.length}`, `без изменений ${r.unchanged}`];
  if (r.collectionCreated) parts.push(`новая коллекция ${COLLECTION}`);
  if (r.errors.length) parts.push(`ошибок ${r.errors.length}`);
  return `${r.dryRun ? 'Проверка' : 'Применено'}: ${parts.join(' · ')}`;
}
