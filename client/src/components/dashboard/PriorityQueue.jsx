import { useNavigate } from 'react-router-dom'

export default function PriorityQueue({ complaints }) {
  const navigate = useNavigate()
  const high = complaints?.filter(c => c.priority === 'HIGH' && c.status !== 'resolved') || []
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <h3 className="font-semibold text-sm text-gray-800">High Priority</h3>
        <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">{high.length}</span>
      </div>
      {high.length === 0 && <p className="text-xs text-gray-400">No high priority complaints</p>}
      <div className="space-y-2 max-h-72 overflow-y-auto">
        {high.map(c => (
          <div key={c._id} onClick={() => navigate(`/complaint/${c._id}`)}
            className="border-l-4 border-red-500 bg-red-50 rounded-r-lg px-3 py-2 cursor-pointer hover:bg-red-100 transition">
            <p className="text-xs font-medium text-gray-800 line-clamp-1">{c.description}</p>
            <p className="text-xs text-gray-500 mt-0.5">{c.area}, {c.city}</p>
          </div>
        ))}
      </div>
    </div>
  )
}