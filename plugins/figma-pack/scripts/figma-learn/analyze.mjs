// analyze: cached REST JSON -> report (structure, archetypes, component usage, token hygiene, dev-readiness, kit gaps).
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { readJson } from './crawl.mjs';
import { screenFrames, parseFrameName, libraryMaps, resolveInstance, walk, DEFAULT_NAME, hexOf, sizeOf } from './walk.mjs';
import { classify, extractBlocks, signature } from './archetypes.mjs';
import { libraryIndex, nearestToken } from './library.mjs';

const pct = (a, b) => (b ? a / b : null);
const round = (x) => (x == null ? null : Math.round(x * 100) / 100);
const inc = (obj, key, by = 1) => { obj[key] = (obj[key] || 0) + by; };

const SPACING = ['itemSpacing', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom'];
const RADIUS = ['cornerRadius', 'topLeftRadius'];
const ROLE = [['body', /^(body|main|тело|основн)/i], ['card', /card|карточк|panel|панель/i], ['form', /form|форм/i]];

/** Walks one screen frame: usage, hygiene, layout, naming. Kit instance internals are skipped. */
function inspect(frame, maps, lib, acc) {
  walk(frame, (n, ctx) => {
    if (n.visible === false) return false;
    if (ctx.inInstance) return false;
    if (n.type === 'INSTANCE') {
      const r = resolveInstance(n, maps);
      const status = r.local ? (acc.library ? 'kit-own' : 'local') : lib.status(r.key);
      const id = r.local ? `local:${r.name}` : r.key || `name:${r.name}`;
      const u = acc.usage[id] || (acc.usage[id] = { key: r.local ? null : r.key, name: r.name, status, count: 0 });
      u.count++;
      inc(acc.byStatus, status);
      if (/sidemenu/i.test(r.name)) acc.layout.nav.push(sizeOf(n).width);
      return false;
    }
    if (ctx.depth > 0) {
      acc.naming.total++;
      if (DEFAULT_NAME.test(n.name)) { acc.naming.defaults++; if (acc.naming.examples.length < 5) acc.naming.examples.push(n.name); }
    }
    if ((n.type === 'FRAME' || n.type === 'GROUP') && ctx.depth > 0) {
      const base = n.name.replace(/\s*\(detached\)\s*$/i, '');
      if (/\(detached\)/i.test(n.name) || lib.isComponentName(base) || maps.names.has(base.toLowerCase())) inc(acc.detached, base);
    }
    const kids = (n.children || []).filter((c) => c.visible !== false).length;
    if ((n.type === 'FRAME' || n.type === 'GROUP') && kids >= 2) {
      acc.layout.containers++;
      if (n.type === 'FRAME' && n.layoutMode && n.layoutMode !== 'NONE') acc.layout.auto++;
      else acc.layout.manual++;
    }
    for (const kind of ['fills', 'strokes']) {
      (n[kind] || []).forEach((p, i) => {
        if (p.visible === false || p.type !== 'SOLID') return;
        acc.paints.total++;
        const bound = p.boundVariables?.color || n.boundVariables?.[kind]?.[i] || n.styles?.[kind === 'fills' ? 'fill' : 'stroke'];
        if (bound) acc.paints.bound++;
        else inc(acc.rawHex, hexOf(p.color));
      });
    }
    if (n.type === 'TEXT') {
      acc.texts.total++;
      const styled = n.styles?.text || n.boundVariables?.fontSize || n.boundVariables?.fontFamily;
      if (styled) acc.texts.styled++;
      else if (acc.texts.examples.length < 5) acc.texts.examples.push(n.characters?.slice(0, 40) || n.name);
    }
    if (n.layoutMode && n.layoutMode !== 'NONE') {
      for (const p of SPACING) if (n[p] > 0) { acc.spacing.total++; if (n.boundVariables?.[p]) acc.spacing.bound++; }
      const role = ROLE.find(([, re]) => re.test(n.name))?.[0];
      if (role) acc.layout.samples.push({ role, padding: [n.paddingTop || 0, n.paddingRight || 0, n.paddingBottom || 0, n.paddingLeft || 0], gap: n.itemSpacing || 0, radius: n.cornerRadius || 0 });
    }
    for (const p of RADIUS) if (n[p] > 0) { acc.radius.total++; if (n.boundVariables?.[p]) acc.radius.bound++; break; }
    return true;
  });
}

const blank = () => ({
  usage: {}, byStatus: {}, detached: {}, rawHex: {},
  paints: { total: 0, bound: 0 }, texts: { total: 0, styled: 0, examples: [] }, spacing: { total: 0, bound: 0 }, radius: { total: 0, bound: 0 },
  naming: { total: 0, defaults: 0, examples: [] }, layout: { containers: 0, auto: 0, manual: 0, nav: [], samples: [] },
});

/** Dev-readiness 0..100 with the parts that explain it. */
export function score(acc, screens) {
  const lib = Object.values(acc.usage).filter((u) => u.status !== 'local').reduce((s, u) => s + u.count, 0);
  const detached = Object.values(acc.detached).reduce((s, n) => s + n, 0);
  const bindTotal = acc.paints.total + acc.texts.total + acc.spacing.total;
  const parts = {
    autoLayout: pct(acc.layout.auto, acc.layout.containers) ?? 1,
    naming: 1 - (pct(acc.naming.defaults, acc.naming.total) ?? 0),
    variables: pct(acc.paints.bound + acc.texts.styled + acc.spacing.bound, bindTotal) ?? 1,
    instances: lib + detached ? lib / (lib + detached) : 0.5,
    readyForDev: pct(screens.filter((s) => s.ready).length, screens.length) ?? 0,
    noDrafts: 1 - (pct(screens.filter((s) => s.draft).length, screens.length) ?? 0),
  };
  const weights = { autoLayout: 25, naming: 15, variables: 25, instances: 15, readyForDev: 10, noDrafts: 10 };
  const total = Math.round(Object.entries(weights).reduce((s, [k, w]) => s + w * parts[k], 0));
  return { total, grade: total >= 80 ? 'A' : total >= 60 ? 'B' : 'C', parts: Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, round(v)])) };
}

