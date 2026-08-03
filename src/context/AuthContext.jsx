import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useLocalStorage(
    'event-countdown:auth',
    false
  )
  const [userName, setUserName] = useLocalStorage(
    'event-countdown:username',
    ''
  )

  // login now actually stores the name the person typed in,
  // instead of using a hardcoded placeholder
  const login = useCallback((name) => {
    setIsAuthenticated(true)
    if (name && name.trim()) setUserName(name.trim())
  }, [setIsAuthenticated, setUserName])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
  }, [setIsAuthenticated])

  return (
    <AuthContext.Provider value={{ isAuthenticated, userName, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
