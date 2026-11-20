declare global {
  export interface GlobalParams {
    limit?: number | string
    offset?: number | string
    token?: string
  }

  export type CommonQuery = Partial<Record<AllPageParams, string>> &
    GlobalParams & {}
  export type ParamKey = keyof CommonQuery
}

export {}
