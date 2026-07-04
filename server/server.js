import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'

import connectDB from './config/db.js'


import { initSocket } from './socket/socket.js'


import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import postRoutes from './routes/post.routes.js'
import notificationRoutes from './routes/notification.routes.js'

import { errorHandler } from './middleware/error.middleware.js'

const app = express()
const httpServer = createServer(app)

app.use(cors({
  origin: function(origin, callback) {
    // Allow these origins
    const allowedOrigins = [
      'http://localhost:5173',
      process.env.CLIENT_URL
    ]

    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)   // allow ✅
    } else {
      callback(new Error(`CORS blocked: ${origin}`))  // block ❌
    }
  },
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Health Route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running 🚀'
  })
})


app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/notifications', notificationRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    initSocket(httpServer)

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error(err)
  }
}

startServer()