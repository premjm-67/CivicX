import Complaint from '../models/Complaint.js'
import { processComplaint } from '../services/ai.service.js'
import { emitStatusUpdate, emitNewComplaint, emitDashboardUpdate } from '../services/socket.service.js'
import { io } from '../index.js'

const isCitizen = (user) => user?.role === 'citizen'

const complaintForResponse = (complaint, user) => {
  const result = complaint.toObject ? complaint.toObject() : { ...complaint }
  if (isCitizen(user)) {
    delete result.priority
    delete result.department
  }
  return result
}

const canAccessComplaint = (complaint, user) => {
  if (user.role === 'admin') return true
  if (user.role === 'department_admin') return complaint.department === user.department
  const getId = (value) => value?._id?.toString() || value?.toString()
  const userId = user._id.toString()
  if (user.role === 'worker') return getId(complaint.assignedTo) === userId
  return getId(complaint.citizenId) === userId ||
    complaint.reporters.some((reporter) => getId(reporter.userId) === userId)
}

export const createComplaint = async (req, res) => {
  const { description, city, zone, area, street, reporterName, reporterPhone } = req.body
  const name = String(reporterName || req.user?.name || '').trim()
  const phone = String(reporterPhone || req.user?.phone || '').trim()
  if (!name || !phone) return res.status(400).json({ message: 'Name and phone number are required' })

  const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const possibleDuplicates = await Complaint.find({ city, zone, area, street, status: { $ne: 'resolved' } })
  const duplicate = possibleDuplicates.find((item) => normalize(item.description) === normalize(description))

  if (duplicate) {
    const alreadyReporter = duplicate.reporters.some((reporter) => reporter.userId?.toString() === req.user?._id?.toString())
    if (!alreadyReporter) {
      duplicate.reporters.push({ userId: req.user?._id, name, phone })
      duplicate.timeline.push({ message: `${name} joined this complaint as a supporting reporter.`, timestamp: new Date() })
      await duplicate.save()
    }
    return res.status(200).json({ complaint: complaintForResponse(duplicate, req.user), duplicate: true })
  }

  const aiResult = await processComplaint(description, city, area)

  const complaint = await Complaint.create({
    description,
    city,
    zone,
    area,
    street,
    images: [],
    citizenId: req.user?._id,
    reporters: [{ userId: req.user?._id, name, phone }],
    ...aiResult,
    timeline: [{ message: 'Complaint submitted and received.', timestamp: new Date() }],
  })

  emitNewComplaint(io, area, complaint.department, complaint)
  emitDashboardUpdate(io)

  res.status(201).json({ complaint: complaintForResponse(complaint, req.user) })
}

export const getComplaints = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Please login to continue' })
  const { area, status, priority, category, department, assignedTo, citizenId } = req.query
  const filter = {}
  if (area) filter.area = { $regex: area, $options: 'i' }
  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (category) filter.category = category
  if (department) filter.department = department
  if (assignedTo) filter.assignedTo = assignedTo
  if (citizenId) {
    filter.$or = [{ citizenId }, { 'reporters.userId': citizenId }]
  }

  if (req.user.role === 'citizen') {
    filter.$or = [{ citizenId: req.user._id }, { 'reporters.userId': req.user._id }]
  }

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .populate('citizenId', 'name email phone')
    .populate('reporters.userId', 'name email phone')
    .populate('assignedTo', 'name email')

  res.json({ complaints: complaints.map((complaint) => complaintForResponse(complaint, req.user)) })
}

export const getComplaintById = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Please login to continue' })
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name email phone')
    .populate('reporters.userId', 'name email phone')
    .populate('assignedTo', 'name email')
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
  if (!canAccessComplaint(complaint, req.user)) return res.status(403).json({ message: 'Access denied' })
  res.json({ complaint: complaintForResponse(complaint, req.user) })
}

export const deleteComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

  const canDelete = req.user.role === 'admin' ||
    (req.user.role === 'department_admin' && complaint.department === req.user.department) ||
    (req.user.role === 'citizen' && complaint.citizenId?.toString() === req.user._id.toString())

  if (!canDelete) return res.status(403).json({ message: 'You are not allowed to delete this complaint' })

  await complaint.deleteOne()
  emitDashboardUpdate(io)
  res.json({ message: 'Complaint deleted successfully', complaintId: req.params.id })
}

