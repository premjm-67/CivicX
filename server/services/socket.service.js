export const emitStatusUpdate = (io, complaintId, citizenId, status, timeline, reporters = []) => {
  const payload = { complaintId, status, timeline }

  // notify anyone watching this specific complaint
  io.to(`complaint-${complaintId}`).emit('status-update', payload)

  // notify the citizen directly via their own room
  if (citizenId) {
    io.to(`citizen-${citizenId}`).emit('my-complaint-update', payload)
  }
  reporters
    .map((reporter) => reporter.userId?.toString())
    .filter(Boolean)
    .forEach((reporterId) => io.to(`citizen-${reporterId}`).emit('my-complaint-update', payload))
}

export const emitNewComplaint = (io, area, dept, complaint) => {
  io.to(`area-${area}`).emit('new-complaint', complaint)
  if (dept) io.to(`dept-${dept}`).emit('new-complaint', complaint)
  // Also broadcast to admin live tracking
  io.to('admin-live-tracking').emit('new-complaint-live', complaint)
}

export const emitDashboardUpdate = (io) => {
  io.to('dashboard').emit('dashboard-refresh')
}

export const emitTimelineUpdate = (io, complaintId, citizenId, message) => {
  io.to(`complaint-${complaintId}`).emit('timeline-update', {
    complaintId,
    message,
    timestamp: new Date()
  })
  if (citizenId) {
    io.to(`citizen-${citizenId}`).emit('timeline-update', {
      complaintId,
      message,
      timestamp: new Date()
    })
  }
}

export const emitWorkerLocationUpdate = (io, complaintId, citizenId, workerId, lat, lng) => {
  const locationData = {
    complaintId,
    workerId,
    location: { lat, lng },
    timestamp: new Date()
  }
  
  // Send to citizen tracking this complaint
  io.to(`complaint-${complaintId}`).emit('worker-location-update', locationData)
  if (citizenId) {
    io.to(`citizen-${citizenId}`).emit('worker-location-update', locationData)
  }
  
  // Broadcast to admin live tracking
  io.to('admin-live-tracking').emit('worker-location-update-live', locationData)
  
  // Broadcast to worker's own live view
  if (workerId) {
    io.to(`worker-live-${workerId}`).emit('my-location-update', locationData)
  }
}

export const emitWorkerAssigned = (io, complaintId, citizenId, workerName) => {
  io.to(`complaint-${complaintId}`).emit('worker-assigned', {
    complaintId,
    workerName,
    message: `Worker ${workerName} has been assigned to your complaint`,
    timestamp: new Date()
  })
  if (citizenId) {
    io.to(`citizen-${citizenId}`).emit('worker-assigned', {
      complaintId,
      workerName,
      message: `Worker ${workerName} has been assigned to your complaint`,
      timestamp: new Date()
    })
  }
}

export const broadcastComplaintUpdate = (io, complaint) => {
  // Broadcast to admin live tracking
  io.to('admin-live-tracking').emit('complaint-update-live', complaint)
}