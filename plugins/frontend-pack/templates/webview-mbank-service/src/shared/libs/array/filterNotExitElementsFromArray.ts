type Item<T> = T[]

interface FilterNeedElementsFromArrayProps<T> {
  targetArray: Item<T>
  needItemsArray: Item<T>
}

export const filterNotExitElementsFromArray = <T>({
  needItemsArray,
  targetArray,
}: FilterNeedElementsFromArrayProps<T>) => {
  return targetArray?.filter((item) => !needItemsArray.includes(item))
}
