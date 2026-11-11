// Import of a pasted shadcn-tokens.json into board edits. Only values of the known names are taken:
// unknown names are reported, never added (the token set is fixed).
import { buildModel, checkTokens, normValue, sameValue, RADIUS } from './model.js';

/**
 * Pasted shadcn/tokens@1 -> board edits relative to the bundled source.
 * -> { edits, changed, ignored: [name], errors }; edits replace the widget's map.
 */
export function importTokens(source, text) {
  let data;
  try { data = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { return { errors: [`Не JSON: ${e.message}`] }; }
  const errors = checkTokens(data);
  if (errors.length) return { errors };
  const edits = {};
  const bad = [];
  for (const r of buildModel(source).rows) {
    const raw = r.name === RADIUS ? (data.radius === undefined ? undefined : { light: data.radius }) : data.colors[r.name];
    if (!raw) continue;
    const light = normValue(r.kind, raw.light);
    const dark = r.kind === 'radius' ? light : normValue(r.kind, raw.dark === undefined ? raw.light : raw.dark);
    if (Number.isNaN(light) || Number.isNaN(dark) || light === undefined) { bad.push(`${r.name}: значение не читается`); continue; }
    if (sameValue(light, r.source.light, r.kind) && sameValue(dark, r.source.dark, r.kind)) continue;
    edits[r.key] = r.kind === 'radius' ? { light } : { light, dark };
  }
  const known = new Set(Object.keys(source.colors));
  const ignored = Object.keys(data.colors).filter((n) => !known.has(n));
  return { edits, changed: Object.keys(edits).length, ignored, errors: bad };
}
