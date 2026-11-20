import { Header } from '@modules/Common'
import { cn } from '@shared/libs/cn'

import { type ReactNode } from 'react'

interface LayoutWrapperProps {
  children: ReactNode
  wrappedClass?: string
  withHeader?: boolean
}
export function LayoutWrapper({
  children,
  wrappedClass,
  withHeader,
}: LayoutWrapperProps) {
  return (
    <main
      className={cn(
        'flex min-h-lvh flex-col items-center bg-background',
        wrappedClass,
      )}
    >
      {withHeader && <Header wrapperClassName="bg-background" />}
      <div className="relative w-full max-w-3xl px-4">{children}</div>
    </main>
  )
}
