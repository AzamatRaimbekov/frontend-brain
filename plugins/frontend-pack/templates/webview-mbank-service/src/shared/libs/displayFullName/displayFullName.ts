import { CouldBeEmpty } from '@shared/types/Common'

import { NameFields } from './types'

export function displayFullName<T extends NameFields>(
  user: CouldBeEmpty<T>,
  placeholder: string = '-',
) {
  const nameParts = [
    user?.last_name,
    user?.first_name,
    user?.middle_name,
  ].filter(Boolean)

  return nameParts.join(' ') || placeholder
}
