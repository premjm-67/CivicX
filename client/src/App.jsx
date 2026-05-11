import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import CitizenPage from './pages/CitizenPage'
import CitizenTrackingPage from './pages/CitizenTrackingPage'
import DashboardPage from './pages/DashboardPage'
import DepartmentDashboardPage from './pages/DepartmentDashboardPage'
import WorkerDashboardPage from './pages/WorkerDashboardPage'
import LoginPage from './pages/LoginPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import Navbar from './components/shared/Navbar'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<CitizenPage />} />
        <Route path="/track/:id" element={<CitizenTrackingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin']}><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/department" element={
          <ProtectedRoute roles={['department_admin']}><DepartmentDashboardPage /></ProtectedRoute>
        } />
        <Route path="/worker" element={
          <ProtectedRoute roles={['worker']}><WorkerDashboardPage /></ProtectedRoute>
        } />
        <Route path="/complaint/:id" element={
          <ProtectedRoute roles={['admin', 'department_admin', 'worker']}><ComplaintDetailPage /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}