export type HorizontalStepperStatus = 'finish' | 'process' | 'wait'

export interface HorizontalStepperItem {
  id: string | number
  labelClassName?: string
  lineClassName?: string
  markerClassName?: string
  status?: HorizontalStepperStatus
  title: string
}

export interface HorizontalStepperProps {
  className?: string
  itemClassName?: string
  items: HorizontalStepperItem[]
  labelClassName?: string
  lineClassName?: string
  markerClassName?: string
  markerSize?: number
  current?: number
}
