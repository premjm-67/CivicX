import { useState } from 'react'
import api from '../../services/api'

const DEPTS = ['Road', 'Water', 'Garbage', 'Electrical', 'Drainage']

export default function AssignDepartment({ complaintId, current, onAssigned }) {
  const [dept, setDept] = useState(current || '')
  const [loading, setLoading] = useState(false)

  const handleAssign = async () => {
    setLoading(true)
    try {
      await api.patch(`/complaints/${complaintId}/assign`, { department: dept })
      onAssigned(dept)
    } catch { alert('Failed to assign') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex items-center gap-2">
      <select value={dept} onChange={e => setDept(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">Select department</option>
        {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
      <button onClick={handleAssign} disabled={!dept || loading}
        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40">
        {loading ? 'Assigning...' : 'Assign'}
      </button>
    </div>
  )
}