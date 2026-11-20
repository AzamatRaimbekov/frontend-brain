import { cn } from '@shared/libs/cn'

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'

const KEYBOARD_CONTROL_SELECTOR =
  'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), [contenteditable="true"]'
const SCROLL_OFFSET = 16

function isIOS() {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

function isKeyboardControl(target: EventTarget | null): target is HTMLElement {
  return target instanceof HTMLElement && target.matches(KEYBOARD_CONTROL_SELECTOR)
}

function getScrollOffset(
  container: HTMLElement,
  target: HTMLElement,
  viewport: VisualViewport,
) {
  const containerRect = container.getBoundingClientRect()
  const targetRect = target.getBoundingClientRect()
  const viewportTop = viewport.offsetTop
  const viewportBottom = viewportTop + viewport.height
  const visibleTop = Math.max(containerRect.top, viewportTop) + SCROLL_OFFSET
  const visibleBottom =
    Math.min(containerRect.bottom, viewportBottom) - SCROLL_OFFSET

  if (targetRect.top < visibleTop) return targetRect.top - visibleTop
  if (targetRect.bottom > visibleBottom) return targetRect.bottom - visibleBottom

  return 0
}

function useKeyboardAwarePage() {
  const contentRef = useRef<HTMLDivElement>(null)
  const [viewportHeight, setViewportHeight] = useState<number>()

  useEffect(() => {
    if (!isIOS()) return

    const container = contentRef.current
    const viewport = window.visualViewport

    if (!container || !viewport) return

    let activeControl: HTMLElement | null = null
    let firstFrame: number | undefined
    let secondFrame: number | undefined

    const cancelScheduledScroll = () => {
      if (firstFrame !== undefined) cancelAnimationFrame(firstFrame)
      if (secondFrame !== undefined) cancelAnimationFrame(secondFrame)
    }

    const revealActiveControl = () => {
      cancelScheduledScroll()

      firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          if (!activeControl || document.activeElement !== activeControl) return

          const scrollOffset = getScrollOffset(
            container,
            activeControl,
            viewport,
          )

          if (scrollOffset) {
            container.scrollBy({ behavior: 'auto', top: scrollOffset })
          }
        })
      })
    }

    const handleViewportResize = () => {
      setViewportHeight(Math.round(viewport.height))
      revealActiveControl()
    }

    const handleFocusIn = (event: FocusEvent) => {
      if (!isKeyboardControl(event.target)) return

      activeControl = event.target
      revealActiveControl()
    }

    const handleFocusOut = (event: FocusEvent) => {
      if (event.target === activeControl) activeControl = null
    }

    container.addEventListener('focusin', handleFocusIn)
    container.addEventListener('focusout', handleFocusOut)
    viewport.addEventListener('resize', handleViewportResize)
    setViewportHeight(Math.round(viewport.height))

    return () => {
      cancelScheduledScroll()
      container.removeEventListener('focusin', handleFocusIn)
      container.removeEventListener('focusout', handleFocusOut)
      viewport.removeEventListener('resize', handleViewportResize)
    }
  }, [])

  return { contentRef, viewportHeight }
}

export interface KeyboardAwarePageProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  header?: ReactNode
}

/**
 * Page shell for forms that need stable keyboard behavior in iOS WebView.
 * It keeps the header fixed and scrolls only the page content.
 */
export function KeyboardAwarePage({
  children,
  className,
  contentClassName,
  header,
}: KeyboardAwarePageProps) {
  const { contentRef, viewportHeight } = useKeyboardAwarePage()

  return (
    <main
      className={cn(
        'flex h-dvh min-h-0 flex-col items-center bg-background',
        className,
      )}
      style={viewportHeight ? { height: `${viewportHeight}px` } : undefined}
    >
      {header}
      <div
        className="min-h-0 w-full flex-1 overflow-y-auto overscroll-contain [scroll-padding-block:16px]"
        ref={contentRef}
      >
        <div
          className={cn(
            'relative mx-auto w-full max-w-3xl px-4 pb-[calc(16px+env(safe-area-inset-bottom))]',
            contentClassName,
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
