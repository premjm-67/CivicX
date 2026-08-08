import { useState } from 'react'
import StatusBadge from '../dashboard/StatusBadge'
import { useWorkerLocationTracking } from '../../hooks/useWorkerLocationTracking'

export default function WorkerCard({ complaint, onUpdate }) {
  const { isTracking, startTracking, stopTracking, currentLocation, error } = useWorkerLocationTracking(complaint._id)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-semibold text-gray-800 flex-1 line-clamp-2 mr-2">{complaint.description}</p>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="text-xs text-gray-500">{complaint.street ? `${complaint.street}, ` : ''}{complaint.area}, {complaint.city}</p>
      {complaint.aiSummary && <p className="text-xs text-gray-400 mt-1 line-clamp-1">AI: {complaint.aiSummary}</p>}
      {currentLocation && <p className="text-xs text-green-600 mt-1">📍 Live: {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>}
      {error && <p className="text-xs text-red-500 mt-1">⚠️ {error}</p>}
      <div className="mt-3 flex gap-2 flex-wrap">
        <button onClick={() => onUpdate(complaint._id, 'in-progress')}
          disabled={complaint.status === 'in-progress' || complaint.status === 'resolved'}
          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-40">
          Start Work
        </button>
        <button onClick={() => onUpdate(complaint._id, 'resolved')}
          disabled={complaint.status === 'resolved'}
          className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-40">
          Mark Resolved
        </button>
        <button onClick={() => isTracking ? stopTracking() : startTracking()}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
            isTracking 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          }`}>
          {isTracking ? '⏹ Stop Tracking' : '🌐 Share Location'}
        </button>
      </div>
    </div>
  )
}