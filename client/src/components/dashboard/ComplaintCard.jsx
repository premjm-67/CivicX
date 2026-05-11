import { useNavigate } from 'react-router-dom'
import StatusBadge from './StatusBadge'

const PRIORITY = { HIGH: 'text-red-600 bg-red-50 border-red-200', MEDIUM: 'text-orange-600 bg-orange-50 border-orange-200', LOW: 'text-green-600 bg-green-50 border-green-200' }

const timeAgo = (date) => {
  const d = Math.floor((Date.now() - new Date(date)) / 864e5)
  const h = Math.floor((Date.now() - new Date(date)) / 36e5)
  return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : 'Just now'
}

export default function ComplaintCard({ complaint }) {
  const navigate = useNavigate()
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
    </div>
  )
}