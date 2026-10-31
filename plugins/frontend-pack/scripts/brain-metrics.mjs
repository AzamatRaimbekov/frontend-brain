#!/usr/bin/env node
// Metrics of the frontend brain: health of the repository, usage from the task files of projects,
// and proposals ("Предложения") that name the file to change.
// Usage:
//   node brain-metrics.mjs [--projects <dir...>] [--json] [--today YYYY-MM-DD] [--plugin <plugin dir>]
// --projects reads <dir>/.frontend/tasks/*.md (format: skills/frontend/references/task-file.md).
// Pure Node 18+, no dependencies.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, relative, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AREAS } from './knowledge.mjs';
import { PIPELINES, parseTask } from './task.mjs';

const PLUGIN = join(dirname(fileURLToPath(import.meta.url)), '..');
const DAY = 86_400_000;
export const LIMITS = { entryDays: 180, sourceDays: 90, watchDays: 14, skillLines: 300, areaTasks: 2, areaEntries: 1, blockedAtStage: 2, repeatedNote: 2, pipelinesMinTasks: 5 };

// Which file to improve when a stage blocks often.
export const STAGE_OWNERS = {
  brief: 'skills/react-page-ux/SKILL.md', ux: 'skills/react-page-ux/SKILL.md',
  plan: 'agents/frontend-architect.md', 'approve-plan': 'skills/frontend/references/pipelines.md',
  code: 'agents/frontend-engineer.md', fix: 'agents/frontend-engineer.md', refactor: 'agents/frontend-engineer.md',
  checks: 'agents/frontend-engineer.md', 'failing-test': 'skills/react-testing/SKILL.md', reproduce: 'skills/react-testing/SKILL.md',
  review: 'agents/frontend-reviewer.md', scope: 'agents/frontend-reviewer.md', report: 'agents/frontend-reviewer.md',
  access: 'design-engine:agents/design-lead.md', draft: 'design-engine:agents/design-lead.md', 'approve-design': 'design-engine:agents/design-lead.md',
  spec: 'figma-pack:agents/figma-reader.md', 'design-qa': 'design-engine:agents/design-qa.md',
  requirements: 'skills/react-new-project/SKILL.md', scaffold: 'skills/react-new-project/SKILL.md', shell: 'skills/react-new-project/SKILL.md',
  handoff: 'skills/frontend/SKILL.md',
  tokens: 'skills/mbank-ui/SKILL.md',
  generate: 'skills/mbank-crm/SKILL.md',
};

// Task text -> knowledge areas. Crude stems on purpose: titles and goals are short Russian or English phrases.
export const AREA_WORDS = {
  'project-setup': ['новый проект', 'каркас', 'scaffold', 'vite', 'настро', 'setup'],
  architecture: ['структур', 'разб', 'рефактор', 'архитект', 'вынес', 'refactor', 'split'],
  data: ['api', 'запрос', 'query', 'эндпоинт', 'загрузк', 'данн', 'fetch', 'кэш'],
  ui: ['компонент', 'кнопк', 'верст', 'макет', 'figma', 'фигм', 'дизайн', 'таблиц', 'ui'],
  ux: ['ux', 'пуст', 'состоян загруз', 'тост', 'фильтр', 'пагинац'],
  forms: ['форм', 'валидац', 'поле', 'form', 'zod'],
  state: ['стор', 'zustand', 'url-состоян', 'state'],
  errors: ['ошибк', 'error', 'падени', 'не работает', 'баг', 'bug'],
  testing: ['тест', 'test', 'msw', 'e2e', 'playwright'],
  performance: ['скорост', 'производит', 'бандл', 'медлен', 'виртуал', 'performance'],
  a11y: ['доступн', 'a11y', 'клавиатур', 'скринридер'],
  security: ['токен', 'авториз', 'auth', 'логин', 'xss', 'csp', 'безопас'],
  i18n: ['перевод', 'i18n', 'язык', 'локализ'],
  tooling: ['линтер', 'eslint', 'ci', 'хук', 'сборк'],
  mobile: ['мобил', 'webview', 'expo', 'адаптив'],
};
const FAIL_WORDS = /(не прош|упал|падает|fail|❌|не пройден|вернул на доработку|returned|blocked|заблок|ошибк[аи] (tsc|eslint|линт|сборк))/i;
const ROUND = /(круг|раунд|round|итерац)\D{0,3}(\d+)/i;

