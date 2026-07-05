import ChatWindow from '../components/chatbot/ChatWindow'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

export default function CitizenPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md text-center">
          <div className="text-5xl mb-4">🏙️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Report a Civic Issue</h2>
          <p className="text-gray-500 text-sm mb-6">
            Login or register to submit complaints and track their status in realtime.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/citizen-login"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Login
            </Link>
            <Link to="/register"
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
              Register
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return <ChatWindow />
}