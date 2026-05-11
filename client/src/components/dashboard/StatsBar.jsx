export default function StatsBar({ stats }) {
  const items = [
    { label: 'Total', value: stats?.total || 0, color: 'text-gray-800' },
    { label: 'Pending', value: stats?.pending || 0, color: 'text-yellow-600' },
    { label: 'In Progress', value: stats?.inProgress || 0, color: 'text-blue-600' },
    { label: 'Resolved', value: stats?.resolved || 0, color: 'text-green-600' },
    { label: 'High Priority', value: stats?.high || 0, color: 'text-red-600' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {items.map(item => (
        <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
          <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          <p className="text-xs text-gray-500 mt-1">{item.label}</p>
        </div>
      ))}
    </div>
  )
}