import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ChatMessage from './ChatMessage'
import UploadButton from './UploadButton'
import LocationPicker from './LocationPicker'
import api from '../../services/api'

const QUESTIONS = {
  issue: "Hi! I'm CivicFlow 👋 I'll help you report a civic issue.\n\nPlease describe the problem you're facing.",
  city: "Got it. Which city is this issue in?",
  area: "Which area or locality is the issue located?",
  media: "Would you like to upload any photos or videos of the issue? (optional — helps speed up resolution)",
  location: "Can you share your live location so we can pinpoint the exact spot? (optional)",
}

export default function ChatWindow() {
  const [messages, setMessages] = useState([{ id: 1, sender: 'bot', text: QUESTIONS.issue }])
  const [step, setStep] = useState('issue')
  const [input, setInput] = useState('')
  const [data, setData] = useState({ issue: '', city: '', area: '', media: [], location: null })
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const addMessage = (text, sender = 'user') =>
    setMessages(prev => [...prev, { id: Date.now(), sender, text }])

  const addBotMessage = (text) =>
    setTimeout(() => setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text }]), 500)

  const handleSend = () => {
    if (!input.trim()) return
    const value = input.trim()
    addMessage(value)
    setInput('')
    if (step === 'issue') { setData(d => ({ ...d, issue: value })); setStep('city'); addBotMessage(QUESTIONS.city) }
    else if (step === 'city') { setData(d => ({ ...d, city: value })); setStep('area'); addBotMessage(QUESTIONS.area) }
    else if (step === 'area') { setData(d => ({ ...d, area: value })); setStep('media'); addBotMessage(QUESTIONS.media) }
  }

  const handleMediaUpload = (files) => {
    setData(d => ({ ...d, media: files }))
    addMessage(`Uploaded ${files.length} file(s)`)
    setTimeout(() => { setStep('location'); addBotMessage(QUESTIONS.location) }, 600)
  }

  const handleSkipMedia = () => { addMessage('Skip'); setStep('location'); addBotMessage(QUESTIONS.location) }

  const handleLocation = (coords) => {
    setData(d => ({ ...d, location: coords }))
    addMessage(`Location shared ✓`)
    setTimeout(() => showConfirm(), 600)
  }

  const handleSkipLocation = () => { addMessage('Skip'); showConfirm() }

  const showConfirm = () => {
    setStep('confirm')
    addBotMessage(`Here's your complaint summary:\n\n📝 Issue: ${data.issue}\n🏙️ City: ${data.city}\n📍 Area: ${data.area}\n\nShall I submit this complaint?`)
  }

  const handleSubmit = async () => {
    setLoading(true)
    addMessage('Yes, submit it!')
    try {
      const formData = new FormData()
      formData.append('description', data.issue)
      formData.append('city', data.city)
      formData.append('area', data.area)
      if (data.location) { formData.append('lat', data.location.lat); formData.append('lng', data.location.lng) }
      data.media.forEach(f => formData.append('media', f))
      const res = await api.post('/complaints', formData)
      const id = res.data.complaint._id
      setStep('done')
      addBotMessage(`✅ Complaint submitted!\n\nYour Complaint ID: ${id}\n\nRedirecting you to the tracking page...`)
      setTimeout(() => navigate(`/track/${id}`), 2500)
    } catch {
      addBotMessage('Something went wrong. Please try again.')
      setStep('confirm')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setMessages([{ id: 1, sender: 'bot', text: QUESTIONS.issue }])
    setStep('issue')
    setData({ issue: '', city: '', area: '', media: [], location: null })
    setInput('')
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] max-w-2xl mx-auto">
      <div className="bg-blue-600 text-white px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">CF</div>
        <div>
          <p className="font-semibold">CivicFlow Assistant</p>
          <p className="text-xs text-blue-100">Report civic issues instantly</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-xs text-blue-100">Online</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-4">
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

        {step === 'media' && (
          <div className="ml-10 mt-1 space-y-2">
            <UploadButton onUpload={handleMediaUpload} />
            <button onClick={handleSkipMedia} className="text-xs text-gray-400 hover:text-gray-600 underline">Skip for now</button>
          </div>
        )}

        {step === 'location' && (
          <div className="ml-10 mt-1 space-y-2">
            <LocationPicker onLocation={handleLocation} />
            <button onClick={handleSkipLocation} className="text-xs text-gray-400 hover:text-gray-600 underline">Skip for now</button>
          </div>
        )}

        {step === 'confirm' && (
          <div className="ml-10 mt-2 flex gap-2 flex-wrap">
            <button onClick={handleSubmit} disabled={loading}
              className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Submitting...' : '✓ Submit Complaint'}
            </button>
            <button onClick={handleRestart} className="bg-gray-100 text-gray-600 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">
              Start over
            </button>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {['issue', 'city', 'area'].includes(step) && (
        <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 flex-shrink-0">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button onClick={handleSend}
            className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700">
            Send
          </button>
        </div>
      )}
    </div>
  )
}