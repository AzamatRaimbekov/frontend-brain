// Safe writes: a file is replaced only if it is still as generated (marker hash), still the untouched
// template file, or --force is given. The template's demo pages are removed only while untouched.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { markerState, withMarker } from './util.mjs';

/** Demo of templates/mbank-crm that the spec replaces (pipeline + application pages and their data). */
export const DEMO = ['src/pages/pipeline', 'src/pages/application', 'src/features/applications', 'src/mocks/data/cards.ts', 'src/mocks/data/details.ts'];

function isTemplateCopy(text, rel, { templateDir, toPackage }) {
  const p = join(templateDir, rel);
  if (!existsSync(p)) return false;
  const original = readFileSync(p, 'utf8');
  return text === original || text === toPackage(original);
}

/** Decides the action per file: create | update | unchanged | overwrite | skip. Pure (reads only). */
export function planWrites(project, files, opts) {
  return files.map(({ path, content }) => {
    const full = join(project, path);
    const next = withMarker(path, content);
    if (!existsSync(full)) return { path, action: 'create', content: next };
    const current = readFileSync(full, 'utf8');
    if (current === next) return { path, action: 'unchanged' };
    const state = markerState(current);
    if (state === 'generated') return { path, action: 'update', content: next };
    if (isTemplateCopy(current, path, opts)) return { path, action: 'update', content: next, note: 'template file' };
    if (opts.force) return { path, action: 'overwrite', content: next, note: state === 'edited' ? 'edited after generation' : 'written by hand' };
    return { path, action: 'skip', note: state === 'edited' ? 'edited after generation' : 'written by hand' };
  });
}

function walk(full) {
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [full];
  return readdirSync(full).flatMap((name) => walk(join(full, name)));
}

/** Untouched demo files go; edited ones stay with a warning (they may not compile without the demo). */
export function planDemoRemoval(project, keep, opts) {
  return DEMO.flatMap((rel) => walk(join(project, rel)))
    .map((full) => relative(project, full).split('\\').join('/'))
    .filter((path) => !keep.has(path))
    .map((path) => (isTemplateCopy(readFileSync(join(project, path), 'utf8'), path, opts)
      ? { path, action: 'delete' }
      : { path, action: 'keep', note: 'template demo file changed by hand; delete it or route it yourself' }));
}

export function applyPlan(project, steps) {
  for (const step of steps) {
    const full = join(project, step.path);
    if (['create', 'update', 'overwrite'].includes(step.action)) {
      mkdirSync(dirname(full), { recursive: true });
      writeFileSync(full, step.content);
    } else if (step.action === 'delete') rmSync(full, { force: true });
  }
  // Drop demo folders left empty.
  for (const rel of DEMO) {
    const full = join(project, rel);
    const empty = (dir) => existsSync(dir) && statSync(dir).isDirectory() && readdirSync(dir).every((n) => empty(join(dir, n)));
    if (empty(full)) rmSync(full, { recursive: true, force: true });
  }
}
