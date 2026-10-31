// Form and login blocks: zod schema in lib/form.ts, fields component, container with useMutation.
// react-hook-form is not in the CRM template (see the mbank-crm skill); the forms use zod + useState.
import { Imports, lit, q } from './util.mjs';

const PHONE = '/^\\+?[\\d\\s()-]{9,}$/';
const MONEY = '/^\\d[\\d\\s]*([.,]\\d{1,2})?$/';
const NUMBER = '/^-?\\d+([.,]\\d+)?$/';
const EMAIL = '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/';
const CHUNK = 10;

export const FORM_TEXTS = {
  form: (b) => ({
    title: b.spec.title, subtitle: b.spec.subtitle, submit: b.spec.submit || 'Сохранить', cancel: b.spec.cancel || 'Отмена',
    success: b.spec.success || 'Данные сохранены', error: 'Не удалось сохранить. Проверьте соединение и попробуйте ещё раз.',
    required: 'Заполните поле', choose: 'Выберите',
    invalid: { phone: 'Номер в формате +996 700 000 000', email: 'Почта в формате name@mail.kg', money: 'Сумма цифрами, например 50 000', number: 'Только цифры' },
    fields: Object.fromEntries(b.fields.map((f) => [f.key, { label: f.label, hint: f.hint, placeholder: f.placeholder, options: f.options }])),
  }),
  login: (b) => ({
    title: b.spec.title || 'Вход', subtitle: b.spec.subtitle, email: 'Рабочая почта', password: 'Пароль', submit: b.spec.submit || 'Войти',
    required: 'Заполните поле', invalidEmail: 'Почта в формате name@mail.kg',
    error: b.spec.error || 'Неверная почта или пароль', failed: 'Не удалось войти. Попробуйте ещё раз.',
    footer: b.spec.footer === false ? undefined : b.spec.footer || 'Забыли пароль? Обратитесь к администратору',
  }),
};

function rule(f) {
  if (f.type === 'checkbox') return f.required ? 'z.boolean().refine((on) => on, f.required)' : 'z.boolean()';
  const re = { phone: [PHONE, 'phone'], email: [EMAIL, 'email'], money: [MONEY, 'money'], number: [NUMBER, 'number'] }[f.type];
  const base = re ? `z.string().trim().regex(${re[0]}, f.invalid.${re[1]})` : 'z.string().trim()';
  if (f.required) return re ? `z.string().trim().min(1, f.required).regex(${re[0]}, f.invalid.${re[1]})` : `${base}.min(1, f.required)`;
  return re ? `${base}.or(z.literal(''))` : base;
}

/** lib/form.ts: schema, values type, defaults and error mapping. */
export function emitFormLib(b, ctx) {
  const P = ctx.pascal;
  const C = ctx.camel;
  const defaults = Object.fromEntries(b.fields.map((f) => [f.key, f.type === 'checkbox' ? false : f.type === 'select' && f.required ? f.options[0] : '']));
  return `import { z } from 'zod'
import { ${ctx.m} as m } from './messages'

const f = m.blocks.${b.key}

/** Client-side validation of the spec form; the server validates again. */
export const ${C}FormSchema = z.object({
${b.fields.map((x) => `  ${x.key}: ${rule(x)},`).join('\n')}
})

export type ${P}Values = z.infer<typeof ${C}FormSchema>
export type ${P}Errors = Partial<Record<keyof ${P}Values, string>>

export const ${C}Defaults: ${P}Values = ${lit(defaults)}

export function ${C}Errors(error: z.ZodError): ${P}Errors {
  const out: ${P}Errors = {}
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof ${P}Values
    out[key] ??= issue.message
  }
  return out
}
`;
}

