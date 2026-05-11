import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import ComplaintDetail from '../components/dashboard/ComplaintDetail'
import Loader from '../components/shared/Loader'

export default function ComplaintDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/complaints/${id}`)
      .then(res => setComplaint(res.data.complaint))
      .catch(() => navigate('/dashboard'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loader />

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline mb-6 flex items-center gap-1">← Back</button>
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        {complaint && <ComplaintDetail complaint={complaint} onUpdate={setComplaint} />}
      </div>
    </div>
  )
}