/** Analyzes one cached file folder. */
export function analyzeFile(dir, lib) {
  const meta = readJson(join(dir, 'meta.json'), {});
  const file = readJson(join(dir, 'file.json'));
  const nodes = readJson(join(dir, 'nodes.json'), { nodes: {} });
  const maps = libraryMaps(file, nodes);
  maps.names = new Set([...Object.values(maps.components), ...Object.values(maps.componentSets)].map((c) => String(c.name).toLowerCase()));
  const acc = blank();
  acc.library = lib.isLibraryFile?.(meta.key) ?? false;
  const screens = [];
  for (const s of screenFrames(file.document)) {
    const frame = nodes.nodes[s.id]?.document;
    if (!frame) continue;
    const parsed = parseFrameName(s.name);
    const title = `${parsed.flow || ''} ${parsed.screen} ${s.section || ''}`;
    inspect(frame, maps, lib, acc);
    if (acc.library) continue; // component docs and specimens, not product screens
    const { archetype, scores } = classify(frame, maps, title);
    const { blocks, nav, empty } = extractBlocks(frame, maps);
    screens.push({
      id: s.id, name: s.name, page: s.page, section: s.section, viewport: s.viewport, width: s.width, height: s.height,
      ready: s.ready, draft: parsed.draft, conventional: parsed.conventional, flow: parsed.flow, screen: parsed.screen, state: parsed.state,
      archetype, scores, blocks, signature: signature(blocks), nav, empty,
    });
  }
  const pages = (file.document.children || []).map((p) => ({
    name: p.name,
    sections: (p.children || []).filter((n) => n.type === 'SECTION').length,
    screens: screens.filter((s) => s.page === p.name).length,
  }));
  return {
    key: meta.key, kind: acc.library ? 'library' : 'product', name: meta.name || file.name, project: meta.project?.name || null, lastModified: meta.lastModified || file.lastModified,
    url: `https://www.figma.com/design/${meta.key}`, truncated: Boolean(meta.truncated),
    pages, screens, groups: groupScreens(screens), acc, score: score(acc, screens),
  };
}

