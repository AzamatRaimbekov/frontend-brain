// templates: report -> one spec@1 template per frequent archetype (builder/templates/<archetype>.spec.json).
// Real structure wins (most common block signature among desktop frames); the shipped example fills the rest.
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSpec, STATES, VIEWPORTS } from '../../builder/core/spec.js';
import { ARCHETYPES, ARCHETYPE_LABELS } from './archetypes.mjs';

export const TEMPLATES_DIR = fileURLToPath(new URL('../../builder/templates', import.meta.url));
export const EXAMPLE_SPECS = [fileURLToPath(new URL('../../builder/examples/credit-crm.spec.json', import.meta.url))];

const has = (blocks, type) => blocks.some((b) => b.type === type || (b.type === 'split' && b.columns.some((c) => has(c, type))));

/** Archetype of a hand-written spec screen, judged by its blocks. */
export function archetypeOfSpecScreen(s) {
  const b = s.blocks || [];
  if (has(b, 'login')) return 'login';
  if (has(b, 'kanban')) return 'board';
  // KPIs next to charts make an overview even when a short table sits below them.
  if (has(b, 'stats') && ['chart', 'funnel', 'meters', 'breakdown'].some((t) => has(b, t))) return 'dashboard';
  if (has(b, 'profile')) return 'record';
  if (has(b, 'table')) return 'list';
  if (has(b, 'form')) return has(b, 'stepper') ? 'wizard' : 'form';
  if (['stepper', 'details', 'timeline', 'score', 'decision'].some((t) => has(b, t))) return 'record';
  if (has(b, 'stats') || has(b, 'chart')) return 'dashboard';
  return 'other';
}

// Drops blocks the validator would reject or that carry nothing, and state-only blocks.
function clean(blocks) {
  const ok = (b) => {
    if (b.type === 'empty') return false;
    if (b.type === 'split') { b.columns = b.columns.map(clean).filter((c) => c.length); return b.columns.length >= 2; }
    const list = { tabs: 'items', stepper: 'steps', kanban: 'columns', stats: 'items', form: 'fields', details: 'items', cards: 'items', table: 'columns' }[b.type];
    return !list || (Array.isArray(b[list]) && b[list].length > 0);
  };
  return blocks.map((b) => structuredClone(b)).filter(ok);
}

const order = (list, ref) => ref.filter((x) => list.includes(x));

function fromReal(archetype, report) {
  const all = report.screens.filter((s) => s.archetype === archetype && s.blocks.length);
  if (!all.length) return null;
  const desktop = all.filter((s) => s.viewport === 'desktop');
  const pool = (desktop.length ? desktop : all).filter((s) => clean(s.blocks).length);
  if (!pool.length) return null;
  const bySig = new Map();
  for (const s of pool) bySig.set(s.signature, [...(bySig.get(s.signature) || []), s]);
  const [signature, same] = [...bySig.entries()].sort((a, b) => b[1].length - a[1].length || b[0].length - a[0].length)[0];
  const rep = same.find((s) => s.state === 'default') || same[0];
  const group = all.filter((s) => s.file === rep.file && s.screen === rep.screen && s.flow === rep.flow);
  const groups = report.files.flatMap((f) => f.groups.filter((g) => g.archetype === archetype));
  const states = order([...new Set(groups.flatMap((g) => g.states))], STATES);
  const viewports = order([...new Set(all.map((s) => s.viewport))], Object.keys(VIEWPORTS));
  const empty = group.find((s) => s.empty?.title)?.empty || all.find((s) => s.empty?.title)?.empty || null;
  return {
    title: rep.screen, nav: rep.nav, states, viewports, empty, blocks: clean(rep.blocks),
    evidence: { screens: groups.length, frames: all.length, files: [...new Set(all.map((s) => s.file))], signature, sameStructure: same.length },
  };
}

