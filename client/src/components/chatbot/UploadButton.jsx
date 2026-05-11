import { useState } from 'react'

export default function UploadButton({ onUpload }) {
  const [previews, setPreviews] = useState([])

  const handleChange = (e) => {
    const files = Array.from(e.target.files)
    onUpload(files)
    setPreviews(files.map(f => ({
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image'
    })))
  }

  return (
    <div className="mt-2">
      <label className="cursor-pointer inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Upload Image / Video
        <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleChange} />
      </label>
      {previews.length > 0 && (
        <div className="flex gap-2 mt-2 flex-wrap">
          {previews.map((p, i) => (
            <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
              {p.type === 'image'
                ? <img src={p.url} alt="preview" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">Video</div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  )
}