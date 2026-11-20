import { StrictMode } from 'react'
import { RouterProvider } from 'react-router-dom'

import { Routing } from './lib/routing'

export function App() {
  return (
    <StrictMode>
      <RouterProvider router={Routing} />
    </StrictMode>
  )
}
