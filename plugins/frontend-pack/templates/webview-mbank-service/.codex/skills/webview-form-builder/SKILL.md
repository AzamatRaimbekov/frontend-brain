---
name: webview-form-builder
description: Use when designing, reviewing, planning, or debugging forms in MBANK WebView projects, including simple submit forms, multi-step editable/autosave forms, validation, API errors, Redux form state, react-hook-form forms, file upload, masks, dirty state, and submit behavior.
---

# WebView Form Builder

Use this skill for WebView form architecture, requirements, UX behavior, and implementation planning.

## First Steps

1. Read `AGENTS.md`.
2. Read root `AGENT_FEEDBACK.md` when it exists. Apply its recurring feedback unless the current user request, its approval boundaries, or `AGENTS.md` says otherwise.
3. Read `docs/webview-app-builder/references/forms-best-practices.md`.
4. If API errors are involved, read `docs/webview-app-builder/references/api-error-handling.md`.
5. If navigation/exit behavior is involved, read `docs/webview-app-builder/references/navigation-best-practices.md`.
6. If UI component behavior is involved, read:
   - `docs/webview-app-builder/references/ui-best-practices.md`
   - `docs/webview-app-builder/references/ui-component-inventory.md`

## Classify The Form

Identify whether the form is:

- **Simple submit-form**: user fills fields, submits once, flow continues or ends.
- **Multi-step editable/autosave-form**: the feature hook restores the RHF draft from Redux, uses `useWatch`/`watch` for the relevant fields, and may trigger debounced updates when the contract requires them.

If this is unclear, ask the user before planning implementation.

## Required Design Checks

- Define fields, required/optional rules, masks, disabled states, and submit behavior.
- Decide whether the form needs wizard/stepper.
- Define validation UX: errors under inputs and scroll to first error on submit/continue.
- Define API error mapping: field-level error vs message above submit button.
- Define dirty/exit behavior: allow exit, save, block, or show modal.
- Define loading behavior: disable submit and show loader icon.
- Define file upload flow: base64, presigned URL, or direct base64 PATCH.
- Define state strategy: local form state vs Redux keyed state.

## Reuse And Form Architecture

Before creating a form component, inspect `src/shared/ui` and the closest relevant module/page form pattern. Reuse an existing input, action, layout, or focused hook when it fits; do not recreate a local equivalent.

For new or materially changed forms, use this shape, adapting block names to the feature:

```text
src/modules/<Domain>/<Feature>/
  components/
    <Feature>Form/
      index.tsx
    <MeaningfulFieldsBlock>/
      index.tsx
    <SubmitActions>/
      index.tsx
  hooks/
    use<Feature>Form.ts
```

- The form root always renders one semantic `<form noValidate onSubmit={...}>`; never nest forms or replace this wrapper with a generic `div`.
- Put every meaningful visual/product block in its own `components/<Block>/index.tsx`. Do not split trivial markup merely to create files.
- Keep exactly one React component in each implementation file. If a block needs several components, keep its public root in `index.tsx` and place the others in separately named files. Do not define inline `Field`, `Section`, `Actions`, or other mini-components inside a parent component.
- `hooks/use<Feature>Form.ts` owns React Hook Form setup, API calls, submit handling, server-error mapping, dirty/autosave behavior, and other feature side effects. Components receive form values, handlers, and state through props or context, and render UI only.
- If one concern becomes independently complex, extract a focused supporting hook; keep `use<Feature>Form` as the feature-facing composition boundary rather than turning it into a god hook.
- Use `FormProvider` only when it meaningfully reduces prop drilling across real form blocks.

## Implementation Rules

- New forms use `react-hook-form`.
- Use `Controller` for shared UI inputs that are controlled or not register-friendly.
- Use explicit `defaultValues`.
- Use `setError` for field-level API errors.
- For autosave, use `useWatch`/`watch` in the feature hook and a `500ms` debounce through `src/shared/libs/debounce`.
- Store Redux form state by keys.
- Pull `initialState` from the smallest needed Redux slice to avoid unnecessary renders.
- Do not invent backend validation, file upload, or save contracts.
- For endpoint-specific API errors, mention skip notification and component-level handling.
- Keep global notification behavior; do not remove `queryErrorLogger` for form work.

## Common Masks

- Phone number.
- Vehicle plate number.
- Currency value.

Exact regex/format rules must be confirmed per project.

## Output Shape

For planning:

- Form type
- Reuse audit and selected shared components/patterns
- Proposed `components/` and sibling `hooks/` structure, including ownership of form behavior
- Fields and masks
- State strategy
- Validation rules
- API error handling
- Dirty/exit behavior
- Submit/loading behavior
- File upload behavior
- Open questions
- Verification plan

For review/debugging:

- What is wrong
- Likely cause
- Where to look
- Proposed fix
- How to verify

## Guardrails

- Do not migrate existing forms to `react-hook-form` unless explicitly asked.
- Do not use `antd Form` in new form code.
- Do not overuse Redux for simple forms that do not need shared editable state.
- Do not trigger autosave requests without debounce.
- Do not show technical backend errors directly to the user.
- Do not allow duplicate submit while loading.
