#!/usr/bin/env node
// UserPromptSubmit hook: when a prompt is a frontend task, remind the agent to enter through the
// `frontend` skill instead of hoping the skill description gets matched. Silent for everything else.
// Fires when the prompt has frontend words and either the project depends on React/Next/Vite or the
// prompt names the stack itself. Disable with MDIGITAL_FRONTEND_AUTOSTART=off.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

if (process.env.MDIGITAL_FRONTEND_AUTOSTART === 'off') process.exit(0);

let payload;
try {
  payload = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
const prompt = String(payload?.prompt ?? '').toLowerCase();
if (!prompt || /\$frontend|frontend-pack:|\/frontend\b/.test(prompt)) process.exit(0);

const TASK = /(страниц|сайт|лендинг|веб-?|web|website|landing|калькулятор|виджет|экран|компонент|сверста|вёрст|верст|форм[аыу]|кнопк|модалк|таблиц|дашборд|личн\w* кабинет|фронт|интерфейс|ui\b|ux\b|стил|адаптив|тёмн\w* тем|темн\w* тем|макет|фигм|figma|react|next\.?js|vite|tanstack|shadcn|tailwind|tsx|page|screen|component|layout|frontend|вебвью|webview|мини-?приложен|нов[а-яё]* проект|new project|создай проект|заведи проект|срм|црм|crm|админк)/;
const STACK = /(react|next\.?js|vite|tanstack|shadcn|tailwind|tsx|фронт|frontend)/;
if (!TASK.test(prompt)) process.exit(0);

function isFrontendProject(dir) {
  const file = join(dir, 'package.json');
  if (!existsSync(file)) return false;
  try {
    const pkg = JSON.parse(readFileSync(file, 'utf8'));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    return ['react', 'next', 'vite'].some((name) => name in deps);
  } catch {
    return false;
  }
}
const cwd = payload?.cwd ?? process.cwd();
// Backend-only projects (no React/Next/Vite) stay quiet unless the prompt names the stack; everywhere else
// (a frontend project or a folder with no package.json yet) a UI task goes through the brain.
const NOT_FRONTEND = /(бэкенд|backend|сервер|server|api endpoint|миграци|sql|docker|1с|1c)/;
const hasPackage = existsSync(join(cwd, 'package.json'));
if (hasPackage && !isFrontendProject(cwd) && !STACK.test(prompt)) process.exit(0);
if (!hasPackage && NOT_FRONTEND.test(prompt) && !STACK.test(prompt)) process.exit(0);

// Mode: vibe (default, fast) or team (full pipelines). Project file .frontend/mode or MDIGITAL_FRONTEND_MODE.
function readMode(dir) {
  const env = String(process.env.MDIGITAL_FRONTEND_MODE ?? '').trim().toLowerCase();
  if (env) return env === 'team' ? 'team' : 'vibe';
  try {
    return /\bteam\b/i.test(readFileSync(join(dir, '.frontend', 'mode'), 'utf8')) ? 'team' : 'vibe';
  } catch {
    return 'vibe';
  }
}
const PROCESS = /(до mr|до мр|merge request|по процессу|с ревью|возьми задачу|как для прода|jira|тикет)/;
const mode = readMode(cwd) === 'team' || PROCESS.test(prompt) ? 'team' : 'vibe';
// A new project: ask the four intake questions first (skill frontend, «Новый проект: сначала вопросы»).
const NEW_PROJECT = /(нов[а-яё]*\s+(?:[а-яёa-z-]+\s+){0,2}(?:проект|срм|црм|crm|админк|вебвью|webview)|new (?:\w+ )?project|с нуля|from scratch|заведи проект|создай проект|запусти[а-яё]* (?:\S+ )?проект)/;
const NAMED_KIND = /(вебвью|webview|мини-?приложен|срм|црм|crm|админк|лендинг|landing|next\.?js)/;
const picker = NEW_PROJECT.test(prompt)
  ? `New project: before creating anything ask the person in ONE AskUserQuestion call: ${NAMED_KIND.test(prompt) ? '' : 'kind (CRM/admin, Mbank WebView, other site), '}what it is about, which sections/screens first, data/API (backend, Swagger or mocks); skip what the message already says. Then create it from the team template (CRM: new-crm.mjs, WebView: new-webview-service.mjs), build the named screens, start and open it. `
  : '';
const route =
  mode === 'vibe'
    ? 'Mode vibe (default): pages, forms, components and features go by pipeline `vibe` - a 5-line UX.md without waiting, ' +
      'code in this session, no task file, no agents, no plan approval; then tsc + lint, a browser look and a 3-5 line report. '
    : 'Mode team: use the full pipelines (feature, refactor, review, handoff) with the task file and agents. ';

// Exit 0 with plain stdout: Claude Code adds it to the context of this prompt.
process.stdout.write(
  'Frontend task detected (frontend-pack). Your FIRST tool call is the Skill tool with skill "frontend-pack:frontend" - ' +
    'before Bash, create-vite or any file: a hook blocks writing frontend code until that skill is loaded. ' +
    'announce the route line it defines, load only the skills it routes to, and finish with its checks. ' +
    route +
    picker +
    'Interface text follows ui-copy: only blocks from the task, no subtitles or descriptions without data, one primary button on the right.\n',
);
