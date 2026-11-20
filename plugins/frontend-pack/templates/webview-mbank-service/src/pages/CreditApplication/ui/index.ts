import { lazy } from 'react'

export const CreditApplicationPageLazy = lazy(
  () => import('./CreditApplication'),
)
