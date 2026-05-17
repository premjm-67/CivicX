export const emitStatusUpdate = (io, complaintId, status, timeline) => {
  io.to(`complaint-${complaintId}`).emit('status-update', {
    complaintId,
    status,
    timeline,
  })
}

export const emitNewComplaint = (io, area, complaint) => {
  io.to(`area-${area}`).emit('new-complaint', complaint)
}

export const emitDashboardUpdate = (io) => {
  io.to('dashboard').emit('dashboard-refresh')
}