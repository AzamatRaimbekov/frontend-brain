import { twMerge } from '@shared/libs/tailwind-merge'

import clsx, { ClassValue } from '../clsx'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
