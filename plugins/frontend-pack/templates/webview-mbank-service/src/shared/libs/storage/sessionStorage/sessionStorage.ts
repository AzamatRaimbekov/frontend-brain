import { appLocaleStorageKey } from '@shared/model/appLocaleStorageKey'

import { SetStorageProps } from '../types'

export const setSessionStorage = ({
  key = appLocaleStorageKey,
  value,
}: SetStorageProps) => {
  sessionStorage.setItem(key, value)
}

export const getSessionStorage = (key = appLocaleStorageKey) => {
  return sessionStorage.getItem(key) || ''
}

export const deleteSessionStorage = (key = appLocaleStorageKey) => {
  sessionStorage.removeItem(key)
}

export const sessionStorageFactory = (namespace: string) => {
  function getKey(key: string) {
    return `[[${namespace}]]-${key}`
  }

  return {
    get(name: string) {
      return sessionStorage.getItem(getKey(name))
        ? JSON.parse(sessionStorage.getItem(getKey(name)) || '')
        : ''
    },

    set(name: string, value: string | number | boolean | object) {
      sessionStorage.setItem(getKey(name), JSON.stringify(value))
    },

    remove(name: string) {
      sessionStorage.removeItem(getKey(name))
    },
  }
}
