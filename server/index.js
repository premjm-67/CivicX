import "express-async-errors"
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import cors from "cors"
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import { initSocket } from "./socket/index.js"
import authRoutes from "./routes/auth.routes.js"
import complaintRoutes from "./routes/complaint.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"

dotenv.config()
connectDB()

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
].filter(Boolean)

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    console.warn(`Blocked CORS request from: ${origin}`)
    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
}

const app = express()
const httpServer = createServer(app)

export const io = new Server(httpServer, {
  cors: corsOptions,
})

initSocket(io)

app.use(cors(corsOptions))
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/complaints", complaintRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(err.status || 500).json({ message: err.message || "Server error" })
})

const BASE_PORT = parseInt(process.env.PORT, 10) || 5000
const tryListen = (port) => {
  httpServer.listen(port, () => console.log(`Server running on port ${port}`))
    .once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${port} is already in use. Trying port ${port + 1}...`)
        tryListen(port + 1)
      } else {
        console.error('Unexpected server error:', err)
        process.exit(1)
      }
    })
}

tryListen(BASE_PORT)
