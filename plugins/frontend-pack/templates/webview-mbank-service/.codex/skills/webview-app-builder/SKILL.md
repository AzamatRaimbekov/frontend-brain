---
name: webview-app-builder
description: Use when reading the MBANK WebView knowledge base, answering questions about WebView rules, planning a WebView screen or flow, deciding which documentation applies, gathering requirements, or orienting the user on next steps in this React template/workbench.
---

# WebView App Builder

Use this skill as the main entrypoint for WebView knowledge, planning, and orientation in this template.

## Core Role

Act as the main entrypoint for a PM-friendly WebView workflow:

- read the right WebView docs;
- turn a supplied brief, design reference, and API contract into an implementation-ready plan;
- ask only questions that block a safe decision;
- classify the task;
- route UI, form, navigation, bridge, and debugging work to the relevant specialized skill;
- produce a clear plan with scope, assumptions, and verification;
- avoid runtime-code changes unless the user explicitly asks for implementation.

Before any edits, follow `AGENTS.md`: present the short plan and wait for the user's separate explicit approval.

## Always Start With

1. Read `AGENTS.md`.
2. Read root `AGENT_FEEDBACK.md` when it exists. It records recurring user feedback; apply it unless the current user request, its approval boundaries, or `AGENTS.md` says otherwise.
3. Read `docs/webview-app-builder/README.md`.
4. If the user asks about a bug, use `webview-debugger` or read `docs/webview-app-builder/references/debugging-playbook.md`.
5. If the user asks for planning, requirements, or a new screen, read the relevant docs below.

## Documentation Map

Read only the docs needed for the task:

- WebView context: `docs/webview-app-builder/references/webview-context.md`
- MBANK Bridge: `docs/webview-app-builder/references/mbank-webview-bridge.md`
- MBANK Bridge helper: `docs/webview-app-builder/references/mbank-bridge-helper.md`
- Legacy/auth/query flow: `docs/webview-app-builder/references/legacy-webview-integration.md`
- UI rules: `docs/webview-app-builder/references/ui-best-practices.md`
- UI page building: `docs/webview-app-builder/references/ui-page-building.md`
- UI component inventory: `docs/webview-app-builder/references/ui-component-inventory.md`
- Forms: `docs/webview-app-builder/references/forms-best-practices.md`
- Navigation: `docs/webview-app-builder/references/navigation-best-practices.md`
- API errors: `docs/webview-app-builder/references/api-error-handling.md`
- Debugging: `docs/webview-app-builder/references/debugging-playbook.md`
- Screen patterns: `docs/webview-app-builder/references/screen-patterns.md`
- Project/screen questions: `docs/webview-app-builder/references/project-questionnaire.md`
- Intake status: `docs/webview-app-builder/intake-questions.md`
- Agent model: `docs/webview-app-builder/agent-model.md`
- Template roadmap: `docs/webview-app-builder/template-roadmap.md`

## Task Classification

Classify the user request before answering:

- **Knowledge question**: answer from docs and cite relevant local docs.
- **Requirement gathering**: ask only the missing questions needed to proceed.
- **New screen/flow planning**: produce assumptions, required data, states, navigation, bridge/API needs, and implementation plan.
- **Page/UI implementation**: use `webview-ui-builder` for layout, shared UI composition, screen states, and page/module file structure.
- **Form work**: read forms docs and identify simple submit-form vs editable/autosave-form.
- **Bridge/native action**: read MBANK Bridge docs and identify event type, capability, payload, fallback, and Sentry/error handling.
- **API/error handling**: read API error docs and identify global notification vs inline error vs separate screen.
- **Bug/debugging**: use `webview-debugger`.
- **Template migration**: read template roadmap and confirm the user explicitly wants implementation.

## Output Shapes

For knowledge answers:

- short answer;
- relevant doc references;
- open questions if any.

For planning:

- goal;
- assumptions;
- only blocking questions;
- supplied and missing design/API inputs;
- relevant docs;
- proposed flow;
- states;
- data/API/bridge needs;
- risks;
- verification plan.

For implementation orientation:

- likely files;
- order of work;
- reuse audit: existing shared components and nearest module/page pattern that will be reused, or why none fits;
- proposed component and hook boundaries for new feature code;
- what not to touch;
- minimal checks.

## Reuse And Architecture Check

When code-aware planning or implementation is in scope:

- Inspect `src/shared/ui` and the nearest relevant `src/modules` and `src/pages` patterns before proposing a new component.
- Reuse an existing component, primitive, layout pattern, or hook when it fits instead of recreating it locally.
- Route form and page architecture to `webview-form-builder` and `webview-ui-builder`; their component and hook boundaries are part of the implementation plan.
- State the selected reuse and the resulting file ownership in the plan or implementation summary.

## Guardrails

- Do not invent MBANK bridge capabilities, API contracts, backend endpoints, or UI rules.
- Do not create additional skills or agents unless the user explicitly asks.
- Do not start React template migration unless the user explicitly asks.
- Keep confirmed knowledge in `docs/webview-app-builder/`.
- If information is missing, mark it as a question instead of guessing.
