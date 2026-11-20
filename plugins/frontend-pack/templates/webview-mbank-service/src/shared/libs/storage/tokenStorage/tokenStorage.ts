import { appLocaleStorageKey } from '@shared/model/appLocaleStorageKey'

import {
  deleteLocalStorage,
  getLocalStorage,
  setLocalStorage,
} from '../localStorage/localStorage'
import {
  deleteSessionStorage,
  getSessionStorage,
  setSessionStorage,
} from '../sessionStorage/sessionStorage'
import { SaveStorage } from '../types'

export const TokenStorage = {
  saveToStorage({ saveLocal, value, key = appLocaleStorageKey }: SaveStorage) {
    if (saveLocal) {
      setLocalStorage({ value, key })
      return
    }

    setSessionStorage({ value, key })
  },
  getFromStorage(
    key: string = appLocaleStorageKey,
    isLocal: boolean = true,
  ): string {
    const localStorage = getLocalStorage(key)

    if (localStorage && isLocal) {
      return localStorage
    }

    const sessionStorage = getSessionStorage(key)

    if (sessionStorage && !isLocal) {
      return sessionStorage
    }

    return localStorage || sessionStorage
  },
  isSaved: (key: string = appLocaleStorageKey) => {
    const localStorage = getLocalStorage(key)

    return !!localStorage
  },

  deleteStorage() {
    deleteLocalStorage()
    deleteSessionStorage()
  },
}
