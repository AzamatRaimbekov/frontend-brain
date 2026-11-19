import { createRootRoute, createRoute, createRouter, type RouterHistory } from '@tanstack/react-router'
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { AppLayout } from './AppLayout'

const rootRoute = createRootRoute({ component: AppLayout, notFoundComponent: NotFoundPage })

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })

const routeTree = rootRoute.addChildren([homeRoute])

/** The app opens the service at its own URL; tests pass a memory history. */
export function createAppRouter(history?: RouterHistory) {
  return createRouter({ routeTree, history, defaultPreload: 'intent', scrollRestoration: true })
}

export const router = createAppRouter()

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
