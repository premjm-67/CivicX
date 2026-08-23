import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import StatusBadge from '../components/dashboard/StatusBadge'
import Loader from '../components/shared/Loader'

export default function MyComplaintsPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const loadComplaints = async () => {
    try {
      const res = await api.get(`/complaints?citizenId=${user?._id}`)
      const apiComplaints = res.data.complaints || []
      const local = JSON.parse(localStorage.getItem(`civicx_complaints_${user?._id}`) || '[]')

      if (apiComplaints.length > 0) {
        localStorage.setItem(`civicx_complaints_${user?._id}`, JSON.stringify(apiComplaints))
        setComplaints(apiComplaints)
      } else {
        setComplaints(local)
      }
    } catch {
      const local = JSON.parse(localStorage.getItem(`civicx_complaints_${user?._id}`) || '[]')
      setComplaints(local)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (event, id) => {
    event.stopPropagation()
    if (!window.confirm('Delete this complaint permanently?')) return
    try {
      await api.delete(`/complaints/${id}`)
      const remaining = complaints.filter((complaint) => complaint._id !== id)
      setComplaints(remaining)
      localStorage.setItem(`civicx_complaints_${user?._id}`, JSON.stringify(remaining))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint')
    }
  }

  useEffect(() => {
    loadComplaints()
  }, [user?._id])

  useEffect(() => {
    if (!socket || !complaints.length) return

    complaints.forEach((c) => {
      socket.emit('join-complaint', c._id)
    })

    const handleStatusUpdate = (data) => {
      setComplaints((prev) => prev.map((c) => c._id === data.complaintId ? { ...c, status: data.status } : c))
    }

    socket.on('status-update', handleStatusUpdate)
    return () => socket.off('status-update', handleStatusUpdate)
  }, [socket, complaints.length])

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">My Complaints</h1>
          <p className="text-sm text-gray-500">Welcome, {user?.name}. {complaints.length} complaint(s) submitted.</p>
        </div>
        <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          + New Complaint
        </button>
      </div>

      {complaints.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-gray-500 text-sm mb-4">No complaints submitted yet.</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
            Report an Issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} onClick={() => navigate(`/track/${c._id}`)} className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-800 flex-1 line-clamp-2">{c.description}</p>
                <StatusBadge status={c.status} />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">Track status</span>
                <span className="text-xs text-gray-400 ml-auto">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              {c.aiSummary && <p className="text-xs text-gray-400 mt-2 line-clamp-1">AI: {c.aiSummary}</p>}
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-blue-500">Tap to view full timeline →</p>
                <button onClick={(event) => handleDelete(event, c._id)} className="text-xs text-red-600 hover:text-red-800">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}