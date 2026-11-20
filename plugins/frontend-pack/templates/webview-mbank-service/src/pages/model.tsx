import { createRouteObject } from '@shared/libs/react-router-dom'
import { Preloader } from '@shared/ui/Preloader'

import { Suspense } from 'react'

import { CreditApplicationPageLazy } from './CreditApplication'
import { HomePageLazy } from './Home'
import { PageNotFoundLazy } from './PageNotFound'
import { UIKitPageLazy } from './UIKit'

export const AppRoutes = createRouteObject([
  {
    path: '',
    handle: {
      isExit: true,
      title: 'title',
    },
    element: (
      <Suspense fallback={<Preloader className="h-dvh" />}>
        <HomePageLazy />
      </Suspense>
    ),
  },
  {
    path: 'ui-kit',
    handle: {
      title: 'UI Kit',
    },
    element: (
      <Suspense fallback={<Preloader className="h-dvh" />}>
        <UIKitPageLazy />
      </Suspense>
    ),
  },
  {
    path: 'credit',
    handle: {
      isExit: true,
      title: 'creditTitle',
    },
    element: (
      <Suspense fallback={<Preloader className="h-dvh" />}>
        <CreditApplicationPageLazy />
      </Suspense>
    ),
  },
  {
    path: '*',
    element: (
      <Suspense>
        <PageNotFoundLazy />
      </Suspense>
    ),
  },
])
