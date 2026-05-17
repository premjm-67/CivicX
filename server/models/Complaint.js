import mongoose from 'mongoose'

const timelineSchema = new mongoose.Schema({
  message: String,
  imageUrl: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
})

const complaintSchema = new mongoose.Schema({
  description: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  images: [String],
  location: {
    lat: Number,
    lng: Number,
  },
  category: {
    type: String,
    enum: ['Road', 'Water', 'Garbage', 'Electrical', 'Drainage', 'Other'],
    default: 'Other'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH'],
    default: 'LOW'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved'],
    default: 'pending'
  },
  aiSummary: { type: String, default: '' },
  department: { type: String, default: '' },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  timeline: [timelineSchema],
}, { timestamps: true })

export default mongoose.model('Complaint', complaintSchema)