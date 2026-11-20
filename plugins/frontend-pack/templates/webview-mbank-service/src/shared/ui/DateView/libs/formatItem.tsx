import { displayField } from '@shared/libs/displayField'
import { NameFields, displayFullName } from '@shared/libs/displayFullName'
import { displayKgzPhone } from '@shared/libs/displayKgzPhone'
import { displaySum } from '@shared/libs/displaySum'
import { CouldBeEmpty } from '@shared/types/Common'

import { ReactNode } from 'react'

import { DateViewItem } from '../model/types'

const formatter = {
  text: (value: ReactNode, placeholder: string) =>
    displayField(value, {
      placeholder,
    }),
  phone: (value: CouldBeEmpty<string>, placeholder: string) =>
    displayKgzPhone(value, placeholder),
  sum: (value: CouldBeEmpty<number>, placeholder: string) =>
    displaySum(value, placeholder),
  name: (value: CouldBeEmpty<NameFields>, placeholder: string) =>
    displayFullName(value, placeholder),
}

export function formatItem(item: DateViewItem): ReactNode {
  const { placeholder = '-', prefix, suffix } = item
  let formatted: ReactNode

  switch (item.dataType) {
    case 'phone':
      formatted = formatter.phone(item.children, placeholder)
      break
    case 'sum':
      formatted = formatter.sum(item.children, placeholder)
      break
    case 'name':
      formatted = formatter.name(item.children, placeholder)
      break
    default:
      formatted = formatter.text(item.children as ReactNode, placeholder)
  }

  return (
    <>
      {prefix && <span>{prefix}</span>}
      {formatted}
      {suffix && <span>{suffix}</span>}
    </>
  )
}
