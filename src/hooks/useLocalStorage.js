import { useState, useEffect } from 'react'

// Custom hook: syncs state with localStorage as JSON.
// Demonstrates useState + useEffect + browser storage + JSON.parse/stringify.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch (err) {
      console.error('useLocalStorage read error:', err)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.error('useLocalStorage write error:', err)
    }
  }, [key, value])

  return [value, setValue]
}
