import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/authSlice'
import { clearUnread } from '../features/notificationSlice'
import { useState } from 'react'
import api from '../services/api'

const Navbar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)
  const { unreadCount, notifications } = useSelector(
    state => state.notifications
  )
  const [showNotifs, setShowNotifs] = useState(false)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const handleBellClick = async () => {
    setShowNotifs(!showNotifs)

    // Mark all as read when bell is clicked
    if (unreadCount > 0) {
      try {
        await api.put('/notifications/read-all')
        dispatch(clearUnread())
      } catch (err) {
        console.error('Failed to mark notifications read:', err)
      }
    }
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary-600">
          DevConnect
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative text-gray-500 hover:text-primary-600 transition"
            >
              🔔
              {/* Unread count badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 w-72 max-h-80 overflow-y-auto z-50">
                <div className="p-3 border-b border-gray-100">
                  <h3 className="font-semibold text-sm text-gray-700">
                    Notifications
                  </h3>
                </div>

                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    No notifications yet
                  </div>
                ) : (
                  notifications.slice(0, 10).map(notif => (
                    <div
                      key={notif._id}
                      className={`p-3 border-b border-gray-50 text-sm ${
                        !notif.read ? 'bg-primary-50' : ''
                      }`}
                    >
                      <span className="font-medium">
                        {notif.sender?.name}
                      </span>
                      {notif.type === 'like' && ' liked your post'}
                      {notif.type === 'comment' && ' commented on your post'}
                      {notif.type === 'follow' && ' started following you'}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Profile link */}
          <Link
            to={`/profile/${user?._id}`}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {user?.name}
            </span>
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-red-500 font-medium transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar