import { useEffect, useState } from 'react'
import api from '../services/api'
import FilterBar from '../components/dashboard/FilterBar'
import ComplaintList from '../components/dashboard/ComplaintList'
import PriorityQueue from '../components/dashboard/PriorityQueue'
import StatsBar from '../components/dashboard/StatsBar'

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({ area: '', zone: '', street: '', status: '', priority: '', category: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/complaints'), api.get('/dashboard/stats')])
      .then(([c, s]) => { setComplaints(c.data.complaints); setFiltered(c.data.complaints); setStats(s.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let r = [...complaints]
    if (filters.area) r = r.filter(c => c.area?.toLowerCase().includes(filters.area.toLowerCase()))
    if (filters.zone) r = r.filter(c => c.zone?.toLowerCase().includes(filters.zone.toLowerCase()))
    if (filters.street) r = r.filter(c => c.street?.toLowerCase().includes(filters.street.toLowerCase()))
    if (filters.status) r = r.filter(c => c.status === filters.status)
    if (filters.priority) r = r.filter(c => c.priority === filters.priority)
    if (filters.category) r = r.filter(c => c.category === filters.category)
    setFiltered(r)
  }, [filters, complaints])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Government Dashboard</h1>
      </div>
      <StatsBar stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <FilterBar filters={filters} onChange={setFilters} />
          <ComplaintList complaints={filtered} loading={loading} />
        </div>
        <div className="lg:col-span-1">
          <PriorityQueue complaints={complaints} />
        </div>
      </div>
    </div>
  )
}