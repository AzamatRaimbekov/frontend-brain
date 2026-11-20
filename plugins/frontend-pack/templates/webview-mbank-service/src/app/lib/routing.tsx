import GlobalLayout from '@app/GlobalLayout'
import { AppRoutes } from '@pages/model'

import { createBrowserRouter } from 'react-router-dom'

export const Routing = createBrowserRouter([
  {
    path: '/',
    shouldRevalidate: () => false,
    element: <GlobalLayout />,
    children: AppRoutes,
  },
])
