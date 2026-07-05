import { useEffect, useState } from 'react'
import api from '../services/api'

export const useWorkerLocationTracking = (complaintId) => {
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState(null)
  const [currentLocation, setCurrentLocation] = useState(null)
  let watchId = null

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      return
    }

    setIsTracking(true)
    setError(null)

    // Get initial location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        sendLocationToServer(latitude, longitude)
      },
      (err) => {
        setError(err.message)
        setIsTracking(false)
      }
    )

    // Watch for location changes every 10 seconds
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setCurrentLocation({ lat: latitude, lng: longitude })
        sendLocationToServer(latitude, longitude)
      },
      (err) => {
        setError(err.message)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    )
  }

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
    }
    setIsTracking(false)
  }

  const sendLocationToServer = async (lat, lng) => {
    try {
      await api.post(`/complaints/${complaintId}/worker-location`, { lat, lng })
    } catch (err) {
      console.error('Failed to send location:', err)
    }
  }

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [])

  return {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking
  }
}
