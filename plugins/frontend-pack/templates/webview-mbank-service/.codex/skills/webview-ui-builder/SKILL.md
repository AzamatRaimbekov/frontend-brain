---
name: webview-ui-builder
description: Use when designing, planning, implementing, or reviewing MBANK WebView pages and UI flows in this React template, including page layout, 16px containers, bottom safe area actions, shared UI composition, screen states, page/module file structure, and react-hook-form based screens.
---

# WebView UI Builder

Use this skill to create WebView pages and UI flows in the current React template/workbench.

## First Steps

1. Read `AGENTS.md`.
2. Read root `AGENT_FEEDBACK.md` when it exists. Apply its recurring feedback unless the current user request, its approval boundaries, or `AGENTS.md` says otherwise.
3. Read `docs/webview-app-builder/references/ui-page-building.md`.
4. Read `docs/webview-app-builder/references/ui-best-practices.md`.
5. Read `docs/webview-app-builder/references/ui-component-inventory.md`.
6. If the page has a form, use `webview-form-builder` or read `docs/webview-app-builder/references/forms-best-practices.md`.
7. If the page changes route/header/back behavior, use `webview-navigation-builder` or read `docs/webview-app-builder/references/navigation-best-practices.md`.
8. If the page calls native actions, use `webview-bridge-builder` or read the bridge docs.
9. If the page consumes API data or handles errors, read `docs/webview-app-builder/references/api-error-handling.md`.

Only inspect runtime files after the task requires code-aware planning or implementation.

## Core Defaults

- New WebView pages use a 16px horizontal content container by default.
- Bottom actions account for safe area.
- Use the common header by default; custom in-page headers are rare and require a reason.
- Use existing shared UI components from `src/shared/ui`.
- Do not use `antd` or `antd-mobile` for new pages.
- New forms use `react-hook-form`, not `antd Form`.
- Do not create Storybook stories unless the user explicitly asks.

## Reuse-First Modular UI

Before creating new UI, inspect `src/shared/ui` and the nearest relevant `src/modules` and `src/pages` implementation. Reuse the existing component, primitive, layout, styling pattern, or focused hook when it fits; do not recreate it locally.

For a new or materially changed feature, keep page-level route wiring in `src/pages` and organize feature UI in sibling `components/` and `hooks/` directories when the feature owns behavior:

```text
src/modules/<Feature>/
  components/
    <MeaningfulBlock>/
      index.tsx
  hooks/
    use<Feature>.ts
```

- Extract meaningful visual or domain blocks into their own `components/<Block>/index.tsx`; do not extract trivial `div` wrappers solely to satisfy the structure.
- Each implementation file contains one React component. If a block needs several components, retain its public root in `index.tsx` and put the others in separately named files. Never add local inline React mini-components such as `Header`, `Section`, or `Actions` to a parent file; give a real block its own folder and file.
- Put feature behavior, side effects, and orchestration in a focused sibling hook instead of mixing it into a presentational component. Do not create a god hook: split independently complex concerns into focused hooks when necessary.
- For forms, `webview-form-builder` owns the stricter semantic-form and `use<Feature>Form` conventions.

## Screen Types

Classify the requested page before planning or editing:

- simple info screen;
- form screen;
- multi-step form;
- list/select screen;
- details/review screen;
- success/error/result screen;
- loading/empty/error API state screen.

If the type is unclear, infer the most likely type from the requested user journey and state the assumption.

## Page Planning Checklist

For every new page or flow, identify:

- route and route metadata;
- common header title/back/close behavior;
- content layout and 16px container needs;
- fixed or sticky bottom action needs;
- screen states: loading, empty, error, success, disabled, submitting;
- shared UI components to compose;
- API/RTK Query hooks and error handling;
- form fields, validation, and submit behavior if applicable;
- bridge/native actions and fallbacks if applicable;
- files to create or edit.

## Implementation Rules

- Follow existing `src/pages`, `src/modules`, and `src/shared` patterns before adding new structure.
- Keep page-level wiring in `src/pages` and reusable/domain UI in `src/modules` when the project pattern supports it.
- Use `src/shared/ui` only for reusable, domain-neutral components.
- Keep edits scoped to the requested page/flow.
- Do not invent API contracts, bridge capabilities, route names, or domain data.
- Prefer route-level metadata over one-off header logic.
- Use shared layout primitives or existing CSS/Tailwind patterns before introducing new wrappers.

## Output Shape

For planning:

- Screen type
- Assumptions
- Reuse audit: selected shared components and nearest implementation pattern, or why none fits
- Proposed `components/` and `hooks/` ownership for new feature code
- Layout
- Route/header behavior
- Components
- States
- Form/API/bridge needs
- Files to edit
- Open questions
- Verification plan

For implementation:

- Brief plan before edits
- Focused code changes
- Reused components/patterns and resulting component/hook structure
- Typecheck/lint/build as appropriate
- Short summary with changed files and verification

## Guardrails

- Do not start large template migration as part of a page task.
- Do not add `antd` usage to new code.
- Do not bypass safe-area handling for fixed bottom actions.
- Do not put business-specific components into `src/shared/ui`.
- Do not ask many questions when a reasonable template default applies.
