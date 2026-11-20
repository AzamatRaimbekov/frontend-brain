import { createRootRoute, createRoute, createRouter, lazyRouteComponent, type RouterHistory } from '@tanstack/react-router'
import { z } from 'zod'
import { periods, stages } from '@/features/applications'
import { ApplicationPage } from '@/pages/application/ApplicationPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { PipelinePage } from '@/pages/pipeline/PipelinePage'
import { SectionPage } from '@/pages/section/SectionPage'
import { AppLayout } from './AppLayout'
import { newApplicationHref, placeholderItems } from './navigation'
import { RouteErrorFallback } from './RouteErrorFallback'
import './route-header'

const rootRoute = createRootRoute({ component: AppLayout })

const pipelineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: z.object({ period: z.enum(periods).optional().catch(undefined) }),
  staticData: { header: { navId: 'pipeline', title: 'Кредитный конвейер' } },
  component: PipelinePage,
})

const applicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/applications/$applicationId',
  staticData: {
    header: {
      navId: 'underwriting',
      backTo: '/',
      crumbs: ({ applicationId }) => [
        { id: 'credits', label: 'Кредиты', href: '/' },
        { id: 'underwriting', label: 'На андеррайтинге', href: '/underwriting' },
        { id: 'application', label: applicationId },
      ],
    },
  },
  component: ApplicationPage,
})

// Dev only: the design-system showcase (palette, scales, kit). import.meta.env.DEV is false in the build,
// so the branch and its lazy chunk are dropped from production.
const devRoutes = import.meta.env.DEV
  ? [
      createRoute({
        getParentRoute: () => rootRoute,
        path: '/design-system',
        staticData: { header: { navId: 'design-system', title: 'Дизайн-система' } },
        component: lazyRouteComponent(() => import('@/pages/design-system/DesignSystemPage'), 'DesignSystemPage'),
      }),
    ]
  : []

// Menu items without a page yet: one placeholder route each, so links work and 404 stays real.
const sectionSearch = z.object({ stage: z.enum(stages).optional().catch(undefined) })
const placeholderRoutes = [...placeholderItems, { id: 'new-application', label: 'Новая заявка', href: newApplicationHref }].map(
  (item) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: item.href,
      validateSearch: sectionSearch,
      staticData: { header: { navId: item.id, title: item.label } },
      component: () => <SectionPage title={item.label} />,
    }),
)

export const routeTree = rootRoute.addChildren([
  pipelineRoute,
  applicationRoute,
  ...devRoutes,
  ...placeholderRoutes,
])

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
