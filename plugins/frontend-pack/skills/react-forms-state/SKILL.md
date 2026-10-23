---
name: react-forms-state
description: Mdigital rules for complex forms and client state in React 19 + TypeScript - multi-step wizards, dynamic field arrays, dependent and conditional fields, async validation, server errors through applyServerErrors, Zod 4 schemas shared between form and API (input vs output types, coerce, transform), and where client state lives (URL, local, context, Zustand only for truly global UI state, never server data) with a decision table. Use when building a form beyond a few plain fields, a wizard, a repeatable list of fields, fields that depend on each other, or when deciding where a piece of state belongs or whether to add a store. Triggers - "сложная форма", "многошаговая форма", "визард", "динамические поля", "массив полей", "зависимые поля", "асинхронная валидация", "zod схема", "где хранить состояние", "zustand", "стор", "глобальное состояние", "multi-step form", "wizard", "field array", "dependent fields", "async validation", "where to keep state", "global store".
---

# Complex forms and client state (Mdigital)

When running in Codex, first read [Codex integration](../../references/codex.md).

This skill extends the owners below; it never redefines what they say.

| Topic | Owner (read it first) |
|---|---|
| Form UX: validation timing (`onTouched`), submit button, preserving input, dirty-guard, field markup with shadcn `Field`, Next.js server actions | `react-ux` [forms.md](../react-ux/references/forms.md) |
| URL state: what goes in the URL, `validateSearch`, `nuqs`, history rules | `react-ux` [url-state.md](../react-ux/references/url-state.md) |
| `ApiError`, `applyServerErrors`, `getUserMessage`, mutation `meta.skipGlobalErrorToast` | `react-error-handling` [api-errors.md](../react-error-handling/references/api-errors.md) |
| State placement order (derive, local, lift, composition, URL, server, form, context, store) | `react-architecture` section 6 [SKILL.md](../react-architecture/SKILL.md) |
| Mutations, invalidation, optimistic updates | `react-data-fetching` [SKILL.md](../react-data-fetching/SKILL.md) |

Libraries (from `rules/libraries.json`): `react-hook-form + @hookform/resolvers`, `zod (v4)`, `@tanstack/react-router validateSearch`, `nuqs`; `zustand` is **conditional**. Forbidden: formik, react-final-form, TanStack Form, yup/joi/valibot, use-query-params, Redux/MobX/Recoil in new projects, copying server data into any store.

## 1. Schemas: one source, two directions

- The form schema lives in `features/<f>/lib/<name>FormSchema.ts` (path per `react-ux` forms.md); the API schemas in `features/<f>/api/<entity>.schemas.ts`. Derive one from the other with `.pick()`, `.omit()`, `.extend()` instead of writing a second object by hand.
- Zod 4 syntax only: `z.email()`, `{ error: 'i18n.key' }`. `required_error` and `invalid_type_error` are silently ignored in Zod 4 - migrate them to `error`.
- When the schema uses `z.coerce`, `.transform()` or `.default()`, form values (input) and submitted values (output) differ. Type the form with both:

```ts
const form = useForm<z.input<typeof orderFormSchema>, unknown, z.output<typeof orderFormSchema>>({
  resolver: zodResolver(orderFormSchema),
  defaultValues: { quantity: '1', email: '' }, // input type
  mode: 'onTouched',
})
// form.handleSubmit((values) => ...) receives the output type: quantity is a number
```

`@hookform/resolvers` v5 (requires `react-hook-form` ≥ 7.55) infers this from `zodResolver(schema)`; spell out the generics when you pass the type to child components.
- Cross-field rules (`password === confirm`, `end > start`) go in `.superRefine()` / `.check()` on the object, with `path: ['confirm']` so the message lands on the right field.
- Error messages are i18n keys, translated at render (rule owned by `react-ux` forms.md).

## 2. Complex form patterns

Full code for each: [references/complex-forms.md](references/complex-forms.md).

| Need | Pattern |
|---|---|
| Wizard / multi-step | One `useForm` for all steps; per-step field list; `await form.trigger(stepFields)` before Next; step number in the URL; one schema with per-step `.pick()` for partial validation; submit only on the last step |
| Repeatable rows (items, contacts) | `useFieldArray` with `keyName` default `id`; render with `field.id` as `key`, never the index; min/max via the schema (`z.array(...).min(1)`); "Add" appends a full default row |
| Dependent fields | `useWatch({ control, name })` in the child that needs it (not `watch()` at the top); reset dependants in the parent field's `onChange` handler, not in an effect |
| Conditional sections | `z.discriminatedUnion('type', [...])` in the schema; unregister hidden fields with `shouldUnregister` on that field only |
| Async validation (unique login, INN check) | Do not put network calls in the resolver. Check on blur in the field's handler through a `queryOptions` + `queryClient.fetchQuery`, show the result with `setError` / `clearErrors`; the server stays the final authority (422 → `applyServerErrors`) |
| Edit form with loaded data | Render the form only after the query has data and pass `defaultValues` from it (`key={entity.id}` remounts on switch); never `reset()` inside `useEffect` on every data change |
| Large forms | Split sections into components that read `useFormContext()`; each file ≤ 150 lines |