const daysBetween = (a, b) => Math.floor((b - a) / DAY);
const lines = (file) => readFileSync(file, 'utf8').replace(/\n$/, '').split('\n').length;
const listDirs = (dir) => (existsSync(dir) ? readdirSync(dir).filter((n) => statSync(join(dir, n)).isDirectory()).sort() : []);
const listFiles = (dir, ext = '.md') => (existsSync(dir) ? readdirSync(dir).filter((n) => n.endsWith(ext) && !n.startsWith('_')).sort() : []);

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = {};
  if (!m) return meta;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].trim().startsWith('[') ? kv[2].trim().slice(1, -1).split(',').map((s) => s.trim()).filter(Boolean) : kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return meta;
}

const MONTHS = { january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12 };

/** Dates after "Checked", "Researched", "Read while writing", "Verified (against)", "Проверено": 2026-10-04, 2026-10, October 2026. */
export function checkedDates(text) {
  const out = [];
  const re = /(checked|researched|read while writing[^\n(]*|verified(?: against)?|проверено|сверено)[^\n\d]{0,20}?(\d{4}-\d{2}(?:-\d{2})?|[a-z]+ \d{4})/gi;
  for (const m of text.matchAll(re)) {
    const v = m[2].toLowerCase();
    const named = v.match(/^([a-z]+) (\d{4})$/);
    if (named && !MONTHS[named[1]]) continue;
    const iso = named ? `${named[2]}-${String(MONTHS[named[1]]).padStart(2, '0')}-01` : v.length === 7 ? `${v}-01` : v;
    if (!Number.isNaN(Date.parse(iso))) out.push(iso);
  }
  return out.sort();
}

function gitLastRelease(root) {
  const r = spawnSync('git', ['log', '-1', '--format=%ad%x09%s', '--date=short', '--', '.claude-plugin/marketplace.json'], { cwd: root, encoding: 'utf8' });
  if (r.status !== 0 || !r.stdout.trim()) return null;
  const [date, subject] = r.stdout.trim().split('\t');
  return { date, subject };
}

export function health(plugin, today) {
  const rel = (p) => relative(plugin, p);
  const skills = listDirs(join(plugin, 'skills'))
    .filter((s) => existsSync(join(plugin, 'skills', s, 'SKILL.md')))
    .map((s) => ({ name: s, lines: lines(join(plugin, 'skills', s, 'SKILL.md')) }));
  const agents = listFiles(join(plugin, 'agents')).map((f) => basename(f, '.md'));

  const kdir = join(plugin, 'knowledge');
  const entries = listDirs(kdir).flatMap((area) => listFiles(join(kdir, area)).map((f) => {
    const meta = frontmatter(readFileSync(join(kdir, area, f), 'utf8'));
    return { path: `knowledge/${area}/${f}`, area, type: meta.type ?? '?', stack: Array.isArray(meta.stack) ? meta.stack : [], updated: meta.updated ?? '', status: meta.status ?? 'active' };
  }));
  const active = entries.filter((e) => e.status !== 'deprecated');
  const count = (list, key) => list.reduce((acc, e) => { for (const v of [].concat(e[key])) acc[v] = (acc[v] ?? 0) + 1; return acc; }, {});
  const staleEntries = active
    .filter((e) => !e.updated || daysBetween(Date.parse(e.updated), today) > LIMITS.entryDays)
    .map((e) => ({ path: e.path, updated: e.updated || 'нет даты' }));

  // Dated source notes: every references/sources.md, plus "checked/verified" dates in SKILL.md files.
  const sources = [];
  for (const { name } of skills) {
    const files = [join(plugin, 'skills', name, 'references', 'sources.md'), join(plugin, 'skills', name, 'SKILL.md')].filter(existsSync);
    for (const file of files) {
      const dates = checkedDates(readFileSync(file, 'utf8'));
      if (!dates.length && !file.endsWith('sources.md')) continue;
      const checked = dates.at(-1) ?? null;
      sources.push({ path: rel(file), checked, ageDays: checked ? daysBetween(Date.parse(checked), today) : null });
    }
  }
  const staleSources = sources.filter((s) => s.ageDays === null || s.ageDays > LIMITS.sourceDays);
  const skillsWithoutSources = skills.filter((s) => !sources.some((x) => x.path.startsWith(`skills/${s.name}/`))).map((s) => s.name);

  const libsFile = join(plugin, 'rules', 'libraries.json');
  const libs = existsSync(libsFile) ? JSON.parse(readFileSync(libsFile, 'utf8')) : {};
  const libraries = Object.fromEntries(Object.entries(libs).filter(([, v]) => Array.isArray(v)).map(([k, v]) => [k, v.length]));

  const stateFile = join(plugin, 'rules', 'watch-state.json');
  const watchUpdated = existsSync(stateFile) ? JSON.parse(readFileSync(stateFile, 'utf8')).updated || null : null;

  const manifest = join(plugin, '.claude-plugin', 'plugin.json');
  const root = join(plugin, '..', '..');
  return {
    version: existsSync(manifest) ? JSON.parse(readFileSync(manifest, 'utf8')).version : null,
    lastRelease: existsSync(join(root, '.git')) ? gitLastRelease(root) : null,
    skills,
    agents,
    knowledge: {
      total: active.length,
      deprecated: entries.length - active.length,
      byArea: Object.fromEntries(AREAS.map((a) => [a, active.filter((e) => e.area === a).length])),
      byType: count(active, 'type'),
      byStack: count(active, 'stack'),
      emptyAreas: AREAS.filter((a) => !active.some((e) => e.area === a)),
      stale: staleEntries,
    },
    sources,
    staleSources,
    skillsWithoutSources,
    libraries,
    watchUpdated,
  };
}

/** Lines of one "## <heading>" section, without "_пока нет_". */
export function section(body, heading) {
  const start = body.indexOf(`\n## ${heading}\n`);
  if (start === -1) return [];
  const from = start + heading.length + 5;
  const next = body.indexOf('\n## ', from);
  return body.slice(from, next === -1 ? body.length : next).split('\n').map((l) => l.trim()).filter((l) => l && l !== '_пока нет_');
}

export function taskAreas(task) {
  if (task.meta.area) return [].concat(task.meta.area).filter((a) => AREAS.includes(a));
  const text = ` ${[task.meta.title, ...section(task.body, 'Цель'), ...section(task.body, 'Решения')].join(' ').toLowerCase()} `;
  return Object.entries(AREA_WORDS).filter(([, words]) => words.some((w) => (w.length <= 3 ? new RegExp(`[^a-zа-я]${w}[^a-zа-я]`).test(text) : text.includes(w)))).map(([a]) => a);
}

export function readTask(file, project) {
  const { meta, body } = parseTask(readFileSync(file, 'utf8'));
  const stageLines = section(body, 'Этапы').filter((l) => /^- \[[ x-]\]/.test(l));
  const checks = section(body, 'Проверки');
  const rounds = checks.concat(section(body, 'Решения')).map((l) => Number(l.match(ROUND)?.[2] ?? 0));
  const stages = PIPELINES[meta.pipeline] ?? [];
  const task = {
    project, slug: basename(file, '.md'), meta, body,
    pipeline: meta.pipeline || '?', status: meta.status || '?', stage: meta.stage || '?',
    stagesTotal: stageLines.length || stages.length,
    stagesDone: stageLines.filter((l) => l.startsWith('- [x]')).length,
    stagesSkipped: stageLines.filter((l) => l.startsWith('- [-]')).length,
    checks,
    failedGates: checks.filter((l) => FAIL_WORDS.test(l)).length,
    reviewRounds: Math.max(0, ...rounds),
    questions: section(body, 'Открытые вопросы'),
    updated: meta.updated || '',
  };
  task.reachedHandoff = task.status === 'done' || (stages.length > 0 && task.stage === stages.at(-1)[0]);
  task.areas = taskAreas(task);
  return task;
}

const normalizeNote = (l) => l.replace(/^- /, '').toLowerCase().replace(/[0-9]+/g, '#').replace(/[^\p{L}#\s]+/gu, ' ').replace(/\s+/g, ' ').trim();

export function usage(projectDirs, today) {
  const tasks = projectDirs.flatMap((dir) => {
    const tdir = join(dir, '.frontend', 'tasks');
    return listFiles(tdir).map((f) => readTask(join(tdir, f), dir));
  });
  const by = (key) => tasks.reduce((acc, t) => ({ ...acc, [t[key]]: (acc[t[key]] ?? 0) + 1 }), {});
  const blocked = tasks.filter((t) => t.status === 'blocked');
  const blockedByStage = blocked.reduce((acc, t) => ({ ...acc, [t.stage]: (acc[t.stage] ?? 0) + 1 }), {});
  const notes = new Map();
  for (const t of tasks) for (const l of new Set(t.checks.map(normalizeNote))) if (l.length > 8) notes.set(l, (notes.get(l) ?? 0) + 1);
  const areas = {};
  for (const t of tasks) for (const a of t.areas) areas[a] = (areas[a] ?? 0) + 1;
  const avg = (f) => (tasks.length ? Math.round((tasks.reduce((s, t) => s + f(t), 0) / tasks.length) * 10) / 10 : 0);
  return {
    projects: projectDirs.map((dir) => ({ dir, tasks: tasks.filter((t) => t.project === dir).length })),
    total: tasks.length,
    byPipeline: by('pipeline'),
    byStatus: by('status'),
    blocked: blocked.map((t) => ({ project: t.project, slug: t.slug, stage: t.stage, question: t.questions.at(-1) ?? '' })),
    blockedByStage,
    staleOpen: tasks.filter((t) => t.status === 'open' && t.updated && daysBetween(Date.parse(t.updated), today) > 14).map((t) => `${t.slug} (${t.stage})`),
    avgStagesDone: avg((t) => t.stagesDone),
    avgStagesShare: avg((t) => (t.stagesTotal ? t.stagesDone / t.stagesTotal : 0)),
    skippedStages: tasks.reduce((s, t) => s + t.stagesSkipped, 0),
    failedGates: tasks.reduce((s, t) => s + t.failedGates, 0),
    maxReviewRounds: Math.max(0, ...tasks.map((t) => t.reviewRounds)),
    handoffShare: tasks.length ? Math.round((tasks.filter((t) => t.reachedHandoff).length / tasks.length) * 100) : 0,
    byArea: areas,
    repeatedChecks: [...notes].filter(([, n]) => n >= LIMITS.repeatedNote).map(([note, n]) => ({ note, tasks: n })).sort((a, b) => b.tasks - a.tasks),
  };
}

export function proposals(h, u) {
  const out = [];
  const add = (why, action, file) => out.push({ why, action, file });
  for (const s of h.staleSources)
    add(s.checked ? `источники проверены ${s.checked}, ${s.ageDays} дн. назад (порог ${LIMITS.sourceDays})` : 'в файле источников нет даты проверки',
      'перепроверь ссылки и версии, обнови строку «Checked …»', s.path);
  for (const e of h.knowledge.stale) add(`статья не обновлялась с ${e.updated} (порог ${LIMITS.entryDays} дн.)`, 'проверь, актуальна ли; обнови `updated` или пометь deprecated', e.path);
  for (const a of h.knowledge.emptyAreas)
    if ((u?.byArea?.[a] ?? 0) < LIMITS.areaTasks) add(`в области ${a} нет ни одной статьи`, 'добавь первую статью, когда на проекте встретится тема (скилл frontend-contribute)', `knowledge/${a}/`);
  for (const s of h.skills.filter((x) => x.lines > LIMITS.skillLines))
    add(`SKILL.md ${s.name}: ${s.lines} строк (порог ${LIMITS.skillLines})`, 'вынеси подробности в references/, в SKILL.md оставь порядок действий', `skills/${s.name}/SKILL.md`);
  if (!h.watchUpdated) add('состояние наблюдения за источниками пустое', 'запусти brain-watch --update-state', 'rules/watch-state.json');
  else if (h.watchDays > LIMITS.watchDays) add(`за источниками не следили ${h.watchDays} дн.`, 'запусти скилл brain-update', 'rules/watch-state.json');
  if (!u) {
    add('нет данных об использовании', 'запусти метрики с --projects <папки проектов>, где есть .frontend/tasks', 'skills/brain-update/SKILL.md');
    return out;
  }
  if (!u.total) add('в переданных проектах нет файлов задач', 'проверь, что дирижёр ведёт .frontend/tasks (task.mjs new)', 'skills/frontend/SKILL.md');
  for (const [area, n] of Object.entries(u.byArea))
    if (n >= LIMITS.areaTasks && (h.knowledge.byArea[area] ?? 0) <= LIMITS.areaEntries)
      add(`задач в области ${area}: ${n}, статей: ${h.knowledge.byArea[area] ?? 0}`, 'собери из «Решений» этих задач статьи для базы знаний', `knowledge/${area}/`);
  for (const [stage, n] of Object.entries(u.blockedByStage))
    if (n >= LIMITS.blockedAtStage)
      add(`на этапе ${stage} заблокировано задач: ${n}`, 'разбери «Открытые вопросы» этих задач и дополни правила этапа', STAGE_OWNERS[stage] ?? 'skills/frontend/references/pipelines.md');
  for (const r of u.repeatedChecks)
    add(`одна и та же заметка в «Проверках» у ${r.tasks} задач: «${r.note}»`, 'сделай из неё правило скилла или хук, чтобы ловилось автоматически', 'hooks/hooks.json');
  if (u.maxReviewRounds >= 3) add(`до ${u.maxReviewRounds} кругов на воротах`, 'посмотри, что возвращали чаще всего, и добавь это в чек-лист исполнителя', 'agents/frontend-engineer.md');
  if (u.total >= LIMITS.pipelinesMinTasks)
    for (const p of Object.keys(PIPELINES).filter((p) => p !== 'small-edit' && !u.byPipeline[p]))
      add(`конвейер ${p} ни разу не выбран из ${u.total} задач`, 'проверь триггеры и таблицу выбора конвейера', 'skills/frontend/SKILL.md');
  if (u.total && u.handoffShare < 50) add(`до handoff дошло только ${u.handoffShare}% задач`, 'посмотри, где задачи останавливаются, и упрости этот этап', 'skills/frontend/references/pipelines.md');
  return out;
}

const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)];
const kv = (obj) => Object.entries(obj).map(([k, v]) => `${k} ${v}`).join(', ') || '—';

export function render({ health: h, usage: u, proposals: p, today }) {
  const out = [`# Метрики мозга фронтенда — ${today}`, '', '## Здоровье', ''];
  out.push(`- Версия плагина: ${h.version ?? '?'}${h.lastRelease ? `, последний релиз ${h.lastRelease.date} («${h.lastRelease.subject}»)` : ''}`);
  out.push(`- Скиллов: ${h.skills.length}, строк в SKILL.md: ${h.skills.reduce((s, x) => s + x.lines, 0)}; агентов: ${h.agents.length} (${h.agents.join(', ')})`);
  out.push(`- Статей в базе знаний: ${h.knowledge.total} (устаревших: ${h.knowledge.deprecated}); по типам: ${kv(h.knowledge.byType)}; по стекам: ${kv(h.knowledge.byStack)}`);
  out.push(`- Пустые области: ${h.knowledge.emptyAreas.join(', ') || 'нет'}`);
  out.push(`- Статей старше ${LIMITS.entryDays} дн.: ${h.knowledge.stale.length}; файлов источников старше ${LIMITS.sourceDays} дн. или без даты: ${h.staleSources.length} из ${h.sources.length}`);
  out.push(`- Скиллы без даты проверки источников: ${h.skillsWithoutSources.join(', ') || 'нет'}`);
  out.push(`- libraries.json: ${kv(h.libraries)}`);
  out.push(`- Наблюдение за источниками (watch-state): ${h.watchUpdated ?? 'не запускалось'}`, '');
  out.push(...table(['Скилл', 'Строк'], h.skills.map((s) => [s.name, s.lines])), '');
  out.push(...table(['Область', 'Статей'], Object.entries(h.knowledge.byArea).map(([a, n]) => [a, n])), '');
  out.push('## Использование', '');
  if (!u) out.push('Нет данных: передай `--projects <папки проектов>`.', '');
  else {
    out.push(`- Проекты: ${u.projects.map((x) => `${x.dir} (${x.tasks})`).join(', ')}`);
    out.push(`- Задач: ${u.total}; по конвейерам: ${kv(u.byPipeline)}; по статусам: ${kv(u.byStatus)}`);
    out.push(`- Этапов пройдено в среднем: ${u.avgStagesDone} (${Math.round(u.avgStagesShare * 100)}% конвейера); пропущено этапов: ${u.skippedStages}`);
    out.push(`- Дошли до handoff: ${u.handoffShare}%; проваленных ворот в «Проверках»: ${u.failedGates}; максимум кругов: ${u.maxReviewRounds}`);
    out.push(`- Заблокировано: ${u.blocked.length}${u.blocked.length ? ` — ${u.blocked.map((b) => `${b.slug} на ${b.stage}${b.question ? ` (${b.question.replace(/^- /, '')})` : ''}`).join('; ')}` : ''}`);
    out.push(`- Открыты и не менялись больше 14 дн.: ${u.staleOpen.join(', ') || 'нет'}`);
    out.push(`- Задачи по областям: ${kv(u.byArea)}`, '');
  }
  out.push('## Предложения', '');
  if (!p.length) out.push('Нет: все пороги в норме.');
  else out.push(...table(['#', 'Почему', 'Что сделать', 'Файл'], p.map((x, i) => [i + 1, x.why, x.action, `\`${x.file}\``])));
  return `${out.join('\n')}\n`;
}

export function metrics({ plugin = PLUGIN, projects = [], today = new Date().toISOString().slice(0, 10) } = {}) {
  const now = Date.parse(today);
  const h = health(plugin, now);
  h.watchDays = h.watchUpdated ? daysBetween(Date.parse(h.watchUpdated), now) : null;
  const u = projects.length ? usage(projects, now) : null;
  return { today, health: h, usage: u, proposals: proposals(h, u) };
}

export function parseArgs(argv) {
  const opts = { json: false, projects: [], plugin: PLUGIN, today: undefined };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json') opts.json = true;
    else if (a === '--projects') while (argv[i + 1] && !argv[i + 1].startsWith('--')) opts.projects.push(argv[++i]);
    else if (a === '--plugin' || a === '--today') {
      if (!argv[i + 1]) return { error: `${a} needs a value` };
      opts[a.slice(2)] = argv[++i];
    } else return { error: `unknown argument ${a}` };
  }
  if (opts.today && (!/^\d{4}-\d{2}-\d{2}$/.test(opts.today) || Number.isNaN(Date.parse(opts.today)))) return { error: '--today must be YYYY-MM-DD' };
  const missing = opts.projects.filter((d) => !existsSync(d));
  if (missing.length) return { error: `no such project dir: ${missing.join(', ')}` };
  return opts;
}

function main(argv) {
  const opts = parseArgs(argv);
  if (opts.error) {
    console.error(`${opts.error}\nusage: brain-metrics.mjs [--projects <dir...>] [--json] [--today YYYY-MM-DD] [--plugin <dir>]`);
    return 2;
  }
  const result = metrics(opts);
  console.log(opts.json ? JSON.stringify(result, null, 2) : render(result));
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exitCode = main(process.argv.slice(2));
