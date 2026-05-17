import Complaint from '../models/Complaint.js'

export const getStats = async (req, res) => {
  const [total, pending, inProgress, resolved, high] = await Promise.all([
    Complaint.countDocuments(),
    Complaint.countDocuments({ status: 'pending' }),
    Complaint.countDocuments({ status: 'in-progress' }),
    Complaint.countDocuments({ status: 'resolved' }),
    Complaint.countDocuments({ priority: 'HIGH' }),
  ])

  const byCategory = await Complaint.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ])

  const byArea = await Complaint.aggregate([
    { $group: { _id: '$area', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ])

  res.json({ total, pending, inProgress, resolved, high, byCategory, byArea })
}

export const getPriorityQueue = async (req, res) => {
  const complaints = await Complaint.find({ priority: 'HIGH', status: { $ne: 'resolved' } })
    .sort({ createdAt: -1 })
  res.json({ complaints })
}

export const getHeatmap = async (req, res) => {
  const complaints = await Complaint.find({ 'location.lat': { $exists: true } })
    .select('location area priority')
  const data = complaints.map(c => ({
    lat: c.location.lat,
    lng: c.location.lng,
    intensity: c.priority === 'HIGH' ? 1 : c.priority === 'MEDIUM' ? 0.6 : 0.3,
  }))
  res.json({ data })
}