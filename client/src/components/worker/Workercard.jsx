import StatusBadge from '../dashboard/StatusBadge'

export default function WorkerCard({ complaint, onUpdate }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex justify-between items-start mb-2">
        <p className="text-sm font-semibold text-gray-800 flex-1 line-clamp-2 mr-2">{complaint.description}</p>
        <StatusBadge status={complaint.status} />
      </div>
      <p className="text-xs text-gray-500">{complaint.area}, {complaint.city}</p>
      {complaint.aiSummary && <p className="text-xs text-gray-400 mt-1 line-clamp-1">AI: {complaint.aiSummary}</p>}
      <div className="mt-3 flex gap-2">
        <button onClick={() => onUpdate(complaint._id, 'in-progress')}
          disabled={complaint.status === 'in-progress' || complaint.status === 'resolved'}
          className="text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 disabled:opacity-40">
          Start Work
        </button>
        <button onClick={() => onUpdate(complaint._id, 'resolved')}
          disabled={complaint.status === 'resolved'}
          className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg hover:bg-green-100 disabled:opacity-40">
          Mark Resolved
        </button>
      </div>
    </div>
  )
}