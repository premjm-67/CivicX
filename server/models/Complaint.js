import mongoose from 'mongoose'

const timelineSchema = new mongoose.Schema({
  message: String,
  imageUrl: String,
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
})

const reporterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  joinedAt: { type: Date, default: Date.now },
}, { _id: false })

const complaintSchema = new mongoose.Schema({
  description: { type: String, required: true },
  city: { type: String, required: true },
  area: { type: String, required: true },
  zone: { type: String, default: '' },
  street: { type: String, default: '' },
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
  reporters: { type: [reporterSchema], default: [] },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  timeline: [timelineSchema],
}, { timestamps: true })

export default mongoose.model('Complaint', complaintSchema)