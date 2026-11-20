export * from './check-in-array'
export * from './unique-elements'
export * from './array-chunk'
export * from './remove-duplicates'
export * from './flatten-array'
export * from './filterNotExitElementsFromArray'

// Example utility function: Remove duplicates from an array
export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array))
}

// Example utility function: Flatten a nested array
export function flattenArray<T>(nestedArray: T[][]): T[] {
  return nestedArray.reduce((acc, val) => acc.concat(val), [])
}
