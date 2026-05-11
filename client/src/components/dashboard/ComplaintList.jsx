import ComplaintCard from './ComplaintCard'
import Loader from '../shared/Loader'

export default function ComplaintList({ complaints, loading }) {
  if (loading) return <Loader />
  if (!complaints?.length) return (
    <div className="text-center py-16 text-gray-400">
      <p className="text-4xl mb-2">📭</p>
      <p className="text-sm">No complaints found</p>
    </div>
  )
  return <div className="space-y-3">{complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}</div>
}