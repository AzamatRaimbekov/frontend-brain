declare global {
  // fsd required
  declare type RootState =
    import('../app/providers/StoreProvider/config/store').RootState
  declare type AppDispatch =
    import('../app/providers/StoreProvider/config/store').AppDispatch
  declare type ReduxStoreWithManager =
    import('../app/providers/StoreProvider/types').ReduxStoreWithManager
  declare type StateSchemaKey =
    import('../app/providers/StoreProvider/types').StateSchemaKey
  declare type ReducersList =
    import('../app/providers/StoreProvider/types').ReducersList
  interface Window {
    MBankBridge?: import('@shared/mobile-bridge').MobileBridgeNativeApi
    ym?: (counterId: number, action: string, goal: string) => void
  }
  type DeepPartial<T> = T extends object
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T
}

export {}
