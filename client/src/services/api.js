import axios from 'axios'

// Create one Axios instance for the entire app
// Instead of typing the full URL every time, we set a base URL once
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// REQUEST INTERCEPTOR
// Runs before EVERY request is sent
// Automatically attaches JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token')

    // If token exists, add it to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config  // must return config to continue
  },
  (error) => {
    return Promise.reject(error)
  }
)

// RESPONSE INTERCEPTOR
// Runs after EVERY response is received
// Handles token expiry globally
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response
  },
  (error) => {
    // If server returns 401 (Unauthorized)
    // Token is expired or invalid
    if (error.response?.status === 401) {
      // Clear everything and redirect to login
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api