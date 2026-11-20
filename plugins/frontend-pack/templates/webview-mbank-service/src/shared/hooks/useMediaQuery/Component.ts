import { CSSProperties, FC, ReactElement, ReactNode } from 'react'

import { MediaQueryAllQueryable, MediaQueryMatchers } from './types'
import useMediaQuery from './useMediaQuery'

interface MediaQueryProps extends MediaQueryAllQueryable {
  component?: ReactNode
  children?: ReactNode | ((matches: boolean | null) => ReactNode)
  query?: string
  style?: CSSProperties
  className?: string
  device?: MediaQueryMatchers
  values?: Partial<MediaQueryMatchers>
  onBeforeChange?: (_matches: boolean) => void
  onChange?: (_matches: boolean | null) => void
}

// ReactNode and ReactElement typings are a little funky for functional components, so the ReactElement cast is needed on the return
const MediaQuery: FC<MediaQueryProps> = ({
  children,
  onChange,
  ...settings
}) => {
  const matches = useMediaQuery(settings, onChange).matches

  if (typeof children === 'function') {
    return children(matches) as ReactElement
  }
  return matches ? (children as ReactElement) : null
}

export default MediaQuery
