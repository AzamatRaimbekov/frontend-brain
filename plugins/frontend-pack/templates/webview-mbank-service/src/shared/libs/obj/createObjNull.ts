export const createObjNull = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  const result = {} as Partial<T>

  for (const key in obj) {
    const currentKey = key

    if (obj[currentKey]) {
      result[currentKey] = obj[currentKey]
    }

    if (obj[currentKey] === null) {
      result[currentKey] = obj[currentKey]
    }
    if (obj[currentKey] === 'null') {
      result[currentKey] = obj[currentKey]
    }
  }

  return result
}
