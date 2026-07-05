import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const myComplaintIcon = L.divIcon({
  html: `<div style="background:#8b5cf6;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [20, 20],
})

const otherWorkerIcon = L.divIcon({
  html: `<div style="background:#06b6d4;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"><div style="position:absolute;width:100%;height:100%;border:2px solid #06b6d4;border-radius:50%;animation:pulse 1.5s infinite;opacity:0.5"></div></div>`,
  className: '',
  iconSize: [16, 16],
})

export default function WorkerLiveMap({ myComplaints = [], otherWorkers = {} }) {
  const validComplaints = myComplaints.filter(c => c.location?.lat && c.location?.lng)
  const validWorkers = Object.entries(otherWorkers).filter(([_, w]) => w.location)
  
  const center = validComplaints.length > 0 
    ? [validComplaints[0].location.lat, validComplaints[0].location.lng]
    : [13.0827, 80.2707]

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden" style={{ height: 500 }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      `}</style>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* My Complaint Locations */}
        {validComplaints.map(complaint => (
          <Marker 
            key={`my-complaint-${complaint._id}`}
            position={[complaint.location.lat, complaint.location.lng]} 
            icon={myComplaintIcon}
          >
            <Popup>
              <div className="text-xs space-y-1 w-40">
                <p className="font-semibold text-purple-600">My Assignment</p>
                <p className="font-semibold">{complaint.description?.slice(0, 50)}...</p>
                <p className="text-gray-600">{complaint.area}, {complaint.city}</p>
                <p>Status: <strong>{complaint.status}</strong></p>
              </div>
            </Popup>
            <Tooltip>My Assignment</Tooltip>
          </Marker>
        ))}
        
        {/* Other Workers' Live Locations */}
        {validWorkers.map(([workerId, workerData]) => (
          <Marker 
            key={`other-worker-${workerId}`}
            position={[workerData.location.lat, workerData.location.lng]} 
            icon={otherWorkerIcon}
          >
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-cyan-600">Other Worker</p>
                <p>Location: {workerData.location.lat.toFixed(6)}, {workerData.location.lng.toFixed(6)}</p>
                <p>Last Update: {new Date(workerData.timestamp).toLocaleTimeString()}</p>
              </div>
            </Popup>
            <Tooltip>Nearby Worker</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
