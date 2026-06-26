import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import ChatMessage from './ChatMessage'
import UploadButton from './UploadButton'
import LocationPicker from './LocationPicker'
import api from '../../services/api'

const STEPS = {
  issue: "Hi! I'm CivicX 👋 I'll help you report a civic issue.\n\nPlease describe the problem you're facing.",
  city: "Got it! Which city is this issue in?",
  area: "Which area or locality is this?",
  media: "Would you like to upload any photos or videos? (optional)",
  location: "Can you share your live location? (optional — helps us pinpoint the issue)",
}

export default function ChatWindow() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const bottomRef = useRef(null)

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Hello ${user?.name || 'there'}! 👋\n\n${STEPS.issue}` }
  ])
  const [step, setStep] = useState('issue')
  const [input, setInput] = useState('')
  const [data, setData] = useState({ issue: '', city: '', area: '', media: [], location: null })
  const [loading, setLoading] = useState(false)
  const [complaintId, setComplaintId] = useState(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ⚡ SOCKET.IO — Listen for realtime updates
  useEffect(() => {
    if (!socket || !complaintId) return

    // Join the specific complaint room
    socket.emit('join-complaint', complaintId)
    console.log('Joined complaint room:', complaintId)

    // Listen for ANY update from server
    socket.on('status-update', (data) => {
      if (data.complaintId === complaintId) {
        // Get the latest timeline message
        const latest = data.timeline?.[data.timeline.length - 1]
        
        // Show as bot message in chatbot
        if (latest) {
          addBotMessage(`🔔 Update: ${latest.message}`)
        }

        // Show status change
        if (data.status === 'in-progress') {
          addBotMessage(`🔄 Your complaint is now **In Progress**!\nA worker has been assigned and is working on it.`)
        } else if (data.status === 'resolved') {
          addBotMessage(`✅ Your complaint has been **Resolved**!\nThank you for reporting. Your area is being taken care of.`)
        }
      }
    })

    return () => {
      socket.off('status-update')
    }
  }, [socket, complaintId])

  const addMessage = (text, sender = 'user') => {
    setMessages(prev => [...prev, { id: Date.now(), sender, text }])
  }

  const addBotMessage = (text) => {
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text }])
    }, 500)
  }

  const handleSend = () => {
    if (!input.trim()) return
    const value = input.trim()
    addMessage(value)
    setInput('')

    if (step === 'issue') {
      setData(d => ({ ...d, issue: value }))
      setStep('city')
      addBotMessage(STEPS.city)
    } else if (step === 'city') {
      setData(d => ({ ...d, city: value }))
      setStep('area')
      addBotMessage(STEPS.area)
    } else if (step === 'area') {
      setData(d => ({ ...d, area: value }))
      setStep('media')
      addBotMessage(STEPS.media)
    }
  }

  const handleMediaUpload = (files) => {
    setData(d => ({ ...d, media: files }))
    addMessage(`📎 Uploaded ${files.length} file(s)`)
    setTimeout(() => {
      setStep('location')
      addBotMessage(STEPS.location)
    }, 600)
  }

  const handleSkipMedia = () => {
    addMessage('Skip')
    setStep('location')
    addBotMessage(STEPS.location)
  }

  const handleLocation = (coords) => {
    setData(d => ({ ...d, location: coords }))
    addMessage('📍 Location shared')
    setTimeout(() => showConfirm(), 600)
  }

  const handleSkipLocation = () => {
    addMessage('Skip')
    showConfirm()
  }

  const showConfirm = () => {
    setStep('confirm')
    addBotMessage(
      `Here's your complaint summary:\n\n` +
      `📝 Issue: ${data.issue}\n` +
      `🏙️ City: ${data.city}\n` +
      `📍 Area: ${data.area}\n\n` +
      `Shall I submit this complaint?`
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    addMessage('Yes, submit it!')
    try {
      const formData = new FormData()
      formData.append('description', data.issue)
      formData.append('city', data.city)
      formData.append('area', data.area)
      if (data.location) {
        formData.append('lat', data.location.lat)
        formData.append('lng', data.location.lng)
      }
      data.media.forEach(f => formData.append('media', f))

      const res = await api.post('/complaints', formData)
      const id = res.data.complaint._id
      setComplaintId(id)
      setStep('tracking')

      // ⚡ SOCKET.IO — Show AI result as bot message
      addBotMessage(
        `✅ Complaint submitted successfully!\n\n` +
        `🔖 Your ID: ${id}\n\n` +
        `🤖 AI is analyzing your complaint...`
      )

      // Show AI results after small delay
      setTimeout(() => {
        const c = res.data.complaint
        addBotMessage(
          `🧠 AI Analysis Complete:\n\n` +
          `📂 Category: ${c.category}\n` +
          `🚨 Priority: ${c.priority}\n` +
          `🏛️ Department: ${c.department}\n\n` +
          `📋 Summary: ${c.aiSummary}\n\n` +
          `⚡ You'll receive live updates here as your complaint progresses!`
        )
      }, 2000)

    } catch {
      addBotMessage('Something went wrong. Please try again.')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setMessages([{ id: 1, sender: 'bot', text: `Hello ${user?.name}! 👋\n\n${STEPS.issue}` }])
    setStep('issue')
    setData({ issue: '', city: '', area: '', media: [], location: null })
    setInput('')
    setComplaintId(null)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">CF</div>
        <div>
          <p className="font-semibold">CivicX Assistant</p>
          <p className="text-xs text-blue-100">Report civic issues instantly</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {complaintId && (
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              ⚡ Live updates on
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-blue-100">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {step === 'media' && (
          <div className="ml-10 mt-1 space-y-2">
            <UploadButton onUpload={handleMediaUpload} />
            <button onClick={handleSkipMedia}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Skip for now
            </button>
          </div>
        )}

        {step === 'location' && (
          <div className="ml-10 mt-1 space-y-2">
            <LocationPicker onLocation={handleLocation} />
            <button onClick={handleSkipLocation}
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Skip for now
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="ml-10 mt-2 flex gap-2 flex-wrap">
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Submitting...' : '✓ Submit Complaint'}
            </button>
            <button onClick={handleRestart}
              className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">
              Start over
            </button>
          </div>
        )}

        {step === 'tracking' && (
          <div className="ml-10 mt-2">
            <button onClick={handleRestart}
              className="bg-green-50 text-green-600 border border-green-200 px-5 py-2 rounded-xl text-sm hover:bg-green-100">
              + Report Another Issue
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {['issue', 'city', 'area'].includes(step) && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
            Send
          </button>
        </div>
      )}
    </div>
  )
}