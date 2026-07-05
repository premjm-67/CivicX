import { useEffect, useState } from 'react'

export default function RealtimeNotification({ updates, position = 'top-right' }) {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    if (!updates.lastUpdate) return

    const newToasts = []

    if (updates.statusUpdates.length > 0) {
      const lastStatus = updates.statusUpdates[updates.statusUpdates.length - 1]
      newToasts.push({
        id: `status-${lastStatus.complaintId}`,
        type: 'status',
        title: '📢 Status Update',
        message: `Your complaint status is now: ${lastStatus.status.toUpperCase()}`,
        timestamp: lastStatus.receivedAt
      })
    }

    if (updates.timelineUpdates.length > 0) {
      const lastTimeline = updates.timelineUpdates[updates.timelineUpdates.length - 1]
      newToasts.push({
        id: `timeline-${lastTimeline.complaintId}`,
        type: 'timeline',
        title: '📝 Progress Update',
        message: lastTimeline.message,
        timestamp: lastTimeline.receivedAt
      })
    }

    if (updates.workerAssigned) {
      newToasts.push({
        id: `assigned-${updates.workerAssigned.complaintId}`,
        type: 'assigned',
        title: '👷 Worker Assigned',
        message: updates.workerAssigned.message,
        timestamp: updates.workerAssigned.timestamp
      })
    }

    if (updates.workerLocation) {
      newToasts.push({
        id: `location-${updates.workerLocation.complaintId}`,
        type: 'location',
        title: '📍 Live Location',
        message: `Worker is tracking live at ${updates.workerLocation.location.lat.toFixed(4)}, ${updates.workerLocation.location.lng.toFixed(4)}`,
        timestamp: updates.workerLocation.timestamp
      })
    }

    newToasts.forEach(toast => {
      setToasts(prev => [...prev, toast])
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id))
      }, 4000)
    })
  }, [updates.lastUpdate])

  const positionClass = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }[position]

  const bgColors = {
    status: 'bg-blue-50 border-blue-200 text-blue-900',
    timeline: 'bg-purple-50 border-purple-200 text-purple-900',
    assigned: 'bg-green-50 border-green-200 text-green-900',
    location: 'bg-cyan-50 border-cyan-200 text-cyan-900'
  }

  return (
    <div className={`fixed ${positionClass} space-y-2 z-50 pointer-events-none`}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`border rounded-lg p-3 max-w-xs shadow-lg animation-slide-in ${bgColors[toast.type]}`}
        >
          <p className="font-semibold text-sm">{toast.title}</p>
          <p className="text-xs mt-1 opacity-90">{toast.message}</p>
          <style>{`
            @keyframes slideIn {
              from {
                transform: translateX(400px);
                opacity: 0;
              }
              to {
                transform: translateX(0);
                opacity: 1;
              }
            }
            .animation-slide-in {
              animation: slideIn 0.3s ease-out;
            }
          `}</style>
        </div>
      ))}
    </div>
  )
}
