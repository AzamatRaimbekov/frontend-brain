export const jsonParse = (value: string) => {
  if (!value) return

  try {
    return JSON.parse(value)
  } catch (error: unknown) {
    console.error(error)
    return ''
  }
}

export const jsonStringify: (value: object) => string = (value: object) => {
  try {
    return JSON.stringify(value)
  } catch (error: unknown) {
    console.error(error)
    return ''
  }
}
