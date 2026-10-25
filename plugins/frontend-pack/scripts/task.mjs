#!/usr/bin/env node
// Task memory for the frontend conductor: one Markdown file per task in <cwd>/.frontend/tasks/<slug>.md.
// It shows the pipeline, the current stage, decisions, artifacts and check results, so a task survives a new chat.
// Usage:
//   node task.mjs new <slug> --title "..." --pipeline <name> [--goal "..."] [--branch <name>]
//   node task.mjs stage <slug> <stage|done> [--status open|blocked|done]
//   node task.mjs note <slug> <section> <text...>     sections: goal, decisions, artifacts, checks, questions
//   node task.mjs list [--open]
//   node task.mjs show <slug>
// Pure Node 18+, no dependencies. Stage lists must match skills/frontend/references/pipelines.md.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export const PIPELINES = {
  'small-edit': [['code', 'Правка по скиллам'], ['checks', 'Хуки и проверки проекта']],
  feature: [
    ['brief', 'UX-бриф (UX.md)'], ['plan', 'План файлов (frontend-architect)'],
    ['approve-plan', 'Человек утвердил план'], ['code', 'Код и тесты (frontend-engineer)'],
    ['checks', 'tsc, линтер, тесты, сборка'], ['review', 'Ревью (frontend-reviewer)'],
    ['handoff', 'Ветка и текст MR, человек решает про MR'],
  ],
  figma: [
    ['access', 'Место Figma и маршрут (design-lead)'], ['brief', 'Бриф утверждён'],
    ['draft', 'Черновик в Figma (figma-designer)'], ['approve-design', 'Дизайнер утвердил фрейм'],
    ['spec', 'Спека (figma-reader)'], ['ux', 'UX.md из спеки'], ['plan', 'План файлов (frontend-architect)'],
    ['code', 'Код (frontend-engineer)'], ['design-qa', 'Сверка с макетом (design-qa)'],
    ['review', 'Ревью (frontend-reviewer)'], ['handoff', 'QA и MR, человек решает про MR'],
  ],
  bug: [
    ['reproduce', 'Воспроизведение и причина'], ['failing-test', 'Тест, который падает'],
    ['fix', 'Фикс, тест зелёный'], ['checks', 'tsc, линтер, тесты, сборка'],
    ['review', 'Ревью (frontend-reviewer)'], ['handoff', 'Ветка и текст MR'],
  ],
  'new-project': [
    ['requirements', 'Стек, продукт, требования'], ['scaffold', 'Каркас (react-new-project)'],
    ['shell', 'Экраны приложения: падение, 404, нет сети'], ['checks', 'tsc, линтер, тесты, сборка'],
    ['review', 'Ревью (frontend-reviewer)'], ['handoff', 'Ветка и отчёт'],
  ],
  review: [['scope', 'Что проверяем'], ['review', 'Ревью (frontend-reviewer)'], ['report', 'Отчёт с вердиктом']],
  refactor: [
    ['baseline', 'Тесты зелёные до правок'], ['plan', 'План (frontend-architect)'],
    ['approve-plan', 'Человек утвердил план'], ['refactor', 'Рефакторинг (frontend-engineer)'],
    ['checks', 'tsc, линтер, тесты, сборка'], ['review', 'Ревью (frontend-reviewer)'], ['handoff', 'Ветка и текст MR'],
  ],
};
export const STATUSES = ['open', 'blocked', 'done'];
export const SECTIONS = {
  goal: 'Цель', decisions: 'Решения', artifacts: 'Артефакты', checks: 'Проверки', questions: 'Открытые вопросы',
  цель: 'Цель', решения: 'Решения', артефакты: 'Артефакты', проверки: 'Проверки', вопросы: 'Открытые вопросы',
};
const EMPTY = '_пока нет_';
const NOW_MARK = ' ← сейчас';
const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

export const tasksDir = (cwd) => join(cwd, '.frontend', 'tasks');
// Local time, minutes precision: 2026-10-25T12:15.
const now = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function parseTask(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = {};
  if (!match) return { meta, body: text };
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^([a-z]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('"')) {
      try { value = JSON.parse(value); } catch { /* keep raw */ }
    }
    meta[kv[1]] = value;
  }
  return { meta, body: text.slice(match[0].length) };
}

function render(meta, body) {
  const keys = ['title', 'pipeline', 'stage', 'status', 'branch', 'created', 'updated'];
  const lines = keys.map((k) => `${k}: ${k === 'title' ? JSON.stringify(meta[k] ?? '') : meta[k] ?? ''}`);
  return `---\n${lines.join('\n')}\n---\n${body}`;
}

function fail(message) {
  const error = new Error(message);
  error.userError = true;
  throw error;
}

function taskPath(cwd, slug) {
  if (!SLUG.test(slug ?? '')) fail(`Неверный slug "${slug ?? ''}": латиница, цифры и дефис, до 64 символов.`);
  return join(tasksDir(cwd), `${slug}.md`);
}

function load(cwd, slug) {
  const path = taskPath(cwd, slug);
  if (!existsSync(path)) fail(`Задачи ${slug} нет: ${path}`);
  return { path, ...parseTask(readFileSync(path, 'utf8')) };
}

function stageLines(pipeline, current, done) {
  const stages = PIPELINES[pipeline] ?? [];
  const index = stages.findIndex(([id]) => id === current);
  return stages.map(([id, label], i) => {
    const checked = done || i < index;
    return `- [${checked ? 'x' : ' '}] ${id} — ${label}${!done && i === index ? NOW_MARK : ''}`;
  }).join('\n');
}

