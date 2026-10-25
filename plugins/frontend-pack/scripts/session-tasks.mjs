#!/usr/bin/env node
// SessionStart hook: if the project has unfinished frontend tasks in .frontend/tasks, print a short summary
// so the agent offers to continue them through the `frontend` skill. Silent when there are none.
// Never blocks a session: any error exits 0 without output. Disable with MDIGITAL_TASKS_HOOK=off.
import { readFileSync } from 'node:fs';
import { listTasks } from './task.mjs';

const SHOWN = 3;

export function summary(cwd) {
  const tasks = listTasks(cwd, { open: true });
  if (!tasks.length) return '';
  const lines = [`Незавершённые frontend-задачи в этом проекте (.frontend/tasks), ${tasks.length}:`];
  for (const t of tasks.slice(0, SHOWN)) lines.push(`- ${t.slug}: этап ${t.stage}, статус ${t.status} — ${t.title}`);
  const more = tasks.length > SHOWN ? `, ещё ${tasks.length - SHOWN} в \`task.mjs list --open\`` : '';
  lines.push(
    `Предложи пользователю продолжить${more}: скилл frontend (frontend-pack:frontend), сначала прочитай файл задачи.`,
  );
  return `${lines.join('\n')}\n`;
}

if (process.env.MDIGITAL_TASKS_HOOK !== 'off') {
  try {
    let payload = {};
    try {
      payload = JSON.parse(readFileSync(0, 'utf8') || '{}');
    } catch {
      payload = {};
    }
    // Exit 0 with plain stdout: Claude Code (and Codex) add it to the session context.
    process.stdout.write(summary(payload?.cwd ?? process.cwd()));
  } catch {
    // A broken task file must not break the session start.
  }
}
