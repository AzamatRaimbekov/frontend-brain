# Complex form patterns: code

Base rules (validation timing, submit button, dirty-guard, draft in `sessionStorage`, shadcn `Field` markup) are in `react-ux` [forms.md](../../react-ux/references/forms.md). Server error mapping is `applyServerErrors` from `react-error-handling` [api-errors.md](../../react-error-handling/references/api-errors.md). Examples below use a Vite + TanStack Router app; in Next.js put the step in the URL with `nuqs` instead.

## 1. Wizard (multi-step)

```ts
// features/orders/lib/orderWizardSchema.ts
import { z } from 'zod'

export const orderWizardSchema = z.object({
  email: z.email({ error: 'orders.form.email.invalid' }),
  phone: z.string().min(9, { error: 'orders.form.phone.invalid' }),
  address: z.string().min(5, { error: 'orders.form.address.min' }),
  deliveryDate: z.iso.date({ error: 'orders.form.deliveryDate.invalid' }),
})
export type OrderWizardValues = z.infer<typeof orderWizardSchema>

export const WIZARD_STEPS = [
  { id: 'contact', fields: ['email', 'phone'] },
  { id: 'delivery', fields: ['address', 'deliveryDate'] },
  { id: 'confirm', fields: [] },
] as const satisfies readonly { id: string; fields: readonly (keyof OrderWizardValues)[] }[]
export type WizardStepId = (typeof WIZARD_STEPS)[number]['id']
```

```ts
// src/routes/orders.new.tsx - the step is URL state (react-ux url-state.md)
validateSearch: z.object({ step: z.enum(['contact', 'delivery', 'confirm']).catch('contact') }),
```

```tsx
// features/orders/hooks/useOrderWizard.ts
export function useOrderWizard() {
  const { step } = route.useSearch()
  const navigate = route.useNavigate()
  const form = useForm<OrderWizardValues>({ resolver: zodResolver(orderWizardSchema), mode: 'onTouched' })
  const index = WIZARD_STEPS.findIndex((s) => s.id === step)

  async function next() {
    const valid = await form.trigger([...WIZARD_STEPS[index].fields], { shouldFocus: true })
    if (valid) navigate({ search: { step: WIZARD_STEPS[index + 1].id } }) // push: Back returns to the previous step
  }
  return { form, step, index, next, isLast: index === WIZARD_STEPS.length - 1 }
}
```

Rules:
- One `useForm` for the whole wizard; step components read it with `useFormContext()`. Values survive moving back and forth.
- `trigger(stepFields)` validates only the current step; the final `handleSubmit` validates everything.
- A deep link to a later step with earlier steps invalid: on mount run `trigger` for previous steps and `navigate({ search: { step: firstInvalid }, replace: true })`.
- The stepper shows "Шаг 2 из 3" as text and moves focus to the step heading on change (focus rules in `react-ux` accessibility-ux.md).
- The draft-to-`sessionStorage` rule from `react-ux` forms.md applies to wizards.

## 2. Field arrays

```ts
export const invoiceFormSchema = z.object({
  items: z
    .array(z.object({ title: z.string().min(1, { error: 'invoices.form.item.title.required' }), qty: z.coerce.number().int().min(1), price: z.coerce.number().min(0) }))
    .min(1, { error: 'invoices.form.items.min' })
    .max(50),
})
```

```tsx
const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'items' })

{fields.map((field, i) => (
  <InvoiceItemRow
    key={field.id}                         // never the index
    index={i}
    onRemove={() => remove(i)}
    onMoveUp={i > 0 ? () => move(i, i - 1) : undefined}               // WCAG 2.5.7: no drag-only reordering
    onMoveDown={i < fields.length - 1 ? () => move(i, i + 1) : undefined}
  />
))}
<Button type="button" variant="outline" onClick={() => append({ title: '', qty: 1, price: 0 }, { shouldFocus: true })}>
  {t('invoices.form.addItem')}
</Button>
{form.formState.errors.items?.root && <p role="alert">{t(form.formState.errors.items.root.message ?? '')}</p>}
```

