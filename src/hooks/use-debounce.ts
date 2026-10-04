import { useState, useEffect } from 'react'

/**
 * Debounce a value for the given delay.
 * Useful for search inputs that trigger API calls.
 *
 * @example
 * const debouncedSearch = useDebounce(searchInput, 300)
 * useQuery({ queryKey: ['list', debouncedSearch], ... })
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
