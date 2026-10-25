import { createContext, useContext, useMemo, useState } from 'react'

// One shared search query for the single search bar in the top navigation.
const SearchContext = createContext(null)

export function SearchProvider({ children }) {
  const [query, setQuery] = useState('')
  const value = useMemo(() => ({ query, setQuery, clear: () => setQuery('') }), [query])
  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
}
export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error('useSearch must be used within SearchProvider')
  return ctx
}
