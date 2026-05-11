import { useState } from 'react'

export default function LocationPicker({ onLocation }) {
  const [status, setStatus] = useState('idle')

  const getLocation = () => {
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('done')
      },
      () => setStatus('error')
    )
  }

  return (
    <div className="mt-2">
      {status === 'idle' && (
        <button onClick={getLocation} className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          Share my location
        </button>
      )}
      {status === 'loading' && <p className="text-sm text-gray-500">Getting location...</p>}
      {status === 'done' && <p className="text-sm text-green-600 font-medium">✓ Location captured</p>}
      {status === 'error' && <p className="text-sm text-red-500">Could not get location. You can skip.</p>}
    </div>
  )
}