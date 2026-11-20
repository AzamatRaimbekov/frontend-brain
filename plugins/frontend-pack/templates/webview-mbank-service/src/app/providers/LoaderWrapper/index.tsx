import { AppLoader } from '@shared/ui/AppLoader'

import { ReactNode, useEffect, useState } from 'react'

export default function LoaderWrapper({ children }: { children: ReactNode }) {
  const [showLoader, setShowLoader] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (showLoader) {
    return <AppLoader />
  }

  return children
}
