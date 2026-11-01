// App-level files of the generated CRM: routes, side menu from spec.nav, layout, header, mocks.
import { formFieldSource } from './blocks-form.mjs';
import { hasSearch } from './feature.mjs';
import { Imports, lit, q } from './util.mjs';

const initials = (name = '') => name.split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();

function router(model, screens) {
  const imp = new Imports();
  imp.add('@tanstack/react-router', 'createRootRoute', 'createRoute', 'createRouter', 'redirect', 'type RouterHistory');
  imp.add('@/pages/not-found/NotFoundPage', 'NotFoundPage');
  const placeholders = model.nav.some((n) => !screens.some((s) => s.path === n.href));
  if (placeholders) imp.add('@/pages/section/SectionPage', 'SectionPage');
  imp.add('./AppLayout', 'AppLayout').add('./navigation', ...(placeholders ? ['placeholderItems'] : [])).add('./RouteErrorFallback', 'RouteErrorFallback');
  imp.add('./route-header');
  const defs = screens.map((s) => {
    imp.add(`@/pages/${s.dir}/${s.pascal}Page`, `${s.pascal}Page`);
    if (hasSearch(s)) imp.add(`@/features/${s.dir}`, `${s.camel}SearchSchema`);
    const lines = [`navId: ${q(s.navId)}`];
    if (s.crumbs) {
      const back = [...s.crumbs].reverse().find((c) => c.href);
      if (back) lines.push(`backTo: ${q(back.href)}`);
      lines.push(`crumbs: () => ${lit(s.crumbs.map((c, i) => ({ id: `crumb-${i + 1}`, label: c.label, href: c.href })), '      ')}`);
    } else if (s.header && !s.plain) lines.push(`title: ${q(model.project)}`, 'section: true');
    else lines.push(`title: ${q(s.title)}`);
    if (s.topActions?.length) lines.push(`actions: ${lit(s.topActions.map((a) => a.label))}`);
    if (s.plain) lines.push('plain: true');
    return `const ${s.camel}Route = createRoute({
  getParentRoute: () => rootRoute,
  path: ${q(s.path)},${hasSearch(s) ? `\n  validateSearch: ${s.camel}SearchSchema,` : ''}
  staticData: {
    header: {
${lines.map((l) => `      ${l},`).join('\n')}
    },
  },
  component: ${s.pascal}Page,
})`;
  });
  return `${imp}

// Routes of the spec screens (spec-to-code). A screen = a route + staticData.header (route-header.ts).
const rootRoute = createRootRoute({ component: AppLayout })

// "/" opens the first menu screen of the spec.
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: ${q(model.home)} })
  },
})

${defs.join('\n\n')}
${placeholders ? `
// Menu items without a screen in the spec: placeholder pages, so the menu has no dead links.
const placeholderRoutes = placeholderItems.map((item) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: item.href,
    staticData: { header: { navId: item.id, title: item.label } },
    component: () => <SectionPage title={item.label} />,
  }),
)
` : ''}
export const routeTree = rootRoute.addChildren([homeRoute, ${screens.map((s) => `${s.camel}Route`).join(', ')}${placeholders ? ', ...placeholderRoutes' : ''}])

export const createAppRouter = (history?: RouterHistory) =>
  createRouter({
    routeTree,
    history,
    defaultPreload: 'intent',
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: RouteErrorFallback,
  })

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
`;
}

