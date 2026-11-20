import { EnhancedStore, Reducer } from '@reduxjs/toolkit'

import { ReducerManager, StateSchema } from './config'

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
  reducerManager: ReducerManager
}

export type StateSchemaKey = keyof StateSchema

export type ReducersList = {
  [name in StateSchemaKey]?: Reducer
}
