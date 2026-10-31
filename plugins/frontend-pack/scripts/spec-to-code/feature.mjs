// One feature folder per spec screen: api (schemas, query keys, fixtures, MSW handlers, mutations),
// lib (messages, status tones, form schema), ui (one component per block + the screen view), index.ts.
import { DATA_TEXTS, dataSchema, emitDataBlock, emptyExpr } from './blocks-data.mjs';
import { emitForm, emitFormLib, emitLogin, emitMutations, FORM_TEXTS } from './blocks-form.mjs';
import { emitUiBlock, headerHasBody, UI_TEXTS } from './blocks-ui.mjs';
import { Imports, lit, q } from './util.mjs';

export function screenCtx(s, model, kit) {
  return { kit, pascal: s.pascal, camel: s.camel, dir: s.dir, title: s.title, m: `${s.camel}Messages`, dataType: `${s.pascal}Data`,
    searchType: `${s.pascal}Search`, endpoint: `/api/screens/${s.dir}`, project: model.project };
}

export const hasSearch = (s) => Boolean(s.search.q || s.search.filters.length || s.search.tabs || s.search.page);
const firstTable = (s) => s.flat.find((b) => b.type === 'table');

function messages(s, ctx) {
  const texts = { ...DATA_TEXTS, ...UI_TEXTS, ...FORM_TEXTS };
  const blocks = Object.fromEntries(s.flat.filter((b) => texts[b.type]).map((b) => [b.key, texts[b.type](b, s)]));
  const e = s.empty;
  const m = {
    title: s.title, documentTitle: `${s.title} — ${ctx.project}`, loading: `Загружаем: ${s.title}`,
    errorTitle: 'Не удалось загрузить данные', errorDescription: 'Проверьте соединение и попробуйте ещё раз.', retry: 'Повторить',
    emptyTitle: e.title || 'Пока ничего нет', emptyDescription: e.text, emptyAction: e.action && String(e.action).replace(/^\+\s*/, ''),
    noAccessTitle: 'Нет доступа', noAccessDescription: 'У вашей роли нет прав на этот раздел. Обратитесь к администратору.',
    blocks,
  };
  return `// Copy of the screen "${s.id}" from the spec, in one place (react-security-i18n).
export const ${ctx.m} = ${lit(m)}
`;
}

function status(s) {
  return `type StatusTone = 'info' | 'warning' | 'success' | 'error' | 'neutral'

// Badge tone per status label of this screen (spec statuses); unknown labels are neutral.
const tones: Record<string, StatusTone> = ${lit(s.statuses)}

export const statusTone = (label: string): StatusTone => tones[label] ?? 'neutral'
`;
}

function schemas(s, ctx) {
  const out = ["import { z } from 'zod'", ''];
  if (s.data.length) {
    out.push(`/** GET ${ctx.endpoint}: one key per data block of the spec screen. */`);
    out.push(`export const ${ctx.camel}DataSchema = z.object({\n${s.data.map((b) => `  ${b.key}: ${dataSchema(b)},`).join('\n')}\n})`);
    out.push(`export type ${ctx.dataType} = z.infer<typeof ${ctx.camel}DataSchema>`, '');
  }
  if (hasSearch(s)) {
    const opt = '.optional().catch(undefined)';
    const fields = [];
    if (s.search.q) fields.push(`  q: z.string()${opt},`);
    if (s.search.tabs) fields.push(`  tab: z.enum([${s.search.tabs.slice(1).map((t) => q(t.value)).join(', ')}])${opt},`);
    if (s.search.page) fields.push(`  page: z.number().int().min(1)${opt},`);
    for (const f of s.search.filters) fields.push(`  ${f.key}: z.string()${opt},`);
    out.push('/** URL search params of the screen (tabs, search, filters, page): react-ux "state in the URL". */');
    out.push(`export const ${ctx.camel}SearchSchema = z.object({\n${fields.join('\n')}\n})`);
    out.push(`export type ${ctx.searchType} = z.infer<typeof ${ctx.camel}SearchSchema>`, '');
  }
  if (s.form) out.push(`export const ${ctx.camel}ResultSchema = z.object({ id: z.string() })`, '');
  if (s.login) out.push(`export const ${ctx.camel}SessionSchema = z.object({ ok: z.literal(true) })`, '');
  return `${out.join('\n').trimEnd()}\n`;
}

