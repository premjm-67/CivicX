import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import CitizenPage from './pages/CitizenPage'
import CitizenTrackingPage from './pages/CitizenTrackingPage'
<<<<<<< HEAD
import CitizenLoginPage from './pages/CitizenLoginPage'
=======
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
import CitizenRegisterPage from './pages/CitizenRegisterPage'
import MyComplaintsPage from './pages/MyComplaintsPage'
import DashboardPage from './pages/DashboardPage'
import DepartmentDashboardPage from './pages/DepartmentDashboardPage'
import WorkerDashboardPage from './pages/WorkerDashboardPage'
import AdminLiveTrackingPage from './pages/AdminLiveTrackingPage'
import WorkerLiveTrackingPage from './pages/WorkerLiveTrackingPage'
import LoginPage from './pages/LoginPage'
import ComplaintDetailPage from './pages/ComplaintDetailPage'
import Navbar from './components/shared/Navbar'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
<<<<<<< HEAD
  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
  if (!user) return <Navigate to="/citizen-login" />
=======
  if (loading) return <div className="flex justify-center items-center h-screen"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/></div>
  if (!user) return <Navigate to="/login" />
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />
  return children
}

function CitizenRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/citizen-login" />
  return children
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<CitizenPage />} />
        <Route path="/citizen-login" element={<CitizenLoginPage />} />
        <Route path="/register" element={<CitizenRegisterPage />} />
=======
        {/* Citizen */}
        <Route path="/" element={<CitizenRoute><CitizenPage /></CitizenRoute>} />
        <Route path="/track/:id" element={<CitizenTrackingPage />} />
        <Route path="/my-complaints" element={<CitizenRoute><MyComplaintsPage /></CitizenRoute>} />
        <Route path="/register" element={<CitizenRegisterPage />} />
        <Route path="/citizen-login" element={<LoginPage />} />

        {/* Officials */}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
        <Route path="/login" element={<LoginPage />} />
        <Route path="/track/:id" element={<CitizenTrackingPage />} />
        <Route path="/my-complaints" element={
          <ProtectedRoute roles={['citizen']}><MyComplaintsPage /></ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute roles={['admin']}><DashboardPage /></ProtectedRoute>
        } />
        <Route path="/department" element={
          <ProtectedRoute roles={['department_admin']}><DepartmentDashboardPage /></ProtectedRoute>
        } />
        <Route path="/worker" element={
          <ProtectedRoute roles={['worker']}><WorkerDashboardPage /></ProtectedRoute>
        } />
        <Route path="/admin-live" element={
          <ProtectedRoute roles={['admin']}><AdminLiveTrackingPage /></ProtectedRoute>
        } />
        <Route path="/worker-live" element={
          <ProtectedRoute roles={['worker']}><WorkerLiveTrackingPage /></ProtectedRoute>
        } />
        <Route path="/complaint/:id" element={
          <ProtectedRoute roles={['admin','department_admin','worker']}><ComplaintDetailPage /></ProtectedRoute>
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