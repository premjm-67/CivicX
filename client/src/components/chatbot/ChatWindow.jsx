import { useState, useRef, useEffect } from 'react'
<<<<<<< HEAD
=======
import { useNavigate } from 'react-router-dom'
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import ChatMessage from './ChatMessage'
import UploadButton from './UploadButton'
import LocationPicker from './LocationPicker'
import api from '../../services/api'

const STEPS = {
  issue: "Hi! I'm CivicX 👋 I'll help you report a civic issue.\n\nPlease describe the problem you're facing.",
  city: "Got it! Which city is this issue in?",
<<<<<<< HEAD
  area: "Which area or locality?",
  media: "Would you like to upload any photos or videos? (optional)",
  location: "Can you share your live location? (optional)",
=======
  area: "Which area or locality is this?",
  media: "Would you like to upload any photos or videos? (optional)",
  location: "Can you share your live location? (optional — helps us pinpoint the issue)",
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
}

export default function ChatWindow() {
  const { user } = useAuth()
  const { socket } = useSocket()
<<<<<<< HEAD
  const bottomRef = useRef(null)
  const lastTimelineCount = useRef(1)
  const currentComplaintId = useRef(null)
=======
  const navigate = useNavigate()
  const bottomRef = useRef(null)
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Hello ${user?.name || 'there'}! 👋\n\n${STEPS.issue}` }
  ])
  const [step, setStep] = useState('issue')
  const [input, setInput] = useState('')
  const [data, setData] = useState({
    issue: '', city: '', area: '', media: [], location: null
  })
  const [loading, setLoading] = useState(false)
  const [complaintId, setComplaintId] = useState(null)
<<<<<<< HEAD
  const [socketConnected, setSocketConnected] = useState(false)

  // Auto scroll to bottom
=======

>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

<<<<<<< HEAD
  // Track socket connection
  useEffect(() => {
    if (!socket) return
    setSocketConnected(socket.connected)
    socket.on('connect', () => setSocketConnected(true))
    socket.on('disconnect', () => setSocketConnected(false))
    return () => {
      socket.off('connect')
      socket.off('disconnect')
    }
  }, [socket])

  // ⚡ SOCKET — join room when complaint ID is set
  useEffect(() => {
    if (!socket || !complaintId) return

    console.log('Joining complaint room:', complaintId)
    socket.emit('join-complaint', complaintId)
    currentComplaintId.current = complaintId

    const handleStatusUpdate = (data) => {
      console.log('Socket received:', data)
      if (data.complaintId !== complaintId) return

      const timeline = data.timeline || []
      const newItems = timeline.slice(lastTimelineCount.current)

      newItems.forEach(item => {
        const msg = item.message || ''
        addBotMessage(`🔔 ${msg}`)

        if (data.status === 'in-progress') {
          addBotMessage(
            `🔄 Your complaint is now In Progress!\n\nA team has been assigned and is working on it.`,
            800
          )
        } else if (data.status === 'resolved') {
          addBotMessage(
            `✅ Your complaint has been Resolved!\n\nThank you for reporting. Your area has been taken care of.`,
            800
          )
        } else if (
          msg.toLowerCase().includes('assigned to') &&
          msg.toLowerCase().includes('department')
        ) {
          addBotMessage(
            `🏛️ Your complaint has been routed to the concerned department.\n\nThey will start working on it shortly.`,
            800
          )
        }
      })

      lastTimelineCount.current = timeline.length

      // Update localStorage with latest status
      if (user?._id) {
        try {
          const stored = JSON.parse(
            localStorage.getItem(`civicx_complaints_${user._id}`) || '[]'
          )
          const updated = stored.map(c =>
            c._id === complaintId ? { ...c, status: data.status } : c
          )
          localStorage.setItem(
            `civicx_complaints_${user._id}`,
            JSON.stringify(updated)
          )
        } catch (e) {
          console.error('localStorage update error:', e)
        }
      }
    }

    socket.on('status-update', handleStatusUpdate)
    return () => socket.off('status-update', handleStatusUpdate)
  }, [socket, complaintId])

  // Backup polling every 15 seconds
  useEffect(() => {
    if (!complaintId) return

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/complaints/${complaintId}`)
        const timeline = res.data.complaint?.timeline || []

        if (timeline.length > lastTimelineCount.current) {
          const newItems = timeline.slice(lastTimelineCount.current)
          newItems.forEach(item => {
            addBotMessage(`🔔 Update: ${item.message}`)
          })
          lastTimelineCount.current = timeline.length
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 15000)

    return () => clearInterval(interval)
  }, [complaintId])

  const addBotMessage = (text, delay = 500) => {
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { id: Date.now() + Math.random(), sender: 'bot', text }
      ])
    }, delay)
  }

  const addMessage = (text, sender = 'user') => {
    setMessages(prev => [
      ...prev,
      { id: Date.now(), sender, text }
    ])
=======
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
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
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
<<<<<<< HEAD
      `Shall I submit this?`
=======
      `Shall I submit this complaint?`
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
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
<<<<<<< HEAD
      const complaint = res.data.complaint
      const id = complaint._id

      // ✅ Save to localStorage so it persists after logout/navigation
      if (user?._id) {
        try {
          const existing = JSON.parse(
            localStorage.getItem(`civicx_complaints_${user._id}`) || '[]'
          )
          const updated = [{
            _id: id,
            description: data.issue,
            category: complaint.category,
            priority: complaint.priority,
            department: complaint.department,
            aiSummary: complaint.aiSummary,
            status: 'pending',
            city: data.city,
            area: data.area,
            createdAt: new Date().toISOString(),
          }, ...existing]
          localStorage.setItem(
            `civicx_complaints_${user._id}`,
            JSON.stringify(updated)
          )
        } catch (e) {
          console.error('localStorage save error:', e)
        }
      }

      setComplaintId(id)
      setStep('tracking')
      lastTimelineCount.current = 1

      addBotMessage(
        `✅ Complaint submitted!\n\n` +
        `🔖 ID: ${id}\n\n` +
        `Your complaint is saved. View it anytime in "My Complaints" even after logout.`
      )

      setTimeout(() => {
        addBotMessage(
          `🤖 AI Analysis Complete:\n\n` +
          `📂 Category: ${complaint.category}\n` +
          `🚨 Priority: ${complaint.priority}\n` +
          `🏛️ Department: ${complaint.department}\n` +
          `📋 Summary: ${complaint.aiSummary}`
        )
      }, 1500)

      setTimeout(() => {
        addBotMessage(
          `⚡ Live updates enabled!\n\nYou'll receive messages here when:\n` +
          `• Department is assigned\n` +
          `• Work starts (In Progress)\n` +
          `• Issue is resolved ✅`
        )
      }, 3000)

    } catch (err) {
      console.error(err)
      addBotMessage(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      )
=======
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
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
<<<<<<< HEAD
    setMessages([
      { id: 1, sender: 'bot', text: `Hello ${user?.name}! 👋\n\n${STEPS.issue}` }
    ])
=======
    setMessages([{ id: 1, sender: 'bot', text: `Hello ${user?.name}! 👋\n\n${STEPS.issue}` }])
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
    setStep('issue')
    setData({ issue: '', city: '', area: '', media: [], location: null })
    setInput('')
    setComplaintId(null)
<<<<<<< HEAD
    lastTimelineCount.current = 1
    currentComplaintId.current = null
=======
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] max-w-2xl mx-auto">
<<<<<<< HEAD

      {/* Header */}
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
          CF
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">CivicX Assistant</p>
          <p className="text-xs text-blue-100">Report civic issues instantly</p>
        </div>
        <div className="flex items-center gap-2">
          {complaintId && (
            <span className="text-xs bg-green-500/30 border border-green-400/50 px-2 py-1 rounded-full">
              ⚡ Live ON
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${
              socketConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-xs text-blue-100">
              {socketConnected ? 'Online' : 'Connecting...'}
            </span>
=======
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
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
          </div>
        </div>
      </div>

      {/* Messages */}
<<<<<<< HEAD
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-1">
=======
      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {step === 'media' && (
          <div className="ml-10 mt-1 space-y-2">
            <UploadButton onUpload={handleMediaUpload} />
<<<<<<< HEAD
            <button
              onClick={handleSkipMedia}
=======
            <button onClick={handleSkipMedia}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Skip for now
            </button>
          </div>
        )}

        {step === 'location' && (
          <div className="ml-10 mt-1 space-y-2">
            <LocationPicker onLocation={handleLocation} />
<<<<<<< HEAD
            <button
              onClick={handleSkipLocation}
=======
            <button onClick={handleSkipLocation}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
              className="text-xs text-gray-400 hover:text-gray-600 underline">
              Skip for now
            </button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="ml-10 mt-2 flex gap-2 flex-wrap">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm">
              {loading ? 'Submitting...' : '✓ Submit Complaint'}
            </button>
<<<<<<< HEAD
            <button
              onClick={handleRestart}
=======
            <button onClick={handleRestart}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
              className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">
              Start over
            </button>
          </div>
        )}

        {step === 'tracking' && (
<<<<<<< HEAD
          <div className="ml-10 mt-3 space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              ⚡ Listening for updates from department...
            </div>
            <button
              onClick={handleRestart}
=======
          <div className="ml-10 mt-2">
            <button onClick={handleRestart}
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
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
<<<<<<< HEAD
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 shadow-sm">
=======
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
>>>>>>> 2d2bc782c0cf72e2daca6375674b1760781d320a
            Send
          </button>
        </div>
      )}
    </div>
  )
}