// Tests for add-ui.mjs. Run: node --test plugins/frontend-pack/scripts/add-ui.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { loadRegistry, parseArgs, resolveItems, run } from './add-ui.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'add-ui.mjs');
const REGISTRY = join(dirname(SCRIPT), '..', 'registry', 'mbank');

function project() {
  const dir = mkdtempSync(join(tmpdir(), 'add-ui-'));
  writeFileSync(join(dir, 'package.json'), JSON.stringify({ dependencies: { clsx: '2', 'tailwind-merge': '3' } }));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src', 'index.css'), '@import "tailwindcss";\n');
  return dir;
}

test('registry files exist, components stay under 150 lines, dependencies resolve', () => {
  const items = loadRegistry();
  for (const item of items.values()) {
    for (const file of item.files) {
      const path = join(REGISTRY, file.path);
      assert.ok(existsSync(path), `${item.name}: ${file.path}`);
      if (path.endsWith('.tsx')) assert.ok(readFileSync(path, 'utf8').split('\n').length <= 150, `${file.path} > 150 lines`);
    }
    for (const dep of item.registryDependencies) assert.ok(items.has(dep), `${item.name} -> ${dep}`);
  }
  const listed = new Set([...items.values()].flatMap((i) => i.files.map((f) => f.path.split('/').pop())));
  for (const file of readdirSync(join(REGISTRY, 'components'))) assert.ok(listed.has(file), `${file} not in registry.json`);
});

test('components use tokens, not hard-coded colours or the old shadcn palette', () => {
  for (const file of readdirSync(join(REGISTRY, 'components'))) {
    const text = readFileSync(join(REGISTRY, 'components', file), 'utf8');
    assert.doesNotMatch(text, /#[0-9a-fA-F]{3,8}\b|rgb\(|oklch\(/, `${file}: raw colour`);
    assert.doesNotMatch(text, /\b(bg|text|border)-(slate|gray|zinc|red|blue|green|yellow)-\d/, `${file}: palette class`);
    assert.doesNotMatch(text, /lucide-react|forwardRef/, `${file}: lucide or forwardRef`);
  }
});

test('resolveItems adds registry dependencies first and rejects unknown names', () => {
  const names = resolveItems(['dialog'], loadRegistry()).map((i) => i.name);
  assert.deepEqual(names.slice(-1), ['dialog']);
  for (const dep of ['utils', 'tokens', 'icons']) assert.ok(names.indexOf(dep) < names.indexOf('dialog'));
  assert.throws(() => resolveItems(['nope'], loadRegistry()), /Unknown item "nope"/);
});

test('--dry-run writes nothing and reports the plan', () => {
  const dir = project();
  try {
    const out = [];
    const result = run({ ...parseArgs(['button', '--dry-run', '--cwd', dir]) }, (l) => out.push(l));
    assert.ok(result.written.includes(join('src', 'shared', 'ui', 'button.tsx')));
    assert.equal(existsSync(join(dir, 'src', 'shared')), false);
    assert.deepEqual(result.missing, ['class-variance-authority', 'radix-ui', 'tailwindcss']);
    assert.match(out.join('\n'), /npm install class-variance-authority radix-ui tailwindcss/);
    assert.match(out.join('\n'), /@import "\.\/styles\/mbank-tokens\.css";/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('copies files, never overwrites without --force, CLI exits 0', () => {
  const dir = project();
  try {
    const cli = (...args) => spawnSync(process.execPath, [SCRIPT, ...args, '--cwd', dir], { encoding: 'utf8' });
    const first = cli('select', '--tokens', 'src/theme/mbank.css');
    assert.equal(first.status, 0, first.stderr);
    for (const p of ['src/shared/ui/select.tsx', 'src/shared/ui/icons.tsx', 'src/shared/lib/utils.ts', 'src/theme/mbank.css'])
      assert.ok(existsSync(join(dir, p)), p);
    const select = join(dir, 'src', 'shared', 'ui', 'select.tsx');
    writeFileSync(select, '// local edit\n');
    const second = cli('select');
    assert.match(second.stdout, /skip\s+src\/shared\/ui\/select\.tsx/);
    assert.equal(readFileSync(select, 'utf8'), '// local edit\n');
    cli('select', '--force');
    assert.notEqual(readFileSync(select, 'utf8'), '// local edit\n');
    assert.equal(cli('missing-item').status, 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
