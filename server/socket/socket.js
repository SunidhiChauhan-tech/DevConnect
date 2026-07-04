import { Server } from 'socket.io'

// Map to store which user is on which socket
// Key: userId, Value: socketId
// Example: { "64abc123": "xK9mN2pQ" }
const userSocketMap = {}

let io

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.CLIENT_URL
        : 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 New socket connected: ${socket.id}`)

    // Frontend sends userId when connecting
    // We store the mapping so we can find this user later
    socket.on('register', (userId) => {
      userSocketMap[userId] = socket.id
      console.log(`✅ User ${userId} registered on socket ${socket.id}`)
    })

    // When user disconnects (closes tab/browser)
    socket.on('disconnect', () => {
      // Find and remove this socket from our map
      const userId = Object.keys(userSocketMap).find(
        key => userSocketMap[key] === socket.id
      )
      if (userId) {
        delete userSocketMap[userId]
        console.log(`❌ User ${userId} disconnected`)
      }
    })
  })

  return io
}

// This function is called from controllers
// to send real-time notification to a specific user
export const sendNotification = (recipientId, notification) => {
  // Find the socket ID for this recipient
  const socketId = userSocketMap[recipientId.toString()]

  if (socketId && io) {
    // emit sends event to ONE specific socket
    io.to(socketId).emit('newNotification', notification)
    console.log(`🔔 Notification sent to user ${recipientId}`)
  }
  // If user is offline (no socketId), we don't send
  // They'll see it when they log in and fetch notifications
}