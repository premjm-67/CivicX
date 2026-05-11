import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const COLORS = { HIGH: '#ef4444', MEDIUM: '#f97316', LOW: '#22c55e' }

const icon = (priority) => L.divIcon({
  html: `<div style="background:${COLORS[priority]||'#3b82f6'};width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
  className: '', iconSize: [14, 14],
})

export default function ComplaintMap({ complaints = [] }) {
  const valid = complaints.filter(c => c.location?.lat && c.location?.lng)
  const center = valid.length ? [valid[0].location.lat, valid[0].location.lng] : [13.0827, 80.2707]

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 420 }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {valid.map(c => (
          <Marker key={c._id} position={[c.location.lat, c.location.lng]} icon={icon(c.priority)}>
            <Popup>
              <div className="text-xs space-y-0.5">
                <p className="font-semibold">{c.description?.slice(0, 60)}...</p>
                <p>{c.area}, {c.city}</p>
                <p>Status: <strong>{c.status}</strong></p>
                {c.priority && <p>Priority: <strong>{c.priority}</strong></p>}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}