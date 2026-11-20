import { appLocaleStorageKey } from '@shared/model/appLocaleStorageKey'

import { SetStorageProps } from '../types'

export const setLocalStorage = ({
  key = appLocaleStorageKey,
  value,
}: SetStorageProps) => {
  localStorage.setItem(key, value)
}

export const getLocalStorageAsOBJ = (key = appLocaleStorageKey) => {
  return JSON.parse(JSON.stringify(localStorage.getItem(key)))
}

export const getLocalStorage = (key = appLocaleStorageKey) => {
  return localStorage.getItem(key) || ''
}
export const deleteLocalStorage = (key = appLocaleStorageKey) => {
  localStorage.removeItem(key)
}
