export type CouldBeEmpty<T> = null | T

export interface PaginationResponse<T> {
  count?: number
  next?: string
  previous?: string
  results: T
}

export type BooleanQuery = 'true' | 'false'