function queries(s, ctx) {
  const imp = new Imports(ctx.kit);
  imp.add('@tanstack/react-query', 'queryOptions').add('@/shared/api/devMock', 'withDevMock').add('@/shared/api/http', 'http');
  imp.add('./schemas', `${ctx.camel}DataSchema`);
  const searchable = hasSearch(s);
  if (searchable) imp.add('@/shared/api/devMock', 'toSearchParams').type('./schemas', ctx.searchType);
  const K = `${ctx.camel}Keys`;
  return `${imp}

export const ${K} = {
  all: [${q(s.id)}] as const,
  screen: (${searchable ? `search: ${ctx.searchType}` : ''}) => [...${K}.all, 'screen'${searchable ? ', search' : ''}] as const,
}

export function ${ctx.camel}Options(${searchable ? `search: ${ctx.searchType}` : ''}) {
  return queryOptions({
    queryKey: ${K}.screen(${searchable ? 'search' : ''}),
    queryFn: ({ signal }) =>
      http(\`${ctx.endpoint}?\${withDevMock(${searchable ? 'toSearchParams(search)' : ''})}\`, (data) => ${ctx.camel}DataSchema.parse(data), { signal }),
  })
}
`;
}

function fixtures(s, ctx) {
  const types = s.data.map((b) => `  ${b.key}: ${ctx.dataType}['${b.key}']${b.type === 'table' ? "['rows']" : ''}`);
  const data = Object.fromEntries(s.data.map((b) => [b.key, b.fixture]));
  return `import type { ${ctx.dataType} } from './schemas'

type ${ctx.pascal}Fixtures = {
${types.join('\n')}
}

/** Deterministic data from the spec (the same fake data the Figma plugin draws). Replace with the real API. */
export const ${ctx.camel}Fixtures: ${ctx.pascal}Fixtures = ${lit(data)}
`;
}

function handlers(s, ctx) {
  const imp = new Imports(ctx.kit);
  imp.add('msw', 'http', 'HttpResponse').add('@/mocks/lib', 'latency');
  if (s.lists.length || s.form || s.login) imp.add('@/mocks/lib', 'scenario');
  const searchable = hasSearch(s);
  const parts = [];
  let payload = '';
  if (s.data.length) {
    imp.add('@/mocks/lib', 'failure').add(`./${s.dir}.fixtures`, `${ctx.camel}Fixtures as seed`).type('./schemas', ctx.dataType);
    if (searchable) imp.add('@/mocks/lib', 'searchOf').add('./schemas', `${ctx.camel}SearchSchema`).type('./schemas', ctx.searchType);
    const table = firstTable(s);
    if (s.data.some((b) => b.type === 'table')) imp.add('@/mocks/lib', 'pageOf');
    if (table) imp.add('@/mocks/lib', 'filterRows');
    const value = (b) => {
      if (b.type === 'table') {
        if (b !== table) return `pageOf(empty ? [] : seed.${b.key}, 1, ${b.pageSize})`;
        const equals = s.search.filters.filter((f) => f.column).map((f) => `${f.column}: search.${f.key}`);
        return `pageOf(
      filterRows(empty ? [] : seed.${b.key}, {${s.search.q ? ' q: search.q,' : ''}${s.search.tabs ? " tab: tabs.indexOf(search.tab ?? 'all')," : ''}${equals.length ? ` equals: { ${equals.join(', ')} }` : ''} }),
      search.page,
      ${b.pageSize},
    )`;
      }
      if (b.type === 'kanban') return `empty ? seed.${b.key}.map((column) => ({ ...column, total: 0, items: [] })) : seed.${b.key}`;
      return b.list ? `empty ? [] : seed.${b.key}` : `seed.${b.key}`;
    };
    payload = `${s.search.tabs ? `const tabs = [${s.search.tabs.map((t) => q(t.value)).join(', ')}]\n\n` : ''}/** Screen payload; \`empty\` = the empty state. Tests use it to arrange data. */
export function ${ctx.camel}Payload(${[searchable && `search: ${ctx.searchType} = {}`, s.lists.length && 'empty = false'].filter(Boolean).join(', ')}): ${ctx.dataType} {
  return {
${s.data.map((b) => `    ${b.key}: ${value(b)},`).join('\n')}
  }
}

`;
    parts.push(`  http.get('${ctx.endpoint}', async ({ request }) => {
    await latency()
    const url = new URL(request.url)
    const failed = failure(url)
    if (failed) return failed
    return HttpResponse.json(${ctx.camel}Payload(${[searchable && `${ctx.camel}SearchSchema.parse(searchOf(url))`, s.lists.length && "scenario(url) === 'empty'"].filter(Boolean).join(', ')}))
  }),`);
  }
  if (s.form) parts.push(`  http.post('${ctx.endpoint}', async ({ request }) => {
    await latency()
    if (scenario(new URL(request.url)) === 'action-error') return HttpResponse.json({ message: 'boom' }, { status: 500 })
    return HttpResponse.json({ id: crypto.randomUUID() }, { status: 201 })
  }),`);
  if (s.login) parts.push(`  // Any email; password "wrong" or ?mock=error answers 401 (the "wrong credentials" state).
  http.post('${ctx.endpoint}/session', async ({ request }) => {
    await latency()
    const { password } = (await request.json()) as { password?: string }
    if (scenario(new URL(request.url)) === 'error' || password === 'wrong') return HttpResponse.json({ message: 'unauthorized' }, { status: 401 })
    return HttpResponse.json({ ok: true })
  }),`);
  return `${imp}

// Dev and test API of the screen "${s.id}" until the backend exists (?mock=empty | error | no-access | action-error).
${payload}export const ${ctx.camel}Handlers = [
${parts.join('\n')}
]
`;
}

