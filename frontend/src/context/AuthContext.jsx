import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('alumni_portal_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('alumni_portal_token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('alumni_portal_token')
    localStorage.removeItem('alumni_portal_user')
  }, [])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me')
          if (res.success && res.data?.user) {
            setUser(res.data.user)
            localStorage.setItem('alumni_portal_user', JSON.stringify(res.data.user))
          }
        } catch (err) {
          console.warn('Session verification failed, logging out:', err.message)
          logout()
        }
      }
      setLoading(false)
    }

    fetchCurrentUser()
  }, [token, logout])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.success && res.data) {
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem('alumni_portal_token', res.data.token)
      localStorage.setItem('alumni_portal_user', JSON.stringify(res.data.user))
      return res.data.user
    }
    throw new Error(res.message || 'Login failed')
  }

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData)
    if (res.success && res.data) {
      setToken(res.data.token)
      setUser(res.data.user)
      localStorage.setItem('alumni_portal_token', res.data.token)
      localStorage.setItem('alumni_portal_user', JSON.stringify(res.data.user))
      return res.data.user
    }
    throw new Error(res.message || 'Registration failed')
  }

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('alumni_portal_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role || null,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
