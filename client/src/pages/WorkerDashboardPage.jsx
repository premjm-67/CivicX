import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import WorkerCard from '../components/worker/WorkerCard'
import ProgressUpload from '../components/worker/ProgressUpload'
import Loader from '../components/shared/Loader'

export default function WorkerDashboardPage() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    api.get(`/complaints?assignedTo=${user?._id}`)
      .then(res => setComplaints(res.data.complaints))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleUpdate = async (id, status) => {
    await api.patch(`/complaints/${id}/status`, { status })
    load()
  }

  if (loading) return <Loader />

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">My Assigned Work</h1>
        <p className="text-sm text-gray-500">Welcome, {user?.name}. {complaints.length} complaint(s) assigned.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          {complaints.length === 0 && <p className="text-center text-gray-400 py-12 text-sm">No complaints assigned yet.</p>}
          {complaints.map(c => (
            <div key={c._id} onClick={() => setSelected(c)} className={`cursor-pointer rounded-xl transition ${selected?._id === c._id ? 'ring-2 ring-blue-500' : ''}`}>
              <WorkerCard complaint={c} onUpdate={handleUpdate} />
            </div>
          ))}
        </div>
        {selected && (
          <div className="space-y-4 sticky top-20">
            <ProgressUpload complaintId={selected._id} onUploaded={load} />
          </div>
        )}
      </div>
    </div>
  )
}