function navigation(model, screens, kit) {
  const groups = new Map();
  for (const n of model.nav) {
    const title = n.group || model.subtitle || model.project;
    if (!groups.has(title)) groups.set(title, []);
    groups.get(title).push(n);
  }
  const icons = [...new Set(model.nav.map((n) => n.icon))];
  const imp = new Imports(kit);
  if (icons.length) imp.add('@/shared/components/crm/crm-icons', ...icons);
  imp.type('@/shared/components/crm/side-menu-types', 'SideMenuItemData', 'SideMenuSectionData');
  const badges = model.nav.some((n) => n.badge != null);
  if (badges) imp.add('react', 'createElement').add('@/shared/ui/badge', 'Badge');
  const sections = [...groups.entries()].map(([title, items], i) => `  {
    id: ${q(`section-${i + 1}`)},
    title: ${q(title)},
    collapsible: true,
    items: [
${items.map((n) => `      item(${q(n.id)}, ${q(n.label)}, ${q(n.href)}, ${n.icon}${n.badge != null ? `, ${q(n.badge)}` : ''}),`).join('\n')}
    ],
  },`);
  const implemented = model.nav.filter((n) => screens.some((s) => s.path === n.href)).map((n) => n.id);
  return `${imp}

/*
 * Side menu from spec.nav (spec-to-code). A menu item opens the spec screen with the same id
 * (or the first screen that names it in "nav"); items without a screen open SectionPage.
 */
${badges ? `// Counter after the label (spec nav "badge"), e.g. open applications.
const item = (id: string, label: string, href: string, icon: SideMenuItemData['icon'], badge?: string): SideMenuItemData => ({
  id,
  label,
  href,
  icon,
  badge: badge && createElement(Badge, { size: 'sm', tone: 'neutral' }, badge),
})` : "const item = (id: string, label: string, href: string, icon: SideMenuItemData['icon']): SideMenuItemData => ({ id, label, href, icon })"}

export const mainSections: SideMenuSectionData[] = [
${sections.join('\n')}
]

/** Pages that exist in router.tsx; everything else in the menu is a placeholder route. */
const implemented = new Set<string>(${lit(implemented)})

export const placeholderItems = mainSections.flatMap((section) => section.items).filter((entry) => !implemented.has(entry.id))
`;
}

const ROUTE_HEADER = (kit) => `import type { BreadcrumbItem } from ${q(kit('@/shared/components/crm/Breadcrumbs'))}

/** What the layout shows in TopHeader and which menu item is current, per route (staticData). */
export type RouteHeader = {
  navId: string
  title?: string
  /** Breadcrumbs from the route params, e.g. the application id. */
  crumbs?: (params: Record<string, string>) => BreadcrumbItem[]
  /** Back link target for the chevron before the breadcrumbs. */
  backTo?: string
  /** The title is the section/product name ("p"); the page h1 is the header block in the body. */
  section?: boolean
  /** Secondary page actions shown in TopHeader as the dark "Экспорт ˅" button (spec header actions without "+"). */
  actions?: string[]
  /** Screen without the CRM frame (spec shell "plain", e.g. login). */
  plain?: boolean
}

declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    header?: RouteHeader
  }
}
`;

function layout(kit) {
  const imp = new Imports(kit).add('react', 'useState').add('@tanstack/react-router', 'Outlet', 'useMatches').add('@/shared/components/crm/CrmLayout', 'CrmLayout')
    .add('@/shared/components/OfflineBanner', 'OfflineBanner').add('./AppHeader', 'AppHeader').add('./AppSideMenu', 'AppSideMenu');
  return `${imp}

/** Root route component: CRM frame (side menu + top header + page), or a bare page for shell "plain". */
export function AppLayout() {
  const matches = useMatches()
  const header = matches[matches.length - 1]?.staticData.header
  // Figma sideMenu "«" button: 280px menu <-> 72px icon rail.
  const [collapsed, setCollapsed] = useState(false)
  if (header?.plain) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-surface-1 p-4">
        <Outlet />
      </main>
    )
  }
  return (
    <CrmLayout
      banner={<OfflineBanner />}
      collapsed={collapsed}
      sideMenu={<AppSideMenu activeId={header?.navId} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((value) => !value)} />}
      header={<AppHeader />}
    >
      <Outlet />
    </CrmLayout>
  )
}
`;
}

