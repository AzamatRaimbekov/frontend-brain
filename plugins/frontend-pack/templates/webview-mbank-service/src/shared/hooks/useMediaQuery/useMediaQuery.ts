import { Breakpoints } from '@shared/config/responsive'

import { useCallback, useEffect, useRef, useState } from 'react'

import { shallowEqualObjects } from './shallowEqual'
import toQuery from './toQuery'
import { MediaQueryAllQueryable } from './types'

type MediaQuerySettings = Partial<MediaQueryAllQueryable & { query?: string }>

const makeQuery = (settings: MediaQuerySettings) =>
  settings.query || toQuery(settings)

const useIsUpdate = () => {
  const ref = useRef(false)

  useEffect(() => {
    ref.current = true
  }, [])

  return ref.current
}

const useQuery = (settings?: MediaQuerySettings) => {
  const getQuery = useCallback(
    () => (settings ? makeQuery(settings) : null),
    [settings],
  )
  const [query, setQuery] = useState(getQuery)

  useEffect(() => {
    const newQuery = getQuery()
    if (query !== newQuery) {
      setQuery(newQuery)
    }
  }, [getQuery, query, settings])

  return query
}

const useMatches = (mq: MediaQueryList | null): boolean | null => {
  const [matches, setMatches] = useState<boolean | null>(mq ? mq.matches : null)

  useEffect(() => {
    if (!mq) return

    const updateMatches = () => {
      setMatches(mq.matches)
    }
    mq.addEventListener('change', updateMatches)
    setMatches(mq.matches)

    return () => {
      mq.removeEventListener('change', updateMatches)
    }
  }, [mq])

  return matches
}

const useMediaQuery = (
  settings?: MediaQuerySettings,
  onChange?: (matches: boolean | null) => void,
) => {
  const query = useQuery(settings)
  const mq = query ? window.matchMedia(query) : null
  const matches = useMatches(mq)
  const isUpdate = useIsUpdate()

  const [breakpointMatches, setBreakpointMatches] = useState({
    isMobile: window.matchMedia(`(max-width: ${Breakpoints.sm}px)`).matches,
    isTablet: window.matchMedia(`(max-width: ${Breakpoints.md}px)`).matches,
    isLaptop: window.matchMedia(`(max-width: ${Breakpoints.lg}px)`).matches,
    isDesktop: window.matchMedia(`(max-width: ${Breakpoints.xl}px)`).matches,
    isWidescreen: window.matchMedia(`(min-width: ${Breakpoints.xl}px)`).matches,
  })

  useEffect(() => {
    const handleResize = () => {
      const newBreakpointMatches = {
        isMobile: window.matchMedia(`(max-width: ${Breakpoints.sm}px)`).matches,
        isTablet: window.matchMedia(`(max-width: ${Breakpoints.md}px)`).matches,
        isLaptop: window.matchMedia(`(max-width: ${Breakpoints.lg}px)`).matches,
        isDesktop: window.matchMedia(`(max-width: ${Breakpoints.xl}px)`)
          .matches,
        isWidescreen: window.matchMedia(`(min-width: ${Breakpoints.xl}px)`)
          .matches,
      }
      if (!shallowEqualObjects(newBreakpointMatches, breakpointMatches)) {
        setBreakpointMatches(newBreakpointMatches)
      }
    }

    window.addEventListener('resize', handleResize)

    handleResize()

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [breakpointMatches])

  useEffect(() => {
    if (isUpdate && onChange) {
      onChange(matches)
    }
  }, [isUpdate, matches, onChange])

  return { matches, breakpointMatches }
}

export default useMediaQuery
