import React, { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    // Determine socket target URL
    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL
      }
      const apiBase = import.meta.env.VITE_API_BASE_URL
      if (apiBase && /^https?:\/\//i.test(apiBase)) {
        try {
          return new URL(apiBase).origin
        } catch {
          // ignore parsing error, fallback to origin
        }
      }
      return window.location.origin
    }

    // Connect to WebSocket server
    const socketInstance = io(getSocketUrl(), {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    })

    socketInstance.on('connect', () => {
      console.log('⚡ Socket connected to server with ID:', socketInstance.id)
    })

    socketInstance.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [isAuthenticated, token])

  return (
    <SocketContext.Provider value={{ socket, unreadNotifications, setUnreadNotifications }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)
