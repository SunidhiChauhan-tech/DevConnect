import { createSlice } from '@reduxjs/toolkit'

// Get initial state from localStorage
// So user stays logged in after page refresh
const token = localStorage.getItem('token')
const user = localStorage.getItem('user')
  ? JSON.parse(localStorage.getItem('user'))
  : null

const initialState = {
  user,            // logged in user object
  token,           // JWT token string
  isLoggedIn: !!token,  // true if token exists
  loading: false,
  error: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    // Called after successful login or register
    loginSuccess: (state, action) => {
      state.user = action.payload.user
      state.token = action.payload.token
      state.isLoggedIn = true
      state.loading = false
      state.error = null

      // Persist to localStorage so user stays logged in
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },

    // Called on logout
    logout: (state) => {
      state.user = null
      state.token = null
      state.isLoggedIn = false

      // Clear localStorage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },

    // Update user profile in Redux state
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    }
  }
})

export const {
  loginSuccess,
  logout,
  updateUser,
  setLoading,
  setError
} = authSlice.actions

export default authSlice.reducer