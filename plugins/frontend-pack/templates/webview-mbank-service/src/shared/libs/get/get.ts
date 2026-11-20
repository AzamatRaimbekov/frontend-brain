export function get<T = unknown>(
  obj: Record<string, unknown> | undefined, // Use unknown instead of any
  path: string | string[],
  defaultValue?: T,
): T {
  if (!obj || typeof obj !== 'object') return defaultValue as T

  const keys = Array.isArray(path) ? path : path.split('.')

  let result: unknown = obj // Use unknown instead of any
  for (const key of keys) {
    if (result == null || typeof result !== 'object') return defaultValue as T
    result = (result as Record<string, unknown>)[key]
  }

  return result !== undefined ? (result as T) : (defaultValue as T)
}
