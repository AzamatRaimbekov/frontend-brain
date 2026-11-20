// Small helpers with expiry in sessionStorage
export function setWithExpiry(key: string, value: string, ttlMs: number) {
  const item = { value, expiry: Date.now() + ttlMs }
  sessionStorage.setItem(key, JSON.stringify(item))
}
