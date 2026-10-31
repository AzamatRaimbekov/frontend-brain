// Non-data blocks (header, toolbar, tabs, pagination, stepper, alert, empty, unknown) -> components.
import { Imports } from './util.mjs';

const ALERT_TONE = { warning: 'warning', destructive: 'error', error: 'error', success: 'success', info: 'info', default: 'clear' };
const clean = (label) => String(label).replace(/^\+\s*/, '');

export const UI_TEXTS = {
  header: (b, s) => ({
    title: b.spec.title || s.title,
    subtitle: b.spec.subtitle,
    badge: b.spec.badge,
    actions: (b.spec.actions || []).map((a) => ({ label: clean(a), primary: /^\+/.test(String(a)) })),
  }),
  toolbar: (b, s) => ({ search: s.search.q ?? undefined, searchLabel: `Поиск: ${s.title}`, all: 'Все', filters: s.search.filters.map((f) => ({ label: f.label, options: f.options })) }),
  tabs: (b, s) => ({ label: b.spec.title || 'Вкладки', items: s.search.tabs }),
  pagination: () => ({ label: 'Страницы', prev: 'Назад', next: 'Вперёд', shown: 'Показано', of: 'из' }),
  stepper: (b) => ({ label: b.spec.title || 'Этапы', steps: b.spec.steps.map(String), current: b.spec.current ?? 0 }),
  alert: (b) => ({ title: b.spec.title, text: b.spec.text }),
  empty: (b) => ({ title: b.spec.title || 'Пока ничего нет', text: b.spec.text, action: b.spec.action && clean(b.spec.action) }),
  todo: (b) => ({ todo: `TODO: блок «${b.rawType}» из spec ещё не поддержан генератором` }),
};

/** Whether the header block needs its own component (TopHeader already shows the title). */
export const headerHasBody = (b, s) => Boolean(s.crumbs || b.spec.subtitle || b.spec.badge || b.spec.actions?.length);

function start(ctx, b, extra = []) {
  const imp = new Imports(ctx.kit);
  imp.add('../lib/messages', `${ctx.m} as m`);
  for (const [mod, ...names] of extra) imp.add(mod, ...names);
  return imp;
}

const actionsJsx = (pad) => `${pad}{t.actions.map((action) => (
${pad}  // TODO(spec-to-code): wire the action; the spec names only the label
${pad}  <Button key={action.label} type="button" size="sm" variant={action.primary ? 'primary' : 'secondary'}>
${pad}    {action.primary && <PlusIcon />}
${pad}    {action.label}
${pad}  </Button>
${pad}))}`;

