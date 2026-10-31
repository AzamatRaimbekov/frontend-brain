// pages/<screen>/: route component, UX.md brief from the spec, page tests (renderRoute + MSW).
import { hasSearch } from './feature.mjs';
import { headerHasBody } from './blocks-ui.mjs';
import { q } from './util.mjs';

const BLOCK_RU = {
  header: 'шапка', stats: 'KPI', toolbar: 'поиск и фильтры', table: 'таблица', pagination: 'пагинация', tabs: 'вкладки',
  form: 'форма', details: 'карточка данных', kanban: 'канбан', chart: 'график', list: 'список', timeline: 'история',
  stepper: 'этапы', cards: 'карточки', alert: 'предупреждение', empty: 'пустое состояние', login: 'вход', todo: 'TODO-блок',
};

export const h1Of = (s) => (s.login ? s.login.spec.title || 'Вход' : s.header?.spec.title || s.title);

function page(s, model) {
  const feature = `@/features/${s.dir}`;
  if (s.login) {
    return `import { useNavigate } from '@tanstack/react-router'
import { ${s.camel}Messages as m, ${s.pascal}View } from '${feature}'

/** Spec screen "${s.id}" (plain shell, pages/${s.dir}/UX.md): after login opens ${model.home}. */
export function ${s.pascal}Page() {
  const navigate = useNavigate()
  return (
    <>
      <title>{m.documentTitle}</title>
      <${s.pascal}View onLoggedIn={() => navigate({ to: ${q(model.home)} })} />
    </>
  )
}
`;
  }
  if (hasSearch(s)) {
    return `import { getRouteApi } from '@tanstack/react-router'
import { ${s.camel}Messages as m, ${s.pascal}View } from '${feature}'

const route = getRouteApi(${q(s.path)})

/** Spec screen "${s.id}" (pages/${s.dir}/UX.md). Tabs, search, filters and page live in the URL. */
export function ${s.pascal}Page() {
  const search = route.useSearch()
  const navigate = route.useNavigate()
  return (
    <>
      <title>{m.documentTitle}</title>
      <${s.pascal}View search={search} onSearchChange={(patch) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })} />
    </>
  )
}
`;
  }
  return `import { ${s.camel}Messages as m, ${s.pascal}View } from '${feature}'

/** Spec screen "${s.id}" (pages/${s.dir}/UX.md). */
export function ${s.pascal}Page() {
  return (
    <>
      <title>{m.documentTitle}</title>
      <${s.pascal}View />
    </>
  )
}
`;
}

function primaryAction(s) {
  if (s.primaryAction) return s.primaryAction;
  if (s.login) return `«${s.login.spec.submit || 'Войти'}»`;
  if (s.form) return `«${s.form.spec.submit || 'Сохранить'}» (отправка формы)`;
  const plus = s.header?.spec.actions?.find((a) => /^\+/.test(String(a)));
  if (plus) return `«${String(plus).replace(/^\+\s*/, '')}» (кнопка в шапке, пока заглушка)`;
  if (s.flat.some((b) => b.type === 'kanban')) return 'открыть карточку на доске';
  if (s.flat.some((b) => b.type === 'table')) return 'найти строку (поиск, фильтры, вкладки)';
  return 'просмотр данных';
}

