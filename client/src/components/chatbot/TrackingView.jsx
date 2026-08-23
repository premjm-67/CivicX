import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { useCitizenComplaintUpdates } from '../../hooks/useCitizenComplaintUpdates'
import RealtimeNotification from '../shared/RealtimeNotification'

const FEEDBACK_OPTIONS = [5, 4, 3, 2, 1]

const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  resolved: 'bg-green-100 text-green-700',
}

export default function TrackingView() {
  const { id } = useParams()
  const { user } = useAuth()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ rating: 5, comment: '' })
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const updates = useCitizenComplaintUpdates(id, user?._id)

  const loadComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data.complaint)
      if (res.data.complaint?.feedback) {
        setFeedback({
          rating: res.data.complaint.feedback.rating || 5,
          comment: res.data.complaint.feedback.comment || ''
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComplaint()
  }, [id])

  // Update complaint with real-time changes
  useEffect(() => {
    if (updates.lastUpdate && complaint) {
      if (updates.statusUpdates.length > 0) {
        const lastStatusUpdate = updates.statusUpdates[updates.statusUpdates.length - 1]
        setComplaint(prev => ({
          ...prev,
          status: lastStatusUpdate.status,
          timeline: lastStatusUpdate.timeline || prev.timeline
        }))
      }
      if (updates.timelineUpdates.length > 0) {
        const lastTimelineUpdate = updates.timelineUpdates[updates.timelineUpdates.length - 1]
        setComplaint(prev => ({
          ...prev,
          timeline: [...(prev.timeline || []), {
            message: lastTimelineUpdate.message,
            timestamp: lastTimelineUpdate.timestamp
          }]
        }))
      }
    }
  }, [updates, complaint])

  const handleFeedbackSubmit = async () => {
    try {
      setSubmittingFeedback(true)
      await api.patch(`/complaints/${id}/feedback`, feedback)
      await loadComplaint()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!complaint) return <div className="text-center p-8 text-gray-500">Complaint not found.</div>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <RealtimeNotification updates={updates} position="top-right" />
      <div className="space-y-6">
        {/* Complaint Details */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-lg">Complaint Tracking</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[complaint.status] || 'bg-gray-100 text-gray-600'}`}>
              {complaint.status}
            </span>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-medium text-gray-800">ID:</span> <span className="font-mono text-xs">{complaint._id}</span></p>
            <p><span className="font-medium text-gray-800">Issue:</span> {complaint.description}</p>
            <p><span className="font-medium text-gray-800">Location:</span> {complaint.street ? `${complaint.street}, ` : ''}{complaint.area}, {complaint.city}</p>
          </div>

          {complaint.aiSummary && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-600 mb-1">AI Summary</p>
              <p className="text-sm text-blue-800">{complaint.aiSummary}</p>
            </div>
          )}

          {complaint.status === 'resolved' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-sm font-semibold text-amber-800">Feedback</p>
                <p className="text-xs text-amber-700">How was the resolution experience?</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {FEEDBACK_OPTIONS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFeedback((prev) => ({ ...prev, rating: value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border ${feedback.rating === value ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-700 border-amber-200'}`}
                  >
                    {value}★
                  </button>
                ))}
              </div>

              <textarea
                value={feedback.comment}
                onChange={(e) => setFeedback((prev) => ({ ...prev, comment: e.target.value }))}
                rows={3}
                placeholder="Tell us how the service was handled..."
                className="w-full border border-amber-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />

              <button
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback}
                className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
              >
                {submittingFeedback ? 'Submitting...' : complaint.feedback ? 'Update Feedback' : 'Submit Feedback'}
              </button>

              {complaint.feedback && (
                <div className="bg-white border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
                  <p className="font-medium">Current rating: {complaint.feedback.rating}/5</p>
                  {complaint.feedback.comment && <p className="mt-1 text-amber-800">{complaint.feedback.comment}</p>}
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Progress Timeline</h3>
            {complaint.timeline?.length > 0 ? (
              <div className="space-y-4">
                {complaint.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-600 mt-0.5 flex-shrink-0" />
                      {i < complaint.timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
                    </div>
                    <div className="pb-4">
                      <p className="text-sm font-medium text-gray-800">{item.message}</p>
                      {item.imageUrl && <img src={item.imageUrl} alt="progress" className="mt-2 rounded-xl w-48 h-32 object-cover" />}
                      <p className="text-xs text-gray-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No updates yet. We'll notify you as soon as there's progress.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}