export interface FormQuery {
  queryKey: ParamKey

  removeKeys?: ParamKey[]
  onChangeMerge?: () => void
  onClearMerge?: () => void
}
