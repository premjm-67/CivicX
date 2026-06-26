import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import StatusBadge from '../components/dashboard/StatusBadge'
import Loader from '../components/shared/Loader'

export default function MyComplaintsPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get(`/complaints?citizenId=${user?._id}`)
      .then(res => setComplaints(res.data.complaints))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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
            Report an Issue
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map(c => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}