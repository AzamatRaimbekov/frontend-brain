export function multiplyParamsOrder(params: string, value: string) {
  const orderBy = params ? params.split(',') : []

  const valueIndex = orderBy.findIndex((item) => item.includes(value))
  if (valueIndex !== -1) {
    const firstLetter = orderBy[valueIndex][0]
    if (firstLetter === '-') {
      orderBy.pop()
    } else {
      orderBy[valueIndex] = `-${orderBy[valueIndex]}`
    }
  } else {
    orderBy.push(value)
  }

  return orderBy
}
