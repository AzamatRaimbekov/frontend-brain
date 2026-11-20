import { ReactNode } from 'react'

interface Options {
  placeholder?: string | number
  prefix?: ReactNode
  suffix?: ReactNode
}

export const displayField = (
  field: ReactNode,
  { placeholder = '-', prefix = '', suffix = '' }: Options = {},
) => {
  if (typeof field === 'number' || typeof field === 'string') {
    return `${prefix}${field}${suffix}`
  }

  if (!field) {
    return `${prefix}${placeholder}${suffix}`
  }
  return (
    <>
      {prefix}
      {field}
      {suffix}
    </>
  )
}
