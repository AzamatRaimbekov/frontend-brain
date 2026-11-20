export const decodeURIValue = (file: string) => {
  try {
    return decodeURI(file).split('/').pop() || ''
  } catch {
    return ''
  }
}
