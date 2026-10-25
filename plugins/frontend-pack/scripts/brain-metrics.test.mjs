// Tests for brain-metrics.mjs on a fixture plugin and fixture task files in a tmp dir.
// Run: node --test plugins/frontend-pack/scripts/brain-metrics.test.mjs
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkedDates, metrics, parseArgs, render, section, taskAreas } from './brain-metrics.mjs';

const SCRIPT = join(dirname(fileURLToPath(import.meta.url)), 'brain-metrics.mjs');
const TODAY = '2026-10-25';
let dir;
let plugin;
let projectA;
let projectB;

const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
};
const entry = (updated, extra = '') => `---\ntitle: t\ntype: gotcha\nstack: [vite, next]\nauthor: a\nupdated: ${updated}\n${extra}---\n\n## Решение\n\nx\n\n## Почему\n\ny\n`;
const task = ({ title, pipeline, stage, status, stages, checks = [], questions = [], goal = '' }) =>
  `---\ntitle: ${JSON.stringify(title)}\npipeline: ${pipeline}\nstage: ${stage}\nstatus: ${status}\nbranch: \ncreated: 2026-10-01T10:00\nupdated: 2026-10-20T10:00\n---\n\n# ${title}\n\n` +
  `## Цель\n\n${goal ? `- ${goal}` : '_пока нет_'}\n\n## Решения\n\n_пока нет_\n\n## Артефакты\n\n_пока нет_\n\n## Этапы\n\n${stages.join('\n')}\n\n` +
  `## Проверки\n\n${checks.length ? checks.map((c) => `- ${c}`).join('\n') : '_пока нет_'}\n\n## Открытые вопросы\n\n${questions.length ? questions.map((q) => `- ${q}`).join('\n') : '_пока нет_'}\n`;

before(() => {
  dir = mkdtempSync(join(tmpdir(), 'brain-metrics-'));
  plugin = join(dir, 'plugins', 'frontend-pack');
  write(join(plugin, '.claude-plugin', 'plugin.json'), '{"name":"frontend-pack","version":"9.9.9"}');
  write(join(plugin, 'skills', 'react-data-fetching', 'SKILL.md'), '---\nname: react-data-fetching\n---\n'.concat('line\n'.repeat(10)));
  write(join(plugin, 'skills', 'react-data-fetching', 'references', 'sources.md'), '# Sources\n\nChecked 2026-10. Latest...\n');
  write(join(plugin, 'skills', 'react-forms-state', 'SKILL.md'), 'x\n'.repeat(320));
  write(join(plugin, 'skills', 'react-forms-state', 'references', 'sources.md'), '# Sources\n\nChecked March 2026.\n');
  write(join(plugin, 'skills', 'frontend', 'SKILL.md'), 'conductor\n');
  write(join(plugin, 'agents', 'frontend-architect.md'), 'a\n');
  write(join(plugin, 'knowledge', 'data', 'fresh.md'), entry('2026-10-01'));
  write(join(plugin, 'knowledge', 'testing', 'old.md'), entry('2026-01-10'));
  write(join(plugin, 'knowledge', 'testing', 'gone.md'), entry('2026-01-10', 'status: deprecated\nreplaced_by: testing/old\n'));
  write(join(plugin, 'knowledge', '_template.md'), entry('2026-01-01'));
  write(join(plugin, 'rules', 'libraries.json'), '{"$comment":"x","allowed":[{},{}],"forbidden":[{}]}');
  write(join(plugin, 'rules', 'watch-state.json'), '{"updated":"2026-09-01","sources":{}}');

  const feature = ['- [x] brief — b', '- [-] approve-plan — a (пропущен: мелкая)', '- [ ] plan — p ← сейчас', '- [ ] code — c', '- [ ] handoff — h'];
  projectA = join(dir, 'crm');
  write(join(projectA, '.frontend', 'tasks', 'client-form.md'), task({
    title: 'Форма клиента', pipeline: 'feature', stage: 'plan', status: 'blocked', stages: feature,
    goal: 'Форма с валидацией Zod', questions: ['Нет swagger для клиента'],
  }));
  write(join(projectA, '.frontend', 'tasks', 'orders-api.md'), task({
    title: 'Подключить API заказов', pipeline: 'feature', stage: 'plan', status: 'blocked', stages: feature,
    checks: ['MSW: onUnhandledFrame не задан, тест прошёл без мока', 'eslint 3 ошибки — вернул на доработку, круг 3'],
  }));
  write(join(projectA, '.frontend', 'tasks', 'broken.md'), 'not a task file at all\n');
  projectB = join(dir, 'portal');
  write(join(projectB, '.frontend', 'tasks', 'login-bug.md'), task({
    title: 'Цикл редиректа на логин', pipeline: 'bug', stage: 'handoff', status: 'done',
    stages: ['- [x] reproduce — r', '- [x] fix — f', '- [x] handoff — h'],
    checks: ['MSW: onUnhandledFrame не задан, тест прошёл без мока', 'vitest 12/12'],
  }));
  write(join(projectB, '.frontend', 'tasks', 'catalog-query.md'), task({
    title: 'Каталог через query', pipeline: 'feature', stage: 'handoff', status: 'open',
    stages: ['- [x] brief — b', '- [x] plan — p', '- [ ] handoff — h ← сейчас'],
  }));
  write(join(projectB, '.frontend', 'tasks', 'split-table.md'), task({
    title: 'Разбить таблицу', pipeline: 'refactor', stage: 'handoff', status: 'done', stages: ['- [x] baseline — b', '- [x] handoff — h'],
  }));
});

