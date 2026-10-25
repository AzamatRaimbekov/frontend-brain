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

const TASK = /(страниц|экран|компонент|сверста|вёрст|верст|форм[аыу]|кнопк|модалк|таблиц|дашборд|личн\w* кабинет|фронт|интерфейс|ui\b|ux\b|стил|адаптив|тёмн\w* тем|темн\w* тем|макет|фигм|figma|react|next\.?js|vite|tanstack|shadcn|tailwind|tsx|page|screen|component|layout|frontend)/;
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
if (!isFrontendProject(cwd) && !STACK.test(prompt)) process.exit(0);

// Exit 0 with plain stdout: Claude Code adds it to the context of this prompt.
process.stdout.write(
  'Frontend task detected (frontend-pack). Start with the `frontend` skill (frontend-pack:frontend): ' +
    'announce the route line it defines, load only the skills it routes to, and finish with its checks.\n',
);