function ux(s, model) {
  const names = (blocks) => blocks.map((b) => (b.type === 'split' ? `[${b.children.map((c) => names(c)).join(' | ')}]` : `${BLOCK_RU[b.type] || b.type}${b.spec.title ? ` «${b.spec.title}»` : ''}`)).join(', ');
  const params = [s.search.q && 'q (поиск)', s.search.tabs && 'tab', s.search.page && 'page', ...s.search.filters.map((f) => `${f.key} (${f.label})`)].filter(Boolean);
  const listed = new Set(s.states);
  const mark = (state) => (listed.has(state) ? '' : ' (нет в spec, сделано по react-ux)');
  const states = [];
  if (s.data.length) {
    states.push(`- загрузка${mark('loading')}: скелетоны каждого блока данных, aria-busy, статус «Загружаем: ${s.title}»`);
    states.push(`- ошибка${mark('error')}: 5xx → ErrorState «Не удалось загрузить данные» + «Повторить»; шапка остаётся`);
    if (s.lists.length) states.push(`- пусто${mark('empty')}: «${s.empty.title || 'Пока ничего нет'}»${s.empty.text ? ` — ${s.empty.text}` : ''}${s.empty.action ? `, кнопка «${String(s.empty.action).replace(/^\+\s*/, '')}»` : ''} вместо блока «${BLOCK_RU[s.lists[0].type]}»`);
    states.push(`- нет доступа${mark('no-access')}: 403 → «Нет доступа» вместо данных`);
  }
  if (s.form) states.push('- форма: ошибки полей под полями (aria-invalid, aria-describedby), фокус на первое ошибочное; отправка — кнопка с loading; ошибка сервера — Alert; успех — Alert и сброс формы');
  if (s.login) states.push(`- вход: пустые поля → «Заполните поле»; 401 → «${s.login.spec.error || 'Неверная почта или пароль'}»; успех → ${model.home}`);
  if (!states.length) states.push('- статичный экран: данных с сервера нет');
  const mocks = [s.data.length && '?mock=empty | error | no-access', s.form && '?mock=action-error (отправка формы)', s.login && '?mock=error или пароль «wrong» (неверный вход)'].filter(Boolean);
  return `# UX: ${s.title}

Страница: ${s.title}, route ${s.path}${params.length ? ` (?${params.join(', ')})` : ''}
Макет: spec «${model.project}», экран \`${s.id}\` — те же фреймы собирает плагин figma-pack/builder (страница «${s.spec.page}»)
Пользователь: ${model.user?.role || 'сотрудник'}; цель — ${s.goal || `работа с разделом «${s.title}»`}
Главное действие: ${primaryAction(s)}
Иерархия: ${names(s.blocks)}
Данные: ${s.data.length ? `GET /api/screens/${s.dir} → { ${s.data.map((b) => b.key).join(', ')} }` : 'нет'}${s.form ? `; POST /api/screens/${s.dir}` : ''}${s.login ? `; POST /api/screens/${s.dir}/session` : ''}
Состояния (spec: ${s.states.join(', ')}):
${states.join('\n')}
Адаптив: 1440 — меню 280 + контент${s.flat.some((b) => b.type === 'split') ? ', колонки split рядом' : ''}; 768 — меню в выезжающей панели; 375 — блоки в столбик${s.flat.some((b) => b.type === 'table') ? ', таблица скроллится по горизонтали' : ''}
Доступность: h1 «${h1Of(s)}»${s.header && !headerHasBody(s.header, s) ? ' в TopHeader' : ''}; статус загрузки озвучивается; таблицы с caption, списки и регионы с именами; формы с label
Тексты: src/features/${s.dir}/lib/messages.ts
Демо-режим: ${mocks.length ? mocks.join('; ') : 'нет'}
Допущения: бэкенда нет — контракт придуман генератором spec-to-code и живёт в MSW (src/features/${s.dir}/api/${s.dir}.handlers.ts); кнопки шапки без поведения помечены TODO
`;
}

function assertions(s) {
  const lines = [];
  for (const b of s.data) {
    const t = `m.blocks.${b.key}`;
    const firstOf = (role, name) => `(await screen.findAllByRole('${role}', { name: ${name} }))[0]`;
    if (b.type === 'stats') lines.push(`    const ${b.key} = ${firstOf('list', `${t}.label`)}`, `    expect(await within(${b.key}).findAllByText(${q(b.fixture[0].value)})).not.toHaveLength(0)`);
    if (b.type === 'table') {
      const first = b.fixture[0];
      const shown = Math.min(b.pageSize, b.fixture.length);
      lines.push(`    const ${b.key} = ${firstOf('table', `${t}.label`)}`, `    expect(await within(${b.key}).findAllByText(${q(first.id.startsWith('row-') ? Object.values(first)[1] ?? first.id : first.id)})).not.toHaveLength(0)`,
        `    expect(within(${b.key}).getAllByRole('row')).toHaveLength(${shown + 1})`);
    }
    if (b.type === 'kanban') lines.push(`    const ${b.key} = ${firstOf('list', `${t}.label`)}`, `    expect(within(${b.key}).getAllByRole('heading', { level: 3 })).toHaveLength(${b.fixture.length})`);
    if (b.type === 'chart') lines.push(`    expect(await screen.findByRole('img', { name: (name) => name.startsWith(${t}.title) })).toBeInTheDocument()`);
    if (b.type === 'list') lines.push(`    expect(await screen.findAllByText(${q(b.fixture[0].title)})).not.toHaveLength(0)`);
    if (b.type === 'timeline') lines.push(`    const ${b.key} = ${firstOf('region', `${t}.title`)}`, `    expect(await within(${b.key}).findByText(${q(b.fixture[0].title)})).toBeInTheDocument()`);
    if (b.type === 'cards') lines.push(`    const ${b.key} = ${firstOf('list', `${t}.label`)}`, `    expect(await within(${b.key}).findByText(${q(b.fixture[0].title)})).toBeInTheDocument()`);
    if (b.type === 'details') lines.push(`    const ${b.key} = ${firstOf('region', `${t}.title`)}`, `    expect(await within(${b.key}).findAllByText(${q(b.fixture[0].value)})).not.toHaveLength(0)`);
  }
  return lines;
}