function header(model, screens, kit) {
  const s = screens.includes(model.searchable) ? model.searchable : null;
  const imp = new Imports(kit).add('@tanstack/react-router', 'Link', 'useMatches').add('@/shared/components/crm/Breadcrumbs', 'Breadcrumbs')
    .add('@/shared/components/crm/crm-icons', 'BellIcon', 'ChevronLeftIcon', 'SettingsIcon').add('@/shared/components/crm/HeaderIconButton', 'HeaderIconButton')
    .add('@/shared/ui/icons', 'ChevronDownIcon')
    .add('@/shared/components/crm/SideMenuSheet', 'SideMenuSheet').add('@/shared/components/crm/TopHeader', 'TopHeader')
    .add('@/shared/components/crm/UserMenu', 'UserMenu').add('@/shared/ui/button', 'Button').add('@/shared/ui/dropdown-menu', 'DropdownMenuItem')
    .add('./AppSideMenu', 'AppSideMenu');
  if (s) imp.add('@tanstack/react-router', 'useNavigate').add('@/shared/components/crm/HeaderSearch', 'HeaderSearch');
  const user = model.user || {};
  return `${imp}

/** TopHeader of the current route: title or breadcrumbs from staticData.header (route-header.ts). */
export function AppHeader() {
  const matches = useMatches()
  const leaf = matches[matches.length - 1]
  const header = leaf?.staticData.header
  const params = (leaf?.params ?? {}) as Record<string, string>
${s ? '  const navigate = useNavigate()\n' : ''}
  return (
    <TopHeader
      leading={
        <SideMenuSheet>
          <AppSideMenu activeId={header?.navId} />
        </SideMenuSheet>
      }
      title={header?.crumbs ? undefined : header?.title}
      titleAs={header?.section ? 'p' : 'h1'}
      back={
        header?.backTo && (
          <Button asChild variant="ghost" size="icon-sm" className="-ml-2 max-md:hidden">
            <Link to={header.backTo} aria-label="Назад">
              <ChevronLeftIcon />
            </Link>
          </Button>
        )
      }
      breadcrumbs={
        header?.crumbs && (
          <Breadcrumbs items={header.crumbs(params)} renderLink={({ item, ...props }) => <Link to={item.href} activeOptions={{ exact: true }} {...props} />} />
        )
      }
${s ? `      search={<HeaderSearch onSearch={(query) => navigate({ to: ${q(s.path)}, search: { q: query || undefined } })} />}
` : ''}      actions={
        <>
          {header?.actions?.map((label) => (
            // TODO(spec-to-code): the page action from the spec ("Экспорт"); add its menu items
            <Button key={label} type="button" variant="secondary" size="sm" className="mr-2 max-sm:hidden">
              {label}
              <ChevronDownIcon />
            </Button>
          ))}
          <HeaderIconButton label="Настройки" className="max-sm:hidden">
            <SettingsIcon />
          </HeaderIconButton>
          {/* TODO(spec-to-code): unread notifications from the API */}
          <HeaderIconButton label="Уведомления" indicator>
            <BellIcon />
          </HeaderIconButton>
        </>
      }
      user={
        <UserMenu name=${JSON.stringify(user.name || 'Пользователь')} role=${JSON.stringify(user.role || '')} initials=${JSON.stringify(initials(user.name))} online>
          <DropdownMenuItem>Профиль</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Выйти</DropdownMenuItem>
        </UserMenu>
      }
    />
  )
}
`;
}

function sideMenu(model, kit) {
  const imp = new Imports(kit).add('@tanstack/react-router', 'Link').add('@/shared/components/crm/SideMenu', 'SideMenu')
    .add('@/shared/components/crm/SideMenuBrand', 'SideMenuBrand').add('@/shared/components/crm/SideMenuUser', 'SideMenuUser')
    .add('@/shared/ui/dropdown-menu', 'DropdownMenuItem').add('./navigation', 'mainSections');
  if (model.create) imp.add('@/shared/components/crm/crm-icons', 'PlusIcon').add('@/shared/ui/button', 'Button');
  const user = model.user || {};
  const sections = model.create ? `
// "+" in the first section header (Figma listMenu action) opens the first form screen of the spec.
const sections = mainSections.map((section, i) =>
  i === 0
    ? {
        ...section,
        action: (
          <Button asChild variant="ghost" size="icon-sm" className="size-8 text-muted-foreground">
            <Link to=${q(model.create.href)} aria-label=${JSON.stringify(model.create.label)}>
              <PlusIcon className="size-5" />
            </Link>
          </Button>
        ),
      }
    : section,
)
` : '\nconst sections = mainSections\n';
  return `${imp}
${sections}
type AppSideMenuProps = { activeId?: string; collapsed?: boolean; onToggleCollapsed?: () => void }

/** The app's side menu: Mbank logo, navigation.ts (spec.nav) + router links, the signed-in user (spec.user). */
export function AppSideMenu({ activeId, collapsed, onToggleCollapsed }: AppSideMenuProps) {
  return (
    <SideMenu
      brand={<SideMenuBrand name=${JSON.stringify(model.brand)} />}
      sections={sections}
      activeId={activeId}
      collapsed={collapsed}
      onToggleCollapsed={onToggleCollapsed}
      // exact: TanStack Link would mark a parent path current too; navId decides.
      renderLink={({ item, ...props }) => <Link to={item.href} activeOptions={{ exact: true }} {...props} />}
      user={
        <SideMenuUser name=${JSON.stringify(user.name || 'Пользователь')} role=${JSON.stringify(user.role || '')} initials=${JSON.stringify(initials(user.name))}>
          <DropdownMenuItem>Профиль</DropdownMenuItem>
          <DropdownMenuItem variant="destructive">Выйти</DropdownMenuItem>
        </SideMenuUser>
      }
    />
  )
}
`;
}

