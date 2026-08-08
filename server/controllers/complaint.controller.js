import Complaint from '../models/Complaint.js'
import { processComplaint } from '../services/ai.service.js'
import { emitStatusUpdate, emitNewComplaint, emitDashboardUpdate } from '../services/socket.service.js'
import { io } from '../index.js'

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
    return res.status(200).json({ complaint: duplicate, duplicate: true })
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

  res.status(201).json({ complaint })
}

export const getComplaints = async (req, res) => {
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

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .populate('citizenId', 'name email phone')
    .populate('reporters.userId', 'name email phone')
    .populate('assignedTo', 'name email')

  res.json({ complaints })
}

export const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name email phone')
    .populate('reporters.userId', 'name email phone')
    .populate('assignedTo', 'name email')
  if (!complaint) return res.status(404).json({ message: 'Complaint not found' })
  res.json({ complaint })
}

export const updateStatus = async (req, res) => {
  const { status } = req.body
  const complaint = await Complaint.findById(req.params.id)
  if (!complaint) return res.status(404).json({ message: 'Not found' })

  complaint.status = status
  complaint.timeline.push({
    message: `Status updated to ${status} by ${req.user.name}`,
    updatedBy: req.user._id,
    timestamp: new Date()
  })
  await complaint.save()

  // Push to citizen socket room
  emitStatusUpdate(io, complaint._id.toString(), complaint.citizenId?.toString(), status, complaint.timeline, complaint.reporters)
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

  complaint.timeline.push({
    message,
    imageUrl: '',
    updatedBy: req.user._id,
    timestamp: new Date()
  })
  await complaint.save()

  emitStatusUpdate(io, complaint._id.toString(), complaint.citizenId?.toString(), complaint.status, complaint.timeline, complaint.reporters)

  res.json({ complaint })
}