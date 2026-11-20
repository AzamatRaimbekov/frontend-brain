import { authReducer } from '@modules/Auth'
import {
  EnhancedStore,
  Middleware,
  ReducersMapObject,
  configureStore,
} from '@reduxjs/toolkit'
import { $RTKClientAPI, $rtkQueryErrorLogger } from '@shared/api/rtk-query'
import { globalNotificationSlice } from '@shared/notification/model/slice'

import { StateSchema } from './StateSchema'
import { createReducerManager } from './reducerManager'

const apiReducers = {
  [$RTKClientAPI.reducerPath]: $RTKClientAPI.reducer,
}

const middlewares = [
  $RTKClientAPI.middleware,
  $rtkQueryErrorLogger,
] as Middleware[]

export const RootReducerState = {
  ...apiReducers,
  ...authReducer,
  globalNotification: globalNotificationSlice,
}

export function createReduxStore(
  initialState?: StateSchema,
  asyncReducers?: ReducersMapObject<StateSchema>,
) {
  const rootReducers = {
    ...asyncReducers,
    ...RootReducerState,
  }

  const reducerManager = createReducerManager(
    rootReducers as unknown as ReducersMapObject<StateSchema>,
  )
  const store = configureStore({
    reducer: reducerManager.reduce,
    devTools: true,
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(middlewares),
  })

  return Object.assign(store, {
    reducerManager,
  }) as EnhancedStore<StateSchema> & {
    reducerManager: ReturnType<typeof createReducerManager>
  }
}

export type AppDispatch = ReturnType<typeof createReduxStore>['dispatch']
export type RootState = ReturnType<
  ReturnType<typeof createReduxStore>['getState']
>
