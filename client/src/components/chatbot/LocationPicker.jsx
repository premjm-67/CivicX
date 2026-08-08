import { useState } from 'react'
import { CORPORATION, LOCATION_OPTIONS, ZONES } from './locationOptions'

export default function LocationPicker({ onLocation }) {
  const [zone, setZone] = useState('')
  const [area, setArea] = useState('')
  const [street, setStreet] = useState('')

  const areas = zone ? Object.keys(LOCATION_OPTIONS[zone]) : []
  const streets = zone && area ? LOCATION_OPTIONS[zone][area] : []

  const handleZoneChange = (value) => {
    setZone(value)
    setArea('')
    setStreet('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (zone && area && street) onLocation({ city: CORPORATION, zone, area, street })
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 max-w-sm">
      <p className="text-xs text-gray-500">Choose the closest address. No device location is needed.</p>
      <select value={CORPORATION} disabled className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100">
        <option value={CORPORATION}>{CORPORATION}</option>
      </select>
      <select value={zone} onChange={(e) => handleZoneChange(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white">
        <option value="">Select GCC zone</option>
        {ZONES.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select value={area} onChange={(e) => { setArea(e.target.value); setStreet('') }} disabled={!zone} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100">
        <option value="">Select area</option>
        {areas.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <select value={street} onChange={(e) => setStreet(e.target.value)} disabled={!area} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white disabled:bg-gray-100">
        <option value="">Select street</option>
        {streets.map((item) => <option key={item} value={item}>{item}</option>)}
      </select>
      <button type="submit" disabled={!street} className="bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-40">
        Confirm location
      </button>
    </form>
  )
}