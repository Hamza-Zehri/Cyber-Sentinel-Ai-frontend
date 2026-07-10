import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiRequest, getAccessToken, setTokens, clearTokens, type User, type TokenPair } from "./api"

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (full_name: string, email: string, password: string) => Promise<void>
  logout: (refresh_token: string) => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = async () => {
    try {
      const u = await apiRequest<User>("/api/v1/auth/me")
      setUser(u)
    } catch {
      setUser(null)
    }
  }

  useEffect(() => {
    if (getAccessToken()) {
      refreshUser().finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const pair = await apiRequest<TokenPair>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    setTokens(pair)
    await refreshUser()
  }

  const register = async (full_name: string, email: string, password: string) => {
    await apiRequest<User>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify({ full_name, email, password }),
    })
  }

  const logout = async (refresh_token: string) => {
    try {
      await apiRequest<{ message: string }>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
      })
    } finally {
      clearTokens()
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
