import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import StatusBadge from '../components/dashboard/StatusBadge'
import FilterBar from '../components/dashboard/FilterBar'

const PRIORITY_COLORS = {
  HIGH: 'border-l-red-500 bg-red-50',
  MEDIUM: 'border-l-orange-400 bg-orange-50',
  LOW: 'border-l-green-500 bg-green-50',
}

export default function DepartmentDashboardPage() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [filters, setFilters] = useState({ area: '', zone: '', street: '', status: '', priority: '', category: '' })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 })

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await api.get(`/complaints?department=${user?.department}`)
      const data = res.data.complaints
      setComplaints(data)
      setFiltered(data)
      setStats({
        total: data.length,
        pending: data.filter(c => c.status === 'pending').length,
        inProgress: data.filter(c => c.status === 'in-progress').length,
        resolved: data.filter(c => c.status === 'resolved').length,
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { fetchComplaints() }, [fetchComplaints])

  // Realtime socket
  useEffect(() => {
    if (!socket || !user) return
    socket.emit('join-department', user.department)
    socket.emit('join-dashboard')
    socket.on('new-complaint', () => fetchComplaints())
    socket.on('dashboard-refresh', () => fetchComplaints())
    return () => {
      socket.off('new-complaint')
      socket.off('dashboard-refresh')
    }
  }, [socket, user, fetchComplaints])

  useEffect(() => {
    let r = [...complaints]
    if (filters.status) r = r.filter(c => c.status === filters.status)
    if (filters.priority) r = r.filter(c => c.priority === filters.priority)
    if (filters.area) r = r.filter(c => c.area?.toLowerCase().includes(filters.area.toLowerCase()))
    if (filters.zone) r = r.filter(c => c.zone?.toLowerCase().includes(filters.zone.toLowerCase()))
    if (filters.street) r = r.filter(c => c.street?.toLowerCase().includes(filters.street.toLowerCase()))
    setFiltered(r)
  }, [filters, complaints])

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status })
      fetchComplaints()
    } catch { alert('Failed to update status') }
  }

  const handleDelete = async (event, id) => {
    event.stopPropagation()
    if (!window.confirm('Delete this complaint permanently?')) return
    try {
      await api.delete(`/complaints/${id}`)
      await fetchComplaints()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint')
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {user?.department} Department Dashboard
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm text-green-600">Live updates enabled</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-gray-800' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-blue-600' },
          { label: 'Resolved', value: stats.resolved, color: 'text-green-600' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="mt-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm text-gray-400">No complaints found</p>
          </div>
        )}
        {filtered.map(c => (
          <div key={c._id}
            className={`bg-white border-l-4 border border-gray-200 rounded-xl p-4 ${PRIORITY_COLORS[c.priority] || ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 cursor-pointer" onClick={() => navigate(`/complaint/${c._id}`)}>
                <p className="text-sm font-semibold text-gray-800 line-clamp-2">{c.description}</p>
                <p className="text-xs text-gray-500 mt-1">{c.street}, {c.area}, {c.city}</p>
                {c.aiSummary && <p className="text-xs text-gray-400 mt-1 line-clamp-1">AI: {c.aiSummary}</p>}
                <div className="flex gap-2 mt-2 flex-wrap">
                  <StatusBadge status={c.status} />
                  {c.priority && <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                    c.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                  }`}>{c.priority}</span>}
                  {c.citizenId && <span className="text-xs text-gray-400">By: {c.citizenId.name}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button onClick={() => handleStatusUpdate(c._id, 'in-progress')}
                  disabled={c.status === 'in-progress' || c.status === 'resolved'}
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-40 whitespace-nowrap">
                  Start Work
                </button>
                <button onClick={() => handleStatusUpdate(c._id, 'resolved')}
                  disabled={c.status === 'resolved'}
                  className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-40 whitespace-nowrap">
                  Mark Resolved
                </button>
                <button onClick={() => navigate(`/complaint/${c._id}`)}
                  className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 whitespace-nowrap">
                  Add Progress
                </button>
                <button onClick={(event) => handleDelete(event, c._id)}
                  className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 whitespace-nowrap">
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}