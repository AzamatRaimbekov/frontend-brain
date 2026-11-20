import { type AuthSliceSchema } from '@modules/Auth'
import {
  type Action,
  type EnhancedStore,
  type Reducer,
  type ReducersMapObject,
} from '@reduxjs/toolkit'
import { $RTKClientAPI } from '@shared/api/rtk-query'
import { type GlobalDrawerSliceState } from '@shared/global-drawer'
import { type GlobalModalSliceSchema } from '@shared/global-modal'
import { type GlobalNotificationSliceSchema } from '@shared/notification'

declare const $CombinedState: unique symbol
interface EmptyObject {
  readonly [$CombinedState]?: undefined
}
export type CombinedState<S> = EmptyObject & S

export type AsyncSlices = GlobalModalSliceSchema & GlobalDrawerSliceState
export interface RTKClientAPIState {
  RTKClientAPI: ReturnType<typeof $RTKClientAPI.reducer>
}

export type StateSchema = AsyncSlices &
  RTKClientAPIState &
  AuthSliceSchema &
  GlobalNotificationSliceSchema

export type StateSchemaKey = keyof StateSchema

export interface ReducerManager {
  getReducerMap: () => ReducersMapObject<StateSchema>
  reduce: (state: StateSchema | undefined, action: Action) => StateSchema
  add: (key: StateSchemaKey, reducer: Reducer) => void
  remove: (key: StateSchemaKey) => void
}

export interface ReduxStoreWithManager extends EnhancedStore<StateSchema> {
  reducerManager: ReducerManager
}

export interface ThunkConfig<T> {
  rejectValue: T
}
