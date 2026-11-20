import { useAppSearchParams } from '@shared/hooks/useAppSearchParams'
import { useDebounceCallback } from '@shared/libs/debounce'
import { FormQuery } from '@shared/types/QueryModel'
import { TextFiled, TextFiledProps } from '@shared/ui/TextFiled'

import { useState } from 'react'

interface TextFiledQueryProps extends FormQuery {
  queryKey: ParamKey
  placeholder?: string
  removeKeys?: ParamKey[]
}

export function TextFiledQuery({
  queryKey,
  placeholder,
  removeKeys,
  ...props
}: TextFiledQueryProps & TextFiledProps) {
  const { setParam, getParam } = useAppSearchParams({
    removeKeys,
  })
  const queryKeyValue = getParam(queryKey) || ''

  const [value, setValue] = useState(queryKeyValue)

  const onChange = (value: string) => {
    setValue(value)
    debounce(value)
  }

  const debounce = useDebounceCallback((value) => {
    setParam(queryKey, value as string)
  }, 700)
  return (
    <TextFiled
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
      {...props}
    />
  )
}
