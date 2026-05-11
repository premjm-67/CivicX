import { useState } from 'react'
import api from '../../services/api'

export default function ProgressUpload({ complaintId, onUploaded }) {
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('message', message)
      if (file) formData.append('media', file)
      await api.post(`/complaints/${complaintId}/progress`, formData)
      setMessage(''); setFile(null)
      onUploaded?.()
    } catch { alert('Failed to post update') }
    finally { setLoading(false) }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Add Progress Update</h3>
      <textarea value={message} onChange={e => setMessage(e.target.value)}
        placeholder="Describe the work done..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none" />
      <div className="flex items-center gap-2 mt-2">
        <label className="cursor-pointer text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200">
          {file ? file.name : 'Attach photo/video'}
          <input type="file" accept="image/*,video/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
        </label>
        <button onClick={handleSubmit} disabled={!message.trim() || loading}
          className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-40">
          {loading ? 'Uploading...' : 'Post Update'}
        </button>
      </div>
    </div>
  )
}