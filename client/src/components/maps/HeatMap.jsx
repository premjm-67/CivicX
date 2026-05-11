import { useEffect } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'

function HeatLayer({ points }) {
  const map = useMap()
  useEffect(() => {
    if (!points?.length || !window.L?.heatLayer) return
    const layer = window.L.heatLayer(points, { radius: 25, blur: 15 })
    layer.addTo(map)
    return () => map.removeLayer(layer)
  }, [points, map])
  return null
}

export default function HeatMap({ data = [] }) {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 420 }}>
      <MapContainer center={[13.0827, 80.2707]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <HeatLayer points={data.map(d => [d.lat, d.lng, d.intensity || 1])} />
      </MapContainer>
    </div>
  )
}