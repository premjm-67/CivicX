import Anthropic from '@anthropic-ai/sdk'
import { buildComplaintPrompt } from '../utils/aiPrompt.js'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export const processComplaint = async (description, city, area) => {
  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: buildComplaintPrompt(description, city, area)
      }]
    })

    const text = message.content[0].text.trim()
    const cleaned = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return {
      category: result.category || 'Other',
      priority: result.priority || 'LOW',
      department: result.department || 'Other',
      aiSummary: result.summary || '',
    }
  } catch (err) {
    console.error('AI processing error:', err.message)
    return { category: 'Other', priority: 'LOW', department: 'Other', aiSummary: '' }
  }
}