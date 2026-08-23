import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import StatusBadge from './StatusBadge'

const PRIORITY = { HIGH: 'text-red-600 bg-red-50 border-red-200', MEDIUM: 'text-orange-600 bg-orange-50 border-orange-200', LOW: 'text-green-600 bg-green-50 border-green-200' }

const timeAgo = (date) => {
  const d = Math.floor((Date.now() - new Date(date)) / 864e5)
  const h = Math.floor((Date.now() - new Date(date)) / 36e5)
  return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : 'Just now'
}

export default function ComplaintCard({ complaint }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleDelete = async (event) => {
    event.stopPropagation()
    if (!window.confirm('Delete this complaint permanently?')) return
    try {
      await api.delete(`/complaints/${complaint._id}`)
      window.location.reload()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete complaint')
    }
  }
  return (
    <div onClick={() => navigate(`/complaint/${complaint._id}`)}
      className="bg-white border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 flex-1">{complaint.description}</p>
        {complaint.priority && (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${PRIORITY[complaint.priority] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
            {complaint.priority}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <StatusBadge status={complaint.status} />
        {complaint.category && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{complaint.category}</span>}
        {complaint.department && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{complaint.department} Dept.</span>}
        <span className="text-xs text-gray-400">{complaint.area}, {complaint.city}</span>
        <span className="text-xs text-gray-400 ml-auto">{timeAgo(complaint.createdAt)}</span>
      </div>
      {complaint.aiSummary && <p className="text-xs text-gray-400 mt-2 line-clamp-1">AI: {complaint.aiSummary}</p>}
      {user?.role === 'admin' && (
        <button onClick={handleDelete} className="mt-3 text-xs text-red-600 hover:text-red-800">Delete complaint</button>
      )}
    </div>
  )
}