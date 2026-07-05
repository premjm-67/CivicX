import Complaint from '../models/Complaint.js'
import { processComplaint } from '../services/ai.service.js'
import { emitStatusUpdate, emitNewComplaint, emitDashboardUpdate } from '../services/socket.service.js'
import { io } from '../index.js'

export const createComplaint = async (req, res) => {
  const { description, city, area, lat, lng } = req.body

  const aiResult = await processComplaint(description, city, area)

  const complaint = await Complaint.create({
    description,
    city,
    area,
    images: [],
    location: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
    citizenId: req.user?._id,
    ...aiResult,
    timeline: [{ message: 'Complaint submitted and received.', timestamp: new Date() }],
  })

  emitNewComplaint(io, area, complaint)
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
  if (citizenId) filter.citizenId = citizenId

  const complaints = await Complaint.find(filter)
    .sort({ createdAt: -1 })
    .populate('citizenId', 'name email phone')
    .populate('assignedTo', 'name email')

  res.json({ complaints })
}

export const getComplaintById = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id)
    .populate('citizenId', 'name email phone')
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
  emitStatusUpdate(io, complaint._id.toString(), status, complaint.timeline)
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
  emitStatusUpdate(io, complaint._id.toString(), complaint.status, complaint.timeline)
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

  emitStatusUpdate(io, complaint._id.toString(), complaint.status, complaint.timeline)
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

  emitStatusUpdate(io, complaint._id.toString(), complaint.status, complaint.timeline)

  res.json({ complaint })
}