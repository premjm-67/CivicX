import { useState } from 'react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const DEPTS = ['Road', 'Water', 'Garbage', 'Electrical', 'Drainage']

export default function AssignDepartment({ complaintId, current, onAssigned }) {
  const { user } = useAuth()
  const [dept, setDept] = useState(current || '')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  if (user?.role !== 'admin') return null

  const handleAssign = async () => {
    if (!dept) return alert('Please select a department')
    setLoading(true)
    try {
      const res = await api.patch(`/complaints/${complaintId}/assign`, { department: dept })
      setDone(true)
      onAssigned(dept)
      setTimeout(() => setDone(false), 3000)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign department')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={dept}
        onChange={e => setDept(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        <option value="">Select Department</option>
        {DEPTS.map(d => (
          <option key={d} value={d}>{d} Department</option>
        ))}
      </select>
      <button
        onClick={handleAssign}
        disabled={!dept || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40 transition"
      >
        {loading ? 'Assigning...' : done ? '✅ Assigned!' : 'Assign'}
      </button>
      {current && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          Current: {current} Dept
        </span>
      )}
    </div>
  )
}