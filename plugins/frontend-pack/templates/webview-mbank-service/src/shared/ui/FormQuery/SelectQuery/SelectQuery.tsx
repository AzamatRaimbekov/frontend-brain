import { useAppSearchParams } from '@shared/hooks/useAppSearchParams'
import { FormQuery } from '@shared/types/QueryModel'
import { Select, SelectProps } from '@shared/ui/Select'

interface SelectQueryProps extends FormQuery {
  options: SelectProps['options']
  removeKeys?: ParamKey[]
}
export function SelectQuery({
  options,
  queryKey,
  defaultValue,
  removeKeys,
  ...props
}: SelectQueryProps & SelectProps) {
  const { setParam, getParam, deleteParam } = useAppSearchParams({
    removeKeys: removeKeys,
  })

  const value = getParam(queryKey)

  const onChange = (value: string | number | null) => {
    if (!value) {
      onClear()
      return
    }
    setParam(queryKey, String(value))
  }

  const onClear = () => {
    deleteParam(queryKey)
  }

  return (
    <Select
      onClear={onClear}
      allowClear
      className="min-w-[200px]"
      options={options}
      value={value || defaultValue}
      onChange={onChange}
      {...props}
    />
  )
}
