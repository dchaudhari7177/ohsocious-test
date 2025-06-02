"use client"

import { useState, useEffect } from "react"
import { Timestamp } from "firebase/firestore"

interface FetchResponse<T> {
  items: T[]
  nextCursor: Timestamp | null
}

interface UseInfiniteScrollOptions<T> {
  initialData?: T[]
  pageSize?: number
}

export function useInfiniteScroll<T>(
  fetchFn: (params: { pageParam?: Timestamp | null }) => Promise<FetchResponse<T>>,
  options: UseInfiniteScrollOptions<T> = {}
) {
  const [data, setData] = useState<{ pages: FetchResponse<T>[] }>({ pages: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)

  // Initial fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetchFn({ pageParam: null })
        setData({ pages: [response] })
        setHasNextPage(!!response.nextCursor)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to fetch data"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [fetchFn])

  const fetchNextPage = async () => {
    if (!hasNextPage || isFetchingNextPage) return

    setIsFetchingNextPage(true)

    try {
      const lastPage = data.pages[data.pages.length - 1]
      const response = await fetchFn({ pageParam: lastPage.nextCursor })

      setData((prev) => ({
        pages: [...prev.pages, response],
      }))

      setHasNextPage(!!response.nextCursor)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch next page"))
    } finally {
      setIsFetchingNextPage(false)
    }
  }

  return {
    data,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  }
} 