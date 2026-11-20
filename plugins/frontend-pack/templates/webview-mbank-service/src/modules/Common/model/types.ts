import { UIMatch } from 'react-router-dom'

export type HeaderBackUrl =
  | string
  | ((match: HeaderMatch, matches: HeaderMatch[]) => string | undefined)

export interface HeaderMatch extends UIMatch {
  handle: {
    title?: string
    backUrl?: HeaderBackUrl
    isExit?: boolean
    subtitle?: boolean
    dynamicTitle?: boolean
  }
}
