// Project token names: custom/<project>/<role>, kebab-case, mapped 1:1 to CSS.
export const kebab = (s) => String(s).trim().toLowerCase()
  .replace(/[^a-z0-9а-яё]+/gi, '-').replace(/^-+|-+$/g, '');

export function customName(project, role) {
  const p = kebab(project);
  let r = kebab(role);
  if (r.startsWith(`${p}-`)) r = r.slice(p.length + 1);
  if (!/^[a-z]/.test(p) || !/^[a-z0-9]/.test(r)) throw new Error(`Bad token name: project "${project}", role "${role}" (latin, kebab-case)`);
  return `custom/${p}/${r}`;
}

// custom/mmarket/badge-bg-orange -> --mmarket-badge-bg-orange; shadcn names stay as is.
export function cssVar(name) {
  const parts = name.split('/');
  return parts[0] === 'custom' ? `--${parts.slice(1).join('-')}` : `--${parts[parts.length - 1]}`;
}

// Legacy kit names like "custom/mmarket/mmarket badge bg slate" -> custom/mmarket/badge-bg-slate.
export function fixLegacyName(name) {
  const parts = name.split('/');
  if (parts[0] !== 'custom' || parts.length < 3) return name;
  try { return customName(parts[1], parts.slice(2).join('-')); } catch { return name; }
}
