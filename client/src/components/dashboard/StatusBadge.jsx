const config = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  'in-progress': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'In Progress' },
  resolved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' },
}
export default function StatusBadge({ status }) {
  const s = config[status] || { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>{s.label}</span>
}