import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false
}

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,

  reducers: {
    setNotifications: (state, action) => {
      state.notifications = action.payload.notifications
      state.unreadCount = action.payload.unreadCount
      state.loading = false
    },

    // Called when Socket.io receives a new notification in real-time
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload)
      state.unreadCount += 1
    },

    markRead: (state, action) => {
      const notification = state.notifications
        .find(n => n._id === action.payload)
      if (notification) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    },

    clearUnread: (state) => {
      state.unreadCount = 0
      state.notifications.forEach(n => n.read = true)
    }
  }
})

export const {
  setNotifications,
  addNotification,
  markRead,
  clearUnread
} = notificationSlice.actions

export default notificationSlice.reducer