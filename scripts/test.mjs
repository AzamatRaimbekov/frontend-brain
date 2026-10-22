#!/usr/bin/env node
// Repository checks: plugin manifests, skill frontmatter, relative links in skills and agents, and the two hooks.
// Usage: node scripts/test.mjs  (exit 1 if any check fails)
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PLUGIN = join(ROOT, 'plugins', 'frontend-pack');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const run = (script, input, env = {}) =>
  spawnSync(process.execPath, [join(PLUGIN, 'scripts', script), ...(script === 'check-file-size.mjs' ? ['--hook'] : [])], {
    encoding: 'utf8',
    input: JSON.stringify(input),
    env: { ...process.env, ...env },
  });

function markdownFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) markdownFiles(path, out);
    else if (name.endsWith('.md')) out.push(path);
  }
  return out;
}

const tests = {
  'manifests are valid and versions match'() {
    const claude = json(join(PLUGIN, '.claude-plugin', 'plugin.json'));
    const codex = json(join(PLUGIN, '.codex-plugin', 'plugin.json'));
    const market = json(join(ROOT, '.claude-plugin', 'marketplace.json'));
    json(join(ROOT, '.agents', 'plugins', 'marketplace.json'));
    const entry = market.plugins.find((p) => p.name === 'frontend-pack');
    assert.ok(entry, 'frontend-pack is listed in the marketplace');
    for (const v of [codex.version, entry.version, market.metadata.version, json(join(ROOT, 'package.json')).version]) {
      assert.equal(v, claude.version);
    }
    json(join(PLUGIN, 'rules', 'libraries.json'));
  },
  'every skill has name and description frontmatter'() {
    for (const skill of readdirSync(join(PLUGIN, 'skills'))) {
      const text = readFileSync(join(PLUGIN, 'skills', skill, 'SKILL.md'), 'utf8');
      assert.match(text, new RegExp(`^---\\n(.*\\n)*?name: ${skill}\\n`), `${skill}: name`);
      assert.match(text, /^---\n(.*\n)*?description: \S/, `${skill}: description`);
    }
  },
  'relative links in skills, agents and references resolve'() {
    const broken = [];
    for (const dir of ['skills', 'agents', 'references', 'knowledge']) {
      for (const file of markdownFiles(join(PLUGIN, dir))) {
        if (file.includes('vercel-react-best-practices')) continue; // vendored as is
        for (const [, target] of readFileSync(file, 'utf8').matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
          if (/^[a-z]+:/i.test(target)) continue;
          if (!existsSync(join(dirname(file), target))) broken.push(`${file.slice(ROOT.length + 1)} -> ${target}`);
        }
      }
    }
    assert.deepEqual(broken, []);
  },
  'knowledge entries are valid and INDEX.md is up to date'() {
    const result = spawnSync(process.execPath, [join(PLUGIN, 'scripts', 'knowledge.mjs'), 'check'], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout);
  },
  'knowledge check rejects an entry without required fields'() {
    const area = join(PLUGIN, 'knowledge', 'testing');
    const created = !existsSync(area);
    const file = join(area, 'zz-invalid-entry.md');
    mkdirSync(area, { recursive: true });
    try {
      writeFileSync(file, '---\ntitle: broken\ntype: idea\nstack: [angular]\n---\n\ntext\n');
      const out = spawnSync(process.execPath, [join(PLUGIN, 'scripts', 'knowledge.mjs'), 'check'], { encoding: 'utf8' }).stdout;
      for (const problem of ['type must be', 'stack must be', 'author', 'updated must be', '## Решение'])
        assert.ok(out.includes(problem), `expected "${problem}" in:\n${out}`);
    } finally {
      rmSync(created ? area : file, { recursive: true, force: true });
    }
  },
  'check-file-size blocks a component over 150 lines and allows a small one'() {
    const dir = mkdtempSync(join(tmpdir(), 'frontend-brain-'));
    try {
      const big = join(dir, 'Big.tsx');
      const small = join(dir, 'Small.tsx');
      writeFileSync(big, 'export const x = 1;\n'.repeat(151));
      writeFileSync(small, 'export const x = 1;\n'.repeat(20));
      assert.equal(run('check-file-size.mjs', { tool_name: 'Write', tool_input: { file_path: big } }).status, 2);
      assert.equal(run('check-file-size.mjs', { tool_name: 'Write', tool_input: { file_path: small } }).status, 0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
  'check-ux-brief blocks a new page without UX.md'() {
    const dir = mkdtempSync(join(tmpdir(), 'frontend-brain-'));
    try {
      const pages = join(dir, 'src', 'pages', 'orders');
      mkdirSync(pages, { recursive: true });
      const input = { tool_name: 'Write', tool_input: { file_path: join(pages, 'OrdersPage.tsx') } };
      assert.equal(run('check-ux-brief.mjs', input).status, 2);
      assert.equal(run('check-ux-brief.mjs', input, { MDIGITAL_UX_BRIEF: 'off' }).status, 0);
      writeFileSync(join(pages, 'UX.md'), '# brief\n');
      assert.equal(run('check-ux-brief.mjs', input).status, 0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
};

let failed = 0;
for (const [name, fn] of Object.entries(tests)) {
  try {
    fn();
    console.log(`ok   ${name}`);
  } catch (error) {
    failed++;
    console.log(`FAIL ${name}\n     ${error.message.split('\n').join('\n     ')}`);
  }
}
process.exit(failed ? 1 : 0);