function call(b, s) {
  const table = firstTable(s);
  switch (b.type) {
    case 'header': return headerHasBody(b, s) ? `<${b.comp} />` : null;
    case 'toolbar': return `<${b.comp} search={search} onChange={onSearchChange} />`;
    case 'tabs': return `<${b.comp} value={search.tab ?? 'all'} onChange={(tab) => onSearchChange({ tab: tab === 'all' ? undefined : tab, page: undefined })} />`;
    case 'pagination': {
      const total = table ? `data?.${table.key}.total` : s.lists[0] && s.lists[0].type !== 'kanban' ? `data?.${s.lists[0].key}.length` : 'undefined';
      return `<${b.comp} page={search.page ?? 1} pageSize={${table?.pageSize ?? 10}} total={${total}} onPageChange={(page) => onSearchChange({ page: page === 1 ? undefined : page })} />`;
    }
    case 'login': return `<${b.comp} onSuccess={onLoggedIn} />`;
    default: return b.data ? `<${b.comp} data={data?.${b.key}} />` : `<${b.comp} />`;
  }
}

function render(blocks, s, pad) {
  const lines = [];
  for (const b of blocks) {
    if (b.type === 'split') {
      const ratio = (b.spec.ratio || b.children.map(() => 1).join(':')).split(':').map((x) => `${Number(x) || 1}fr`).join('_');
      lines.push(`${pad}<div className="grid gap-6 lg:grid-cols-[${ratio}]">`);
      for (const col of b.children) {
        lines.push(`${pad}  <div className="flex min-w-0 flex-col gap-6">`, ...render(col, s, `${pad}    `), `${pad}  </div>`);
      }
      lines.push(`${pad}</div>`);
      continue;
    }
    const el = call(b, s);
    if (!el) continue;
    if (s.lists.length && b === s.lists[0]) lines.push(`${pad}{empty ? <EmptyState title={m.emptyTitle}${s.empty.text ? ' description={m.emptyDescription}' : ''}${s.empty.action ? ' action={<Button variant="secondary">{m.emptyAction}</Button>}' : ''} /> : ${el}}`);
    else if (s.lists.length && (b.list || b.type === 'pagination')) lines.push(`${pad}{!empty && ${el}}`);
    else lines.push(`${pad}${el}`);
  }
  return lines;
}