function fromExample(archetype, examples) {
  for (const { name, spec } of examples) {
    const s = (spec.screens || []).find((x) => archetypeOfSpecScreen(x) === archetype);
    if (!s) continue;
    const navItem = (spec.nav || []).find((n) => n.id === s.nav);
    return {
      title: s.title, nav: spec.nav?.map((n) => n.label) || null, navLabel: navItem?.label, states: s.states || ['default'],
      viewports: s.viewports || spec.viewports || ['desktop'], empty: s.empty || null, blocks: clean(s.blocks), example: name,
    };
  }
  return null;
}

const slug = (s, i) => `n${i + 1}`;

function toSpec(archetype, t, example, source = 'figma-learn') {
  const nav = (t.nav || []).slice(0, 7).map((label, i) => ({ id: slug(label, i), label }));
  const near = [t.title, ...t.blocks.filter((b) => b.type === 'header').map((b) => b.title)].join(' ').toLowerCase();
  const navId = (nav.find((n) => n.label === t.navLabel) || nav.find((n) => near.includes(n.label.toLowerCase().slice(0, 5))) || nav[0])?.id;
  let blocks = t.blocks;
  if (archetype === 'login' && !blocks.some((b) => b.type === 'login')) blocks = [{ type: 'login', title: t.title }];
  if (!blocks.length) return null;
  const viewports = t.viewports.length ? t.viewports : ['desktop'];
  const screen = {
    id: archetype, title: t.title, page: ARCHETYPE_LABELS[archetype],
    ...(nav.length && archetype !== 'login' ? { nav: navId } : { shell: 'plain' }),
    states: t.states.length ? t.states : ['default'],
    ...(t.empty || example?.empty ? { empty: Object.fromEntries(Object.entries(t.empty || example.empty).filter(([, v]) => v)) } : {}),
    blocks,
  };
  return {
    $schema: 'ds-builder/spec@1',
    project: `Шаблон: ${ARCHETYPE_LABELS[archetype]}`,
    platform: viewports.every((v) => v === 'mobile') ? 'mobile' : 'web',
    viewports,
    template: {
      archetype, label: ARCHETYPE_LABELS[archetype], source,
      derivedFrom: { ...(t.evidence || { screens: 0, frames: 0, files: [] }), example: t.example || (example ? example.example : null) },
      updated: new Date().toISOString().slice(0, 10),
    },
    ...(nav.length && archetype !== 'login' ? { nav } : {}),
    screens: [screen],
  };
}

export function loadExamples(paths = EXAMPLE_SPECS) {
  return paths.filter((p) => existsSync(p)).map((p) => ({ name: p.split('/').pop().replace('.spec.json', ''), spec: JSON.parse(readFileSync(p, 'utf8')) }));
}

/** report + examples -> { templates: { archetype: spec }, skipped: [{archetype, reason}] }. min = screens needed from real files. */
export function buildTemplates(report, { examples = loadExamples(), min = 1, source = 'figma-learn' } = {}) {
  const templates = {};
  const skipped = [];
  for (const a of ARCHETYPES) {
    const real = report ? fromReal(a, report) : null;
    const example = fromExample(a, examples);
    const chosen = real && real.evidence.screens >= min ? real : example;
    if (!chosen) { skipped.push({ archetype: a, reason: 'no screens in files or examples' }); continue; }
    const spec = toSpec(a, chosen, chosen === real ? example : null, source);
    if (!spec) { skipped.push({ archetype: a, reason: 'no blocks recognised' }); continue; }
    const errors = validateSpec(spec);
    if (errors.length) { skipped.push({ archetype: a, reason: `invalid spec: ${errors.join('; ')}` }); continue; }
    templates[a] = spec;
  }
  return { templates, skipped };
}

export function writeTemplates(templates, outDir = TEMPLATES_DIR) {
  mkdirSync(outDir, { recursive: true });
  return Object.entries(templates).map(([a, spec]) => {
    const file = join(outDir, `${a}.spec.json`);
    writeFileSync(file, JSON.stringify(spec, null, 2) + '\n');
    return file;
  });
}
