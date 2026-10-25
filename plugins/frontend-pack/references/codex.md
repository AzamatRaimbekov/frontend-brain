# Using frontend-pack in Codex

For every React, Next.js, or web UI implementation, edit, refactor, or review,
load skills/react-brain/SKILL.md before changing code. Follow every applicable
Vercel React Best Practice and Web Interface Guideline selected by that skill,
then review the changed files before finishing. Applicability is based on the
code and runtime; never add an irrelevant library or pattern just to check a
box. Preserve the project's stack and Mdigital standards when they define a
more specific choice.

The plugin root is two directories above a skill's `SKILL.md`. Resolve package
paths from that root, including `rules/libraries.json`, `scripts/`, `agents/`
and sibling `skills/<name>/SKILL.md`; references inside a skill remain relative
to that skill. Read only the standards relevant to the current task.

Codex can select these skills automatically or through an explicit skill
mention. To load another standard, read its `SKILL.md` directly if a Skill tool
is unavailable.

When creating a project, write its instructions to `AGENTS.md`. Preserve any
existing project instructions and the user's chosen stack and scope.

The `frontend` skill is the conductor: it picks a pipeline per task type and
runs its stages with gates (`skills/frontend/references/pipelines.md`). In
Claude Code it launches the agents with the Agent tool; in Codex keep the same
pipelines, stages, gates and human approvals, and run each agent file as a
procedure in the current session, one stage after another (no parallel
worktree part unless the session can delegate).

The Claude agents are reusable procedures in Codex:

- For the code stage of a pipeline, follow `agents/frontend-engineer.md` as the procedure.
- For the `figma` pipeline, use `agents/design-lead.md` to check gates and name
  the next stage; it never runs the stages itself.
- For a large page or feature, read `agents/frontend-architect.md` and produce
  its file plan in the current session.
- Before finishing implementation, read `agents/frontend-reviewer.md` and
  perform its review on the changed files in the current session.

Ignore the Claude agent's `model` and `tools` metadata and its instructions for
finding a Claude installation. Do not require named agents or a Claude Skill
tool. Delegate only when the session permits it and it benefits the task.

Use the browser capability available in the session for visual verification.
If none is available, follow the page skill's test fallback and report which
visual checks were not performed.

The Codex manifest uses `hooks/codex-hooks.json`: its adapter translates
`apply_patch` events into the existing UX-brief, file-size and ESLint checks; a `UserPromptSubmit` hook reminds the agent to start with `$frontend` on frontend tasks. Hooks run
only when enabled and trusted in Codex; installing a skill alone does not
prove that a hook ran. File writes through other tools still need the checks
specified by the skills. Before finishing, run:

```sh
node <plugin-root>/scripts/check-file-size.mjs <changed-component-paths>
npx eslint <changed-files>
```

Respect the existing exception for legacy oversized files that did not grow,
and verify that each new page has its `UX.md` alongside it. Follow the same
checks manually when hooks are unavailable.

Task memory works the same in Codex: the conductor keeps
`.frontend/tasks/<slug>.md` in the project with
`node <plugin-root>/scripts/task.mjs` (see
`skills/frontend/references/task-file.md`). `hooks/codex-hooks.json` also
registers a `SessionStart` hook (`scripts/session-tasks.mjs`) that lists open
or blocked tasks at session start; disable it with `MDIGITAL_TASKS_HOOK=off`.
If your Codex build does not run `SessionStart` hooks, or hooks are not
trusted, run `node <plugin-root>/scripts/task.mjs list --open` yourself when
the user asks to continue a task.
