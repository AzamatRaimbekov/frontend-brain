import { useEffect, useState } from 'react'

import { UseInfiniteScrollOptions } from './types'

/**
 * A generic infinite scroll hook.
 *
 * @param fetcher - A function that fetches data. It should accept an object that includes:
 *   - extra params of type P,
 *   - plus `limit` and `offset` numbers.
 *   The function should return a Promise resolving to an array of T.
 * @param extraParams - Extra parameters to be passed to the fetcher.
 * @param options - Additional options like limit (default: 100).
 *
 * @returns Object with data, current page, setPage, hasMore flag, and isFetching status.
 */
export const useInfiniteScroll = <T, P>(
  fetcher: (params: P & { limit: number; offset: number }) => Promise<T[]>,
  extraParams?: P,
  options?: UseInfiniteScrollOptions,
) => {
  const defaultLimit = options?.limit ?? 100
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [data, setData] = useState<T[]>([])
  const [isFetching, setIsFetching] = useState(false)

  // Reset data when extraParams change
  useEffect(() => {
    setData([])
    setHasMore(true)
    setPage(1)
  }, [extraParams])

  // Fetch new data when page or extraParams change
  useEffect(() => {
    const fetchData = (extraParams?: P) => {
      setIsFetching(true)
      return fetcher({
        ...extraParams,
        limit: defaultLimit,
        offset: (page - 1) * defaultLimit,
      } as P & { limit: number; offset: number })
        .then((res) => {
          if (res.length === 0) {
            setHasMore(false)
            return
          }
          setHasMore(true)
          setData((prev) => [...prev, ...res])
        })
        .finally(() => {
          setIsFetching(false)
        })
    }

    fetchData(extraParams)
  }, [page, defaultLimit, extraParams, fetcher])

  return { data, setPage, page, hasMore, isFetching }
}
