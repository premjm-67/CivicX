import { useState } from 'react'
<<<<<<< HEAD
import { Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
=======
import { useNavigate, Link } from 'react-router-dom'
import api from '../services/api'
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a

export default function CitizenRegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
<<<<<<< HEAD
  const { login } = useAuth()
=======
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
<<<<<<< HEAD
      await api.post('/auth/register', { ...form, role: 'citizen' })
      await login(form.email, form.password)
=======
      const res = await api.post('/auth/register', { ...form, role: 'citizen' })
      localStorage.setItem('civicflow_token', res.data.token)
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">
        <div className="text-center mb-8">
<<<<<<< HEAD
          <h1 className="text-2xl font-bold text-blue-600">CivicFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Create citizen account</p>
        </div>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input type="tel" required value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9876543210" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••" />
          </div>
=======
          <h1 className="text-2xl font-bold text-blue-600">CivicX</h1>
          <p className="text-gray-500 mt-1 text-sm">Create citizen account</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text', placeholder: 'John Doe' },
            { label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '9876543210' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                required
                placeholder={field.placeholder}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-blue-700 disabled:opacity-50 transition">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
<<<<<<< HEAD
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{' '}
          <Link to="/citizen-login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
        <div className="border-t border-gray-200 mt-4 pt-4 text-center">
          <Link to="/login" className="text-xs text-gray-400 hover:text-gray-600">Official login →</Link>
        </div>
=======
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/citizen-login" className="text-blue-600 hover:underline font-medium">Login</Link>
        </p>
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
      </div>
    </div>
  )
}