function control(f, ctx) {
  const v = `values.${f.key}`;
  const set = (expr) => `onChange('${f.key}', ${expr})`;
  const ph = f.placeholder ? ` placeholder={t.fields.${f.key}.placeholder}` : '';
  switch (f.type) {
    case 'checkbox': return `<Checkbox {...field} checked={${v}} onCheckedChange={(on) => ${set('on === true')}} />`;
    case 'select': return `(
          <Select value={${v}} onValueChange={(value) => ${set('value')}}>
            <SelectTrigger {...field}>
              <SelectValue placeholder={t.choose} />
            </SelectTrigger>
            <SelectContent>
              {(t.fields.${f.key}.options ?? []).map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )`;
    case 'textarea': return `<Textarea {...field}${ph} value={${v}} onChange={(event) => ${set('event.target.value')}} />`;
    default: {
      const attrs = { phone: ' type="tel" inputMode="tel" autoComplete="tel"', email: ' type="email" autoComplete="email"', money: ' inputMode="decimal"', number: ' inputMode="numeric"', date: ' type="date"', password: ' type="password"' }[f.type] || '';
      const p = ph || (f.type === 'phone' ? ' placeholder="+996 700 000 000"' : f.type === 'money' ? ' placeholder="0"' : '');
      return `<Input {...field}${attrs}${p} value={${v}} onChange={(event) => ${set('event.target.value')}} />`;
    }
  }
}

function emitFields(b, ctx, fields, comp) {
  const imp = new Imports(ctx.kit);
  imp.add('@/shared/components/FormField', 'FormField');
  const kinds = new Set(fields.map((f) => f.type));
  if (kinds.has('checkbox')) imp.add('@/shared/ui/checkbox', 'Checkbox');
  if (kinds.has('select')) imp.add('@/shared/ui/select', 'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue');
  if (kinds.has('textarea')) imp.add('@/shared/ui/textarea', 'Textarea');
  if ([...kinds].some((k) => !['checkbox', 'select', 'textarea'].includes(k))) imp.add('@/shared/ui/input', 'Input');
  imp.type('../lib/form', `${ctx.pascal}Errors`, `${ctx.pascal}Values`);
  imp.add('../lib/messages', `${ctx.m} as m`);
  const P = ctx.pascal;
  const rows = fields.map((f) => `      <FormField
        id="${ctx.dir}-${f.key}"
        label={t.fields.${f.key}.label}${f.required ? '\n        required' : ''}${f.hint ? `\n        hint={t.fields.${f.key}.hint}` : ''}${f.type === 'checkbox' ? '\n        inline' : ''}
        error={errors.${f.key}}
      >
        {(field) => ${control(f, ctx)}}
      </FormField>`);
  return `${imp}

const t = m.blocks.${b.key}

type ${comp}Props = {
  values: ${P}Values
  errors: ${P}Errors
  onChange: <K extends keyof ${P}Values>(key: K, value: ${P}Values[K]) => void
}

/** Fields of the spec form "${b.spec.title || ctx.title}" (labels, hints and options in lib/messages.ts). */
export function ${comp}({ values, errors, onChange }: ${comp}Props) {
  return (
    <>
${rows.join('\n')}
    </>
  )
}
`;
}