export const updateStatus = async (req, res) => {
  const { status } = req.body
  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Not found' })

  complaint.status = status

  const statusMessageMap = {
    pending: `Complaint is pending review in ${complaint.department || 'the assigned department'}.`,
    'in-progress': `Work has started on your complaint. The ${complaint.department || 'department'} team is actively handling it.`,
    resolved: `Your complaint has been resolved and verified by the ${complaint.department || 'department'} team.`
  }

  const message = statusMessageMap[status] || `Status updated to ${status} by ${req.user.name}`

  complaint.timeline.push({
    message: `${message} Updated by ${req.user.name}`,
    updatedBy: req.user._id,
    timestamp: new Date()
  })
  await complaint.save()

  emitStatusUpdate(
    io,
    complaint._id.toString(),
    complaint.citizenId?.toString(),
    status,
    complaint.timeline,
    complaint.reporters,
    message,
    { department: complaint.department || '', updatedBy: req.user.name }
  )
  emitDashboardUpdate(io)

  res.json({ complaint })
}

export const assignDepartment = async (req, res) => {
  const { department } = req.body
  if (!department) return res.status(400).json({ message: 'Department is required' })

  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

  complaint.department = department
  complaint.timeline.push({
    message: `Assigned to ${department} Department by ${req.user.name}`,
    updatedBy: req.user._id,
    timestamp: new Date()
  })
  await complaint.save()

  // Push realtime to citizen
  emitStatusUpdate(io, complaint._id.toString(), complaint.citizenId?.toString(), complaint.status, complaint.timeline, complaint.reporters)
  emitDashboardUpdate(io)

  res.json({ complaint })
}

export const assignWorker = async (req, res) => {
  const { workerId } = req.body
  const complaint = await Complaint.findByIdAndUpdate(
    req.params.id,
    {
      assignedTo: workerId,
      $push: {
        timeline: {
          message: `Assigned to worker by ${req.user.name}`,
          updatedBy: req.user._id,
          timestamp: new Date()
        }
      }
    },
    { new: true }
  )

  emitStatusUpdate(io, complaint._id.toString(), complaint.citizenId?.toString(), complaint.status, complaint.timeline, complaint.reporters)
  res.json({ complaint })
}

export const addProgress = async (req, res) => {
  const { message } = req.body
  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Not found' })

  const progressMessage = message || 'Progress update shared by the department team.'

  complaint.timeline.push({
    message: progressMessage,
    imageUrl: '',
    updatedBy: req.user._id,
    timestamp: new Date()
  })
  await complaint.save()

  emitStatusUpdate(
    io,
    complaint._id.toString(),
    complaint.citizenId?.toString(),
    complaint.status,
    complaint.timeline,
    complaint.reporters,
    progressMessage,
    { type: 'progress', updatedBy: req.user.name }
  )

  res.json({ complaint })
}

export const submitFeedback = async (req, res) => {
  const { rating, comment } = req.body
  const complaint = await Complaint.findById(req.params.id)

  if (!complaint) return res.status(404).json({ message: 'Complaint not found' })

  const isOwner = complaint.citizenId?.toString() === req.user._id.toString()
  const isReporter = complaint.reporters.some((reporter) => reporter.userId?.toString() === req.user._id.toString())

  if (!isOwner && !isReporter) {
    return res.status(403).json({ message: 'You can only rate your own complaint.' })
  }

  const numericRating = Number(rating)
  if (!numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Please choose a rating between 1 and 5.' })
  }

  complaint.feedback = {
    rating: numericRating,
    comment: String(comment || '').trim(),
    submittedAt: new Date(),
  }

  complaint.timeline.push({
    message: `Feedback received: ${numericRating}/5. ${String(comment || '').trim() ? `Comment: ${String(comment).trim()}` : 'No comments provided.'}`,
    updatedBy: req.user._id,
    timestamp: new Date()
  })

  await complaint.save()

  emitStatusUpdate(
    io,
    complaint._id.toString(),
    complaint.citizenId?.toString(),
    complaint.status,
    complaint.timeline,
    complaint.reporters,
    `Feedback submitted: ${numericRating}/5 rating`,
    { type: 'feedback' }
  )

  res.json({ complaint })
}