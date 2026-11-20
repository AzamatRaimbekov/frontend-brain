import { useState } from 'react'

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

const defaultKey = '@setLocalStorage'

export const usePersistentState = <T>(
  key: string = defaultKey,
  initialValue: T,
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = getLocalStorage(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      setLocalStorage({ key, value: JSON.stringify(value) })
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export const setLocalStorage = ({
  key = '@setLocalStorage',
  value,
}: SetStorageProps) => {
  localStorage.setItem(key, value)
}

export const getLocalStorageAsOBJ = (key = defaultKey) => {
  return JSON.parse(JSON.stringify(localStorage.getItem(key)))
}

export const getLocalStorage = (key = defaultKey) => {
  return localStorage.getItem(key) || ''
}
export const deleteLocalStorage = (key = defaultKey) => {
  localStorage.removeItem(key)
}
