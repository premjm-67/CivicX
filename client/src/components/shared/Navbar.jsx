import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const dashLink = () => {
    if (!user) return null
    if (user.role === 'admin') return { to: '/dashboard', label: 'Dashboard' }
    if (user.role === 'department_admin') return { to: '/department', label: 'Dept. Dashboard' }
    if (user.role === 'worker') return { to: '/worker', label: 'My Work' }
    return null
  }

  const link = dashLink()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="text-blue-600 font-bold text-lg tracking-tight">CivicFlow</Link>
      <div className="flex items-center gap-4 text-sm">
        <Link to="/" className="text-gray-600 hover:text-blue-600 transition">Report Issue</Link>
        {link && <Link to={link.to} className="text-gray-600 hover:text-blue-600 transition">{link.label}</Link>}
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-xs hidden sm:block">{user.name} · {user.role}</span>
            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 transition">Logout</button>
          </div>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium transition">Official Login</Link>
        )}
      </div>
    </nav>
  )
}