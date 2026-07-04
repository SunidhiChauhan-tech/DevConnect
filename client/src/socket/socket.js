import { io } from 'socket.io-client'

// Create socket connection to our backend
const socket = io(
  import.meta.env.VITE_API_URL?.replace('/api', '') 
  || 'http://localhost:5000',
  { autoConnect: false }
)
export default socket