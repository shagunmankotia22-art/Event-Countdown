import { useState, useEffect, useCallback, useRef } from 'react'
import { readJSON } from '../lib/storage.js'

// useState backed by localStorage (JSON). Safe when `key` changes (e.g. a different
// account signs in): the new key is read fresh and the old value is never written to it.
export function useLocalStorage(key, initialValue) {
  const initialRef = useRef(initialValue)
  initialRef.current = initialValue
  const load = (k) => { const v = readJSON(k, undefined); return v === undefined ? (typeof initialRef.current === 'function' ? initialRef.current() : initialRef.current) : v }
  const [store, setStore] = useState(() => ({ key, value: load(key) }))

  let current = store
  if (store.key !== key) { current = { key, value: load(key) }; setStore(current) }

  useEffect(() => {
    if (store.key !== key) return
    try { window.localStorage.setItem(key, JSON.stringify(store.value)) } catch (err) { console.error('useLocalStorage write error:', err) }
  }, [key, store])

  const setValue = useCallback((update) => {
    setStore((prev) => {
      const base = prev.key === key ? prev.value : load(key)
      return { key, value: typeof update === 'function' ? update(base) : update }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return [current.value, setValue]
}
