import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildComplaintPrompt } from '../utils/aiPrompt.js'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const processComplaint = async (description, city, area) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    const result = await model.generateContent(
      buildComplaintPrompt(description, city, area)
    )
    const text = result.response.text().trim()
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)

    console.log('✅ Gemini AI result:', parsed)

    return {
      category: parsed.category || 'Other',
      priority: parsed.priority || 'LOW',
      department: parsed.department || 'Other',
      aiSummary: parsed.summary || '',
    }
  } catch (err) {
    console.error('❌ Gemini AI error:', err.message)
    return { category: 'Other', priority: 'LOW', department: 'Other', aiSummary: '' }
  }
}