- `append` gets a complete default row; partial rows break typing and validation.
- Array-level errors (`min`, `max`) come back on `errors.items.root`; render them near the list.
- Removing a row moves focus to the next row's first field, or the "Add" button when the list is empty.
- `InvoiceItemRow` reads fields through `useFormContext()` and registers `items.${index}.title`.

## 3. Dependent fields

```tsx
// Parent: reset the dependant in the handler that changes the parent value
<Controller
  control={form.control}
  name="country"
  render={({ field }) => (
    <CountrySelect
      value={field.value}
      onValueChange={(value) => {
        field.onChange(value)
        form.setValue('region', '', { shouldDirty: true, shouldValidate: false })
      }}
    />
  )}
/>

// Child: subscribe only where the value is needed
function RegionField() {
  const { control } = useFormContext<AddressFormValues>()
  const country = useWatch({ control, name: 'country' })
  const regions = useQuery({ ...regionQueries.list(country), enabled: Boolean(country) })
  // render Select disabled until country is chosen; options from regions.data
}
```

- `useWatch` in the leaf re-renders only that leaf; `form.watch()` at the root re-renders the whole form.
- No `useEffect` that watches a field and calls `setValue`: the reset belongs to the event that caused it (`react-architecture` section 8).

## 4. Conditional sections

```ts
export const paymentFormSchema = z.discriminatedUnion('method', [
  z.object({ method: z.literal('card'), cardHolder: z.string().min(2) }),
  z.object({ method: z.literal('invoice'), companyName: z.string().min(2), inn: z.string().regex(/^\d{14}$/) }),
])
```

- Render the section for the current `method` (read with `useWatch`).
- Values of the hidden branch are stripped at submit (a plain `z.object` drops unknown keys). Add `shouldUnregister: true` on those fields only if they must also leave form state while hidden.
- Prefer a radio group for 2-5 methods (`react-ux` forms.md, field rules).

## 5. Async validation (advisory, on blur)

```tsx
const queryClient = useQueryClient()

async function checkLoginAvailable(login: string) {
  if (!loginSchema.safeParse(login).success) return // sync rules first
  try {
    const { available } = await queryClient.fetchQuery(userQueries.loginAvailability(login)) // cached per login
    if (available) form.clearErrors('login')
    else form.setError('login', { type: 'taken', message: 'users.form.login.taken' })
  } catch (error) {
    if (isUnexpected(error)) reportError(error, { feature: 'users' }) // advisory check: the server re-validates on submit
  }
}

<Controller
  control={form.control}
  name="login"
  render={({ field }) => (
    <Input {...field} onBlur={() => { field.onBlur(); void checkLoginAvailable(field.value) }} />
  )}
/>
```

- Never call the network inside the Zod schema or resolver: it runs on every validation pass.
- The check is a hint; uniqueness is enforced by the server. A 422 on submit goes through `applyServerErrors`.
- The resolver replaces errors on submit, so a stale `taken` error does not block submit; the server answer is final.

## 6. Edit forms with loaded data

```tsx
export function EditOrderPage({ id }: { id: string }) {
  const { data: order } = useSuspenseQuery(orderQueries.detail(id))
  return <OrderForm key={order.id} defaultValues={toOrderFormValues(order)} />
}
```

- `toOrderFormValues` (in `features/orders/lib/`) maps API output to form input (numbers to strings for inputs, `null` to `''`).
- `key={order.id}` remounts the form when the user switches entity; no `reset()` in effects, so a background refetch never overwrites what the user is typing.

## 7. Server errors on nested fields

`applyServerErrors(error, setError, knownFields)` sets only fields listed in `knownFields`; others go to `root.server`. For arrays, add the concrete paths that exist right now:

```ts
const itemPaths = form.getValues('items').flatMap((_, i) => [`items.${i}.title`, `items.${i}.qty`, `items.${i}.price`] as const)
applyServerErrors(error, form.setError, [...invoiceFormSchema.keyof().options, ...itemPaths])
```

The backend must use the same dotted paths (`items.0.price`); agree on it in the API contract.
