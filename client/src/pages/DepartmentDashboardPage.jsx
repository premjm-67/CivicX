import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import ComplaintList from '../components/dashboard/ComplaintList'
import FilterBar from '../components/dashboard/FilterBar'
import StatusBadge from '../components/dashboard/StatusBadge'

export default function DepartmentDashboardPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [filters, setFilters] = useState({ area: '', status: '', priority: '', category: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/complaints?department=${user?.department}`)
      .then(res => { setComplaints(res.data.complaints); setFiltered(res.data.complaints) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let r = [...complaints]
    if (filters.status) r = r.filter(c => c.status === filters.status)
    if (filters.priority) r = r.filter(c => c.priority === filters.priority)
    if (filters.area) r = r.filter(c => c.area?.toLowerCase().includes(filters.area.toLowerCase()))
    setFiltered(r)
  }, [filters, complaints])

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{user?.department || 'Department'} Dashboard</h1>
        <p className="text-sm text-gray-500">Manage complaints assigned to your department</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['pending', 'in-progress', 'resolved'].map(s => (
          <div key={s} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-800">{complaints.filter(c => c.status === s).length}</p>
            <div className="mt-1 flex justify-center"><StatusBadge status={s} /></div>
          </div>
        ))}
      </div>
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="mt-4"><ComplaintList complaints={filtered} loading={loading} /></div>
    </div>
  )
}