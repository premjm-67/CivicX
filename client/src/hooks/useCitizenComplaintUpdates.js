import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'

export const useCitizenComplaintUpdates = (complaintId, citizenId) => {
  const { socket } = useSocket()
  const [updates, setUpdates] = useState({
    statusUpdates: [],
    timelineUpdates: [],
    workerLocation: null,
    workerAssigned: null,
    lastUpdate: null
  })

  useEffect(() => {
    if (!socket || !complaintId || !citizenId) return

    const joinRooms = () => {
      socket.emit('join-citizen', citizenId)
      socket.emit('join-complaint', complaintId)
    }

    // Join citizen's personal room
    joinRooms()
    socket.on('connect', joinRooms)

    // Listen for status updates
    socket.on('status-update', (data) => {
      if (data.complaintId === complaintId) {
        setUpdates(prev => ({
          ...prev,
          statusUpdates: [...prev.statusUpdates, { ...data, receivedAt: new Date() }],
          lastUpdate: new Date()
        }))
      }
    })

    // Listen for timeline updates
    socket.on('timeline-update', (data) => {
      if (data.complaintId === complaintId) {
        setUpdates(prev => ({
          ...prev,
          timelineUpdates: [...prev.timelineUpdates, { ...data, receivedAt: new Date() }],
          lastUpdate: new Date()
        }))
      }
    })

    // Listen for worker location updates
    socket.on('worker-location-update', (data) => {
      if (data.complaintId === complaintId) {
        setUpdates(prev => ({
          ...prev,
          workerLocation: data,
          lastUpdate: new Date()
        }))
      }
    })

    // Listen for worker assignment
    socket.on('worker-assigned', (data) => {
      if (data.complaintId === complaintId) {
        setUpdates(prev => ({
          ...prev,
          workerAssigned: data,
          lastUpdate: new Date()
        }))
      }
    })

    return () => {
      socket.off('connect', joinRooms)
      socket.off('status-update')
      socket.off('timeline-update')
      socket.off('worker-location-update')
      socket.off('worker-assigned')
    }
  }, [socket, complaintId, citizenId])

  return updates
}
