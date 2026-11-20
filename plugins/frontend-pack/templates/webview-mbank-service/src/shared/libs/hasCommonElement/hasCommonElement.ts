interface HasCommonElementProps<T> {
  firstArray: T[]
  secondArray: T[]
}

export const hasCommonElement = <T>({
  firstArray,
  secondArray,
}: HasCommonElementProps<T>) => {
  return firstArray.some((item) => secondArray.includes(item))
}

interface HasCommonModelProps<
  FirstArrayItem extends Record<string, unknown>,
  SecondArrayItem extends Record<string, unknown>,
  KeyType extends string | number | symbol = string | number | symbol,
> {
  firstArray: FirstArrayItem[]
  secondArray: SecondArrayItem[]

  firstArrayItemKey: keyof FirstArrayItem & KeyType
  secondArrayItemKey: keyof SecondArrayItem & KeyType
}

export const hasCommonModel = <
  FirstArrayItem extends Record<string, unknown>,
  SecondArrayItem extends Record<string, unknown>,
  KeyType extends string | number | symbol = string | number | symbol,
>({
  firstArray,
  secondArray,
  firstArrayItemKey,
  secondArrayItemKey,
}: HasCommonModelProps<FirstArrayItem, SecondArrayItem, KeyType>) => {
  return firstArray.some((item1) =>
    secondArray.some(
      (item2) =>
        (item1[firstArrayItemKey] as unknown) ===
        (item2[secondArrayItemKey] as unknown),
    ),
  )
}
