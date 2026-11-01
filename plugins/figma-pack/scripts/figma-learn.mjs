#!/usr/bin/env node
// figma-learn: study the team's Figma files and turn them into templates, patterns and knowledge drafts.
// Token: env FIGMA_ACCESS_TOKEN only (never an argument, never printed). Cache: ~/.cache/figma-learn/<team>/ ($FIGMA_LEARN_CACHE).
//
//   node figma-learn.mjs crawl --team <id|url> [--project <id|name>] [--since YYYY-MM-DD] [--force] [--max-frames 80]
//   node figma-learn.mjs crawl --file <key|url> [--team <id>]          one file, view access is enough
//   node figma-learn.mjs analyze   [--team <id> | --dir <cache dir>] [--map <components-map.json>]   -> report.json, report.md
//   node figma-learn.mjs templates [--team <id> | --dir ...] [--out <dir>] [--min 1] [--dry-run] [--source <label>] -> builder/templates/
//   node figma-learn.mjs learn     [--team <id> | --dir ...] [--out <dir>] [--author <login>]      -> knowledge drafts + learned-patterns.md
//   node figma-learn.mjs all --team <id> [...]                           crawl + analyze + templates (dry run) + learn
import { join } from 'node:path';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createClient, tokenFromEnv, parseFileKey, parseTeamId } from './figma-learn/api.mjs';
import { crawlTeam, crawlFile, cacheRoot, teamDir, readJson, SINGLE_FILES } from './figma-learn/crawl.mjs';
import { analyze } from './figma-learn/analyze.mjs';
import { renderReport } from './figma-learn/report-md.mjs';
import { buildTemplates, writeTemplates, TEMPLATES_DIR } from './figma-learn/templates.mjs';
import { knowledgeDrafts, learnedPatterns, writeLearn } from './figma-learn/learn.mjs';
import { loadCatalog, loadTokens, findComponentsMap } from './figma-learn/library.mjs';

const FLAGS = new Set(['force', 'dry-run', 'json']);

export function parseArgs(argv) {
  const [command, ...rest] = argv;
  const opts = { command };
  for (let i = 0; i < rest.length; i++) {
    const name = rest[i].replace(/^--/, '');
    if (!rest[i].startsWith('--')) throw new Error(`unexpected argument: ${rest[i]}`);
    if (name === 'token') throw new Error('the token is read from env FIGMA_ACCESS_TOKEN only, never from arguments');
    opts[name] = FLAGS.has(name) ? true : rest[++i];
  }
  return opts;
}

const dirOf = (o, env) => o.dir || teamDir(cacheRoot(env), o.team ? parseTeamId(o.team) : SINGLE_FILES);

function needReport(dir) {
  const report = readJson(join(dir, 'report.json'));
  if (!report) throw new Error(`no report.json in ${dir}: run "analyze" first`);
  return report;
}

export async function run(argv, { env = process.env, fetch = globalThis.fetch, sleep, log = console.log } = {}) {
  const o = parseArgs(argv);
  const say = (s) => log(s);
  if (o.command === 'crawl') {
    const client = createClient({ token: tokenFromEnv(env), fetch, sleep, log: say });
    const common = { root: cacheRoot(env), force: Boolean(o.force), maxFrames: Number(o['max-frames'] || 80), log: say };
    const team = o.team ? parseTeamId(o.team) : null;
    let r;
    if (o.file) r = await crawlFile({ client, key: parseFileKey(o.file), team, ...common });
    else if (team) r = await crawlTeam({ client, team, project: o.project || null, since: o.since || null, concurrency: Number(o.concurrency || 2), ...common });
    else throw new Error('crawl needs --team <id> or --file <key|url>');
    say(`cache: ${r.dir}`);
    say(`fetched ${r.fetched.length}, skipped ${r.skipped.length}, failed ${r.failed.length}; API calls ${client.calls()}`);
    for (const f of r.failed) say(`  failed ${f.name}: ${f.error}`);
    return r;
  }
  const dir = dirOf(o, env);
  if (o.command === 'analyze') {
    if (!existsSync(join(dir, 'files'))) throw new Error(`no cached files in ${dir}: run "crawl" first`);
    const { map, path } = findComponentsMap(o.map, env);
    const report = analyze(dir, { catalog: loadCatalog(o.catalog), map, tokens: loadTokens() });
    const out = o.out || dir;
    mkdirSync(out, { recursive: true });
    writeFileSync(join(out, 'report.json'), JSON.stringify(report, null, 1) + '\n');
    writeFileSync(join(out, 'report.md'), renderReport(report));
    say(`report: ${join(out, 'report.md')} (+ report.json)`);
    say(`components map: ${path || 'not found (pass --map or set FIGMA_LEARN_COMPONENTS_MAP); code status from catalog.json'}`);
    say(`files ${report.totals.files}, screens ${report.totals.screens}, average dev-readiness ${report.totals.score}/100`);
    say(`archetypes: ${Object.entries(report.archetypes).map(([k, v]) => `${k} ${v.screens}`).join(', ')}`);
    return report;
  }
  if (o.command === 'templates') {
    const report = o.dir || o.team ? needReport(dir) : readJson(join(dir, 'report.json'));
    const { templates, skipped } = buildTemplates(report, { min: Number(o.min || 1), ...(o.source ? { source: o.source } : {}) });
    const files = o['dry-run'] ? [] : writeTemplates(templates, o.out || TEMPLATES_DIR);
    for (const [a, spec] of Object.entries(templates)) say(`${a}: ${spec.template.derivedFrom.screens} screens from files${spec.template.derivedFrom.example ? `, example ${spec.template.derivedFrom.example}` : ''} (spec check ok)`);
    for (const s of skipped) say(`skip ${s.archetype}: ${s.reason}`);
    if (files.length) say(`wrote ${files.length} templates to ${o.out || TEMPLATES_DIR}`);
    return { templates, skipped, files };
  }
  if (o.command === 'learn') {
    const report = needReport(dir);
    const { templates } = buildTemplates(report, { min: Number(o.min || 2) });
    const drafts = knowledgeDrafts(report, templates, { author: o.author || 'figma-learn', min: Number(o.min || 2) });
    const bad = drafts.filter((d) => d.errors.length);
    const out = o.out || join(dir, 'learn');
    const files = writeLearn(out, drafts.filter((d) => !d.errors.length), learnedPatterns(report, templates, { tokens: loadTokens() }));
    say(`drafts: ${out}`);
    for (const f of files) say(`  ${f}`);
    for (const d of bad) say(`  invalid draft ${d.area}/${d.slug}: ${d.errors.join('; ')}`);
    return { drafts, files };
  }
  if (o.command === 'all') {
    if (!o.team && !o.file) throw new Error('all needs --team <id> or --file <key|url>');
    const pass = (cmd, extra = []) => run([cmd, ...Object.entries(o).filter(([k]) => !['command', 'out', 'dry-run'].includes(k)).flatMap(([k, v]) => (v === true ? [`--${k}`] : [`--${k}`, v])), ...extra], { env, fetch, sleep, log });
    await pass('crawl');
    await pass('analyze');
    await pass('templates', ['--dry-run']);
    return pass('learn');
  }
  throw new Error('usage: figma-learn.mjs crawl|analyze|templates|learn|all (see the header of this file)');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  run(process.argv.slice(2)).catch((error) => {
    console.error(`figma-learn: ${error.message}`);
    process.exit(1);
  });
}
