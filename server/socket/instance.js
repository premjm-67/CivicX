let io = null

export const setSocketServer = (socketServer) => {
  io = socketServer
}

export const getSocketServer = () => {
  if (!io) {
    throw new Error('Socket server is not initialized yet')
  }
  return io
}
