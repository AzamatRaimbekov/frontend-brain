export interface JWTTokens {
  access: string
  refresh: string
}

export interface SaveStorage {
  saveLocal: boolean
  key?: string
  value: string
}

export interface SetStorageProps {
  key?: string
  value: string
}