const SAMPLE = { phone: '+996 700 123 456', email: 'test@mail.kg', money: '50000', number: '10', text: 'Тест', textarea: 'Тест', password: 'secret' };

function formTests(s) {
  const f = s.form;
  const required = f.fields.filter((x) => x.required && x.type !== 'select');
  const fill = required.map((x) => (x.type === 'checkbox' ? `    await user.click(screen.getByLabelText(t.fields.${x.key}.label))`
    : x.type === 'date' ? `    fireEvent.change(screen.getByLabelText(t.fields.${x.key}.label), { target: { value: '2026-01-15' } })`
      : `    await user.type(screen.getByLabelText(t.fields.${x.key}.label), ${q(SAMPLE[x.type] || 'Тест')})`)).join('\n');
  return `  it('validates the required fields', async () => {
    const user = userEvent.setup()
    renderRoute(${q(s.path)})
    await user.click(await screen.findByRole('button', { name: t.submit }))
    expect(screen.getAllByText(t.required)).toHaveLength(${required.length})
  })

  it('submits the form', async () => {
    const user = userEvent.setup()
    renderRoute(${q(s.path)})
    await screen.findByRole('button', { name: t.submit })
${fill}
    await user.click(screen.getByRole('button', { name: t.submit }))
    expect(await screen.findByText(t.success)).toBeInTheDocument()
  })

  it('shows a server error and keeps the values', async () => {
    server.use(http.post(API, () => HttpResponse.json({ message: 'boom' }, { status: 500 })))
    const user = userEvent.setup()
    renderRoute(${q(s.path)})
    await screen.findByRole('button', { name: t.submit })
${fill}
    await user.click(screen.getByRole('button', { name: t.submit }))
    expect(await screen.findByText(t.error)).toBeInTheDocument()
  })`;
}

function loginTests(s, model) {
  return `  it('validates empty fields', async () => {
    const user = userEvent.setup()
    renderRoute(${q(s.path)})
    await user.click(await screen.findByRole('button', { name: t.submit }))
    expect(screen.getAllByText(t.required)).toHaveLength(2)
  })

  it('logs in and opens ${model.home}', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute(${q(s.path)})
    await user.type(await screen.findByLabelText(t.email), 'analyst@mbank.kg')
    await user.type(screen.getByLabelText(t.password), 'secret')
    await user.click(screen.getByRole('button', { name: t.submit }))
    await waitFor(() => expect(router.state.location.pathname).toBe(${q(model.home)}))
  })

  it('shows wrong credentials', async () => {
    const user = userEvent.setup()
    renderRoute(${q(s.path)})
    await user.type(await screen.findByLabelText(t.email), 'analyst@mbank.kg')
    await user.type(screen.getByLabelText(t.password), 'wrong')
    await user.click(screen.getByRole('button', { name: t.submit }))
    expect(await screen.findByText(t.error)).toBeInTheDocument()
  })`;
}

