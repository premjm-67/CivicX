import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  const getDashLink = () => {
    if (!user) return null
    if (user.role === 'admin') return { to: '/dashboard', label: 'Dashboard' }
    if (user.role === 'department_admin') return { to: '/department', label: `${user.department} Dept` }
    if (user.role === 'worker') return { to: '/worker', label: 'My Work' }
    if (user.role === 'citizen') return { to: '/my-complaints', label: 'My Complaints' }
    return null
  }

  const getLiveTrackingLink = () => {
    if (!user) return null
    if (user.role === 'admin') return { to: '/admin-live', label: '🌐 Live Map' }
    if (user.role === 'worker') return { to: '/worker-live', label: '📍 Live View' }
    return null
  }

  const link = getDashLink()
  const liveLink = getLiveTrackingLink()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link to="/" className="text-blue-600 font-bold text-lg tracking-tight">
        CivicFlow
      </Link>
      <div className="flex items-center gap-4 text-sm">
        {!user && (
          <>
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition">Report Issue</Link>
            <Link to="/citizen-login" className="text-gray-600 hover:text-blue-600 transition">Sign In</Link>
            <Link to="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 font-medium transition">Register</Link>
          </>
        )}
        {user && (
          <>
            {user.role === 'citizen' && (
              <Link to="/" className="text-gray-600 hover:text-blue-600 transition">Report Issue</Link>
            )}
            {link && (
              <Link to={link.to} className="text-gray-600 hover:text-blue-600 transition font-medium">
                {link.label}
              </Link>
            )}
            {liveLink && (
              <Link to={liveLink.to} className="text-gray-600 hover:text-blue-600 transition font-medium flex items-center gap-1">
                {liveLink.label}
              </Link>
            )}
            <div className="flex items-center gap-2 ml-2">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button onClick={handleLogout}
                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs hover:bg-red-100 transition">
                Logout
              </button>
            </div>
          </>
        )}
        {!user && (
          <Link to="/login" className="text-xs text-gray-400 hover:text-gray-500">Official →</Link>
        )}
      </div>
    </nav>
  )
}