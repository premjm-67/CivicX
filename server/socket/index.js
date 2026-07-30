export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join-complaint', (complaintId) => {
      socket.join(`complaint-${complaintId}`)
      console.log(`Socket joined room: complaint-${complaintId}`)
    })

    socket.on('join-area', (area) => {
      socket.join(`area-${area}`)
    })

    socket.on('join-department', (department) => {
      socket.join(`dept-${department}`)
      console.log(`Socket joined department room: dept-${department}`)
    })

    socket.on('join-citizen', (citizenId) => {
      socket.join(`citizen-${citizenId}`)
    })

    socket.on('join-dashboard', () => {
      socket.join('dashboard')
      console.log('Socket joined dashboard room')
    })

    socket.on('join-admin-live', () => {
      socket.join('admin-live-tracking')
      console.log('Socket joined admin live tracking room')
    })

    socket.on('join-worker-live', (workerId) => {
      socket.join(`worker-live-${workerId}`)
      console.log(`Socket joined worker room: worker-live-${workerId}`)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })
}