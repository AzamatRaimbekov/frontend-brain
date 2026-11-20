import type { DrawerRoot } from '@base-ui/react/drawer'

import { type CSSProperties, type ReactNode } from 'react'

interface LegacyDrawerProps {
  bodyStyle?: CSSProperties
  className?: string
  closeOnMaskClick?: boolean
  closeOnSwipe?: boolean
}

export interface GlobalDrawerState {
  body: null | ReactNode
  title?: string
  description?: string
  showHandle?: boolean
  closeOnMaskClick?: boolean
  rootProps?: Partial<DrawerRoot.Props>
  contentClassName?: string
  bodyClassName?: string
  backdropClassName?: string
  contentStyle?: CSSProperties
  props?: LegacyDrawerProps
}
