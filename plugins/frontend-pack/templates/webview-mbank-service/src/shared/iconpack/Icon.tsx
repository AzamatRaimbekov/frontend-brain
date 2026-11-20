import { cn } from '@shared/libs/cn'

import { iconMap } from './model/icon'
import { sizeMap } from './model/size'
import { IconProps } from './model/types'

export const Icon = ({
  name,
  className,
  color = 'currentColor',
  size = 'sm',
  ...props
}: IconProps) =>
  iconMap[name] &&
  iconMap[name]({
    size: typeof size === 'string' ? sizeMap[size] : size,
    color,
    className: cn('align-middle', className),
    ...props,
  })
