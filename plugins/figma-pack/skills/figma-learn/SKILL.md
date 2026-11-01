---
name: figma-learn
description: Studies all of the team's Figma files through the Figma REST API (personal access token in env) and turns them into what the agents build from - spec@1 screen templates per archetype (list, record card, form, dashboard, login, wizard, board) for figma-spec, real composition rules for mbank-figma-patterns, knowledge drafts for the frontend brain, the kit backlog (Figma components without code, local one-offs, detached instances) and a dev-readiness report per file for designers (auto layout, variables, instances, Ready for dev, names). Incremental crawl with a cache outside the repo. Use when new team files appear, once a month, before a kit planning session, or when asked "изучи наши макеты", "проанализируй фигму", "обучи на наших макетах", "какие экраны у нас рисуют", "готовы ли макеты к разработке", "что в ките не хватает", "study our Figma files", "learn from our designs", "dev-readiness report".
---

# figma-learn: learn from all our Figma files

The agents build better when they copy what our designers actually draw. This skill reads every file the token can see, finds the screen archetypes and how they are composed, and turns that into templates, rules and backlog items. It never writes to Figma and never edits other plugins: it produces drafts that a person reviews.

Script: `<plugin-root>/scripts/figma-learn.mjs` (Node 18+, no dependencies). Designer guide to the checks: [references/ready-for-dev.md](references/ready-for-dev.md).

## When to run

- New files or a new project in the team (crawl is incremental: unchanged files are skipped).
- Monthly, as part of the frontend brain update (`frontend-pack:brain-update` lists it as a step, if both plugins are installed).
- Before planning kit work (which components lack code, which local components designers keep re-creating).
- When a designer asks "is this file ready for dev?" - `crawl --file <url>` + `analyze`.

## Token setup (once per person)

The REST API needs a **personal access token**; the Figma MCP (OAuth) does not expose a team crawl.

1. Figma → avatar → **Settings → Security → Personal access tokens → Generate new token**.
2. Expiration: the shortest that fits (90 days). Scopes, read only: `file_content:read`, `file_metadata:read`, `projects:read`, `library_content:read`. Nothing with write.
3. Store it in the shell profile or a password-manager CLI, **never** in chat, the repo, `.env` files that get committed, or a command line argument:

   ```bash
   export FIGMA_ACCESS_TOKEN="$(security find-generic-password -s figma-pat -w)"   # macOS Keychain example
   ```

4. The account behind the token needs view access to the team (crawl) or the file (`--file`). A Dev or View seat is enough for reading.

The script reads the token from `FIGMA_ACCESS_TOKEN` only, sends it only in the `X-Figma-Token` header to `api.figma.com`, refuses `--token`, and never prints or caches it. If the user pastes a token into chat: do not use or repeat it, tell them to revoke it in Figma and create a new one stored as above.

## Commands

```bash
FL=<plugin-root>/scripts/figma-learn.mjs
node $FL crawl --team <team id or figma.com/files/team/... URL> [--project <id|name>] [--since 2026-10-01] [--force]
node $FL crawl --file <file key or figma.com/design/... URL> [--team <id>]   # one file, view access is enough
node $FL analyze   --team <id> [--map <design-engine>/references/components-map.json]
node $FL templates --team <id> [--min 2] [--dry-run] [--out <dir>]
node $FL learn     --team <id> [--author <github login>] [--out <dir>]
node $FL all       --team <id>                                       # crawl + analyze + templates (dry run) + learn
```

