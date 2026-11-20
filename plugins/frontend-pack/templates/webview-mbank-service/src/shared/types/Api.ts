export interface FetchProps<Params = CommonQuery, Config = unknown> {
  params?: Params
  onSuccess?: () => void
  config?: Config
  uuid?: string
}
