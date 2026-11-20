import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { EXCLUDE, keep, packageName, parseArgs, planSteps, TEMPLATE } from './new-webview-service.mjs';

test('the team template is bundled with its own rules', () => {
  for (const file of ['package.json', 'AGENTS.md', 'AGENT_FEEDBACK.md', 'src/shared/mobile-bridge/mobileBridge.ts', 'docs/webview-app-builder/README.md'])
    assert.ok(existsSync(join(TEMPLATE, file)), file);
  for (const junk of ['node_modules', 'dist', '.git']) assert.ok(!existsSync(join(TEMPLATE, junk)), junk);
});

test('arguments, package name and copy filter', () => {
  assert.equal(parseArgs(['fines', '--name', 'Штрафы']).name, 'Штрафы');
  assert.throws(() => parseArgs([]), /directory/);
  assert.throws(() => parseArgs(['a', '--kit', 'x']), /Unknown option/);
  assert.equal(packageName('/x/Mbank Fines'), 'mbank-fines');
  assert.equal(keep(TEMPLATE, join(TEMPLATE, 'src', 'app')), true);
  for (const junk of EXCLUDE) assert.equal(keep(TEMPLATE, join(TEMPLATE, junk, 'x')), false, junk);
});

test('plan: copy the template as is, git before install, no own scaffold or kit', () => {
  const steps = planSteps({ dir: 'fines', template: TEMPLATE, dryRun: true });
  const titles = steps.map((s) => s.title).join('\n');
  assert.match(titles, /Copy the team template/);
  const git = steps.findIndex((s) => s.command === 'git');
  const install = steps.findIndex((s) => /Install dependencies/.test(s.title));
  assert.ok(git > -1 && git < install, 'husky needs git before install');
  const all = steps.flatMap((s) => [s.command, ...(s.args ?? [])]).join(' ');
  assert.doesNotMatch(all, /create-vite|add-ui/);
  assert.equal(JSON.parse(readFileSync(join(TEMPLATE, 'package.json'), 'utf8')).name, 'webview-mbank-service');
});
