// Data blocks (stats, table, kanban, chart, list, timeline, cards, details) -> feature ui components.
// Each component gets `data` from the screen query; `data === undefined` means loading (skeletons).
import { Imports, q } from './util.mjs';

const MUTED = ['id', 'date', 'datetime', 'phone', 'email'];
const NUMERIC = ['money', 'number', 'percent'];
const GRID = { 1: '', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4' };

/** Strings of each data block for lib/messages.ts (react-security-i18n: copy out of JSX). */
export const DATA_TEXTS = {
  stats: (b) => ({ label: b.spec.label || 'Показатели', labels: b.fixture.map((k) => k.label) }),
  table: (b, s) => ({ label: b.spec.title || s.title, columns: b.columns.filter((c) => c.type !== 'actions').map((c) => c.label), selectAll: 'Выбрать все строки', selectRow: 'Выбрать строку', actions: 'Действия' }),
  kanban: (b) => ({ label: b.spec.title || 'Этапы', loading: 'Загружаем доску' }),
  chart: (b) => ({ title: b.spec.title || 'Динамика', subtitle: b.spec.subtitle }),
  list: (b) => ({ title: b.spec.title || 'Список', subtitle: b.spec.subtitle }),
  timeline: (b) => ({ title: b.spec.title || 'История', empty: 'Событий пока нет' }),
  cards: (b, s) => ({ label: b.spec.title || s.title }),
  details: (b) => ({ title: b.spec.title || 'Данные', labels: b.fixture.map((f) => f.label) }),
};

function head(ctx, b, extra = []) {
  const imp = new Imports(ctx.kit);
  imp.type('../api/schemas', ctx.dataType);
  imp.add('../lib/messages', `${ctx.m} as m`);
  for (const [mod, ...names] of extra) imp.add(mod, ...names);
  return imp;
}

const file = (imp, b, ctx, doc, body) => `${imp}

const t = m.blocks.${b.key}

type ${b.comp}Props = { data?: ${ctx.dataType}['${b.key}'] }

/** ${doc} */
export function ${b.comp}({ data }: ${b.comp}Props) {
${body}
}
`;

const EMIT = {
  stats(b, ctx) {
    const imp = head(ctx, b, [['@/shared/components/crm/KpiCard', 'KpiCard']]);
    return file(imp, b, ctx, 'Spec block "stats": KPI cards (crm KpiCard).', `  return (
    <ul aria-label={t.label} aria-busy={!data} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {data
        ? data.map((kpi) => (
            <li key={kpi.id}>
              <KpiCard label={kpi.label} value={kpi.value} delta={kpi.delta} deltaLabel={kpi.deltaLabel} deltaTone={kpi.tone} className="h-full" />
            </li>
          ))
        : t.labels.map((label) => (
            <li key={label}>
              <KpiCard label={label} loading />
            </li>
          ))}
    </ul>
  )`);
  },

  table(b, ctx) {
    const cols = b.columns;
    const sel = Boolean(b.spec.selectable);
    const extra = [['@/shared/ui/table', 'Table', 'TableBody', 'TableCaption', 'TableCell', 'TableHead', 'TableHeader', 'TableRow'], ['@/shared/ui/skeleton', 'Skeleton']];
    if (sel) extra.push(['react', 'useState'], ['@/shared/ui/checkbox', 'Checkbox']);
    if (cols.some((c) => c.type === 'status')) extra.push(['@/shared/ui/badge', 'Badge'], ['../lib/status', 'statusTone']);
    if (cols.some((c) => c.type === 'actions')) extra.push(['@/shared/ui/button', 'Button'], ['@/shared/components/crm/crm-icons', 'MoreVerticalIcon']);
    const imp = head(ctx, b, extra);
    let label = 0;
    const th = cols.map((c) => (c.type === 'actions'
      ? '            <TableHead className="w-12"><span className="sr-only">{t.actions}</span></TableHead>'
      : `            <TableHead${NUMERIC.includes(c.type) ? ' className="text-right"' : ''}>{t.columns[${label++}]}</TableHead>`));
    const td = cols.map((c) => {
      if (c.type === 'actions') return `              <TableCell>
                {/* TODO(spec-to-code): row menu; the spec names no actions */}
                <Button variant="ghost" size="icon-sm" aria-label={\`\${t.actions} \${row.id}\`}>
                  <MoreVerticalIcon />
                </Button>
              </TableCell>`;
      if (c.type === 'status') return `              <TableCell>
                <Badge tone={statusTone(row.${c.key})}>{row.${c.key}}</Badge>
              </TableCell>`;
      const cls = NUMERIC.includes(c.type) ? 'text-right tabular-nums' : MUTED.includes(c.type) ? 'text-muted-foreground' : '';
      return `              <TableCell${cls ? ` className="${cls}"` : ''}>{row.${c.key}}</TableCell>`;
    });
    const n = cols.length + (sel ? 1 : 0);
    const selState = sel ? `  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set())
  const rows = data?.rows ?? []
  const allSelected = rows.length > 0 && rows.every((row) => selected.has(row.id))
  const toggle = (id: string, on: boolean) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (on) next.add(id)
      else next.delete(id)
      return next
    })
` : '';
    return file(imp, b, ctx, `Spec block "table" (${b.pageSize} rows per page): kit Table, skeleton rows while loading.`, `${selState}  return (
    <div className="rounded-lg border border-border bg-card">
      <Table aria-busy={!data}>
        <TableCaption className="sr-only">{t.label}</TableCaption>
        <TableHeader>
          <TableRow>
${sel ? `            <TableHead className="w-10">
              <Checkbox
                aria-label={t.selectAll}
                checked={allSelected}
                onCheckedChange={(on) => setSelected(on === true ? new Set(rows.map((row) => row.id)) : new Set())}
              />
            </TableHead>
` : ''}${th.join('\n')}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data
            ? data.rows.map((row) => (
                <TableRow key={row.id}${sel ? ' data-state={selected.has(row.id) ? \'selected\' : undefined}' : ''}>
${sel ? `                  <TableCell>
                    <Checkbox
                      aria-label={\`\${t.selectRow} \${row.id}\`}
                      checked={selected.has(row.id)}
                      onCheckedChange={(on) => toggle(row.id, on === true)}
                    />
                  </TableCell>
` : ''}${td.map((l) => l.replace(/^ {14}/gm, '                  ')).join('\n')}
                </TableRow>
              ))
            : Array.from({ length: ${b.pageSize} }, (_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: ${n} }, (_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-28" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )`);
  },

  kanban(b, ctx) {
    const imp = head(ctx, b, [['@tanstack/react-router', 'Link'], ['@/shared/components/crm/ApplicationCard', 'ApplicationCard'],
      ['@/shared/components/crm/Board', 'Board'], ['@/shared/components/crm/BoardColumn', 'BoardColumn'],
      ['@/shared/components/crm/BoardSkeleton', 'BoardSkeleton'], ['../lib/status', 'statusTone']]);
    return file(imp, b, ctx, `Spec block "kanban": crm Board + BoardColumn + ApplicationCard; cards open ${b.href}.`, `  if (!data) return <BoardSkeleton columns={${b.fixture.length}} label={t.loading} />
  return (
    <Board label={t.label}>
      {data.map((column) => (
        <BoardColumn key={column.id} title={column.title} count={column.total}>
          {column.items.map((card) => (
            <ApplicationCard
              key={card.id}
              id={card.id}
              time={card.time}
              title={card.title}
              amount={card.amount}
              meta={card.meta}
              status={{ label: card.status, tone: statusTone(card.status) }}
              href=${q(b.href).replace(/^'|'$/g, '"')}
              renderLink={({ href, ...props }) => <Link to={href} {...props} />}
            />
          ))}
        </BoardColumn>
      ))}
    </Board>
  )`);
  },

  chart(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/card', 'Card'], ['@/shared/ui/skeleton', 'Skeleton']]);
    return file(imp, b, ctx, 'Spec block "chart": bar chart from tokens (no chart library in the kit yet).', `  const max = Math.max(1, ...(data ?? []).map((point) => point.value))
  return (
    <Card className="gap-4 border-transparent px-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-foreground">{t.title}</h2>
${b.spec.subtitle ? '        <p className="text-sm text-muted-foreground">{t.subtitle}</p>\n' : ''}      </div>
      {!data ? (
        <Skeleton className="h-48 w-full" />
      ) : (
        <div>
          <div
            role="img"
            aria-label={\`\${t.title}: \${data.map((point) => \`\${point.label} — \${point.value}\`).join(', ')}\`}
            className="flex h-48 items-end gap-1 sm:gap-2"
          >
            {data.map((point) => (
              <div key={point.label} className="flex-1 rounded-t-sm bg-brand" style={{ height: \`\${(point.value / max) * 100}%\` }} />
            ))}
          </div>
          <div aria-hidden="true" className="mt-2 flex gap-1 text-caption text-muted-foreground sm:gap-2">
            {data.map((point) => (
              <span key={point.label} className="flex-1 truncate text-center">
                {point.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )`);
  },

  list(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/avatar', 'Avatar', 'AvatarFallback'], ['@/shared/ui/badge', 'Badge'], ['@/shared/ui/card', 'Card'],
      ['@/shared/ui/skeleton', 'Skeleton'], ['../lib/status', 'statusTone']]);
    return file(imp, b, ctx, 'Spec block "list": card with avatar rows and status badges.', `  return (
    <Card className="gap-0 border-transparent py-0">
      <div className="flex flex-col gap-1 px-5 pt-5 pb-2">
        <h2 className="text-base font-bold text-foreground">{t.title}</h2>
${b.spec.subtitle ? '        <p className="text-sm text-muted-foreground">{t.subtitle}</p>\n' : ''}      </div>
      <ul aria-busy={!data} className="flex flex-col pb-2">
        {data
          ? data.map((item) => (
              <li key={item.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar size="sm">
                  <AvatarFallback>{initials(item.title)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{item.title}</span>
                  {item.subtitle && <span className="truncate text-caption text-muted-foreground">{item.subtitle}</span>}
                </div>
                {item.status && <Badge tone={statusTone(item.status)}>{item.status}</Badge>}
              </li>
            ))
          : Array.from({ length: ${b.fixture.length} }, (_, i) => (
              <li key={i} className="flex items-center gap-3 px-5 py-3">
                <Skeleton className="size-8 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </li>
            ))}
      </ul>
    </Card>
  )`).replace(`const t = m.blocks.${b.key}`, `const t = m.blocks.${b.key}

const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)`);
  },

  timeline(b, ctx) {
    const imp = head(ctx, b, [['@/shared/components/crm/Timeline', 'Timeline'], ['@/shared/components/crm/TimelineItem', 'TimelineItem'], ['@/shared/ui/skeleton', 'Skeleton']]);
    return file(imp, b, ctx, 'Spec block "timeline": crm Timeline, newest first.', `  return (
    <Timeline title={t.title} empty={<p className="text-sm text-muted-foreground">{t.empty}</p>}>
      {data
        ? data.map((event, i) => <TimelineItem key={event.id} title={event.title} meta={event.time} tone={i === 0 ? 'brand' : 'neutral'} />)
        : Array.from({ length: 3 }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-9 w-full" />
            </li>
          ))}
    </Timeline>
  )`);
  },

  cards(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/badge', 'Badge'], ['@/shared/ui/card', 'Card'], ['@/shared/ui/skeleton', 'Skeleton'], ['../lib/status', 'statusTone']]);
    const grid = GRID[Math.min(4, b.spec.columns || 3)] ?? GRID[3];
    return file(imp, b, ctx, 'Spec block "cards": a grid of kit Cards.', `  return (
    <ul aria-label={t.label} aria-busy={!data} className="grid gap-4 sm:grid-cols-2 ${grid}">
      {data
        ? data.map((card) => (
            <li key={card.id}>
              <Card className="h-full gap-2 border-transparent px-5">
                <h2 className="text-base font-bold text-foreground">{card.title}</h2>
                {card.text && <p className="text-sm text-muted-foreground">{card.text}</p>}
                {card.badge && (
                  <Badge tone={statusTone(card.badge)} className="mt-auto">
                    {card.badge}
                  </Badge>
                )}
              </Card>
            </li>
          ))
        : Array.from({ length: ${b.fixture.length} }, (_, i) => (
            <li key={i}>
              <Skeleton className="h-32 w-full rounded-lg" />
            </li>
          ))}
    </ul>
  )`);
  },

  details(b, ctx) {
    const imp = head(ctx, b, [['@/shared/components/crm/KeyValueRow', 'KeyValueRow'], ['@/shared/components/crm/KeyValueSection', 'KeyValueSection'], ['@/shared/ui/skeleton', 'Skeleton']]);
    return file(imp, b, ctx, 'Spec block "details": crm KeyValueSection with label / value rows.', `  return (
    <KeyValueSection title={t.title}>
      {data
        ? data.map((field) => (
            <KeyValueRow key={field.id} label={field.label}>
              {field.value}
            </KeyValueRow>
          ))
        : t.labels.map((label) => (
            <KeyValueRow key={label} label={label}>
              <Skeleton className="h-4 w-32" />
            </KeyValueRow>
          ))}
    </KeyValueSection>
  )`);
  },
};

