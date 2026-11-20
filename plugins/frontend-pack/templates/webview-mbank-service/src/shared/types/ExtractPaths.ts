export type ExtractPaths<T> = T extends () => string
  ? ReturnType<T>
  : T extends object
    ? { [K in keyof T]: ExtractPaths<T[K]> }[keyof T]
    : never
