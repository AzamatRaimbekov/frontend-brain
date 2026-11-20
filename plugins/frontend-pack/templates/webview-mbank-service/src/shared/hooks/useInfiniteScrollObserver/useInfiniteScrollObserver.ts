import { useEffect, useRef } from 'react'

interface useInfiniteScrollObserverProps {
  onLoadMore: () => void
  hasMore: boolean
  loading?: boolean
}

export const useInfiniteScrollObserver = ({
  onLoadMore,
  hasMore,
  loading,
}: useInfiniteScrollObserverProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!hasMore) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [target] = entries
        if (target.isIntersecting && hasMore && !loading) {
          onLoadMore()
        }
      },
      { threshold: 0.5 },
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, onLoadMore])

  return {
    loadMoreRef,
    isLoading: loading,
    hasMore,
  }
}
