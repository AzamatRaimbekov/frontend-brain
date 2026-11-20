export function uniqueElements<T>(array: T[]): T[] {
  return array.filter((item, index) => array.indexOf(item) === index)
}
