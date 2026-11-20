import { CSSProperties, ReactNode } from 'react'

export type GlobalModalPlacement =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'custom'

export interface GlobalModalState {
  body: null | ReactNode
  title?: string
  placement?: GlobalModalPlacement
  positionClassName?: string
  sizeClassName?: string
  contentClassName?: string
  backdropClassName?: string
  contentStyle?: CSSProperties
}
