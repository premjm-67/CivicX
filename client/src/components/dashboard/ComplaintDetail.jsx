import { useState } from 'react'
import StatusBadge from './StatusBadge'
import AssignDepartment from './AssignDepartment'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const STATUSES = ['pending', 'in-progress', 'resolved']

export default function ComplaintDetail({ complaint, onUpdate }) {
  const { user } = useAuth()
  const [status, setStatus] = useState(complaint.status)
  const [updating, setUpdating] = useState(false)

  const handleStatus = async (s) => {
    setUpdating(true)
    try {
      await api.patch(`/complaints/${complaint._id}/status`, { status: s })
      setStatus(s)
      onUpdate({ ...complaint, status: s })
    } catch { alert('Failed to update') }
    finally { setUpdating(false) }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{complaint.description}</h2>
          <p className="text-sm text-gray-500 mt-1">{complaint.street ? `${complaint.street}, ` : ''}{complaint.area}, {complaint.city}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      {complaint.aiSummary && (
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
          <p className="text-xs font-semibold text-purple-600 mb-1">AI Analysis</p>
          <p className="text-sm text-purple-800">{complaint.aiSummary}</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {complaint.category && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{complaint.category}</span>}
            {complaint.priority && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{complaint.priority} Priority</span>}
          </div>
        </div>
      )}

      {complaint.images?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Media</p>
          <div className="flex gap-2 flex-wrap">
            {complaint.images.map((url, i) => (
              <img key={i} src={url} alt="complaint" className="w-24 h-24 rounded-xl object-cover border border-gray-200" />
            ))}
          </div>
        </div>
      )}

      {user?.role === 'admin' && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Assign Department</p>
          <AssignDepartment complaintId={complaint._id} current={complaint.department}
            onAssigned={(dept) => onUpdate({ ...complaint, department: dept })} />
        </div>
      )}

      {complaint.reporters?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Supporting Reporters ({complaint.reporters.length})</p>
          <div className="space-y-2">
            {complaint.reporters.map((reporter, index) => (
              <div key={`${reporter.userId?._id || reporter.userId || reporter.phone}-${index}`} className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-medium text-gray-800">{reporter.name}</span> · {reporter.phone}
              </div>
            ))}
          </div>
        </div>
      )}

      {['department_admin', 'worker'].includes(user?.role) && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Update Status</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map(s => (
              <button key={s} onClick={() => handleStatus(s)} disabled={status === s || updating}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition capitalize ${
                  status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                } disabled:opacity-40`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {complaint.timeline?.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Timeline</p>
          <div className="space-y-3">
            {complaint.timeline.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
                <div>
                  <p className="text-gray-800">{item.message}</p>
                  {item.imageUrl && <img src={item.imageUrl} className="mt-2 w-40 h-28 rounded-lg object-cover" />}
                  <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}