Server errors: every mutation behind a form uses `meta: { skipGlobalErrorToast: true }` and `onError: (e) => applyServerErrors(e, form.setError, schema.keyof().options)`. For nested or array fields pass the full list of known paths (`'items.0.price'`), see the note in [references/complex-forms.md](references/complex-forms.md).

## 3. Where client state lives

Server data is never client state: it stays in the TanStack Query cache (`react-architecture` section 6, rule 6). Everything else - decide with this table, top row first:

| The value... | Put it in | Example |
|---|---|---|
| can be computed from props, other state or query data | nothing: compute during render | `isOverdue`, filtered list, totals |
| should survive reload, Back, or a shared link | **URL** (`validateSearch` / `nuqs`) | filters, search, sort, page, tab, open detail id, wizard step |
| is a form value or form status | **React Hook Form** | field values, dirty, submitting |
| belongs to one component or a small subtree | **`useState` / `useReducer`**, lifted to the nearest common parent | open dialog, selected rows in one table, hover |
| is app-wide, rarely changes, read by many | **Context** | theme, session user id, locale |
| is truly global client-only UI state that URL, context and the query cache cannot hold (`rules/libraries.json`), changes often | **Zustand** (conditional) | sidebar collapsed, global command palette open, a cross-feature selection basket |
| must persist across sessions on this device | Zustand `persist` or a tiny `localStorage` wrapper with a Zod schema, **only** for UI preferences | table density, dismissed hints |

If none of the Zustand conditions is true, Zustand is the wrong answer. Never: server data in a store, a store that mirrors the URL, a store per form.

## 4. Zustand rules (when it is justified)

Code: [references/client-state.md](references/client-state.md).

- Scope is exactly `rules/libraries.json`: **truly global, client-only UI state that URL, context and the query cache cannot hold** (sidebar, command palette, app-wide layout preferences). Feature-scoped state is lifted state or context, not a store.
- One small store per concern, never one global store. It lives in `src/shared/hooks/use<Name>.ts` (`react-architecture` layout, no new folders).
- Do not export the store; export hooks: `useSidebarOpen()`, `useSidebarActions()`.
- Atomic selectors (`useStore((s) => s.open)`); when you need several values, `useShallow`.
- Actions live in one `actions` object that never changes identity, so `useXActions()` never re-renders.
- A value that feeds a query (a filter, a scope chosen in a side panel) is never store state: it is URL state, or state lifted to the page that owns both the panel and the query.
- `persist` stores only UI preferences; version them (`version`, `migrate`) and never persist tokens, PII or server data.

## Anti-patterns (reject in review)

- `useState` mirrors of form fields next to RHF; `watch()` at the form root re-rendering everything.
- `useEffect` that calls `setValue` / `reset` to sync dependent fields or loaded data.
- Field array rendered with `key={index}`; removing rows by index after reordering.
- Network calls inside the Zod schema or resolver; debounced async validation on every keystroke.
- A schema written twice (form and API) by hand; `as` casts between input and output types.
- Filters, tabs, pagination or wizard step in `useState` or Zustand instead of the URL.
- Query data copied into Zustand, Context or `useState`; a store that holds `isLoading`.
- Exporting the raw store; selecting the whole store (`useStore()`); one god store.

## Checklist before finishing

- [ ] One schema source; API and form schemas derived with `pick/omit/extend`; Zod 4 `error` params only.
- [ ] `useForm` typed with input and output types when the schema coerces or transforms.
- [ ] Wizard: one form, per-step `trigger`, step in the URL, submit on the last step.
- [ ] Field arrays keyed by `field.id`; array limits in the schema.
- [ ] Dependent fields via `useWatch` and handlers, no syncing effects.
- [ ] Server errors via `applyServerErrors` with all known field paths; global toast suppressed for that mutation.
- [ ] Every new piece of state placed with the table in section 3; Zustand only with a written reason.
- [ ] Tests per `react-testing`: validation timing, submit payload, 422 on fields, each wizard step.

Sources: [references/sources.md](references/sources.md).
