// Tests for task.mjs and session-tasks.mjs. Run: node --test plugins/frontend-pack/scripts/task.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PIPELINES, parseTask } from './task.mjs';

const SCRIPTS = dirname(fileURLToPath(import.meta.url));
const PIPELINES_DOC = join(SCRIPTS, '..', 'skills', 'frontend', 'references', 'pipelines.md');

const cli = (cwd, ...args) => spawnSync(process.execPath, [join(SCRIPTS, 'task.mjs'), ...args], { cwd, encoding: 'utf8' });
const hook = (payload, env = {}) =>
  spawnSync(process.execPath, [join(SCRIPTS, 'session-tasks.mjs')], {
    input: JSON.stringify(payload), encoding: 'utf8', env: { ...process.env, ...env },
  });

function withProject(fn) {
  const dir = mkdtempSync(join(tmpdir(), 'frontend-task-'));
  try {
    fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('new creates the task file with frontmatter, sections and the stage checklist', () => withProject((dir) => {
  const result = cli(dir, 'new', 'orders-page', '--title', 'Страница: заказы', '--pipeline', 'feature', '--goal', 'Видеть заказы', '--branch', 'feat/orders');
  assert.equal(result.status, 0, result.stderr);
  const file = join(dir, '.frontend', 'tasks', 'orders-page.md');
  const { meta, body } = parseTask(readFileSync(file, 'utf8'));
  assert.equal(meta.title, 'Страница: заказы');
  assert.equal(meta.pipeline, 'feature');
  assert.equal(meta.stage, 'brief');
  assert.equal(meta.status, 'open');
  assert.equal(meta.branch, 'feat/orders');
  assert.match(meta.created, /^\d{4}-\d\d-\d\dT\d\d:\d\d$/);
  for (const heading of ['Цель', 'Решения', 'Артефакты', 'Этапы', 'Проверки', 'Открытые вопросы']) {
    assert.match(body, new RegExp(`\\n## ${heading}\\n`));
  }
  assert.match(body, /- \[ \] brief — .* ← сейчас/);
  assert.match(body, /## Цель\n\n- Видеть заказы\n/);
  assert.equal(cli(dir, 'new', 'orders-page', '--title', 'x', '--pipeline', 'feature').status, 1, 'no overwrite');
}));

test('new rejects a bad slug, a missing title and an unknown pipeline', () => withProject((dir) => {
  assert.equal(cli(dir, 'new', '../evil', '--title', 'x', '--pipeline', 'bug').status, 1);
  assert.equal(cli(dir, 'new', 'ok', '--pipeline', 'bug').status, 1);
  assert.match(cli(dir, 'new', 'ok', '--title', 'x', '--pipeline', 'nope').stderr, /feature/);
  assert.equal(cli(dir, 'nonsense').status, 2);
}));

test('stage moves the marker, checks earlier stages, sets status and closes with done', () => withProject((dir) => {
  cli(dir, 'new', 'fix-login', '--title', 'Логин падает', '--pipeline', 'bug', '--branch', 'fix/login');
  const file = join(dir, '.frontend', 'tasks', 'fix-login.md');
  assert.equal(cli(dir, 'stage', 'fix-login', 'fix').status, 0);
  let text = readFileSync(file, 'utf8');
  assert.match(text, /- \[x\] reproduce/);
  assert.match(text, /- \[x\] failing-test/);
  assert.match(text, /- \[ \] fix — .* ← сейчас/);
  assert.equal((text.match(/← сейчас/g) ?? []).length, 1);
  assert.equal(cli(dir, 'stage', 'fix-login', 'fix', '--status', 'blocked').status, 0);
  assert.equal(parseTask(readFileSync(file, 'utf8')).meta.status, 'blocked');
  assert.match(cli(dir, 'stage', 'fix-login', 'brief').stderr, /reproduce/, 'stage outside the pipeline');
  assert.equal(cli(dir, 'stage', 'fix-login', 'fix', '--status', 'paused').status, 1);
  assert.equal(cli(dir, 'stage', 'fix-login', 'done').status, 0);
  text = readFileSync(file, 'utf8');
  assert.equal(parseTask(text).meta.status, 'done');
  assert.doesNotMatch(text, /- \[ \]|← сейчас/);
  assert.equal(cli(dir, 'stage', 'missing', 'fix').status, 1);
}));

test('note appends to the right section and replaces the placeholder', () => withProject((dir) => {
  cli(dir, 'new', 'cart', '--title', 'Корзина', '--pipeline', 'feature');
  assert.equal(cli(dir, 'note', 'cart', 'decisions', 'Фильтры', 'в URL').status, 0);
  assert.equal(cli(dir, 'note', 'cart', 'проверки', 'tsc 0, eslint 0').status, 0);
  assert.equal(cli(dir, 'note', 'cart', 'checks', 'vitest 14/14').status, 0);
  const text = readFileSync(join(dir, '.frontend', 'tasks', 'cart.md'), 'utf8');
  assert.match(text, /## Решения\n\n- Фильтры в URL\n\n## Артефакты\n\n_пока нет_\n/);
  assert.match(text, /## Проверки\n\n- tsc 0, eslint 0\n- vitest 14\/14\n/);
  assert.equal(cli(dir, 'note', 'cart', 'unknown', 'x').status, 1);
  assert.equal(cli(dir, 'note', 'cart', 'checks').status, 1, 'empty text');
}));

test('list shows tasks, --open hides done ones; show prints the file', () => withProject((dir) => {
  assert.match(cli(dir, 'list').stdout, /Задач нет/);
  cli(dir, 'new', 'a-task', '--title', 'A', '--pipeline', 'review');
  cli(dir, 'new', 'b-task', '--title', 'B', '--pipeline', 'refactor');
  cli(dir, 'stage', 'b-task', 'done');
  const all = cli(dir, 'list').stdout;
  assert.match(all, /a-task\treview\tscope\topen\tA/);
  assert.match(all, /b-task\trefactor\thandoff\tdone\tB/);
  const open = cli(dir, 'list', '--open').stdout;
  assert.match(open, /a-task/);
  assert.doesNotMatch(open, /b-task/);
  assert.match(cli(dir, 'show', 'a-task').stdout, /^---\ntitle: "A"/);
}));

test('session-tasks prints a short summary of open and blocked tasks only', () => withProject((dir) => {
  assert.equal(hook({ cwd: dir }).stdout, '', 'no task folder: silent');
  cli(dir, 'new', 'done-one', '--title', 'Готово', '--pipeline', 'bug');
  cli(dir, 'stage', 'done-one', 'done');
  assert.equal(hook({ cwd: dir }).stdout, '', 'only done tasks: silent');
  cli(dir, 'new', 'orders', '--title', 'Заказы', '--pipeline', 'feature');
  cli(dir, 'stage', 'orders', 'code', '--status', 'blocked');
  const out = hook({ cwd: dir });
  assert.equal(out.status, 0);
  assert.match(out.stdout, /orders: этап code, статус blocked — Заказы/);
  assert.doesNotMatch(out.stdout, /done-one/);
  assert.match(out.stdout, /frontend-pack:frontend/);
  const lines = out.stdout.trim().split('\n').length;
  assert.ok(lines >= 2 && lines <= 5, `${lines} lines`);
  assert.equal(hook({ cwd: dir }, { MDIGITAL_TASKS_HOOK: 'off' }).stdout, '');
}));

test('session-tasks caps the summary at five lines and never fails', () => withProject((dir) => {
  for (const slug of ['t1', 't2', 't3', 't4', 't5']) cli(dir, 'new', slug, '--title', slug, '--pipeline', 'review');
  const out = hook({ cwd: dir }).stdout.trim().split('\n');
  assert.equal(out.length, 5);
  assert.match(out.at(-1), /ещё 2/);
  writeFileSync(join(dir, '.frontend', 'tasks', 'broken.md'), 'no frontmatter at all');
  assert.equal(hook({ cwd: dir }).status, 0);
  const bad = spawnSync(process.execPath, [join(SCRIPTS, 'session-tasks.mjs')], { input: 'not json', encoding: 'utf8', cwd: dir });
  assert.equal(bad.status, 0);
}));

test('pipelines.md documents every pipeline and stage id of task.mjs', () => {
  assert.ok(existsSync(PIPELINES_DOC));
  const doc = readFileSync(PIPELINES_DOC, 'utf8');
  for (const [name, stages] of Object.entries(PIPELINES)) {
    const start = doc.indexOf(`\n## ${name}\n`);
    assert.ok(start !== -1, `section ## ${name}`);
    const end = doc.indexOf('\n## ', start + 1);
    const section = doc.slice(start, end === -1 ? undefined : end);
    for (const [id] of stages) assert.match(section, new RegExp(`\\| \`${id}\` \\|`), `${name}: stage ${id}`);
  }
});
