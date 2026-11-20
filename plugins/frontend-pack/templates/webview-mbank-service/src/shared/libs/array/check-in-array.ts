export function checkValueInArray<T>(
  array: T[],
  key: keyof T,
  value: string,
): boolean {
  for (const obj of array) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && obj[key] === value) {
      return true
    }
  }
  return false
}
