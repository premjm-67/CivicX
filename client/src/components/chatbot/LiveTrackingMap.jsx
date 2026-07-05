import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const complaintIcon = L.divIcon({
  html: `<div style="background:#3b82f6;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  className: '',
  iconSize: [20, 20],
})

const workerIcon = L.divIcon({
  html: `<div style="background:#10b981;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"><div style="position:absolute;width:100%;height:100%;border:2px solid #10b981;border-radius:50%;animation:pulse 2s infinite;opacity:0.7"></div></div>`,
  className: '',
  iconSize: [18, 18],
})

export default function LiveTrackingMap({ complaintLocation, workerLocation, status }) {
  const center = complaintLocation ? [complaintLocation.lat, complaintLocation.lng] : [13.0827, 80.2707]
  const zoom = complaintLocation ? 14 : 11

  return (
    <div className="w-full" style={{ height: 400 }}>
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1); opacity: 0.7; }
        }
      `}</style>
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* Complaint Location */}
        {complaintLocation && (
          <Marker position={[complaintLocation.lat, complaintLocation.lng]} icon={complaintIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold">Complaint Location</p>
                <p>Status: <strong>{status}</strong></p>
              </div>
            </Popup>
            <Tooltip>Complaint Location</Tooltip>
          </Marker>
        )}
        
        {/* Worker Location (Real-time) */}
        {workerLocation && (
          <Marker position={[workerLocation.lat, workerLocation.lng]} icon={workerIcon}>
            <Popup>
              <div className="text-xs space-y-1">
                <p className="font-semibold text-green-600">Worker En Route</p>
                <p>Last updated: {new Date(workerLocation.timestamp).toLocaleTimeString()}</p>
              </div>
            </Popup>
            <Tooltip>Worker Location</Tooltip>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
