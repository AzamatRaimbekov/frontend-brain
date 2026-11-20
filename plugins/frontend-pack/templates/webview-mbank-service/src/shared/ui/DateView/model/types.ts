import { NameFields } from '@shared/libs/displayFullName'
import { CouldBeEmpty } from '@shared/types/Common'

import { ReactNode } from 'react'

export type DataType = 'text' | 'phone' | 'sum' | 'name'

interface BaseDateViewItem {
  label: string
  placeholder?: string
  prefix?: string
  suffix?: string
  dataType?: DataType
}

// Create a generic type that enforces the specific dataType and children type.
export type DateViewItemGeneric<T extends DataType, U> = BaseDateViewItem & {
  dataType?: T
  children: U
}

// Now define each variant using the generic.
export type DateViewItemText = DateViewItemGeneric<'text', ReactNode>
export type DateViewItemPhone = DateViewItemGeneric<
  'phone',
  CouldBeEmpty<string>
>
export type DateViewItemSum = DateViewItemGeneric<'sum', CouldBeEmpty<number>>
export type DateViewItemName = DateViewItemGeneric<
  'name',
  CouldBeEmpty<NameFields>
>

// And if needed, you can define a union of all variants:
export type DateViewItem =
  | DateViewItemText
  | DateViewItemPhone
  | DateViewItemSum
  | DateViewItemName

export type DateViewTypes = 'callout' | 'default'
