import dotenv from 'dotenv'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { buildComplaintPrompt } from '../utils/aiPrompt.js'

dotenv.config()

let genAI = null

const getGenAI = () => {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured')
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

const allowedDepartments = ['Road', 'Water', 'Garbage', 'Electrical', 'Drainage']
const allowedCategories = ['Road', 'Water', 'Garbage', 'Electrical', 'Drainage', 'Other']

const inferComplaintClassification = (description = '', city = '', area = '') => {
  const text = `${description} ${city} ${area}`.toLowerCase()

  if (/streetlight|light|electrical|power|transformer|wire|pole|outage/i.test(text)) {
    return { category: 'Electrical', department: 'Electrical', priority: 'MEDIUM', aiSummary: 'Electrical issue reported.' }
  }

  if (/water|leak|pipe|tank|drinking|overflow|sewer/i.test(text)) {
    return { category: 'Water', department: 'Water', priority: 'HIGH', aiSummary: 'Water supply or leakage issue reported.' }
  }

  if (/drain|drainage|flood|stagnant|clog|sewer/i.test(text)) {
    return { category: 'Drainage', department: 'Drainage', priority: 'HIGH', aiSummary: 'Drainage or flooding issue reported.' }
  }

  if (/garbage|trash|waste|dump|sanitation|odor/i.test(text)) {
    return { category: 'Garbage', department: 'Garbage', priority: 'MEDIUM', aiSummary: 'Sanitation issue reported.' }
  }

  if (/road|pothole|lane|traffic|signal|street|crack|block/i.test(text)) {
    return { category: 'Road', department: 'Road', priority: 'MEDIUM', aiSummary: 'Road infrastructure issue reported.' }
  }

  if (/danger|accident|collapse|fire|burst|electrocution|hazard/i.test(text)) {
    return { category: 'Safety', department: 'Other', priority: 'HIGH', aiSummary: 'Safety hazard reported.' }
  }

  return { category: 'Other', department: 'Other', priority: 'LOW', aiSummary: 'Complaint received and routed for review.' }
}

const normalizeDepartment = (value, category) => {
  const normalized = String(value || category || '').trim()
  if (allowedDepartments.includes(normalized)) return normalized

  const map = {
    road: 'Road',
    pothole: 'Road',
    traffic: 'Road',
    streetlight: 'Electrical',
    electrical: 'Electrical',
    water: 'Water',
    leak: 'Water',
    drainage: 'Drainage',
    sewer: 'Drainage',
    garbage: 'Garbage',
    trash: 'Garbage',
  }

  return map[normalized.toLowerCase()] || 'Other'
}

const normalizeCategory = (value) => {
  const normalized = String(value || '').trim()
  if (allowedCategories.includes(normalized)) return normalized

  const map = {
    sanitation: 'Garbage',
    trash: 'Garbage',
    waste: 'Garbage',
    safety: 'Other',
  }

  return map[normalized.toLowerCase()] || 'Other'
}

const extractJson = (text) => {
  const trimmed = text.trim()
  const fenced = trimmed.replace(/```json|```/g, '').trim()
  const match = fenced.match(/\{[\s\S]*\}/)
  if (match) return match[0]
  return fenced
}

export const processComplaint = async (description, city, area) => {
  const fallback = inferComplaintClassification(description, city, area)

  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not configured')
    return { category: fallback.category, priority: fallback.priority, department: fallback.department, aiSummary: fallback.aiSummary }
  }

  try {
    console.log('📤 Sending complaint to Gemini:', { description, city, area })
    const model = getGenAI().getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    })

    const result = await model.generateContent(buildComplaintPrompt(description, city, area))
    const text = result?.response?.text?.().trim() || ''
    console.log('📥 Gemini raw response:', text)

    const parsed = JSON.parse(extractJson(text))
    console.log('✅ Gemini AI result:', parsed)

    const category = normalizeCategory(parsed.category)
    const priority = String(parsed.priority || 'LOW').trim().toUpperCase()
    const department = normalizeDepartment(parsed.department, category)
    const aiSummary = String(parsed.summary || parsed.aiSummary || '').trim()

    return {
      category,
      priority: ['LOW', 'MEDIUM', 'HIGH'].includes(priority) ? priority : 'LOW',
      department,
      aiSummary,
    }
  } catch (err) {
    const status = err?.status || ''
    const message = err?.message || ''
    const details = err?.errorDetails || []
    console.error('❌ Gemini AI error:', { status, message, details })
    return { category: fallback.category, priority: fallback.priority, department: fallback.department, aiSummary: fallback.aiSummary }
  }
}