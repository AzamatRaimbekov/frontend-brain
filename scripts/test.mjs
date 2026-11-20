#!/usr/bin/env node
// Repository checks: plugin manifests, skill frontmatter, relative links in skills and agents, and the two hooks.
// Usage: node scripts/test.mjs  (exit 1 if any check fails)
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, chmodSync } from 'node:fs';
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

// Every plugin folder under plugins/ (frontend-pack, figma-pack, ...).
const plugins = () =>
  readdirSync(join(ROOT, 'plugins'))
    .map((name) => join(ROOT, 'plugins', name))
    .filter((dir) => existsSync(join(dir, '.claude-plugin', 'plugin.json')));
const allSkills = () =>
  plugins().flatMap((dir) =>
    existsSync(join(dir, 'skills')) ? readdirSync(join(dir, 'skills')).map((skill) => ({ dir, skill })) : [],
  );
const unitTests = () =>
  plugins().flatMap((dir) =>
    existsSync(join(dir, 'scripts'))
      ? readdirSync(join(dir, 'scripts')).filter((f) => f.endsWith('.test.mjs')).map((f) => join(dir, 'scripts', f))
      : [],
  );

const tests = {
  'plugins do not reach into each other by relative paths (docs/architecture.md)'() {
    const r = spawnSync(process.execPath, [join(ROOT, 'scripts', 'check-boundaries.mjs')], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stdout);
  },
  'shadcn registry r/ and design-engine contracts are up to date'() {
    for (const script of ['plugins/frontend-pack/scripts/registry-build.mjs', 'plugins/design-engine/scripts/sync-contracts.mjs']) {
      const r = spawnSync(process.execPath, [join(ROOT, script), '--check'], { encoding: 'utf8' });
      assert.equal(r.status, 0, `${script}: ${r.stdout}${r.stderr}`);
    }
  },
  'component contracts are valid and the kit matches them (contracts-check, contract-to-code --check)'() {
    for (const script of ['plugins/design-engine/scripts/contracts-check.mjs', 'plugins/frontend-pack/scripts/contract-to-code.mjs --check']) {
      const [file, ...args] = script.split(' ');
      const r = spawnSync(process.execPath, [join(ROOT, file), ...args], { encoding: 'utf8' });
      assert.equal(r.status, 0, `${script}: ${r.stdout}${r.stderr}`);
    }
  },
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
    for (const { dir, skill } of allSkills()) {
      const text = readFileSync(join(dir, 'skills', skill, 'SKILL.md'), 'utf8');
      assert.match(text, new RegExp(`^---\\n(.*\\n)*?name: ${skill}\\n`), `${skill}: name`);
      assert.match(text, /^---\n(.*\n)*?description: \S/, `${skill}: description`);
    }
  },
  'relative links in skills, agents and references resolve'() {
    const broken = [];
    for (const dir of plugins().flatMap((p) => ['skills', 'agents', 'references', 'knowledge'].map((d) => join(p, d)))) {
      if (!existsSync(dir)) continue;
      for (const file of markdownFiles(dir)) {
        if (file.includes('vercel-react-best-practices')) continue; // vendored as is
        for (const [, target] of readFileSync(file, 'utf8').matchAll(/\]\(([^)#\s]+)(#[^)]*)?\)/g)) {
          if (/^[a-z]+:/i.test(target)) continue;
          if (!existsSync(join(dirname(file), target))) broken.push(`${file.slice(ROOT.length + 1)} -> ${target}`);
        }
      }
    }
    assert.deepEqual(broken, []);
  },
  'every plugin in the marketplaces exists and has a valid manifest'() {
    const market = json(join(ROOT, '.claude-plugin', 'marketplace.json'));
    const codex = json(join(ROOT, '.agents', 'plugins', 'marketplace.json'));
    for (const entry of market.plugins) {
      const manifest = json(join(ROOT, entry.source, '.claude-plugin', 'plugin.json'));
      assert.equal(manifest.name, entry.name);
      assert.equal(manifest.version, entry.version, `${entry.name}: marketplace version`);
      assert.ok(codex.plugins.some((p) => p.name === entry.name), `${entry.name}: listed for Codex`);
    }
    for (const dir of plugins()) {
      const name = json(join(dir, '.claude-plugin', 'plugin.json')).name;
      assert.ok(market.plugins.some((p) => p.name === name), `${name}: plugin folder is not listed in the marketplace`);
    }
  },
  'plugin unit tests pass (node --test plugins/*/scripts/*.test.mjs)'() {
    const files = unitTests();
    if (!files.length) return;
    const result = spawnSync(process.execPath, ['--test', ...files], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
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
  'lint-on-edit feeds ESLint errors back and stays quiet otherwise'() {
    const dir = mkdtempSync(join(tmpdir(), 'frontend-brain-'));
    const hook = (file, env = {}) =>
      spawnSync(process.execPath, [join(PLUGIN, 'scripts', 'lint-on-edit.mjs')], {
        encoding: 'utf8', env: { ...process.env, ...env },
        input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: file } }),
      });
    try {
      const src = join(dir, 'src');
      mkdirSync(join(dir, 'node_modules', '.bin'), { recursive: true });
      mkdirSync(src);
      const file = join(src, 'App.tsx');
      writeFileSync(file, 'export const App = () => null\n');
      assert.equal(hook(file).status, 0, 'no eslint.config: nothing to enforce');
      writeFileSync(join(dir, 'eslint.config.js'), 'export default []\n');
      const bin = join(dir, 'node_modules', '.bin', 'eslint');
      writeFileSync(bin, '#!/bin/sh\necho "src/App.tsx  1:1  error  Unexpected any  @typescript-eslint/no-explicit-any"\nexit 1\n');
      chmodSync(bin, 0o755);
      const failed = hook(file);
      assert.equal(failed.status, 2);
      assert.match(failed.stderr, /no-explicit-any/);
      assert.equal(hook(file, { MDIGITAL_LINT_HOOK: 'off' }).status, 0);
      writeFileSync(bin, '#!/bin/sh\nexit 0\n');
      assert.equal(hook(file).status, 0, 'clean file');
      assert.equal(hook(join(src, 'notes.md')).status, 0, 'not a script file');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
  'format-on-edit writes the file in the project Prettier style before ESLint'() {
    const dir = mkdtempSync(join(tmpdir(), 'frontend-brain-'));
    const hook = (file, env = {}) =>
      spawnSync(process.execPath, [join(PLUGIN, 'scripts', 'lint-on-edit.mjs')], {
        encoding: 'utf8', env: { ...process.env, ...env },
        input: JSON.stringify({ tool_name: 'Edit', tool_input: { file_path: file } }),
      });
    try {
      const src = join(dir, 'src');
      mkdirSync(join(dir, 'node_modules', '.bin'), { recursive: true });
      mkdirSync(src);
      const file = join(src, 'App.tsx');
      const raw = 'export const App = () => null;\n';
      writeFileSync(file, raw);
      // Fake prettier: --write rewrites the last argument (the file) to a marker.
      const bin = join(dir, 'node_modules', '.bin', 'prettier');
      writeFileSync(bin, '#!/bin/sh\nfor f; do :; done\necho "// formatted" > "$f"\n');
      chmodSync(bin, 0o755);
      assert.equal(hook(file).status, 0);
      assert.equal(readFileSync(file, 'utf8'), raw, 'no Prettier config: the file stays as written');
      writeFileSync(join(dir, '.prettierrc.json'), '{ "semi": false }\n');
      assert.equal(hook(file, { MDIGITAL_FORMAT_HOOK: 'off' }).status, 0);
      assert.equal(readFileSync(file, 'utf8'), raw, 'MDIGITAL_FORMAT_HOOK=off skips formatting');
      assert.equal(hook(file).status, 0);
      assert.equal(readFileSync(file, 'utf8'), '// formatted\n', 'formatted with the project prettier');
      const css = join(src, 'index.css');
      writeFileSync(css, 'a{}\n');
      hook(css);
      assert.equal(readFileSync(css, 'utf8'), '// formatted\n', 'CSS, JSON and Markdown are formatted too');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
  'frontend-autostart fires on frontend tasks only'() {
    const dir = mkdtempSync(join(tmpdir(), 'frontend-brain-'));
    const hook = (prompt, cwd = dir) =>
      spawnSync(process.execPath, [join(PLUGIN, 'scripts', 'frontend-autostart.mjs')], {
        encoding: 'utf8', input: JSON.stringify({ prompt, cwd }),
      }).stdout;
    try {
      assert.match(hook('сделай страницу заказов'), /frontend-pack:frontend/, 'empty folder: a UI task still goes through the brain');
      assert.match(hook('мне нужна одна страница где есть калькулятор'), /frontend-pack:frontend/);
      assert.equal(hook('подними докер на сервере'), '', 'infra task in an empty folder');
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { express: '5.0.0' } }));
      assert.equal(hook('сделай страницу заказов'), '', 'backend project, no stack words');
      assert.match(hook('сделай страницу заказов на React'), /frontend-pack:frontend/);
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { react: '19.0.0' } }));
      assert.match(hook('сделай страницу заказов'), /frontend-pack:frontend/);
      assert.equal(hook('сколько будет 2+2'), '');
      assert.equal(hook('$frontend сделай страницу'), '', 'already routed');
      assert.match(hook('сделай страницу заказов'), /Mode vibe/, 'fast by default');
      assert.match(hook('сделай страницу заказов до MR'), /Mode team/, 'process on request');
      mkdirSync(join(dir, '.frontend'));
      writeFileSync(join(dir, '.frontend', 'mode'), 'team\n');
      assert.match(hook('сделай страницу заказов'), /Mode team/, 'project switch');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  },
  'require-frontend-skill blocks frontend code until the brain is loaded'() {
    const dir = mkdtempSync(join(tmpdir(), 'frontend-brain-'));
    try {
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { react: '19.0.0' } }));
      const transcript = join(dir, 'session.jsonl');
      writeFileSync(transcript, '{"type":"user","message":{"content":"сделай калькулятор"}}\n');
      const input = (file, extra = {}) => ({ tool_name: 'Write', tool_input: { file_path: join(dir, file) }, transcript_path: transcript, ...extra });
      const r = run('require-frontend-skill.mjs', input('src/App.tsx'));
      assert.equal(r.status, 2);
      assert.match(r.stderr, /frontend-pack:frontend/);
      assert.equal(run('require-frontend-skill.mjs', input('src/index.css')).status, 2, 'styles too');
      assert.equal(run('require-frontend-skill.mjs', input('README.md')).status, 0, 'not code');
      assert.equal(run('require-frontend-skill.mjs', input('src/App.test.tsx')).status, 0, 'tests are free');
      assert.equal(run('require-frontend-skill.mjs', input('src/App.tsx', { agent_type: 'frontend-pack:frontend-engineer' })).status, 0);
      assert.equal(run('require-frontend-skill.mjs', input('src/App.tsx'), { MDIGITAL_SKILL_GATE: 'off' }).status, 0);
      const bash = (command) => run('require-frontend-skill.mjs', { tool_name: 'Bash', tool_input: { command }, transcript_path: transcript }).status;
      assert.equal(bash('npm create vite@latest calc -- --template react-ts'), 2, 'bare scaffold is gated');
      assert.equal(bash('npx create-next-app@latest web'), 2);
      assert.equal(bash('npm install && npm run build'), 0, 'other commands pass');
      const empty = mkdtempSync(join(tmpdir(), 'no-pkg-'));
      const orphan = (f) => run('require-frontend-skill.mjs', { tool_name: 'Write', tool_input: { file_path: join(empty, f) }, transcript_path: transcript }).status;
      assert.equal(orphan('calc/src/App.tsx'), 2, 'a .tsx with no package.json is a React project being born');
      assert.equal(orphan('notes/style.css'), 0, 'plain css outside a project is not gated');
      rmSync(empty, { recursive: true, force: true });
      writeFileSync(transcript, '{"type":"assistant","message":{"content":[{"type":"tool_use","name":"Skill","input":{"skill":"frontend-pack:frontend"}}]}}\n', { flag: 'a' });
      assert.equal(run('require-frontend-skill.mjs', input('src/App.tsx')).status, 0, 'skill loaded');
      assert.equal(run('require-frontend-skill.mjs', { tool_name: 'Bash', tool_input: { command: 'npm create vite@latest x' }, transcript_path: transcript }).status, 0, 'scaffold after the skill');
      const other = mkdtempSync(join(tmpdir(), 'not-frontend-'));
      writeFileSync(join(other, 'package.json'), '{}');
      assert.equal(run('require-frontend-skill.mjs', { ...input('x'), tool_input: { file_path: join(other, 'src/a.tsx') }, transcript_path: join(other, 'none.jsonl') }).status, 0, 'not a frontend project');
      rmSync(other, { recursive: true, force: true });
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
