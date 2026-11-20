import { PageNotFoundLazy } from '@pages/PageNotFound'

import { type ReactNode } from 'react'

import { useMbankToken } from '../lib'

export function TokenProvider({ children }: { children: ReactNode }) {
  const { token } = useMbankToken()

  if (!token) {
    return <PageNotFoundLazy subtitle="Пожалуйста, авторизуйтесь" />
  }

  return children
}
