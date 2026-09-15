import { createContext, useContext, useEffect, useState } from "react"
import { getSession, loginUser, logoutUser, registerUser, updateUserRecord } from "../api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(getSession())
    setReady(true)
  }, [])

  const login = async (credentials) => {
    const session = await loginUser(credentials)
    setUser(session)
    return session
  }

  const register = async (details) => {
    const session = await registerUser(details)
    setUser(session)
    return session
  }

  const logout = () => {
    logoutUser()
    setUser(null)
  }

  const updateUser = (updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates }
      localStorage.setItem("pos_session", JSON.stringify(updated))
      if (prev?.id) {
        updateUserRecord(prev.id, updates)
      }
      return updated
    })
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout, updateUser, isOwner: user?.role === "owner" }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}