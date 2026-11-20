import { HeaderMatch } from '../model'

export const getLastMatchWithTitle = (matches: HeaderMatch[]) =>
  matches.filter((m) => Boolean(m.handle?.title)).at(-1)
export const getLastMatchWithSubTitle = (matches: HeaderMatch[]) =>
  matches.filter((m) => Boolean(m.handle?.subtitle)).at(-1)
export const getLastMatchWithIsExit = (matches: HeaderMatch[]) =>
  matches.filter((m) => Boolean(m.handle?.isExit)).at(-1)
export const getLastMatchWithDynamicTitle = (matches: HeaderMatch[]) =>
  matches.filter((m) => Boolean(m.handle?.dynamicTitle)).at(-1)

const getLastMatchWithBackUrl = (matches: HeaderMatch[]) =>
  matches.filter((m) => Boolean(m.handle?.backUrl)).at(-1)

export const resolveBackUrl = (matches: HeaderMatch[]): string | undefined => {
  const matchWithBackUrl = getLastMatchWithBackUrl(matches)
  const rawBackUrl = matchWithBackUrl?.handle?.backUrl
  if (!rawBackUrl) return undefined

  if (typeof rawBackUrl === 'function') {
    return rawBackUrl(matchWithBackUrl, matches)
  }

  if (rawBackUrl.startsWith('/')) return rawBackUrl

  const bidId = matches.find((match) => match.params?.bidId)?.params?.bidId
  if (!bidId) return rawBackUrl

  return `/mortgage/${bidId}/${rawBackUrl}`
}

export const HomePathPatterns = [
  /^$/,
  /^partner\/application\/[^/]+$/,
  /^owner\/[^/]+$/,
  /^seller\/[^/]+$/,
]
