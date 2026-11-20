/**
 * Creates a new object containing only the properties of the input object
 * that have truthy values.
 *
 * @param obj - The input object to filter.
 * @returns A new object with only truthy values from the input object.
 *
 * @example
 * const original = { a: 1, b: null, c: 'hello', d: undefined };
 * const filtered = createValueInObj(original);
 * console.log(filtered); // Output: { a: 1, c: 'hello' }
 */
export const createValueInObj = <T extends Record<string, unknown>>(
  obj: T,
): Partial<T> => {
  const result = {} as Partial<T>

  for (const key in obj) {
    const currentKey = key

    if (obj[currentKey]) {
      result[currentKey] = obj[currentKey]
    }
  }

  return result
}
