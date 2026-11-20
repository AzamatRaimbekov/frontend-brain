// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { getWithExpiry } from '@shared/libs/getWithExpiry'
import { isChunkLoadError } from '@shared/libs/isChunkLoadError'
import { setWithExpiry } from '@shared/libs/setWithExpiry'
import { closeMobileWebView } from '@shared/mobile-bridge/mobileBridge'
import { getTheme } from '@shared/theme'
import { BigChevronLeft } from 'md-glyphs'

import { Component, ErrorInfo, ReactNode } from 'react'

import s from './ErrorPage.module.css'

interface Props {
  children?: ReactNode
  path?: string
}

interface State {
  errorText: string | null
  crashData: string | null
}

const chunkFailedKey = 'chunk_failed'
const chunkTtlMs = 10_000

function closeWebView() {
  void closeMobileWebView()
}

export class ErrorHoc extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      errorText: null,
      crashData: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (isChunkLoadError(error)) {
      if (!getWithExpiry(chunkFailedKey)) {
        setWithExpiry(chunkFailedKey, 'true', chunkTtlMs)
        window.location.reload()
        return
      }
    }

    this.setState({
      errorText: error.message,
      crashData: errorInfo.componentStack,
    })
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.path !== this.props.path) {
      this.setState({ errorText: null, crashData: null })
    }
  }

  render() {
    const { errorText } = this.state

    if (errorText) {
      return <ErrorPage theme={getTheme()} />
    }

    return this.props.children
  }
}

function ErrorPage({ theme }: { theme: 'dark' | 'light' }) {
  return (
    <div
      className={s.page}
      data-theme={theme}
    >
      {/* back arrow */}
      <button
        className={s.back}
        onClick={closeWebView}
        aria-label="Назад"
      >
        <BigChevronLeft
          size={24}
          color="currentColor"
        />
      </button>

      {/* centered content */}
      <div className={s.content}>
        <div className={s.iconWrap}>
          <ClockIcon />
        </div>

        <h1 className={s.title}>Технические работы</h1>
        <p className={s.subtitle}>
          Временно ведутся технические работы.{'\n'}
          Просим прощения, вернитесь чуть позже
        </p>
      </div>

      {/* bottom cta */}
      <div className={s.footer}>
        <button
          className={s.btn}
          onClick={closeWebView}
        >
          На главную
        </button>
      </div>
    </div>
  )
}

function ClockIcon() {
  return (
    <svg
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        width="64"
        height="64"
        rx="32"
        fill="var(--input)"
      />
      <path
        d="M48.6663 32.0002C48.6663 41.2049 41.2044 48.6668 31.9997 48.6668C22.7949 48.6668 15.333 41.2049 15.333 32.0002C15.333 22.7954 22.7949 15.3335 31.9997 15.3335C41.2044 15.3335 48.6663 22.7954 48.6663 32.0002Z"
        fill="var(--card)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M31.9997 24.0835C32.69 24.0835 33.2497 24.6431 33.2497 25.3335V31.4824L37.0502 35.2829C37.5384 35.7711 37.5384 36.5626 37.0502 37.0507C36.5621 37.5389 35.7706 37.5389 35.2825 37.0507L31.1158 32.884C30.8814 32.6496 30.7497 32.3317 30.7497 32.0002V25.3335C30.7497 24.6431 31.3093 24.0835 31.9997 24.0835Z"
        fill="var(--muted-foreground)"
      />
    </svg>
  )
}