function mockHandlers(screens) {
  const withApi = screens.filter((s) => s.data.length || s.form || s.login);
  return `${withApi.map((s) => `import { ${s.camel}Handlers } from '@/features/${s.dir}/api/${s.dir}.handlers'`).join('\n')}

// Every feature's MSW handlers in one list: dev (browser.ts), tests (test/server.ts). react-testing.
export const handlers = [${withApi.map((s) => `...${s.camel}Handlers`).join(', ')}]
`;
}

const MOCK_LIB = `import { delay, HttpResponse } from 'msw'

// Helpers for the generated feature handlers (src/features/*/api/*.handlers.ts).
export const latency = () => delay(import.meta.env.MODE === 'test' ? 0 : 400)

/** ?mock=empty | error | no-access | action-error, forwarded from the page URL by withDevMock(). */
export const scenario = (url: URL) => url.searchParams.get('mock')

export function failure(url: URL) {
  const mock = scenario(url)
  if (mock === 'error') return HttpResponse.json({ message: 'boom' }, { status: 500 })
  if (mock === 'no-access') return HttpResponse.json({ message: 'forbidden' }, { status: 403 })
  return null
}

/** URL search params -> the shape of the route search schema (page is a number there). */
export function searchOf(url: URL): Record<string, unknown> {
  const out: Record<string, unknown> = Object.fromEntries(url.searchParams)
  delete out.mock
  if (out.page !== undefined) out.page = Number(out.page)
  return out
}

/** Server-side search (any cell), tab (mock: every n-th row) and exact filters. */
export function filterRows<T extends Record<string, string>>(
  rows: T[],
  { q, tab = 0, equals = {} }: { q?: string; tab?: number; equals?: Record<string, string | undefined> },
) {
  const needle = q?.trim().toLowerCase()
  return rows.filter(
    (row, i) =>
      (!needle || Object.values(row).some((value) => value.toLowerCase().includes(needle))) &&
      (tab <= 0 || i % (tab + 1) === 0) &&
      Object.entries(equals).every(([key, value]) => value === undefined || row[key] === value),
  )
}

export const pageOf = <T,>(rows: T[], page = 1, pageSize: number) => ({
  rows: rows.slice((page - 1) * pageSize, page * pageSize),
  total: rows.length,
})
`;

const DB = `// The generated mock handlers keep no state; resetDb() stays for src/test/setup.ts.
// Add in-memory data here when a handler starts to change it (see the mbank-crm template history).
export function resetDb() {}
`;

const DEV_MOCK = `// Dev-only: forwards ?mock=empty|error|no-access|action-error from the page URL to the MSW handlers,
// so every page state can be opened in the browser. Real API calls ignore it.
export function withDevMock(params = new URLSearchParams()) {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    const mock = new URLSearchParams(window.location.search).get('mock')
    if (mock) params.set('mock', mock)
  }
  return params.toString()
}

/** Route search object -> URLSearchParams for the API (undefined values are dropped). */
export function toSearchParams(search: Record<string, string | number | undefined>) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(search)) if (value !== undefined && value !== '') params.set(key, String(value))
  return params
}
`;

/** App files; `screens` = the screens present in the app (all, or --only + already generated). */
export function appFiles(model, screens, kit) {
  return [
    { path: 'src/app/router.tsx', content: router(model, screens) },
    { path: 'src/app/navigation.ts', content: navigation(model, screens, kit) },
    { path: 'src/app/route-header.ts', content: ROUTE_HEADER(kit) },
    { path: 'src/app/AppLayout.tsx', content: layout(kit) },
    { path: 'src/app/AppHeader.tsx', content: header(model, screens, kit) },
    { path: 'src/app/AppSideMenu.tsx', content: sideMenu(model, kit) },
    { path: 'src/mocks/handlers.ts', content: mockHandlers(screens) },
    { path: 'src/mocks/lib.ts', content: MOCK_LIB },
    { path: 'src/mocks/data/db.ts', content: DB },
    { path: 'src/shared/api/devMock.ts', content: DEV_MOCK },
    { path: 'src/shared/components/FormField.tsx', content: formFieldSource(kit) },
  ];
}
