export function getWithExpiry(key: string): string | null {
  const raw = sessionStorage.getItem(key)
  if (!raw) return null
  try {
    const item = JSON.parse(raw) as { value: string; expiry: number }
    if (Date.now() > item.expiry) {
      sessionStorage.removeItem(key)
      return null
    }
    return item.value
  } catch {
    sessionStorage.removeItem(key)
    return null
  }
}
