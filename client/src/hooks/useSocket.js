import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'

export function useSocketEvent(event) {
  const { socket } = useSocket()
  const [data, setData] = useState(null)

  useEffect(() => {
    if (!socket) return
    socket.on(event, setData)
    return () => socket.off(event, setData)
  }, [socket, event])

  return data
}