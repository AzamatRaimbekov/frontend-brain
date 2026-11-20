import {
  Action,
  Reducer,
  ReducersMapObject,
  combineReducers,
} from '@reduxjs/toolkit'

import { StateSchema, StateSchemaKey } from './StateSchema'

export function createReducerManager(
  initialReducers: ReducersMapObject<StateSchema>,
) {
  const reducers = { ...initialReducers }

  let combinedReducer = combineReducers(reducers)

  let keysToRemove: Array<StateSchemaKey> = []

  return {
    getReducerMap: () => reducers,
    reduce: (state: StateSchema | undefined, action: Action) => {
      if (keysToRemove.length > 0) {
        const stateCopy = { ...state } as StateSchema
        keysToRemove.forEach((key) => {
          delete stateCopy[key]
        })
        state = stateCopy
        keysToRemove = []
      }
      return combinedReducer(state, action)
    },
    add: (key: StateSchemaKey, reducer: Reducer) => {
      if (!key || reducers[key]) {
        return
      }
      reducers[key] = reducer

      combinedReducer = combineReducers(reducers)
    },
    remove: (key: StateSchemaKey) => {
      if (!key || !reducers[key]) {
        return
      }
      delete reducers[key]
      keysToRemove.push(key)
      combinedReducer = combineReducers(reducers)
    },
  }
}
