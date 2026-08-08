import { useEffect, useState } from 'react'
import { useSocket } from '../context/SocketContext'
import api from '../services/api'
import Loader from '../components/shared/Loader'

export default function AdminLiveTrackingPage() {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 })
  const [query, setQuery] = useState('')
  const { socket, connected } = useSocket()

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await api.get('/complaints')
        setComplaints(res.data.complaints)
        setStats({
          total: res.data.complaints.length,
          active: res.data.complaints.filter(c => c.status !== 'resolved').length,
          resolved: res.data.complaints.filter(c => c.status === 'resolved').length,
        })
      } catch (err) {
        console.error('Error fetching complaints:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchComplaints()
  }, [])

  useEffect(() => {
    if (!socket) return

    // Join admin live tracking room
    socket.emit('join-admin-live')

    // Listen for new complaints
    socket.on('new-complaint-live', (complaint) => {
      setComplaints(prev => [complaint, ...prev])
      setStats(s => ({ ...s, total: s.total + 1, active: s.active + 1 }))
    })

    // Listen for complaint updates
    socket.on('complaint-update-live', (updatedComplaint) => {
      setComplaints(prev =>
        prev.map(c => c._id === updatedComplaint._id ? updatedComplaint : c)
      )
      setStats(s => ({
        ...s,
        active: complaints.filter(c => c.status !== 'resolved').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
      }))
    })

    return () => {
      socket.off('new-complaint-live')
      socket.off('complaint-update-live')
    }
  }, [socket, complaints])

  const visibleComplaints = complaints.filter((complaint) => {
    const text = `${complaint.description} ${complaint.zone || ''} ${complaint.area || ''} ${complaint.street || ''}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  const exportComplaints = () => {
    const rows = visibleComplaints.map(c => [c._id, c.status, c.priority, c.department, c.zone, c.area, c.street])
    const csv = [['ID', 'Status', 'Priority', 'Department', 'Zone', 'Area', 'Street'], ...rows]
      .map(row => row.map(value => `"${String(value || '').replaceAll('"', '""')}"`).join(','))
      .join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'civicflow-complaints.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-800">Complaint Operations</h1>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-600">{connected ? 'Live' : 'Offline'}</span>
          </div>
        </div>
        <p className="text-gray-600">Real-time monitoring of complaint status and assigned teams</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search issue, zone, area, or street"
          className="flex-1 min-w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        <button onClick={exportComplaints} className="bg-gray-800 text-white rounded-lg px-4 py-2 text-sm">Export CSV</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Total Complaints</p>
          <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-3xl font-bold text-orange-600">{stats.active}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Resolved</p>
          <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-sm text-gray-600">Open Reports</p>
          <p className="text-3xl font-bold text-purple-600">{complaints.filter(c => c.status !== 'resolved').length}</p>
        </div>
      </div>

      {/* Live activity list */}
      <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="font-semibold text-lg text-gray-800 mb-4">Complaint Activity</h2>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {visibleComplaints
            .filter(c => c.status !== 'resolved')
            .length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">No active complaints</p>
            ) : (
              visibleComplaints
                .filter(c => c.status !== 'resolved')
                .map(complaint => {
                  return (
                    <div key={complaint._id} className="flex items-start gap-4 pb-3 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{complaint.description}</p>
                        <p className="text-xs text-gray-500">{complaint.street}, {complaint.area}, {complaint.city}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {complaint.assignedTo?.name || 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          complaint.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  )
                })
            )}
        </div>
      </div>
    </div>
  )
}
