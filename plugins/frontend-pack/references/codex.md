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

The Claude agents are reusable procedures in Codex:

- For a whole task end to end, follow `agents/frontend-engineer.md` as the procedure.
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
