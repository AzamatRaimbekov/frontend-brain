// Mbank token reader for use_figma: dumps variable collections, text styles and effect styles as JSON.
// Read-only (creates and changes nothing). Needs a Full seat and "can edit" on the file (figma-core).
// Run it once per library file, paste the whole file as the `code` of one use_figma call:
//   Foundation      KIT = 'foundation'  -> 2.theme, 1.brand (colours + radius/*), foundation (mobile paddings/radius)
//   Web components  KIT = 'web'         -> spacing/*, rem/*, border-radius/*, font/* text styles, shadow/* effect styles
//   Mobile KIT      KIT = 'mobile'      -> mobile text and effect styles
// Save each result as raw-<kit>.json, then (frontend-pack):
//   node plugins/frontend-pack/scripts/tokens-build.mjs --from raw-foundation.json --from raw-web.json --from raw-mobile.json
// which normalises the dumps into tokens.json (same shape as before) and regenerates registry/mbank/tokens.css.
// From a product file instead of the library: set LIBRARY_COLLECTIONS to read published collections
// (styles of a library cannot be listed from another file; read them in the library file itself).

const KIT = 'foundation';            // 'foundation' | 'web' | 'mobile': labels the styles of this file
const LIBRARY_COLLECTIONS = [];      // e.g. ['2.theme', '1.brand'] to import published collections by name
const MAX_ALIAS_DEPTH = 10;

// ---- helpers ----
const byte = (x) => Math.round(Math.min(1, Math.max(0, x)) * 255).toString(16).padStart(2, '0');
const hex = (c) => `#${byte(c.r)}${byte(c.g)}${byte(c.b)}${c.a === undefined || c.a >= 1 ? '' : byte(c.a)}`;
const isAlias = (v) => v && typeof v === 'object' && v.type === 'VARIABLE_ALIAS';
const plain = (v, type) => (type === 'COLOR' && v && typeof v === 'object' ? hex(v) : v);
const warnings = [];

const collectionCache = new Map();
async function collectionOf(variable) {
  const id = variable.variableCollectionId;
  if (!collectionCache.has(id)) collectionCache.set(id, await figma.variables.getVariableCollectionByIdAsync(id));
  return collectionCache.get(id);
}

// Follows an alias chain. The target is read in the mode with the same name, else in its collection's default mode
// (2.theme light/dark -> primitives; text/brand -> 1.brand default mode "bank").
async function resolve(value, modeName, depth = 0) {
  if (!isAlias(value)) return value;
  if (depth > MAX_ALIAS_DEPTH) throw new Error(`alias chain too deep at ${value.id}`);
  const target = await figma.variables.getVariableByIdAsync(value.id);
  if (!target) { warnings.push(`missing alias target ${value.id}`); return null; }
  const coll = await collectionOf(target);
  const mode = coll.modes.find((m) => m.name === modeName) || coll.modes.find((m) => m.modeId === coll.defaultModeId);
  return resolve(target.valuesByMode[mode.modeId], modeName, depth + 1);
}

async function readCollection(coll, variables, libraryKey) {
  const vars = variables || (await Promise.all(coll.variableIds.map((id) => figma.variables.getVariableByIdAsync(id))));
  const out = { name: coll.name, key: libraryKey || coll.key, modes: coll.modes.map((m) => m.name), variables: [] };
  for (const v of vars.filter(Boolean)) {
    const values = {};
    const alias = {};
    for (const m of coll.modes) {
      const raw = v.valuesByMode[m.modeId];
      alias[m.name] = null;
      if (isAlias(raw)) {
        const target = await figma.variables.getVariableByIdAsync(raw.id);
        alias[m.name] = target ? target.name : null;
      }
      values[m.name] = plain(await resolve(raw, m.name), v.resolvedType);
    }
    out.variables.push({ name: v.name, key: v.key, type: v.resolvedType, values, alias });
  }
  return out;
}

// ---- variables ----
const collections = [];
for (const coll of await figma.variables.getLocalVariableCollectionsAsync()) {
  collections.push(await readCollection(coll));
}
if (LIBRARY_COLLECTIONS.length) {
  const libs = await figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync();
  for (const name of LIBRARY_COLLECTIONS) {
    const lib = libs.find((l) => l.name === name);
    if (!lib) { warnings.push(`library collection "${name}" is not enabled in this file`); continue; }
    const refs = await figma.teamLibrary.getVariablesInLibraryCollectionAsync(lib.key);
    const imported = [];
    for (const ref of refs) imported.push(await figma.variables.importVariableByKeyAsync(ref.key));
    if (!imported.length) continue;
    collections.push(await readCollection(await collectionOf(imported[0]), imported, lib.key));
  }
}

// ---- styles ----
const lineHeightPx = (s) => {
  const lh = s.lineHeight;
  if (!lh || lh.unit === 'AUTO') return null;
  return lh.unit === 'PIXELS' ? lh.value : Math.round((s.fontSize * lh.value) / 100);
};
const textStyles = (await figma.getLocalTextStylesAsync()).map((s) => ({
  name: s.name, key: s.key, family: s.fontName.family, style: s.fontName.style, size: s.fontSize, lineHeight: lineHeightPx(s),
}));
const effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => ({
  name: s.name, key: s.key,
  effects: s.effects.map((e) => ({
    type: e.type, visible: e.visible !== false, x: e.offset ? e.offset.x : 0, y: e.offset ? e.offset.y : 0,
    radius: e.radius, spread: e.spread || 0, color: e.color ? hex(e.color) : null,
  })),
}));

return {
  format: 'mbank-figma-raw/1',
  kit: KIT,
  file: { name: figma.root.name, key: figma.fileKey || null },
  readAt: new Date().toISOString(),
  collections,
  textStyles,
  effectStyles,
  warnings,
};
