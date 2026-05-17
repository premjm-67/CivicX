export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join-complaint', (complaintId) => {
      socket.join(`complaint-${complaintId}`)
    })

    socket.on('join-area', (area) => {
      socket.join(`area-${area}`)
    })

    socket.on('join-dashboard', () => {
      socket.join('dashboard')
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })
}