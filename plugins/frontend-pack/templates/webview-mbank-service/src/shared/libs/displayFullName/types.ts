import { CouldBeEmpty } from '@shared/types/Common'

export interface NameFields {
  first_name?: CouldBeEmpty<string>
  middle_name?: CouldBeEmpty<string>
  last_name?: CouldBeEmpty<string>
}