/** Form block: container + one fields component per ${CHUNK} fields. Returns [{ name, content }]. */
export function emitForm(b, ctx) {
  const P = ctx.pascal;
  const C = ctx.camel;
  const chunks = [];
  for (let i = 0; i < b.fields.length; i += CHUNK) chunks.push(b.fields.slice(i, i + CHUNK));
  const names = chunks.map((_, i) => `${b.comp}Fields${chunks.length > 1 ? i + 1 : ''}`);
  const imp = new Imports(ctx.kit);
  imp.add('@tanstack/react-query', 'useMutation').add('react', 'useState', 'type FormEvent');
  imp.add('@/shared/ui/alert', 'Alert', 'AlertDescription').add('@/shared/ui/button', 'Button').add('@/shared/ui/card', 'Card');
  imp.add('../api/mutations', `submit${P}`).add('../lib/form', `${C}Defaults`, `${C}Errors`, `${C}FormSchema`, `type ${P}Errors`, `type ${P}Values`);
  imp.add('../lib/messages', `${ctx.m} as m`);
  names.forEach((n) => imp.add(`./${n}`, n));
  const width = b.spec.width ? ` max-w-[${Number(b.spec.width) || 760}px]` : ' max-w-3xl';
  const container = `${imp}

const t = m.blocks.${b.key}

/** Spec block "form": validation (lib/form.ts), POST through useMutation, pending / error / success states. */
export function ${b.comp}() {
  const [values, setValues] = useState<${P}Values>(${C}Defaults)
  const [errors, setErrors] = useState<${P}Errors>({})
  const mutation = useMutation({ mutationFn: submit${P}, onSuccess: () => setValues(${C}Defaults) })

  const change = <K extends keyof ${P}Values>(key: K, value: ${P}Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }
  const reset = () => {
    setValues(${C}Defaults)
    setErrors({})
    mutation.reset()
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = ${C}FormSchema.safeParse(values)
    if (!parsed.success) {
      const next = ${C}Errors(parsed.error)
      setErrors(next)
      document.getElementById(\`${ctx.dir}-\${Object.keys(next)[0]}\`)?.focus()
      return
    }
    mutation.mutate(parsed.data)
  }

  return (
    <Card className="w-full${width} gap-6 border-transparent px-5">
${b.spec.title || b.spec.subtitle ? `      <div className="flex flex-col gap-1">
${b.spec.title ? '        <h2 className="text-base font-bold text-foreground">{t.title}</h2>\n' : ''}${b.spec.subtitle ? '        <p className="text-sm text-muted-foreground">{t.subtitle}</p>\n' : ''}      </div>
` : ''}      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
${names.map((n) => `        <${n} values={values} errors={errors} onChange={change} />`).join('\n')}
        {mutation.isError && (
          <Alert tone="error">
            <AlertDescription>{t.error}</AlertDescription>
          </Alert>
        )}
        {mutation.isSuccess && (
          <Alert tone="success">
            <AlertDescription>{t.success}</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="secondary" onClick={reset}>
            {t.cancel}
          </Button>
          <Button type="submit" loading={mutation.isPending}>
            {t.submit}
          </Button>
        </div>
      </form>
    </Card>
  )
}
`;
  return [{ name: b.comp, content: container }, ...chunks.map((c, i) => ({ name: names[i], content: emitFields(b, ctx, c, names[i]) }))];
}

/** Login block: email + password, POST /session, 401 -> "wrong credentials" alert, success -> onSuccess(). */
export function emitLogin(b, ctx) {
  const imp = new Imports(ctx.kit);
  imp.add('@tanstack/react-query', 'useMutation').add('react', 'useState', 'type FormEvent').add('zod', 'z');
  imp.add('@/shared/api/http', 'isApiError').add('@/shared/components/FormField', 'FormField');
  imp.add('@/shared/ui/alert', 'Alert', 'AlertDescription').add('@/shared/ui/button', 'Button').add('@/shared/ui/card', 'Card').add('@/shared/ui/input', 'Input');
  imp.add('../api/mutations', `logIn${ctx.pascal}`).add('../lib/messages', `${ctx.m} as m`);
  return `${imp}

const t = m.blocks.${b.key}

const schema = z.object({
  email: z.string().trim().min(1, t.required).regex(${EMAIL}, t.invalidEmail),
  password: z.string().min(1, t.required),
})
type Errors = Partial<Record<'email' | 'password', string>>

/** Spec block "login": the page h1, validation, pending and "wrong credentials" states. */
export function ${b.comp}({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const mutation = useMutation({ mutationFn: logIn${ctx.pascal}, onSuccess })
  const denied = isApiError(mutation.error) && mutation.error.status === 401

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      const next: Errors = {}
      for (const issue of parsed.error.issues) next[issue.path[0] as keyof Errors] ??= issue.message
      setErrors(next)
      document.getElementById(\`${ctx.dir}-\${Object.keys(next)[0]}\`)?.focus()
      return
    }
    mutation.mutate(parsed.data)
  }

  return (
    <Card className="w-full max-w-sm gap-6 border-transparent px-6 py-8">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
${b.spec.subtitle ? '        <p className="text-sm text-muted-foreground">{t.subtitle}</p>\n' : ''}      </div>
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <FormField id="${ctx.dir}-email" label={t.email} required error={errors.email}>
          {(field) => <Input {...field} type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} />}
        </FormField>
        <FormField id="${ctx.dir}-password" label={t.password} required error={errors.password}>
          {(field) => (
            <Input {...field} type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} />
          )}
        </FormField>
        {mutation.isError && (
          <Alert tone="error">
            <AlertDescription>{denied ? t.error : t.failed}</AlertDescription>
          </Alert>
        )}
        <Button type="submit" loading={mutation.isPending}>
          {t.submit}
        </Button>
      </form>
${b.spec.footer === false ? '' : '      <p className="text-center text-sm text-muted-foreground">{t.footer}</p>\n'}    </Card>
  )
}
`;
}