export const emitDataBlock = (b, ctx) => EMIT[b.type](b, ctx);

/** Zod schema of one data block's payload (api/schemas.ts). */
export function dataSchema(b) {
  const str = 'z.string()';
  switch (b.type) {
    case 'stats': return `z.array(z.object({ id: ${str}, label: ${str}, value: ${str}, delta: ${str}.optional(), deltaLabel: ${str}.optional(), tone: z.enum(['positive', 'negative', 'neutral']) }))`;
    case 'table': {
      const cols = b.columns.filter((c) => c.type !== 'actions' && c.key !== 'id').map((c) => `${c.key}: ${str}`);
      return `z.object({ rows: z.array(z.object({ id: ${str}${cols.length ? `, ${cols.join(', ')}` : ''} })), total: z.number().int() })`;
    }
    case 'kanban': return `z.array(z.object({ id: ${str}, title: ${str}, total: z.number().int(), items: z.array(z.object({ id: ${str}, title: ${str}, amount: ${str}, time: ${str}, meta: ${str}, status: ${str} })) }))`;
    case 'chart': return `z.array(z.object({ label: ${str}, value: z.number() }))`;
    case 'list': return `z.array(z.object({ id: ${str}, title: ${str}, subtitle: ${str}.optional(), status: ${str}.optional() }))`;
    case 'timeline': return `z.array(z.object({ id: ${str}, title: ${str}, time: ${str} }))`;
    case 'cards': return `z.array(z.object({ id: ${str}, title: ${str}, text: ${str}.optional(), badge: ${str}.optional() }))`;
    case 'details': return `z.array(z.object({ id: ${str}, label: ${str}, value: ${str} }))`;
    default: return 'z.unknown()';
  }
}

/** Expression that is true when a list block has nothing to show (data defined). */
export function emptyExpr(b) {
  if (b.type === 'table') return `data.${b.key}.total === 0`;
  if (b.type === 'kanban') return `data.${b.key}.every((column) => column.total === 0)`;
  return `data.${b.key}.length === 0`;
}
