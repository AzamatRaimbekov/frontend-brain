import { Reducer } from '@reduxjs/toolkit'

import { useEffect } from 'react'
import { useDispatch, useStore } from 'react-redux'

interface DynamicModuleLoaderProps {
  removeAfterUnmount?: boolean
  reducers: ReducersList
}
export const useDynamicModuleLoader = ({
  removeAfterUnmount,
  reducers,
}: DynamicModuleLoaderProps) => {
  const store = useStore() as ReduxStoreWithManager
  const dispatch = useDispatch()

  useEffect(() => {
    Object.entries(reducers).forEach(([name, reducer]) => {
      store.reducerManager.add(name as StateSchemaKey, reducer as Reducer)
      dispatch({ type: `@INIT ${name} reducer` })
    })

    return () => {
      if (removeAfterUnmount) {
        Object.entries(reducers).forEach(([name]) => {
          store.reducerManager.remove(name as StateSchemaKey)
          dispatch({ type: `@DESTROY ${name} reducer` })
        })
      }
    }
  }, [dispatch, reducers, removeAfterUnmount, store.reducerManager])
}
