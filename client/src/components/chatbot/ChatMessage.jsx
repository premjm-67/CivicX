export default function ChatMessage({ message }) {
  const isBot = message.sender === 'bot'
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">CF</div>
      )}
      <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
        isBot ? 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm' : 'bg-blue-600 text-white rounded-tr-sm'
      }`}>
        {message.text}
      </div>
    </div>
  )
}