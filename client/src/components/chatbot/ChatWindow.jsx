import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import ChatMessage from './ChatMessage'
import UploadButton from './UploadButton'
import LocationPicker from './LocationPicker'
import api from '../../services/api'

const STEPS = {
  issue: "Hi! I'm CivicX 👋 I'll help you report a civic issue.\n\nPlease describe the problem you're facing.",
  name: 'Please enter your full name.',
  phone: 'Please enter your phone number.',
  media: 'Would you like to upload any photos or videos? This is the final step before submission. (optional)',
  location: 'Select the Chennai region, area, and street where this issue is located.',
}

export default function ChatWindow() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const bottomRef = useRef(null)
  const lastTimelineCount = useRef(1)

  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: `Hello ${user?.name || 'there'}! 👋\n\n${STEPS.issue}` },
  ])
  const [step, setStep] = useState('issue')
  const [input, setInput] = useState('')
  const [data, setData] = useState({ issue: '', reporterName: user?.name || '', reporterPhone: user?.phone || '', city: '', zone: '', area: '', street: '', media: [] })
  const [loading, setLoading] = useState(false)
  const [complaintId, setComplaintId] = useState(null)
  const [socketConnected, setSocketConnected] = useState(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const joinComplaintRooms = () => {
    if (!socket || !complaintId) return
    socket.emit('join-complaint', complaintId)
    if (user?._id) socket.emit('join-citizen', user._id)
  }

  useEffect(() => {
    if (!socket) return

    setSocketConnected(socket.connected)
    const handleConnect = () => {
      setSocketConnected(true)
      joinComplaintRooms()
    }
    const handleDisconnect = () => setSocketConnected(false)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
    }
  }, [socket, complaintId, user?._id])

  useEffect(() => {
    if (!socket || !complaintId) return

    joinComplaintRooms()

    const handleStatusUpdate = (payload) => {
      if (payload.complaintId !== complaintId) return

      const timeline = payload.timeline || []
      const newItems = timeline.slice(lastTimelineCount.current)

      newItems.forEach((item) => {
        const msg = item.message || ''
        addBotMessage(`🔔 ${msg}`)
      })

      lastTimelineCount.current = timeline.length

      if (payload.status === 'in-progress') {
        addBotMessage('🔄 Your complaint is now In Progress!\nA worker has been assigned and is working on it.')
      } else if (payload.status === 'resolved') {
        addBotMessage('✅ Your complaint has been Resolved!\nThank you for reporting. Your area is being taken care of.')
      }
    }

    socket.on('status-update', handleStatusUpdate)
    socket.on('my-complaint-update', handleStatusUpdate)

    return () => {
      socket.off('status-update', handleStatusUpdate)
      socket.off('my-complaint-update', handleStatusUpdate)
    }
  }, [socket, complaintId, user?._id])

  useEffect(() => {
    if (!complaintId) return

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/complaints/${complaintId}`)
        const timeline = res.data.complaint?.timeline || []

        if (timeline.length > lastTimelineCount.current) {
          const newItems = timeline.slice(lastTimelineCount.current)
          newItems.forEach((item) => {
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

  const addMessage = (text, sender = 'user') => {
    setMessages((prev) => [...prev, { id: Date.now(), sender, text }])
  }

  const addBotMessage = (text, delay = 500) => {
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: Date.now() + Math.random(), sender: 'bot', text }])
    }, delay)
  }

  const handleSend = () => {
    if (!input.trim()) return

    const value = input.trim()
    addMessage(value)
    setInput('')

    if (step === 'issue') {
      setData((d) => ({ ...d, issue: value }))
      setStep('name')
      addBotMessage(STEPS.name)
    } else if (step === 'name') {
      setData((d) => ({ ...d, reporterName: value }))
      setStep('phone')
      addBotMessage(STEPS.phone)
    } else if (step === 'phone') {
      if (!/^[0-9+()\-\s]{7,20}$/.test(value)) {
        addBotMessage('Please enter a valid phone number.')
        return
      }
      setData((d) => ({ ...d, reporterPhone: value }))
      setStep('location')
      addBotMessage(STEPS.location)
    }
  }

  const handleMediaUpload = (files) => {
    setData((d) => ({ ...d, media: files }))
    addMessage(`📎 Uploaded ${files.length} file(s)`)
    setTimeout(() => showConfirm({ ...data, media: files }), 600)
  }

  const handleSkipMedia = () => {
    addMessage('Skip')
    showConfirm({ ...data, media: [] })
  }

  const handleLocation = (address) => {
    setData((d) => ({ ...d, ...address }))
    addMessage(`📍 ${address.street}, ${address.area}, ${address.city}`)
    setStep('media')
    addBotMessage(STEPS.media)
  }

  const showConfirm = (complaintData = data) => {
    setStep('confirm')
    addBotMessage(
      `Here's your complaint summary:\n\n` +
        `📝 Issue: ${complaintData.issue}\n` +
        `🏙️ City: ${complaintData.city}\n` +
        `📍 Area: ${complaintData.area}\n` +
        `🛣️ Street: ${complaintData.street}\n\n` +
        'Shall I submit this complaint?'
    )
  }

  const handleSubmit = async () => {
    setLoading(true)
    addMessage('Yes, submit it!')

    try {
      const formData = new FormData()
      formData.append('description', data.issue)
      formData.append('reporterName', data.reporterName)
      formData.append('reporterPhone', data.reporterPhone)
      formData.append('city', data.city)
      formData.append('zone', data.zone)
      formData.append('area', data.area)
      formData.append('street', data.street)
      data.media.forEach((file) => formData.append('media', file))

      const res = await api.post('/complaints', formData)
      const complaint = res.data.complaint
      const id = complaint._id

      if (user?._id) {
        try {
          const existing = JSON.parse(localStorage.getItem(`civicx_complaints_${user._id}`) || '[]')
          const updated = [{
            _id: id,
            description: data.issue,
            category: complaint.category,
            priority: complaint.priority,
            department: complaint.department,
            aiSummary: complaint.aiSummary,
            status: complaint.status,
            city: data.city,
            zone: data.zone,
            area: data.area,
            street: data.street,
            createdAt: new Date().toISOString(),
          }, ...existing]
          localStorage.setItem(`civicx_complaints_${user._id}`, JSON.stringify(updated))
        } catch (err) {
          console.error('localStorage save error:', err)
        }
      }

      setComplaintId(id)
      setStep('tracking')
      lastTimelineCount.current = 1

      addBotMessage(
        `${res.data.duplicate ? '✅ You joined the existing complaint.' : '✅ Complaint submitted!'}\n\n` +
          `🔖 ID: ${id}\n\n` +
          `${res.data.duplicate ? 'You will receive the same realtime updates as other reporters.' : 'Your complaint is saved. View it anytime in "My Complaints" even after logout.'}`
      )

      if (!res.data.duplicate) {
        setTimeout(() => {
          addBotMessage(
            `🤖 AI Analysis Complete:\n\n` +
              `📂 Category: ${complaint.category}\n` +
              `🚨 Priority: ${complaint.priority}\n` +
              `🏛️ Department: ${complaint.department}\n` +
              `📋 Summary: ${complaint.aiSummary}`
          )
        }, 1500)
      }

      setTimeout(() => {
        addBotMessage(
          '⚡ Live updates enabled!\n\nYou will receive updates here when:\n' +
            '• Department is assigned\n' +
            '• Work starts (In Progress)\n' +
            '• Issue is resolved ✅'
        )
      }, 3000)
    } catch (err) {
      console.error(err)
      addBotMessage(err.response?.data?.message || 'Something went wrong. Please try again.')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setMessages([{ id: 1, sender: 'bot', text: `Hello ${user?.name || 'there'}! 👋\n\n${STEPS.issue}` }])
    setStep('issue')
    setData({ issue: '', reporterName: user?.name || '', reporterPhone: user?.phone || '', city: '', zone: '', area: '', street: '', media: [] })
    setInput('')
    setComplaintId(null)
    lastTimelineCount.current = 1
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] max-w-2xl mx-auto">
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-md">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">CF</div>
        <div className="flex-1">
          <p className="font-semibold text-sm">CivicX Assistant</p>
          <p className="text-xs text-blue-100">Report civic issues instantly</p>
        </div>
        <div className="flex items-center gap-2">
          {complaintId && (
            <span className="text-xs bg-green-500/30 border border-green-400/50 px-2 py-1 rounded-full">⚡ Live ON</span>
          )}
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs text-blue-100">{socketConnected ? 'Online' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4 space-y-1">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        {step === 'media' && (
          <div className="ml-10 mt-1 space-y-2">
            <UploadButton onUpload={handleMediaUpload} />
            <button onClick={handleSkipMedia} className="text-xs text-gray-400 hover:text-gray-600 underline">
              Skip for now
            </button>
          </div>
        )}

        {step === 'location' && (
          <div className="ml-10 mt-1 space-y-2">
            <LocationPicker onLocation={handleLocation} />
          </div>
        )}

        {step === 'confirm' && (
          <div className="ml-10 mt-2 flex gap-2 flex-wrap">
            <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 shadow-sm">
              {loading ? 'Submitting...' : '✓ Submit Complaint'}
            </button>
            <button onClick={handleRestart} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">
              Start over
            </button>
          </div>
        )}

        {step === 'tracking' && (
          <div className="ml-10 mt-3 space-y-2">
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700">
              ⚡ Listening for updates from department...
            </div>
            <button onClick={handleRestart} className="bg-green-50 text-green-600 border border-green-200 px-5 py-2 rounded-xl text-sm hover:bg-green-100">
              + Report Another Issue
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {['issue', 'name', 'phone'].includes(step) && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button onClick={handleSend} className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 shadow-sm">
            Send
          </button>
        </div>
      )}
    </div>
  )
}