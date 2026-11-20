export const getBaseUrl = (accessUrl: string) => {
  const url = new URL(accessUrl)
  url.search = ''
  return url.toString()
}
