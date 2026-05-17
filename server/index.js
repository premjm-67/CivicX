import 'express-async-errors'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import { initSocket } from './socket/index.js'
import authRoutes from './routes/auth.routes.js'
import complaintRoutes from './routes/complaint.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'

dotenv.config()
connectDB()

const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] }
})

initSocket(io)

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/complaints', complaintRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`))