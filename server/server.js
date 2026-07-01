import 'dotenv/config'

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'

import connectDB from './config/db.js'

// ❌ Abhi comment kar diya hai kyunki file incomplete hai
// import { initSocket } from './socket/socket.js'

// ❌ Routes abhi incomplete hain
// import authRoutes from './routes/auth.routes.js'
// import userRoutes from './routes/user.routes.js'
// import postRoutes from './routes/post.routes.js'
// import notificationRoutes from './routes/notification.routes.js'

// ❌ Error middleware bhi baad me use karenge
// import { errorHandler } from './middleware/error.middleware.js'

const app = express()
const httpServer = createServer(app)

app.use(cors({
  origin: 'http://localhost:5173',
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

// ❌ Baad me uncomment karenge
// app.use('/api/auth', authRoutes)
// app.use('/api/users', userRoutes)
// app.use('/api/posts', postRoutes)
// app.use('/api/notifications', notificationRoutes)

// app.use(errorHandler)

const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    // initSocket(httpServer)

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (err) {
    console.error(err)
  }
}

startServer()