import { createContext, useContext, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hca_user')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })

  const login = async (email, password) => {
    const data = await api.login({ email, password })
    const u = { ...data.user, token: data.token }
    setUser(u)
    localStorage.setItem('hca_user', JSON.stringify(u))
    return u
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hca_user')
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