/** api/mutations.ts for a screen with a form and / or a login block. */
export function emitMutations(s, ctx) {
  const imp = new Imports(ctx.kit);
  imp.add('@/shared/api/devMock', 'withDevMock').add('@/shared/api/http', 'http');
  const parts = [];
  if (s.form) {
    imp.type('../lib/form', `${ctx.pascal}Values`).add('./schemas', `${ctx.camel}ResultSchema`);
    parts.push(`/** POST of the spec form; the response is validated with the result schema. */
export const submit${ctx.pascal} = (values: ${ctx.pascal}Values) =>
  http(\`${ctx.endpoint}?\${withDevMock()}\`, (data) => ${ctx.camel}ResultSchema.parse(data), { ...json, body: JSON.stringify(values) })`);
  }
  if (s.login) {
    imp.add('./schemas', `${ctx.camel}SessionSchema`);
    parts.push(`/** Opens a session; 401 = wrong email or password. */
export const logIn${ctx.pascal} = (credentials: { email: string; password: string }) =>
  http(\`${ctx.endpoint}/session?\${withDevMock()}\`, (data) => ${ctx.camel}SessionSchema.parse(data), { ...json, body: JSON.stringify(credentials) })`);
  }
  return `${imp}

const json = { method: 'POST', headers: { 'Content-Type': 'application/json' } } as const

${parts.join('\n\n')}
`;
}

export const FORM_FIELD = `import type { ReactNode } from 'react'
import { Label } from '@/shared/ui/label'

export type FieldControlProps = {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
  'aria-required'?: true
}

type FormFieldProps = {
  id: string
  label: string
  required?: boolean
  hint?: string
  error?: string
  /** Checkbox / switch: control before the label on one line. */
  inline?: boolean
  children: (field: FieldControlProps) => ReactNode
}

/** Label + control + hint + error with the aria links (react-ux forms); the control comes from children. */
export function FormField({ id, label, required, hint, error, inline, children }: FormFieldProps) {
  const hintId = hint ? \`\${id}-hint\` : undefined
  const errorId = error ? \`\${id}-error\` : undefined
  const control = children({
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
    'aria-required': required && !inline ? true : undefined,
  })
  const labelNode = (
    <Label htmlFor={id} className={required ? "after:text-destructive-text after:content-['*']" : undefined}>
      {label}
    </Label>
  )
  return (
    <div className="flex flex-col gap-1.5">
      {inline ? (
        <div className="flex items-center gap-3">
          {control}
          {labelNode}
        </div>
      ) : (
        <>
          {labelNode}
          {control}
        </>
      )}
      {hint && (
        <p id={hintId} className="text-caption text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-destructive-text">
          {error}
        </p>
      )}
    </div>
  )
}
`;

export const formFieldSource = (kit) => FORM_FIELD.replace("import { Label } from '@/shared/ui/label'", `import { Label } from ${q(kit('@/shared/ui/label'))}`);