function gitBranch(cwd) {
  // symbolic-ref also works on a branch without commits; detached HEAD gives no branch.
  const result = spawnSync('git', ['symbolic-ref', '--short', 'HEAD'], { cwd, encoding: 'utf8' });
  return result.status === 0 ? result.stdout.trim() : '';
}

export function newTask(cwd, slug, { title, pipeline, goal, branch } = {}) {
  const path = taskPath(cwd, slug);
  if (!title) fail('Нужен --title.');
  if (!PIPELINES[pipeline]) fail(`Нужен --pipeline: ${Object.keys(PIPELINES).join(', ')}.`);
  if (existsSync(path)) fail(`Задача ${slug} уже есть: ${path}`);
  const stage = PIPELINES[pipeline][0][0];
  const time = now();
  const meta = { title, pipeline, stage, status: 'open', branch: branch ?? gitBranch(cwd), created: time, updated: time };
  const section = (name, content = EMPTY) => `## ${name}\n\n${content}\n`;
  const body = [
    `\n# ${title}\n`,
    section('Цель', goal ? `- ${goal}` : EMPTY),
    section('Решения'),
    section('Артефакты'),
    section('Этапы', stageLines(pipeline, stage, false)),
    section('Проверки'),
    section('Открытые вопросы'),
  ].join('\n');
  mkdirSync(tasksDir(cwd), { recursive: true });
  writeFileSync(path, render(meta, body));
  return path;
}

function replaceSection(body, heading, update) {
  const start = body.indexOf(`\n## ${heading}\n`);
  if (start === -1) fail(`В файле нет раздела «${heading}».`);
  const from = start + heading.length + 5;
  const next = body.indexOf('\n## ', from);
  const end = next === -1 ? body.length : next;
  const content = body.slice(from, end).trim();
  return `${body.slice(0, from)}\n${update(content)}\n${body.slice(end)}`;
}

export function setStage(cwd, slug, stage, status) {
  const task = load(cwd, slug);
  const stages = PIPELINES[task.meta.pipeline];
  if (!stages) fail(`Неизвестный конвейер в задаче: ${task.meta.pipeline}`);
  if (status && !STATUSES.includes(status)) fail(`--status: ${STATUSES.join(', ')}.`);
  const done = stage === 'done' || status === 'done';
  if (stage !== 'done' && !stages.some(([id]) => id === stage)) {
    fail(`Этап ${stage} не из конвейера ${task.meta.pipeline}: ${stages.map(([id]) => id).join(', ')}, done.`);
  }
  const meta = { ...task.meta, stage: stage === 'done' ? stages.at(-1)[0] : stage, status: done ? 'done' : status ?? 'open', updated: now() };
  const body = replaceSection(task.body, 'Этапы', () => stageLines(meta.pipeline, meta.stage, done));
  writeFileSync(task.path, render(meta, body));
  return meta;
}

export function addNote(cwd, slug, section, text) {
  const heading = SECTIONS[String(section ?? '').toLowerCase()];
  if (!heading) fail(`Раздел: ${Object.keys(SECTIONS).slice(0, 5).join(', ')}.`);
  if (!text) fail('Нужен текст заметки.');
  const task = load(cwd, slug);
  const line = `- ${text.replace(/\s*\n\s*/g, ' ')}`;
  const body = replaceSection(task.body, heading, (content) => (content === EMPTY || !content ? line : `${content}\n${line}`));
  writeFileSync(task.path, render({ ...task.meta, updated: now() }, body));
}

export function listTasks(cwd, { open = false } = {}) {
  const dir = tasksDir(cwd);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith('.md'))
    .map((name) => ({ slug: name.slice(0, -3), ...parseTask(readFileSync(join(dir, name), 'utf8')).meta }))
    .filter((t) => !open || t.status === 'open' || t.status === 'blocked')
    .sort((a, b) => String(b.updated ?? '').localeCompare(String(a.updated ?? '')));
}

export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--open') flags.open = true;
    else if (arg.startsWith('--')) flags[arg.slice(2)] = argv[(i += 1)];
    else positional.push(arg);
  }
  return { positional, flags };
}

function main(argv, cwd) {
  const { positional: [command, slug, ...rest], flags } = parseArgs(argv);
  if (command === 'new') {
    console.log(`Создано: ${newTask(cwd, slug, flags)}`);
  } else if (command === 'stage') {
    const meta = setStage(cwd, slug, rest[0], flags.status);
    console.log(`${slug}: этап ${meta.stage}, статус ${meta.status}`);
  } else if (command === 'note') {
    addNote(cwd, slug, rest[0], rest.slice(1).join(' '));
    console.log(`${slug}: записано в «${SECTIONS[rest[0].toLowerCase()]}»`);
  } else if (command === 'list') {
    const tasks = listTasks(cwd, { open: Boolean(flags.open) || slug === '--open' });
    if (!tasks.length) console.log('Задач нет.');
    for (const t of tasks) console.log(`${t.slug}\t${t.pipeline}\t${t.stage}\t${t.status}\t${t.title}`);
  } else if (command === 'show') {
    process.stdout.write(readFileSync(load(cwd, slug).path, 'utf8'));
  } else {
    console.error('Команды: new, stage, note, list, show. Подробности в начале task.mjs.');
    return 2;
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    process.exitCode = main(process.argv.slice(2), process.cwd());
  } catch (error) {
    if (!error.userError) throw error;
    console.error(error.message);
    process.exitCode = 1;
  }
}
