import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { useSocket } from '../context/SocketContext'
=======
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
import api from '../services/api'
import StatusBadge from '../components/dashboard/StatusBadge'
import Loader from '../components/shared/Loader'

export default function MyComplaintsPage() {
  const { user } = useAuth()
<<<<<<< HEAD
  const { socket } = useSocket()
=======
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

<<<<<<< HEAD
  const loadComplaints = async () => {
    try {
      const res = await api.get(`/complaints?citizenId=${user?._id}`)
      const apiComplaints = res.data.complaints || []

      // Merge with localStorage
      const local = JSON.parse(localStorage.getItem(`civicx_complaints_${user?._id}`) || '[]')

      // API is source of truth — update localStorage with latest status
      if (apiComplaints.length > 0) {
        localStorage.setItem(`civicx_complaints_${user?._id}`, JSON.stringify(apiComplaints))
        setComplaints(apiComplaints)
      } else {
        setComplaints(local)
      }
    } catch {
      // Fallback to localStorage if API fails
      const local = JSON.parse(localStorage.getItem(`civicx_complaints_${user?._id}`) || '[]')
      setComplaints(local)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadComplaints() }, [])

  // Socket — update status in realtime on this page too
  useEffect(() => {
    if (!socket || !complaints.length) return

    complaints.forEach(c => {
      socket.emit('join-complaint', c._id)
    })

    socket.on('status-update', (data) => {
      setComplaints(prev =>
        prev.map(c =>
          c._id === data.complaintId
            ? { ...c, status: data.status }
            : c
        )
      )
    })

    return () => socket.off('status-update')
  }, [socket, complaints.length])
=======
  useEffect(() => {
    api.get(`/complaints?citizenId=${user?._id}`)
      .then(res => setComplaints(res.data.complaints))
      .finally(() => setLoading(false))
  }, [])
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
<<<<<<< HEAD
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Complaints</h1>
          <p className="text-sm text-gray-500">
            Welcome, {user?.name}. {complaints.length} complaint(s) submitted.
          </p>
        </div>
        <button onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + New Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 text-sm mb-4">No complaints submitted yet.</p>
          <button onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
=======
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Complaints</h1>
        <p className="text-sm text-gray-500">Welcome, {user?.name}. Track all your submitted complaints.</p>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 text-sm">No complaints submitted yet.</p>
          <button onClick={() => navigate('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
            Report an Issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
<<<<<<< HEAD
            <div key={c._id}
              onClick={() => navigate(`/track/${c._id}`)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-800 flex-1 line-clamp-2">
                  {c.description}
                </p>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {c.category && (
                  <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                    {c.category}
                  </span>
                )}
                {c.priority && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                    c.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' :
                    'bg-green-50 text-green-600'
                  }`}>
                    {c.priority}
                  </span>
                )}
                {c.department && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                    {c.department} Dept
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              {c.aiSummary && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-1">
                  AI: {c.aiSummary}
                </p>
              )}
              <p className="text-xs text-blue-500 mt-2">
                Tap to view full timeline →
              </p>
=======
            <div key={c._id} onClick={() => navigate(`/track/${c._id}`)}
              className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 flex-1">{c.description}</p>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {c.category && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{c.category}</span>}
                {c.priority && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  c.priority === 'HIGH' ? 'bg-red-50 text-red-600' :
                  c.priority === 'MEDIUM' ? 'bg-orange-50 text-orange-600' :
                  'bg-green-50 text-green-600'}`}>{c.priority}</span>}
                {c.department && <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{c.department} Dept</span>}
                <span className="text-xs text-gray-400">{c.area}, {c.city}</span>
              </div>
              {c.aiSummary && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-1">AI: {c.aiSummary}</p>
              )}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
            </div>
          ))}
        </div>
      )}
    </div>
  )
}