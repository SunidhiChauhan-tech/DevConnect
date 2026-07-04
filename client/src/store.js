import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/authSlice'
import postReducer from './features/postSlice'
import notificationReducer from './features/notificationSlice'

const store = configureStore({
  reducer: {
    // Each key here becomes a "slice" of global state
    // Access with useSelector(state => state.auth)
    auth: authReducer,
    posts: postReducer,
    notifications: notificationReducer,
  }
})

export default store