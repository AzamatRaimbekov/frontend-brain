import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

interface UseAppSearchParamsOptions {
  removeKeys?: ParamKey[]
}

export const useAppSearchParams = ({
  removeKeys = [],
}: UseAppSearchParamsOptions = {}) => {
  const [searchParams, setSearchParams] = useSearchParams()

  const getParam = useCallback(
    (key: ParamKey) => searchParams.get(String(key)),
    [searchParams],
  )

  const setParam = useCallback(
    (key: ParamKey, value: string) => {
      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams)

        nextParams.set(String(key), value)
        removeKeys.forEach((removeKey) => {
          nextParams.delete(String(removeKey))
        })

        return nextParams
      })
    },
    [removeKeys, setSearchParams],
  )

  const deleteParam = useCallback(
    (key: ParamKey) => {
      setSearchParams((prevParams) => {
        const nextParams = new URLSearchParams(prevParams)

        nextParams.delete(String(key))
        removeKeys.forEach((removeKey) => {
          nextParams.delete(String(removeKey))
        })

        return nextParams
      })
    },
    [removeKeys, setSearchParams],
  )

  return {
    deleteParam,
    getParam,
    setParam,
  }
}