/** Screens with the same flow + screen name are one screen in several states / widths. */
export function groupScreens(screens) {
  const groups = new Map();
  for (const s of screens) {
    const id = `${s.flow || s.page} / ${s.screen}`;
    const g = groups.get(id) || { id, states: new Set(), viewports: new Set(), archetypes: {}, frames: 0 };
    g.states.add(s.state);
    g.viewports.add(s.viewport);
    if (s.archetype !== 'other') inc(g.archetypes, s.archetype, s.state === 'default' ? 2 : 1);
    g.frames++;
    groups.set(id, g);
  }
  return [...groups.values()].map((g) => ({
    id: g.id, frames: g.frames, states: [...g.states], viewports: [...g.viewports],
    archetype: Object.entries(g.archetypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'other',
  }));
}

function mergeAcc(files) {
  const all = blank();
  for (const f of files) {
    const a = f.acc;
    for (const [id, u] of Object.entries(a.usage)) {
      const t = all.usage[id] || (all.usage[id] = { ...u, count: 0, files: [] });
      t.count += u.count;
      t.files.push(f.name);
    }
    for (const k of ['byStatus', 'detached', 'rawHex']) for (const [x, n] of Object.entries(a[k])) inc(all[k], x, n);
    for (const k of ['paints', 'spacing', 'radius']) for (const x of Object.keys(all[k])) all[k][x] += a[k][x];
    all.texts.total += a.texts.total; all.texts.styled += a.texts.styled;
    all.naming.total += a.naming.total; all.naming.defaults += a.naming.defaults;
    for (const x of ['containers', 'auto', 'manual']) all.layout[x] += a.layout[x];
    all.layout.nav.push(...a.layout.nav);
    all.layout.samples.push(...a.layout.samples.map((s) => ({ ...s, file: f.name })));
  }
  return all;
}

/** Kit backlog: missing/partial library components in use, local components reused, detached kit pieces. */
export function gaps(files, all) {
  const out = [];
  for (const u of Object.values(all.usage)) {
    const files_ = [...new Set(u.files)];
    if (u.status === 'missing' || u.status === 'partial') out.push({ kind: `code-${u.status}`, name: u.name, key: u.key, count: u.count, files: files_, action: 'design-engine components-map backlog: code component for this Figma component' });
    else if (u.status === 'local' && (u.count >= 2 || files_.length >= 2)) out.push({ kind: 'local-reused', name: u.name, key: null, count: u.count, files: files_, action: 'candidate for the kit: designers reuse a local component' });
    else if (u.status === 'unknown') out.push({ kind: 'not-in-catalog', name: u.name, key: u.key, count: u.count, files: files_, action: 'library component not in catalog.json: refresh the catalog or check the library' });
  }
  for (const [name, count] of Object.entries(all.detached)) {
    const where = files.filter((f) => f.acc.detached[name]).map((f) => f.name);
    out.push({ kind: 'detached', name, key: null, count, files: where, action: 'detached kit component: find what the kit could not do and fix the kit or the frame' });
  }
  return out.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** Analyzes every cached file of a team folder. opts: { catalog, map, tokens } (objects or null). */
export function analyze(dir, opts = {}) {
  const lib = libraryIndex(opts);
  const filesDir = join(dir, 'files');
  const keys = existsSync(filesDir) ? readdirSync(filesDir).filter((k) => existsSync(join(filesDir, k, 'nodes.json'))).sort() : [];
  const files = keys.map((k) => analyzeFile(join(filesDir, k), lib));
  const all = mergeAcc(files);
  const screens = files.flatMap((f) => f.screens.map((s) => ({ ...s, file: f.name, fileKey: f.key })));
  const groups = files.flatMap((f) => f.groups.map((g) => ({ ...g, file: f.name })));
  const archetypes = {};
  for (const g of groups) {
    const a = archetypes[g.archetype] || (archetypes[g.archetype] = { screens: 0, frames: 0, files: new Set(), states: {} });
    a.screens++; a.frames += g.frames; a.files.add(g.file);
    for (const st of g.states) inc(a.states, st);
  }
  const rawHex = Object.entries(all.rawHex).sort((a, b) => b[1] - a[1]).map(([hex, count]) => ({ hex, count, token: nearestToken(hex, opts.tokens) }));
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    sources: { catalog: lib.hasCatalog, componentsMap: lib.hasMap, tokens: Boolean(opts.tokens) },
    totals: {
      files: files.length, pages: files.reduce((s, f) => s + f.pages.length, 0), screens: screens.length, screenGroups: groups.length,
      viewports: screens.reduce((o, s) => (inc(o, s.viewport), o), {}),
      score: files.length ? Math.round(files.reduce((s, f) => s + f.score.total, 0) / files.length) : null,
    },
    archetypes: Object.fromEntries(Object.entries(archetypes).map(([k, v]) => [k, { ...v, files: [...v.files] }])),
    usage: {
      byStatus: all.byStatus,
      components: Object.values(all.usage).map((u) => ({ ...u, files: [...new Set(u.files)] })).sort((a, b) => b.count - a.count),
      detached: all.detached,
    },
    hygiene: {
      paints: all.paints, rawHex, texts: { total: all.texts.total, styled: all.texts.styled }, spacing: all.spacing, radius: all.radius,
      naming: { total: all.naming.total, defaults: all.naming.defaults },
      layout: { containers: all.layout.containers, auto: all.layout.auto, manual: all.layout.manual },
    },
    layout: { nav: all.layout.nav, samples: all.layout.samples },
    gaps: gaps(files, all),
    files: files.map(({ acc, groups: g, ...f }) => ({
      ...f, groups: g,
      hygiene: {
        rawHex: Object.keys(acc.rawHex).length, rawPaints: acc.paints.total - acc.paints.bound, paints: acc.paints.total,
        unstyledTexts: acc.texts.total - acc.texts.styled, texts: acc.texts.total, textExamples: acc.texts.examples,
        rawSpacing: acc.spacing.total - acc.spacing.bound, defaultNames: acc.naming.defaults, nameExamples: acc.naming.examples,
        manualContainers: acc.layout.manual, detached: acc.detached, byStatus: acc.byStatus,
      },
    })),
    screens,
  };
}
