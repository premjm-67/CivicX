import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const complaintIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [18, 18],
})

const workerIcon = L.divIcon({
  html: `<div style="background:#10b981;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><div style="position:absolute;width:100%;height:100%;border:2px solid #10b981;border-radius:50%;animation:pulse 1.5s infinite;opacity:0.6"></div></div>`,
  className: '',
  iconSize: [16, 16],
})

export default function AdminLiveMap({ complaints = [], workers = {} }) {
  const validComplaints = complaints.filter(c => c.location?.lat && c.location?.lng)
  const validWorkers = Object.entries(workers).filter(([_, w]) => w.location)
  
  const center = validComplaints.length > 0 
    ? [validComplaints[0].location.lat, validComplaints[0].location.lng]
    : [13.0827, 80.2707]

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ height: 500 }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Complaint Locations */}
        {validComplaints.map(complaint => (
          <Marker 
            key={`complaint-${complaint._id}`}
            position={[complaint.location.lat, complaint.location.lng]} 
            icon={complaintIcon}
          >
            <Popup>
              <div className="text-xs space-y-1 w-40">
                <p className="font-semibold">{complaint.description?.slice(0, 50)}...</p>
                <p className="text-gray-600">{complaint.area}, {complaint.city}</p>
                <p>Status: <strong>{complaint.status}</strong></p>
                <p>ID: <span className="font-mono text-xs">{complaint._id.slice(0, 8)}</span></p>
              </div>
            </Popup>
            <Tooltip>{complaint.description?.slice(0, 30)}</Tooltip>
          </Marker>
        ))}
        
        {/* Worker Live Locations */}
        {validWorkers.map(([workerId, workerData]) => (
          <Marker 
            key={`worker-${workerId}`}
            position={[workerData.location.lat, workerData.location.lng]} 
            icon={workerIcon}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-green-600">Worker Live Location</p>
                <p>Coordinates: {workerData.location.lat.toFixed(6)}, {workerData.location.lng.toFixed(6)}</p>
                <p>Last Update: {new Date(workerData.timestamp).toLocaleTimeString()}</p>
                <p>Working on ID: <span className="font-mono text-xs">{workerData.complaintId.slice(0, 8)}</span></p>
              </div>
            </Popup>
            <Tooltip>Worker Live Tracking</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
