import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const { token } = useAuth()

  useEffect(() => {
    if (!token) {
      setSocket(null)
      setConnected(false)
      return undefined
    }

    const s = io('/', {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket', 'polling'],
      forceNew: true,
    })
    s.on('connect', () => setConnected(true))
    s.on('disconnect', () => setConnected(false))
    s.on('connect_error', () => setConnected(false))
    setSocket(s)
    return () => s.disconnect()
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}

export const useSocket = () => useContext(SocketContext)