| Command | What it does | Output |
|---|---|---|
| `crawl` | `GET /v1/teams/:id/projects`, `/v1/projects/:id/files`, per file `/v1/files/:key?depth=3` (pages, sections, top frames), screen frames via `/v1/files/:key/nodes` in batches of 25, `/components`, `/component_sets`, `/styles`. Incremental by `last_modified` (`state.json`); 429 waits `Retry-After`, 5xx backs off; 2 files at a time; one failed file does not stop the crawl. `--max-frames` (80) caps screens per file. | `~/.cache/figma-learn/<team>/files/<key>/*.json` (`$FIGMA_LEARN_CACHE` moves it; single files go to `files/`) |
| `analyze` | Pages and sections; screen frames by width (mobile < 600 ≤ tablet < 1024 ≤ desktop); archetype per frame from layer names, component names and texts; screens grouped by `<Flow> / <Screen>` with their states and widths; component usage by key against `mbank-design-system` `catalog.json` and, when given, the design-engine components map (mapped / partial / missing / local / unknown, detached copies); token hygiene (colours, texts, spacing, radius not bound to variables or styles; raw hex with the nearest 2.theme token); dev-readiness 0-100 per file; kit backlog. | `report.json`, `report.md` in the cache folder |
| `templates` | Per archetype: the most common block structure among default desktop frames → a spec@1 file validated by `builder/core/spec.js`. Columns typed from header texts (`Сумма` → `money`), states and widths from the screen group, `empty` texts from the empty frame. Archetypes without real screens come from `builder/examples/credit-crm.spec.json`. | `builder/templates/<archetype>.spec.json` |
| `learn` | Knowledge drafts in the frontend-pack format (frontmatter checked by the same rules as `knowledge.mjs check`) and `learned-patterns.md` (structures, block pairs, grid and paddings with token names, states, naming), every line with evidence: files and frame count. | `<cache>/learn/knowledge/<area>/*.md`, `<cache>/learn/learned-patterns.md` |

The components map is found by `--map`, `$FIGMA_LEARN_COMPONENTS_MAP`, `$DESIGN_ENGINE_DIR`, or the newest installed `design-engine` plugin; without it, code status comes from `catalog.json`.

## Where results go

| Result | Goes to | How |
|---|---|---|
| `builder/templates/*.spec.json` | `figma-spec` | starting point for a new spec: copy the archetype's screen, rename, adjust. Review the diff before committing: real copy from our files lands in the repo. |
| `learned-patterns.md` | `mbank-figma-patterns/references/learned-patterns.md` | a person reads it, drops wrong claims, commits. Rules that contradict `crm-screen.md` are discussed with the designers, not merged silently. |
| knowledge drafts | frontend-pack `knowledge/<area>/` | through `frontend-pack:frontend-contribute` (one PR, author = the person who reviewed). Never copied by a script into another plugin. |
| kit backlog (`report.md` → «Бэклог кита») | design-engine `components-map.json` | `code-missing` / `code-partial` → code component work; `local-reused` → propose to the kit; `detached` → find what the kit could not do. |
| per-file dev-readiness | designers | send each owner their file's block from `report.md` and [references/ready-for-dev.md](references/ready-for-dev.md). |

## Steps for the agent

1. Check `FIGMA_ACCESS_TOKEN` is set (`[ -n "$FIGMA_ACCESS_TOKEN" ] && echo set`), never echo the value. Not set → give the user the token setup above and stop.
2. Ask for the team id (or a file URL) if not given. Run `crawl`, then `analyze`. Show the summary: files, screens, archetypes, average score, top 5 of the kit backlog, the three lowest-scoring files.
3. Run `templates --dry-run`, show which archetypes changed. Write them only after the user agrees; then `git diff builder/templates` with them.
4. Run `learn`. Show the drafts' titles and the evidence lines; do not commit them yourself. Offer: patterns → this plugin (review), knowledge → `frontend-pack:frontend-contribute`, backlog → design-engine owner.
5. Nothing is pushed or published by this skill.

## Limits (say them in the report)

- Archetypes and blocks come from names and component usage: a file with `Frame 12` everywhere classifies as `other`. The fix is in the file (see ready-for-dev.md), not in the heuristics.
- REST has no "detached" flag: a frame is counted as detached when it carries a kit component's name or `(detached)`.
- Variables are seen as bound/unbound only; their names need Enterprise (`variables:read`), so hygiene reports the nearest token by value.
- Branches are not crawled; only the main file.
- Shipped templates are seeded from the test fixtures and the credit-crm example; the first real crawl replaces them.

## Report

```
figma-learn: команда <id> — файлов <n> (скачано <n>, без изменений <n>, ошибок <n>), экранов <n>
Типы экранов: list <n>, record <n>, form <n>, dashboard <n>, login <n>, ...
Готовность к разработке: в среднем <n>/100; ниже 60: <файлы>
Бэклог кита: <топ-5>
Шаблоны: <изменены / без изменений>; черновики знаний: <n>; learned-patterns.md: <путь>
```
