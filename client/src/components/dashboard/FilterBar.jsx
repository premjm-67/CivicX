export default function FilterBar({ filters, onChange }) {
  const set = (key, value) => onChange({ ...filters, [key]: value })
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap gap-3">
      <input type="text" placeholder="Search area..." value={filters.area || ''} onChange={e => set('area', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-40" />
      <select value={filters.status || ''} onChange={e => set('status', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Status</option>
        <option value="pending">Pending</option>
        <option value="in-progress">In Progress</option>
        <option value="resolved">Resolved</option>
      </select>
      <select value={filters.priority || ''} onChange={e => set('priority', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Priority</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>
      <select value={filters.category || ''} onChange={e => set('category', e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All Categories</option>
        <option value="Road">Road</option>
        <option value="Water">Water</option>
        <option value="Garbage">Garbage</option>
        <option value="Electrical">Electrical</option>
        <option value="Drainage">Drainage</option>
      </select>
      <button onClick={() => onChange({ area: '', status: '', priority: '', category: '' })}
        className="text-sm text-gray-400 hover:text-gray-600 underline">Clear</button>
    </div>
  )
}