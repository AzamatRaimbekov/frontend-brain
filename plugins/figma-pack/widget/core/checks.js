// WCAG AA contrast of the shadcn text/fill pairs in both modes: <name>-foreground on <name>,
// foreground on background, muted-foreground on background (and muted, large-text minimum).
import { parseColor, composite, contrastRatio } from './oklch.js';
import { rowsByName, MODES } from './model.js';

export const MIN_TEXT = 4.5;
export const MIN_SECONDARY = 3;

/** [fill, minimum] pairs the text token `name` is read on. */
export function pairsFor(name, byName) {
  if (name === 'foreground') return [['background', MIN_TEXT]];
  if (name === 'muted-foreground') return [['background', MIN_TEXT], ['muted', MIN_SECONDARY]];
  const m = /^(.+)-foreground$/.exec(name);
  return m && byName.has(m[1]) ? [[m[1], MIN_TEXT]] : [];
}

/** Every pair of the model in both modes: [{ fg, bg, mode, ratio, min, ok }]. Translucent colours sit on background. */
export function contrastIssues(rows) {
  const byName = rowsByName(rows);
  const out = [];
  for (const r of rows) {
    if (r.kind !== 'color') continue;
    for (const [bgName, min] of pairsFor(r.name, byName)) {
      for (const mode of MODES) {
        const page = parseColor(byName.get('background') && byName.get('background')[mode]) || { r: 1, g: 1, b: 1, a: 1 };
        const bgRaw = parseColor(byName.get(bgName)[mode]);
        const fgRaw = parseColor(r[mode]);
        let ratio = null;
        if (bgRaw && fgRaw) {
          const bg = composite(bgRaw, page);
          ratio = Math.round(contrastRatio(composite(fgRaw, bg), bg) * 100) / 100;
        }
        out.push({ fg: r.name, bg: bgName, mode, ratio, min, ok: ratio !== null && ratio >= min });
      }
    }
  }
  return out;
}
