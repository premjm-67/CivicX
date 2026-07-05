import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import WorkerLiveMap from '../components/worker/WorkerLiveMap'
import Loader from '../components/shared/Loader'

export default function WorkerLiveTrackingPage() {
  const { user } = useAuth()
  const { socket, connected } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [otherWorkers, setOtherWorkers] = useState({})
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0 })

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get(`/complaints?assignedTo=${user?._id}`)
        setComplaints(res.data.complaints)
        setStats({
          assigned: res.data.complaints.length,
          inProgress: res.data.complaints.filter(c => c.status === 'in-progress').length,
          completed: res.data.complaints.filter(c => c.status === 'resolved').length,
        })
      } catch (err) {
        console.error('Error fetching complaints:', err)
      } finally {
        setLoading(false)
      }
    }
    if (user?._id) fetchComplaints()
  }, [user])

  useEffect(() => {
    if (!socket || !user) return

    // Join worker live tracking room
    socket.emit('join-worker-live', user._id)

    // Listen for other workers' location updates
    socket.on('worker-location-update-live', (data) => {
      if (data.workerId !== user._id) {
        setOtherWorkers(prev => ({
          ...prev,
          [data.workerId]: {
            location: data.location,
            complaintId: data.complaintId,
            timestamp: data.timestamp
          }
        }))
      }
    })

    // Listen for complaint updates
    socket.on('complaint-update-live', (updatedComplaint) => {
      setComplaints(prev =>
        prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c)
      )
    })

    return () => {
      socket.off('worker-location-update-live')
      socket.off('complaint-update-live')
    }
  }, [socket, user])

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Worker Live Tracking</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <p className="text-gray-600">Your assigned complaints and nearby workers</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Assigned Tasks</p>
          <p className="text-3xl font-bold text-blue-600">{stats.assigned}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Nearby Workers</p>
          <p className="text-3xl font-bold text-purple-600">{Object.keys(otherWorkers).length}</p>
        </div>
      </div>

      {/* Main Map */}
      <WorkerLiveMap myComplaints={complaints} otherWorkers={otherWorkers} />

      {/* Assigned Complaints */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Your Assigned Complaints</h2>
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {complaints.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No complaints assigned</p>
          ) : (
            complaints.map(complaint => (
              <div key={complaint._id} className="flex items-start gap-4 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{complaint.description}</p>
                  <p className="text-xs text-gray-500">{complaint.area}, {complaint.city}</p>
                  {complaint.location && (
                    <p className="text-xs text-gray-600 mt-1">
                      📍 {complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {complaint.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Nearby Workers */}
      {Object.keys(otherWorkers).length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-lg text-gray-800 mb-4">Nearby Workers</h2>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {Object.entries(otherWorkers).map(([workerId, workerData]) => (
              <div key={workerId} className="flex items-start gap-4 pb-3 border-b border-gray-100 last:border-b-0">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">Worker #{workerId.slice(0, 8)}</p>
                  <p className="text-xs text-gray-600">
                    📍 {workerData.location.lat.toFixed(4)}, {workerData.location.lng.toFixed(4)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Last update: {new Date(workerData.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-sm text-green-600 font-semibold">🟢 Active</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