const EMIT = {
  header(b, ctx, s) {
    const acts = Boolean(b.spec.actions?.length);
    const extra = acts ? [['@/shared/ui/button', 'Button'], ['@/shared/components/crm/crm-icons', 'PlusIcon']] : [];
    if (b.spec.badge) extra.push(['../lib/status', 'statusTone']);
    if (s.crumbs) {
      const imp = start(ctx, b, [...extra, ['@/shared/components/crm/SummaryHeader', 'SummaryHeader']]);
      return `${imp}

const t = m.blocks.${b.key}

/** Spec block "header" on a page with breadcrumbs: the h1 lives here (crm SummaryHeader). */
export function ${b.comp}() {
  return (
    <SummaryHeader
      title={t.title}
${b.spec.badge ? '      status={{ label: t.badge, tone: statusTone(t.badge) }}\n' : ''}${b.spec.subtitle ? '      context={t.subtitle}\n' : ''}${acts ? `      actions={
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
${actionsJsx('          ')}
        </div>
      }
` : ''}    />
  )
}
`;
    }
    if (b.spec.badge) extra.push(['@/shared/ui/badge', 'Badge']);
    const imp = start(ctx, b, extra);
    return `${imp}

const t = m.blocks.${b.key}

/** Spec block "header": the h1 is in TopHeader (route staticData.header); here subtitle, badge, actions. */
export function ${b.comp}() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
${b.spec.subtitle ? '        <p className="text-sm text-muted-foreground">{t.subtitle}</p>\n' : ''}${b.spec.badge ? '        <Badge tone={statusTone(t.badge)}>{t.badge}</Badge>\n' : ''}      </div>
${acts ? `      <div className="flex flex-wrap gap-2">
${actionsJsx('        ')}
      </div>
` : ''}    </div>
  )
}
`;
  },

  toolbar(b, ctx, s) {
    const filters = s.search.filters;
    const extra = s.search.q ? [['react', 'useState', 'type FormEvent'], ['@/shared/ui/input', 'Input']] : [];
    if (filters.length) extra.push(['@/shared/ui/select', 'Select', 'SelectContent', 'SelectItem', 'SelectTrigger', 'SelectValue']);
    const imp = start(ctx, b, extra);
    imp.type('../api/schemas', ctx.searchType);
    const selects = filters.map((f, i) => `        <Select
          value={search.${f.key} ?? ALL}
          onValueChange={(value) => onChange({ ${f.key}: value === ALL ? undefined : value, page: undefined })}
        >
          <SelectTrigger size="sm" className="w-full sm:w-48" aria-label={t.filters[${i}].label}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{\`\${t.filters[${i}].label}: \${t.all.toLowerCase()}\`}</SelectItem>
            {t.filters[${i}].options.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>`).join('\n');
    const searchForm = s.search.q ? `  const [text, setText] = useState(search.q ?? '')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onChange({ q: text.trim() || undefined, page: undefined })
  }
` : '';
    return `${imp}

const t = m.blocks.${b.key}
${filters.length ? "const ALL = 'all'\n" : ''}
type ${b.comp}Props = { search: ${ctx.searchType}; onChange: (patch: Partial<${ctx.searchType}>) => void }

/** Spec block "toolbar": search (Enter) and filters, all kept in the URL search params. */
export function ${b.comp}({ search, onChange }: ${b.comp}Props) {
${searchForm}  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
${s.search.q ? `      <form role="search" onSubmit={submit} className="md:w-80">
        <Input type="search" size="sm" aria-label={t.searchLabel} placeholder={t.search} value={text} onChange={(event) => setText(event.target.value)} />
      </form>
` : ''}${filters.length ? `      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
${selects}
      </div>
` : ''}    </div>
  )
}
`;
  },

  tabs(b, ctx) {
    const imp = start(ctx, b, [['@/shared/ui/tabs', 'Tabs', 'TabsList', 'TabsTrigger']]);
    imp.type('../api/schemas', ctx.searchType);
    return `${imp}

const t = m.blocks.${b.key}

type TabValue = NonNullable<${ctx.searchType}['tab']> | 'all'
type ${b.comp}Props = { value: TabValue; onChange: (value: TabValue) => void }

/** Spec block "tabs": a filter over the screen data, value in the URL (?tab=). */
export function ${b.comp}({ value, onChange }: ${b.comp}Props) {
  return (
    <Tabs value={value} onValueChange={(next) => onChange(next as TabValue)}>
      <TabsList variant="line" aria-label={t.label} className="max-w-full overflow-x-auto">
        {t.items.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
`;
  },

  pagination(b, ctx) {
    const imp = start(ctx, b, [['@/shared/ui/button', 'Button']]);
    return `${imp}

const t = m.blocks.${b.key}

type ${b.comp}Props = { page: number; pageSize: number; total?: number; onPageChange: (page: number) => void }

/** Spec block "pagination": previous / next with "Показано a–b из N", page in the URL (?page=). */
export function ${b.comp}({ page, pageSize, total, onPageChange }: ${b.comp}Props) {
  if (total === undefined) return null
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <nav aria-label={t.label} className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground" aria-live="polite">{\`\${t.shown} \${from}–\${to} \${t.of} \${total}\`}</p>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          {t.prev}
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>
          {t.next}
        </Button>
      </div>
    </nav>
  )
}
`;
  },

  stepper(b, ctx) {
    const imp = start(ctx, b, [['@/shared/components/crm/StageStepper', 'StageStepper', 'type StageItem']]);
    return `${imp}

const t = m.blocks.${b.key}

const stages: StageItem[] = t.steps.map((title, i) => ({
  id: \`step-\${i + 1}\`,
  title,
  state: i < t.current ? 'done' : i === t.current ? 'current' : 'upcoming',
}))

/** Spec block "stepper": crm StageStepper, current step from the spec. */
export function ${b.comp}() {
  return <StageStepper stages={stages} label={t.label} />
}
`;
  },

  alert(b, ctx) {
    const tone = ALERT_TONE[b.spec.variant || 'default'] || 'clear';
    const imp = start(ctx, b, [['@/shared/ui/alert', 'Alert', ...(b.spec.title ? ['AlertTitle'] : []), 'AlertDescription']]);
    return `${imp}

const t = m.blocks.${b.key}

/** Spec block "alert" (variant ${b.spec.variant || 'default'} -> tone ${tone}). */
export function ${b.comp}() {
  return (
    <Alert tone="${tone}">
${b.spec.title ? '      <AlertTitle>{t.title}</AlertTitle>\n' : ''}      <AlertDescription>{t.text}</AlertDescription>
    </Alert>
  )
}
`;
  },

  empty(b, ctx) {
    const extra = [['@/shared/components/EmptyState', 'EmptyState']];
    if (b.spec.action) extra.push(['@/shared/ui/button', 'Button']);
    const imp = start(ctx, b, extra);
    return `${imp}

const t = m.blocks.${b.key}

/** Spec block "empty". */
export function ${b.comp}() {
  return (
    <EmptyState
      title={t.title}
${b.spec.text ? '      description={t.text}\n' : ''}${b.spec.action ? '      action={<Button variant="secondary">{t.action}</Button>}\n' : ''}    />
  )
}
`;
  },

  todo(b, ctx) {
    const imp = start(ctx, b);
    return `${imp}

const t = m.blocks.${b.key}

/**
 * TODO(spec-to-code): the spec block type "${b.rawType}" has no generator yet.
 * Build it from kit components and CRM blocks (skill mbank-crm, references/blocks.md) and delete this note.
 */
export function ${b.comp}() {
  return (
    <div role="note" className="rounded-lg border border-dashed border-border-secondary p-6 text-sm text-muted-foreground">
      {t.todo}
    </div>
  )
}
`;
  },
};

export const emitUiBlock = (b, ctx, s) => EMIT[b.type](b, ctx, s);
export const hasUiEmitter = (type) => Boolean(EMIT[type]);
