import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { addNotification } from './features/notificationSlice'
import socket from './socket/socket'

import Login from './pages/Login'
import Register from './pages/Register'
import Home from './pages/Home'

const Profile = () => (
  <div className="p-8 text-2xl font-bold text-primary-600">
    👤 Profile Page — Coming Soon!
  </div>
)

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useSelector(state => state.auth)
  return isLoggedIn ? children : <Navigate to="/login" replace />
}

const PublicRoute = ({ children }) => {
  const { isLoggedIn } = useSelector(state => state.auth)
  return !isLoggedIn ? children : <Navigate to="/" replace />
}

// Separate component to handle socket logic
// Only runs when user is logged in
const SocketManager = () => {
  const { user, isLoggedIn } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  useEffect(() => {
    if (isLoggedIn && user) {
      // Connect socket
      socket.connect()

      // Register this user on the socket server
      socket.emit('register', user._id)

      // Listen for incoming notifications
      socket.on('newNotification', (notification) => {
        // Add to Redux store — bell updates instantly
        dispatch(addNotification(notification))
      })
    }

    // Cleanup when user logs out
    return () => {
      socket.off('newNotification')
      socket.disconnect()
    }
  }, [isLoggedIn, user])

  return null  // this component renders nothing
}

function App() {
  return (
    <BrowserRouter>
      {/* SocketManager runs silently in background */}
      <SocketManager />

      <Routes>
        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute><Home /></ProtectedRoute>
        } />
        <Route path="/profile/:id" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App