function view(s, ctx) {
  const imp = new Imports(ctx.kit);
  const comps = s.flat.filter((b) => b.type !== 'split' && (b.type !== 'header' || headerHasBody(b, s)));
  comps.forEach((b) => imp.add(`./${b.comp}`, b.comp));
  const searchable = hasSearch(s);
  const props = [];
  if (searchable) { props.push(`search: ${ctx.searchType}`, `onSearchChange: (patch: Partial<${ctx.searchType}>) => void`); imp.type('../api/schemas', ctx.searchType); }
  if (s.login) props.push('onLoggedIn: () => void');
  const sig = props.length ? `{ ${props.map((p) => p.split(':')[0]).join(', ')} }: ${s.pascal}ViewProps` : '';
  const propsType = props.length ? `type ${s.pascal}ViewProps = { ${props.join('; ')} }\n\n` : '';
  const doc = `/** Spec screen "${s.id}" (${s.title}): blocks in spec order, states in pages/${s.dir}/UX.md. */`;
  if (!s.data.length) {
    return `${imp}

${propsType}${doc}
export function ${s.pascal}View(${sig}) {
  return (
    <div className="${s.plain ? 'flex w-full justify-center' : 'flex flex-col gap-6'}">
${render(s.blocks, s, '      ').join('\n')}
    </div>
  )
}
`;
  }
  imp.add('@tanstack/react-query', ...(searchable ? ['keepPreviousData'] : []), 'useQuery');
  imp.add('@/shared/api/http', 'isApiError').add('@/shared/components/EmptyState', 'EmptyState').add('@/shared/components/ErrorState', 'ErrorState');
  imp.add('../api/queries', `${ctx.camel}Options`).add('../lib/messages', `${ctx.m} as m`);
  if (s.lists.length && s.empty.action) imp.add('@/shared/ui/button', 'Button');
  const at = s.blocks.findIndex((b) => b.type === 'header');
  const prefix = s.blocks.slice(0, at + 1);
  const rest = s.blocks.slice(at + 1);
  const emptyLine = s.lists.length ? `  const empty = data !== undefined && ${s.lists.map((b) => `${emptyExpr(b)}`).join(' && ')}\n` : '';
  return `${imp}

${propsType}${doc}
export function ${s.pascal}View(${sig}) {
  const query = useQuery(${searchable ? `{ ...${ctx.camel}Options(search), placeholderData: keepPreviousData }` : `${ctx.camel}Options()`})
  const data = query.data
${emptyLine}  const forbidden = isApiError(query.error) && query.error.status === 403

  return (
    <div className="flex flex-col gap-6" aria-busy={query.isFetching}>
${render(prefix, s, '      ').join('\n')}${prefix.length ? '\n' : ''}      {query.isPending && (
        <p role="status" aria-label={m.loading} className="sr-only">
          {m.loading}
        </p>
      )}
      {forbidden ? (
        <EmptyState title={m.noAccessTitle} description={m.noAccessDescription} />
      ) : query.isError && !data ? (
        <ErrorState title={m.errorTitle} description={m.errorDescription} retryLabel={m.retry} onRetry={() => query.refetch()} />
      ) : (
        <>
${render(rest, s, '          ').join('\n')}
        </>
      )}
    </div>
  )
}
`;
}

function index(s, ctx) {
  const lines = [`export { ${s.pascal}View } from './ui/${s.pascal}View'`];
  if (s.data.length) lines.push(`export { ${ctx.camel}Keys, ${ctx.camel}Options } from './api/queries'`);
  const types = [];
  if (s.data.length) types.push(`type ${ctx.dataType}`);
  if (hasSearch(s)) types.unshift(`${ctx.camel}SearchSchema`), types.push(`type ${ctx.searchType}`);
  if (types.length) lines.push(`export { ${types.join(', ')} } from './api/schemas'`);
  lines.push(`export { ${ctx.m} } from './lib/messages'`);
  return `${lines.join('\n')}\n`;
}

/** All files of the screen's feature folder: [{ path, content }]. */
export function featureFiles(s, ctx) {
  const base = `src/features/${s.dir}`;
  const files = [
    { path: `${base}/index.ts`, content: index(s, ctx) },
    { path: `${base}/lib/messages.ts`, content: messages(s, ctx) },
    { path: `${base}/api/schemas.ts`, content: schemas(s, ctx) },
    { path: `${base}/ui/${s.pascal}View.tsx`, content: view(s, ctx) },
  ];
  if (Object.keys(s.statuses).length) files.push({ path: `${base}/lib/status.ts`, content: status(s) });
  if (s.data.length) files.push({ path: `${base}/api/queries.ts`, content: queries(s, ctx) }, { path: `${base}/api/${s.dir}.fixtures.ts`, content: fixtures(s, ctx) });
  if (s.data.length || s.form || s.login) files.push({ path: `${base}/api/${s.dir}.handlers.ts`, content: handlers(s, ctx) });
  if (s.form || s.login) files.push({ path: `${base}/api/mutations.ts`, content: emitMutations(s, ctx) });
  if (s.form) files.push({ path: `${base}/lib/form.ts`, content: emitFormLib(s.form, ctx) });
  for (const b of s.flat) {
    if (b.type === 'split' || (b.type === 'header' && !headerHasBody(b, s))) continue;
    if (b.type === 'form') {
      if (b !== s.form) continue;
      for (const f of emitForm(b, ctx)) files.push({ path: `${base}/ui/${f.name}.tsx`, content: f.content });
    } else if (b.type === 'login') {
      if (b === s.login) files.push({ path: `${base}/ui/${b.comp}.tsx`, content: emitLogin(b, ctx) });
    } else {
      files.push({ path: `${base}/ui/${b.comp}.tsx`, content: b.data ? emitDataBlock(b, ctx) : emitUiBlock(b, ctx, s) });
    }
  }
  return files;
}
