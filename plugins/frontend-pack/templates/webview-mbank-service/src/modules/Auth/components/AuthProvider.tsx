import { extractErrorDetails } from '@shared/api/rtk-query/lib/errorUtils'
import { TokenStorage } from '@shared/libs/storage'
import { useTheme } from '@shared/theme'
import { ErrorPage } from '@shared/ui/ErrorPage'
import { Preloader } from '@shared/ui/Preloader'

import { type ReactNode, useEffect, useState } from 'react'

import { useLazyMeQuery, useLoginMutation } from '../model'

const guestTokenValue = 'GUEST'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { theme } = useTheme()
  const [login] = useLoginMutation()
  const [getMe] = useLazyMeQuery()
  const [isLoading, setIsLoading] = useState(() => {
    const token = TokenStorage.getFromStorage()

    return Boolean(token && token !== guestTokenValue)
  })
  const [authError, setAuthError] = useState<unknown>(null)

  useEffect(() => {
    let isMounted = true

    const authenticate = async () => {
      const token = TokenStorage.getFromStorage()

      if (!token || token === guestTokenValue) {
        setAuthError(null)
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setAuthError(null)

      try {
        await login({ body: { token } }).unwrap()
        await getMe().unwrap()
      } catch (error) {
        if (isMounted) {
          setAuthError(error)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void authenticate()

    return () => {
      isMounted = false
    }
  }, [getMe, login])

  if (isLoading) {
    return <Preloader className="h-dvh" />
  }

  if (authError) {
    return (
      <ErrorPage
        title="Внимание"
        subtitle={
          typeof authError === 'object' && authError && 'data' in authError
            ? extractErrorDetails(authError.data)
            : 'Возникла неизвестная проблема, повторите попытку позже'
        }
        theme={theme}
      />
    )
  }

  return children
}
