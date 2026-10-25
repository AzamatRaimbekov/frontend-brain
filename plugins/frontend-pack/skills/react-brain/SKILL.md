---
name: react-brain
description: Mandatory React frontend standards for writing, editing, refactoring, or reviewing React, Next.js, and other web UI code. Routes every change through applicable Vercel React Best Practices and Web Interface Guidelines while preserving the project's stack and Mdigital frontend rules.
---

# React Brain

Use this skill for every React, Next.js, or other web UI implementation, refactor, and review. Apply every relevant Web Interface Guideline to visible UI, and every applicable Vercel rule to React/Next.js code. Treat each applicable rule as a requirement: do not silently skip one. Rules whose preconditions do not exist in the changed code are not applicable; do not add complexity just to demonstrate a rule.

When running in Codex, first read [Codex integration](../../references/codex.md).

## Before writing code

1. Inspect the existing framework, React version, rendering model, libraries, and local `AGENTS.md`. Preserve the project's architecture and data layer.
2. Read [Vercel's rule index](references/vercel-react-best-practices/SKILL.md). Select the rules that match the change and read those individual files under `references/vercel-react-best-practices/rules/`. Start with critical rules when their conditions apply:
   - async work and request dependencies: `async-*`;
   - imports, initial bundle, lazy loading: `bundle-*`;
   - React Server Components, server actions, serialization, server cache: `server-*`;
   - client requests, listeners, browser storage: `client-*`;
   - hooks, state updates, subscriptions, memoization: `rerender-*`;
   - rendering, hydration, scripts, SVG: `rendering-*`;
   - repeated JavaScript work and data structures: `js-*`;
   - stable callbacks and one-time initialization: `advanced-*`.
3. For visible interface changes, read [Web Interface Guidelines](references/web-interface-guidelines.md). Keep its full checklist in scope through implementation and review.
4. Load only the relevant skills from frontend-pack for UX, architecture, UI, data fetching, error handling, and project setup. Their project-specific rules remain authoritative for libraries, file layout, naming, and limits.
5. Search the team [knowledge base](../../knowledge/INDEX.md) for the change's area and stack (`node <plugin-root>/scripts/knowledge.mjs search <words> --stack <stack>`) and apply matching entries. A skill wins over an entry when they conflict.
6. When a task uses shadcn/ui, also follow the bundled [shadcn skill](../shadcn/SKILL.md). Read the app's components.json and use the actual installed component APIs, base library, aliases, paths, and project CLI configuration.

## Mdigital overrides of Vercel rules

`rules/libraries.json` and the Mdigital skills win over the vendored rules. These Vercel rules are replaced, not applied as written:

- `client-swr-dedup`: SWR is forbidden. Get deduplication and caching from TanStack Query `queryOptions` (`react-data-fetching`).
- `rerender-memo`, `rerender-memo-with-default-value`, `rerender-simple-expression-in-memo`: with React Compiler on, do not add `memo`/`useMemo`/`useCallback` in new code; without it, memoize only for a measured problem or a required stable reference (`react-architecture` section 10). The non-memo idea in these rules (early return before expensive work, splitting a component) still applies.
- `bundle-barrel-imports`: applies to third-party packages and `shared/` (no barrels there). A feature's `index.ts` with explicit named re-exports stays the required public API (`react-architecture`); never `export *`.

## During implementation

- Satisfy every applicable Vercel rule and interface guideline as the code is written. Prefer the smallest change that meets the rule and the user's request.
- Check the rule's context and prerequisites before applying it. For example, do not introduce SWR into a project standardized on TanStack Query, use server-only patterns in a client-only app, or add memoization for work that is already cheap.
- If a guideline conflicts with the user's explicit requirement, framework support, an established project convention, or a higher-priority Mdigital rule, preserve the higher-priority constraint and record the specific conflict for the final report.
- For a new project, put the project's durable React standards in its `AGENTS.md`, in addition to following this skill during the current task.

## Before finishing

- Review every changed React/UI file against all selected Vercel rules and the applicable Web Interface Guidelines. Fix findings before finishing.
- For visible UI, verify the changed flows and responsive states using the available browser or project checks. Follow `react-page-ux` for new or substantially redesigned pages.
- Run the relevant project checks when available. Report any applicable rule that remains unmet, why it could not be resolved, and the affected file and line. Do not claim compliance based only on having loaded this skill.
- For a requested standalone review, use the concise, file-grouped output format in the Web Interface Guidelines reference.

## Source

The Vercel rule set is vendored from [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills/tree/063bee94c3f4df8453406c830b0a7df0f2860278/skills/react-best-practices), pinned at commit `063bee94c3f4df8453406c830b0a7df0f2860278`. Its original `SKILL.md`, compiled `AGENTS.md`, metadata, and individual rule files are kept under `references/vercel-react-best-practices/`.
