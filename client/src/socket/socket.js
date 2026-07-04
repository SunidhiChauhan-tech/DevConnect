import { io } from 'socket.io-client'

// Create socket connection to our backend
const socket = io('http://localhost:5000', {
  autoConnect: false  // don't connect immediately
                      // we connect manually after login
})

export default socket