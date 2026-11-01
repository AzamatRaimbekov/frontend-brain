// Credit pipeline CRM blocks (figma-pack builder blocks-crm.js) -> feature ui components. Data blocks
// (funnel, meters, score, files, checks, comments, breakdown) get `data` from the screen query,
// `data === undefined` = skeletons; decision and profile are static copy from the spec (crm-data.mjs).
import { CRM_DATA, crmActions, decisionActions } from './crm-data.mjs';
import { Imports, q } from './util.mjs';

// Chart palette from tokens (brand + supportive), white text stays readable on each.
const PALETTE = "const PALETTE = ['bg-brand', 'bg-supportive-6', 'bg-supportive-7', 'bg-supportive-3', 'bg-supportive-4']";
const GRID = { 1: '', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-2 lg:grid-cols-3', 4: 'sm:grid-cols-2 lg:grid-cols-4', 5: 'sm:grid-cols-3 lg:grid-cols-5' };

function head(ctx, b, extra = []) {
  const imp = new Imports(ctx.kit);
  if (CRM_DATA.includes(b.type)) imp.type('../api/schemas', ctx.dataType);
  imp.add('../lib/messages', `${ctx.m} as m`).add('@/shared/ui/card', 'Card');
  if (b.moreHref) imp.add('@tanstack/react-router', 'Link');
  for (const [mod, ...names] of extra) imp.add(mod, ...names);
  return imp;
}

const file = (imp, b, ctx, doc, body, consts = '') => `${imp}

const t = m.blocks.${b.key}
${consts ? `${consts}\n` : ''}
${CRM_DATA.includes(b.type) ? `type ${b.comp}Props = { data?: ${ctx.dataType}['${b.key}'] }\n\n` : ''}/** ${doc} */
export function ${b.comp}(${CRM_DATA.includes(b.type) ? `{ data }: ${b.comp}Props` : ''}) {
${body}
}
`;

/** Card head as in Figma `cardHead`: title + subtitle left, a quiet link («Отчёт →») right. */
const cardHead = (b, pad = '      ') => `${pad}<div className="flex items-start justify-between gap-3">
${pad}  <div className="flex min-w-0 flex-col gap-1">
${pad}    <h2 className="text-base font-bold text-foreground">{t.title}</h2>
${b.spec.subtitle ? `${pad}    <p className="text-sm text-muted-foreground">{t.subtitle}</p>\n` : ''}${pad}  </div>
${b.moreHref ? `${pad}  <Link to=${q(b.moreHref).replace(/^'|'$/g, '"')} className="shrink-0 text-sm font-medium text-link hover:underline">
${pad}    {t.more}
${pad}  </Link>
` : ''}${pad}</div>`;

const card = (b, body, gap = 'gap-4', busy = true) => `  return (
    <Card role="region" aria-label={t.title}${busy ? ' aria-busy={!data}' : ''} className="${gap} border-transparent px-5">
${cardHead(b)}
${body}
    </Card>
  )`;

const skeletonRows = (n, inner, li = 'flex items-center gap-3', pad = '          ') => `${pad}: Array.from({ length: ${n} }, (_, i) => (
${pad}    <li key={i} className="${li}">
${inner}
${pad}    </li>
${pad}  ))}`;

const buttons = (acts, ref, pad) => acts.map((a, i) => `${pad}{/* TODO(spec-to-code): wire «${a.label}»; the spec names only the label */}
${pad}<Button type="button" size="sm" variant="${a.variant}">
${pad}  {${ref}[${i}].label}
${pad}</Button>`).join('\n');

const INITIALS = `const initials = (name: string) =>
  name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)`;

const EMIT = {
  funnel(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/skeleton', 'Skeleton']]);
    return file(imp, b, ctx, 'Spec block "funnel": pipeline stages, bar length by value, conversion on the right.', card(b, `      <ol aria-label={t.label} className="flex flex-col gap-3">
        {data
          ? data.map((stage, i) => (
              <li key={stage.id} className="grid gap-1.5 sm:grid-cols-[10rem_1fr_3.5rem] sm:items-center sm:gap-4">
                <div className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium text-foreground">{stage.label}</span>
                  {stage.hint && <span className="text-caption text-muted-foreground">{stage.hint}</span>}
                </div>
                <div
                  className={\`flex h-8 min-w-12 items-center rounded-md px-3 text-sm font-semibold text-brand-foreground \${PALETTE[i % PALETTE.length]}\`}
                  style={{ width: \`\${stage.share * 100}%\` }}
                >
                  {stage.value}
                </div>
                <span className="text-sm font-medium text-muted-foreground sm:text-right">{stage.rate}</span>
              </li>
            ))
${skeletonRows(b.fixture.length, `                <Skeleton className="h-8" style={{ width: \`\${100 - i * 15}%\` }} />`)}
      </ol>`), PALETTE);
  },

  meters(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/progress', 'Progress'], ['@/shared/ui/skeleton', 'Skeleton']]);
    const consts = "const VALUE = { brand: 'text-foreground', success: 'text-success-text', warning: 'text-warning-text', error: 'text-destructive-text' } as const";
    return file(imp, b, ctx, 'Spec block "meters": kit Progress per item (SLA by stage, load, limits), tone from the spec.', card(b, `      <ul className="flex flex-col gap-4">
        {data
          ? data.map((meter) => (
              <li key={meter.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-foreground">{meter.label}</span>
                  <span className={\`font-semibold tabular-nums \${VALUE[meter.tone]}\`}>{meter.value}</span>
                </div>
                <Progress value={meter.percent} tone={meter.tone} aria-label={meter.label} />
                {meter.hint && <span className="text-caption text-muted-foreground">{meter.hint}</span>}
              </li>
            ))
${skeletonRows(b.fixture.length, '                <Skeleton className="h-8 w-full" />')}
      </ul>`), consts);
  },

  score(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/badge', 'Badge'], ['@/shared/ui/skeleton', 'Skeleton'], ['../lib/status', 'statusTone']]);
    const consts = "// Risk zones from high to low risk; the marker sits over the score.\nconst ZONES = ['bg-status-error', 'bg-status-warning', 'bg-supportive-2', 'bg-supportive-3', 'bg-status-success']";
    return file(imp, b, ctx, 'Spec block "score": score of max, grade badge, 5-zone risk scale with a marker, factors.', card(b, `      {!data ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-2.5 w-full" />
          <Skeleton className="h-4 w-48" />
        </div>
      ) : (
        <>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-bold text-foreground tabular-nums">{data.value}</p>
            <p className="pb-1 text-sm text-muted-foreground">{\`\${t.of} \${data.max}\`}</p>
            {data.grade && (
              <Badge tone={statusTone(data.grade)} className="ml-auto self-center">
                {data.grade}
              </Badge>
            )}
          </div>
          <div role="img" aria-label={\`\${t.scale}: \${data.value} \${t.of} \${data.max}\`} className="flex flex-col gap-1.5">
            <div className="relative h-3">
              <span
                className="absolute top-0 size-3 -translate-x-1/2 rounded-full bg-foreground"
                style={{ left: \`\${Math.min(100, (data.value / data.max) * 100)}%\` }}
              />
            </div>
            <div className="flex gap-1">
              {ZONES.map((zone) => (
                <span key={zone} className={\`h-2 flex-1 rounded-full \${zone}\`} />
              ))}
            </div>
            <div className="flex justify-between text-caption text-muted-foreground">
              <span>{t.high}</span>
              <span>{t.low}</span>
            </div>
          </div>
          {data.factors.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-medium text-muted-foreground">{t.factors}</h3>
              <ul className="flex flex-col gap-2.5">
                {data.factors.map((factor) => (
                  <li key={factor.id} className="flex items-center gap-2.5 text-sm">
                    <span aria-hidden="true" className={\`size-2 shrink-0 rounded-full \${factor.good ? 'bg-status-success' : 'bg-status-error'}\`} />
                    <span className="min-w-0 flex-1 text-foreground">{factor.label}</span>
                    <span className={\`font-semibold tabular-nums \${factor.good ? 'text-success-text' : 'text-destructive-text'}\`}>{factor.impact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}`, 'gap-5'), consts);
  },

  files(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/badge', 'Badge'], ['@/shared/ui/button', 'Button'], ['@/shared/ui/skeleton', 'Skeleton'],
      ['@/shared/components/crm/crm-icons', 'FileIcon', 'MoreVerticalIcon'], ['../lib/status', 'statusTone']]);
    return file(imp, b, ctx, 'Spec block "files": documents with meta and status badges.', card(b, `      <ul className="flex flex-col">
        {data
          ? data.map((doc) => (
              <li key={doc.id} className="flex items-center gap-3 py-2.5">
                <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <FileIcon className="size-4.5" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-foreground">{doc.name}</span>
                  {doc.meta && <span className="text-caption text-muted-foreground">{doc.meta}</span>}
                </div>
                {doc.status && <Badge tone={statusTone(doc.status)}>{doc.status}</Badge>}
                {/* TODO(spec-to-code): file menu (open, download, replace); the spec names no actions */}
                <Button variant="ghost" size="icon-sm" aria-label={\`\${t.actions}: \${doc.name}\`}>
                  <MoreVerticalIcon />
                </Button>
              </li>
            ))
${skeletonRows(b.fixture.length, '                <Skeleton className="size-9 rounded-md" />\n                <Skeleton className="h-4 w-48" />', 'flex items-center gap-3 py-2.5')}
      </ul>`, 'gap-2'));
  },

  checks(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/skeleton', 'Skeleton'], ['@/shared/ui/icons', 'CheckIcon', 'CloseIcon'], ['@/shared/components/crm/crm-icons', 'AlertIcon', 'ClockIcon']]);
    const consts = `const LOOK = {
  ok: { Icon: CheckIcon, dot: 'bg-status-success-muted text-success-text', text: 'text-success-text' },
  warn: { Icon: AlertIcon, dot: 'bg-status-warning-muted text-warning-text', text: 'text-warning-text' },
  fail: { Icon: CloseIcon, dot: 'bg-status-error-muted text-destructive-text', text: 'text-destructive-text' },
  wait: { Icon: ClockIcon, dot: 'bg-muted text-muted-foreground', text: 'text-muted-foreground' },
} as const`;
    return file(imp, b, ctx, 'Spec block "checks": credit bureau, stop lists, verification; status ok | warn | fail | wait.', card(b, `      <ul className="flex flex-col divide-y divide-border">
        {data
          ? data.map((check) => {
              const { Icon, dot, text } = LOOK[check.status]
              return (
                <li key={check.id} className="flex items-center gap-3 py-3">
                  <span aria-hidden="true" className={\`flex size-7 shrink-0 items-center justify-center rounded-full \${dot}\`}>
                    <Icon className="size-3.5" />
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-medium text-foreground">{check.label}</span>
                    {check.hint && <span className="text-caption text-muted-foreground">{check.hint}</span>}
                  </div>
                  <span className={\`text-sm font-medium \${text}\`}>{check.result ?? t.status[check.status]}</span>
                </li>
              )
            })
${skeletonRows(b.fixture.length, '                <Skeleton className="size-7 rounded-full" />\n                <Skeleton className="my-3 h-4 w-48" />')}
      </ul>`, 'gap-2'), consts);
  },

  comments(b, ctx) {
    const imp = head(ctx, b, [['react', 'useState', 'type FormEvent'], ['@/shared/ui/avatar', 'Avatar', 'AvatarFallback'], ['@/shared/ui/button', 'Button'],
      ['@/shared/ui/input', 'Input'], ['@/shared/ui/skeleton', 'Skeleton']]);
    const consts = `${INITIALS}\n\ntype Comment = ${ctx.dataType}['${b.key}'][number]`;
    return file(imp, b, ctx, 'Spec block "comments": thread with avatars + a reply field (shown locally until the API exists).', `  const [text, setText] = useState('')
  const [sent, setSent] = useState<Comment[]>([])
  const items = data ? [...data, ...sent] : undefined
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    // TODO(spec-to-code): POST the comment to the API; for now it is only added on screen
    setSent((prev) => [...prev, { id: \`local-\${prev.length + 1}\`, who: t.you, text: value }])
    setText('')
  }
${card(b, `      <ul className="flex flex-col gap-4">
        {items
          ? items.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{initials(comment.who)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-semibold text-foreground">{comment.who}</span>
                    {comment.time && <span className="text-caption text-muted-foreground">{comment.time}</span>}
                  </p>
                  <p className="rounded-lg bg-muted px-3 py-2.5 text-sm text-foreground">{comment.text}</p>
                </div>
              </li>
            ))
${skeletonRows(b.fixture.length, '                <Skeleton className="size-8 rounded-full" />\n                <Skeleton className="h-12 flex-1" />')}
      </ul>
      {items?.length === 0 && <p className="text-sm text-muted-foreground">{t.empty}</p>}
      <form onSubmit={submit} className="flex items-center gap-2">
        <Input size="sm" aria-label={t.field} placeholder={t.placeholder} value={text} onChange={(event) => setText(event.target.value)} />
        <Button type="submit" size="sm">
          {t.send}
        </Button>
      </form>`)}`, consts);
  },

  breakdown(b, ctx) {
    const imp = head(ctx, b, [['@/shared/ui/skeleton', 'Skeleton']]);
    return file(imp, b, ctx, 'Spec block "breakdown": shares as one stacked bar + legend rows.', card(b, `      {!data ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-40" />
        </div>
      ) : (
        <>
          <div
            role="img"
            aria-label={\`\${t.title}: \${data.map((part) => \`\${part.label} — \${part.share}\`).join(', ')}\`}
            className="flex h-3 gap-0.5 overflow-hidden rounded-full"
          >
            {data.map((part, i) => (
              <span key={part.id} className={PALETTE[i % PALETTE.length]} style={{ width: \`\${part.percent}%\` }} />
            ))}
          </div>
          <ul className="flex flex-col gap-2.5">
            {data.map((part, i) => (
              <li key={part.id} className="flex items-center gap-2.5 text-sm">
                <span aria-hidden="true" className={\`size-2.5 shrink-0 rounded-full \${PALETTE[i % PALETTE.length]}\`} />
                <span className="min-w-0 flex-1 truncate text-foreground">{part.label}</span>
                {part.value && <span className="font-medium text-foreground tabular-nums">{part.value}</span>}
                <span className="w-12 text-right text-muted-foreground tabular-nums">{part.share}</span>
              </li>
            ))}
          </ul>
        </>
      )}`), PALETTE);
  },

  decision(b, ctx) {
    const acts = decisionActions(b);
    const imp = head(ctx, b, acts.length ? [['@/shared/ui/button', 'Button']] : []);
    const grid = GRID[Math.min(4, b.spec.columns || 2)] ?? GRID[2];
    return file(imp, b, ctx, 'Spec block "decision": offer terms grid, note and decision buttons ("Отказать"-like = destructive).', card(b, `      <dl className="grid gap-3 ${grid}">
        {t.terms.map((term) => (
          <div key={term.label} className="flex flex-col gap-1 rounded-lg bg-muted px-3.5 py-3">
            <dt className="text-caption text-muted-foreground">{term.label}</dt>
            <dd className="text-base font-semibold text-foreground">{term.value}</dd>
          </div>
        ))}
      </dl>
${b.spec.note ? '      <p className="text-sm text-muted-foreground">{t.note}</p>\n' : ''}${acts.length ? `      <div className="flex flex-wrap gap-2">
${buttons(acts, 't.actions', '        ')}
      </div>` : ''}`.replace(/\n$/, ''), 'gap-5', false));
  },

  profile(b, ctx) {
    const acts = crmActions(b.spec.actions);
    const extra = [['@/shared/ui/avatar', 'Avatar', 'AvatarFallback']];
    if (acts.length) extra.push(['@/shared/ui/button', 'Button']);
    if (b.spec.badges?.length) extra.push(['@/shared/ui/badge', 'Badge'], ['../lib/status', 'statusTone']);
    const imp = head(ctx, b, extra);
    const facts = b.spec.items?.length || 0;
    return file(imp, b, ctx, 'Spec block "profile": client header — avatar, name, meta, badges, actions, key facts.', `  return (
    <Card role="region" aria-label={t.name} className="gap-5 border-transparent px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar size="lg">
            <AvatarFallback>{t.initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 className="text-xl font-bold text-foreground">{t.name}</h2>
${b.spec.meta ? '            <p className="text-sm text-muted-foreground">{t.meta}</p>\n' : ''}${b.spec.badges?.length ? `            <ul aria-label={t.badgesLabel} className="flex flex-wrap gap-1.5">
              {t.badges.map((badge) => (
                <li key={badge}>
                  <Badge tone={statusTone(badge)}>{badge}</Badge>
                </li>
              ))}
            </ul>
` : ''}          </div>
        </div>
${acts.length ? `        <div className="flex flex-wrap gap-2 md:ml-auto">
${buttons(acts, 't.actions', '          ')}
        </div>
` : ''}      </div>
${facts ? `      <dl className="grid grid-cols-2 gap-4 border-t border-border pt-4 ${GRID[Math.min(5, facts)] ?? ''}">
        {t.facts.map((fact) => (
          <div key={fact.label} className="flex flex-col gap-1">
            <dt className="text-caption text-muted-foreground">{fact.label}</dt>
            <dd className="text-sm font-semibold text-foreground">{fact.value}</dd>
          </div>
        ))}
      </dl>
` : ''}    </Card>
  )`);
  },
};

export const emitCrmBlock = (b, ctx) => EMIT[b.type](b, ctx);
