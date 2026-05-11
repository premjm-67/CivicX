import { useEffect, useState } from 'react'
import api from '../services/api'
import FilterBar from '../components/dashboard/FilterBar'
import ComplaintList from '../components/dashboard/ComplaintList'
import PriorityQueue from '../components/dashboard/PriorityQueue'
import StatsBar from '../components/dashboard/StatsBar'
import ComplaintMap from '../components/maps/ComplaintMap'

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([])
  const [filtered, setFiltered] = useState([])
  const [stats, setStats] = useState({})
  const [filters, setFilters] = useState({ area: '', status: '', priority: '', category: '' })
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('list')

  useEffect(() => {
    Promise.all([api.get('/complaints'), api.get('/dashboard/stats')])
      .then(([c, s]) => { setComplaints(c.data.complaints); setFiltered(c.data.complaints); setStats(s.data) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let r = [...complaints]
    if (filters.area) r = r.filter(c => c.area?.toLowerCase().includes(filters.area.toLowerCase()))
    if (filters.status) r = r.filter(c => c.status === filters.status)
    if (filters.priority) r = r.filter(c => c.priority === filters.priority)
    if (filters.category) r = r.filter(c => c.category === filters.category)
    setFiltered(r)
  }, [filters, complaints])

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-800">Government Dashboard</h1>
        <div className="flex gap-2">
          {['list', 'map'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:border-blue-400'}`}>
              {t} View
            </button>
          ))}
        </div>
      </div>
      <StatsBar stats={stats} />
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <FilterBar filters={filters} onChange={setFilters} />
          {tab === 'list' ? <ComplaintList complaints={filtered} loading={loading} /> : <ComplaintMap complaints={filtered} />}
        </div>
        <div className="lg:col-span-1">
          <PriorityQueue complaints={complaints} />
        </div>
      </div>
    </div>
  )
}