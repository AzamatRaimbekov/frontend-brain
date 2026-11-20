/**
 * Flattens a nested array into a single array.
 *
 * @param nestedArray - The nested array to flatten.
 * @returns A new flattened array.
 *
 * @example
 * const nested = [[1, 2], [3, 4], [5]];
 * const flat = flattenArray(nested);
 * console.log(flat); // Output: [1, 2, 3, 4, 5]
 */
export function flattenArray<T>(nestedArray: T[][]): T[] {
  return nestedArray.reduce((acc, val) => acc.concat(val), [])
}
