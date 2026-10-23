# Sources

Checked October 2026.

## Forms
- `@hookform/resolvers` v5 - requires `react-hook-form` ≥ 7.55, infers input and output types from the schema. https://npmjs.com/@hookform/resolvers , https://unpkg.com/@hookform/resolvers@5.5.7/README.md
- React Hook Form `useForm` (generics `TFieldValues, TContext, TTransformedValues`), `useFieldArray`, `useWatch`, `useFormContext`, `trigger`, `setError`. https://react-hook-form.com/docs
- Zod 4 changelog - unified `error` parameter, `required_error` / `invalid_type_error` dropped; `z.input` / `z.output`; `z.discriminatedUnion`. https://zod.dev/v4/changelog
- WCAG 2.2 SC 2.5.7 Dragging Movements (reordering needs a single-pointer alternative). https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html

## State
- TanStack Router - validate search params (Zod 4 schemas work directly; `@tanstack/zod-adapter` only for Zod 3; `fallback()` / `.catch()` defaults; `loaderDeps`). https://tanstack.com/router/latest/docs/framework/react/how-to/validate-search-params , https://tanstack.com/router/latest/docs/framework/react/guide/search-params
- nuqs adapters - Next.js App Router adapter; nuqs recommends TanStack Router's native search API over its experimental adapter. https://nuqs.dev/docs/adapters.md
- TkDodo, "Working with Zustand" - export custom hooks not the store, atomic selectors, actions object, small stores, no server state. https://tkdodo.eu/blog/working-with-zustand
- Zustand `useShallow` and `persist` middleware (`version`, `migrate`, `partialize`). https://zustand.docs.pmnd.rs/
- react.dev "Choosing the State Structure", "Sharing State Between Components". https://react.dev/learn/choosing-the-state-structure

## Related pack files
- `react-ux` [forms.md](../../react-ux/references/forms.md), [url-state.md](../../react-ux/references/url-state.md)
- `react-error-handling` [api-errors.md](../../react-error-handling/references/api-errors.md)