function dataTests(s) {
  const asserts = assertions(s);
  const first = asserts.slice(0, 2).join('\n');
  const payload = `${s.camel}Payload(${hasSearch(s) ? '{}, ' : ''}true)`;
  const table = s.flat.find((b) => b.type === 'table');
  const pager = s.flat.find((b) => b.type === 'pagination');
  const out = [`  it('shows the screen data', async () => {
    renderRoute(${q(s.path)})
${asserts.join('\n')}
    expect(screen.getByRole('heading', { level: 1, name: ${q(h1Of(s))} })).toBeInTheDocument()
  })`, `  it('announces loading', async () => {
    server.use(http.get(API, async () => {
      await delay('infinite')
      return HttpResponse.json({})
    }))
    renderRoute(${q(s.path)})
    expect(await screen.findByRole('status', { name: m.loading })).toBeInTheDocument()
  })`, `  it('shows an error with retry and recovers', async () => {
    server.use(http.get(API, () => HttpResponse.json({ message: 'boom' }, { status: 500 }), { once: true }))
    const user = userEvent.setup()
    renderRoute(${q(s.path)})
    expect(await screen.findByText(m.errorTitle)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: m.retry }))
${first}
  })`, `  it('shows no access on 403', async () => {
    server.use(http.get(API, () => HttpResponse.json({ message: 'forbidden' }, { status: 403 })))
    renderRoute(${q(s.path)})
    expect(await screen.findByText(m.noAccessTitle)).toBeInTheDocument()
  })`];
  if (s.lists.length) out.push(`  it('shows the empty state', async () => {
    server.use(http.get(API, () => HttpResponse.json(${payload})))
    renderRoute(${q(s.path)})
    expect(await screen.findByText(m.emptyTitle)).toBeInTheDocument()
  })`);
  if (table && pager && table.fixture.length > table.pageSize && s.search.page) {
    const to = Math.min(table.fixture.length, table.pageSize * 2);
    out.push(`  it('pages through the table and keeps the page in the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute(${q(s.path)})
    await screen.findAllByRole('table', { name: m.blocks.${table.key}.label })
    await user.click(await screen.findByRole('button', { name: m.blocks.${pager.key}.next }))
    expect(await screen.findByText(\`\${m.blocks.${pager.key}.shown} ${table.pageSize + 1}–${to} \${m.blocks.${pager.key}.of} ${table.fixture.length}\`)).toBeInTheDocument()
    expect(router.state.location.search).toMatchObject({ page: 2 })
  })`);
  }
  if (table && s.search.q && table.columns.some((c) => c.type === 'id') && table.fixture.length > table.pageSize) {
    const target = table.fixture[table.pageSize].id;
    out.push(`  it('searches through the server and keeps the query in the URL', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute(${q(s.path)})
    const table = (await screen.findAllByRole('table', { name: m.blocks.${table.key}.label }))[0]
    await user.type(screen.getByRole('searchbox', { name: m.blocks.toolbar.searchLabel }), '${target}{Enter}')
    expect(await within(table).findByText('${target}')).toBeInTheDocument()
    await waitFor(() => expect(within(table).getAllByRole('row')).toHaveLength(2))
    expect(router.state.location.search).toMatchObject({ q: '${target}' })
  })`);
  }
  return out.join('\n\n');
}

function test(s, model) {
  const body = [];
  if (s.data.length) body.push(dataTests(s));
  if (s.form) body.push(formTests(s));
  if (s.login) body.push(loginTests(s, model));
  if (!body.length) body.push(`  it('renders the screen', async () => {
    renderRoute(${q(s.path)})
    expect(await screen.findByRole('heading', { level: 1, name: ${q(h1Of(s))} })).toBeInTheDocument()
  })`);
  const text = body.join('\n\n');
  const testing = ['screen', ...(/within\(/.test(text) ? ['within'] : []), ...(/waitFor\(/.test(text) ? ['waitFor'] : []), ...(/fireEvent\./.test(text) ? ['fireEvent'] : [])].sort();
  const msw = [...(/delay\(/.test(text) ? ['delay'] : []), ...(/http\./.test(text) ? ['http', 'HttpResponse'] : [])];
  const handlers = /Payload\(/.test(text) ? `import { ${s.camel}Payload } from '@/features/${s.dir}/api/${s.dir}.handlers'\n` : '';
  const t = s.form ? `\nconst t = m.blocks.${s.form.key}` : s.login ? `\nconst t = m.blocks.${s.login.key}` : '';
  const api = /\bAPI\b/.test(text) ? `\nconst API = '/api/screens/${s.dir}'` : '';
  const radix = s.form?.fields.some((f) => f.type === 'checkbox' || f.type === 'select')
    ? '\n\n// jsdom has no ResizeObserver; Radix Checkbox / Select measure themselves with it.\nglobalThis.ResizeObserver ??= class {\n  observe() {}\n  unobserve() {}\n  disconnect() {}\n}'
    : '';
  return `import { ${testing.join(', ')} } from '@testing-library/react'
${/userEvent/.test(text) ? "import userEvent from '@testing-library/user-event'\n" : ''}${msw.length ? `import { ${msw.join(', ')} } from 'msw'\n` : ''}import { describe, expect, it } from 'vitest'
${t || /\bm\./.test(text) ? `import { ${s.camel}Messages as m } from '@/features/${s.dir}'\n` : ''}${handlers}import { renderRoute } from '@/test/render'
${/server\./.test(text) ? "import { server } from '@/test/server'\n" : ''}${api}${t}${radix}

// Generated from the spec screen "${s.id}" (states: ${s.states.join(', ')}). Add cases for real behaviour here.
describe('${s.pascal}Page', () => {
${text}
})
`;
}

export function pageFiles(s, model) {
  const base = `src/pages/${s.dir}`;
  return [
    { path: `${base}/UX.md`, content: ux(s, model) },
    { path: `${base}/${s.pascal}Page.tsx`, content: page(s, model) },
    { path: `${base}/${s.pascal}Page.test.tsx`, content: test(s, model) },
  ];
}