after(() => rmSync(dir, { recursive: true, force: true }));

test('checked dates: ISO day, ISO month, month name, read while writing', () => {
  assert.deepEqual(checkedDates('Checked 2026-10. x'), ['2026-10-01']);
  assert.deepEqual(checkedDates('Researched 2026-10-04. npm'), ['2026-10-04']);
  assert.deepEqual(checkedDates('# Sources (checked October 2026)'), ['2026-10-01']);
  assert.deepEqual(checkedDates('Read while writing this skill (October 2026).'), ['2026-10-01']);
  assert.deepEqual(checkedDates('Checked the docs, nothing else'), []);
});

test('health counts skills, knowledge, stale entries and stale sources', () => {
  const { health: h } = metrics({ plugin, today: TODAY });
  assert.equal(h.version, '9.9.9');
  assert.deepEqual(h.skills.map((s) => [s.name, s.lines]), [['frontend', 1], ['react-data-fetching', 13], ['react-forms-state', 320]]);
  assert.deepEqual(h.agents, ['frontend-architect']);
  assert.equal(h.knowledge.total, 2, 'deprecated and _template are not counted');
  assert.equal(h.knowledge.deprecated, 1);
  assert.deepEqual(h.knowledge.byStack, { vite: 2, next: 2 });
  assert.ok(h.knowledge.emptyAreas.includes('forms') && !h.knowledge.emptyAreas.includes('data'));
  assert.deepEqual(h.knowledge.stale.map((e) => e.path), ['knowledge/testing/old.md']);
  assert.deepEqual(h.staleSources.map((s) => s.path), ['skills/react-forms-state/references/sources.md']);
  assert.deepEqual(h.skillsWithoutSources, ['frontend']);
  assert.deepEqual(h.libraries, { allowed: 2, forbidden: 1 });
  assert.equal(h.watchDays, 54);
});

test('usage reads task files of several projects and tolerates broken ones', () => {
  const { usage: u } = metrics({ plugin, projects: [projectA, projectB], today: TODAY });
  assert.equal(u.total, 6);
  assert.deepEqual(u.byPipeline, { feature: 3, '?': 1, bug: 1, refactor: 1 });
  assert.equal(u.byStatus.blocked, 2);
  assert.deepEqual(u.blockedByStage, { plan: 2 });
  assert.equal(u.blocked[0].question, '- Нет swagger для клиента');
  assert.equal(u.skippedStages, 2);
  assert.equal(u.failedGates, 1);
  assert.equal(u.maxReviewRounds, 3);
  assert.equal(u.handoffShare, 50, 'two done + one at the last stage of six');
  assert.deepEqual(u.repeatedChecks.map((r) => r.tasks), [2]);
  assert.equal(u.byArea.data, 2);
});

test('proposals name the file to change', () => {
  const result = metrics({ plugin, projects: [projectA, projectB], today: TODAY });
  const files = result.proposals.map((p) => p.file);
  for (const f of [
    'skills/react-forms-state/references/sources.md', // stale source
    'knowledge/testing/old.md', // stale entry
    'skills/react-forms-state/SKILL.md', // too long
    'rules/watch-state.json', // watch not run for 54 days
    'agents/frontend-architect.md', // plan blocks twice
    'hooks/hooks.json', // repeated check note
    'agents/frontend-engineer.md', // three rounds
    'skills/frontend/SKILL.md', // figma/new-project/review never used
  ]) assert.ok(files.includes(f), `expected a proposal for ${f}: ${files.join(', ')}`);
  assert.ok(result.proposals.some((p) => p.why.includes('конвейер figma')));
  const md = render(result);
  assert.match(md, /## Здоровье[\s\S]*## Использование[\s\S]*## Предложения/);
  assert.match(md, /\| 1 \| .* \| `/);
});

test('without projects the report asks for usage data; area with 2 tasks and 1 entry asks for entries', () => {
  const noUsage = metrics({ plugin, today: TODAY });
  assert.equal(noUsage.usage, null);
  assert.ok(noUsage.proposals.some((p) => p.why === 'нет данных об использовании'));
  const withUsage = metrics({ plugin, projects: [projectA, projectB], today: TODAY });
  assert.ok(withUsage.proposals.some((p) => p.file === 'knowledge/data/' && p.why.includes('статей: 1')));
});

test('section and taskAreas read the conductor format', () => {
  const body = '\n# T\n\n## Цель\n\n- Форма заявки\n\n## Проверки\n\n_пока нет_\n';
  assert.deepEqual(section(body, 'Цель'), ['- Форма заявки']);
  assert.deepEqual(section(body, 'Проверки'), []);
  assert.deepEqual(taskAreas({ meta: { title: 'Форма заявки' }, body }), ['forms']);
  assert.deepEqual(taskAreas({ meta: { title: 'x', area: 'i18n' }, body }), ['i18n']);
});

test('CLI: json output and argument errors', () => {
  const ok = spawnSync(process.execPath, [SCRIPT, '--plugin', plugin, '--projects', projectA, '--today', TODAY, '--json'], { encoding: 'utf8' });
  assert.equal(ok.status, 0, ok.stderr);
  assert.equal(JSON.parse(ok.stdout).usage.total, 3);
  assert.ok(parseArgs(['--today', '25.10.2026']).error);
  assert.ok(parseArgs(['--projects', join(dir, 'missing')]).error);
  assert.equal(spawnSync(process.execPath, [SCRIPT, '--wat'], { encoding: 'utf8' }).status, 2);
});
