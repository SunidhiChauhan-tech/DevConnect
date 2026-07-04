import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loginSuccess, setLoading, setError } from '../features/authSlice'
import api from '../services/api'

const Register = () => {
  // Local state for form fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Get Redux state and dispatch
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector(state => state.auth)

  // Handle input changes
  // One function handles ALL inputs using the name attribute
  const handleChange = (e) => {
    setFormData({
      ...formData,           // keep existing values
      [e.target.name]: e.target.value  // update only changed field
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()  // prevent page reload on form submit

    // Frontend validation
    if (formData.password !== formData.confirmPassword) {
      dispatch(setError('Passwords do not match'))
      return
    }

    if (formData.password.length < 6) {
      dispatch(setError('Password must be at least 6 characters'))
      return
    }

    try {
      dispatch(setLoading(true))
      dispatch(setError(null))

      // Call our backend API
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      })

      // Save user and token to Redux + localStorage
      dispatch(loginSuccess({
        user: response.data.user,
        token: response.data.token
      }))

      // Redirect to home feed
      navigate('/')

    } catch (err) {
      // err.response.data.message comes from our backend error handler
      dispatch(setError(err.response?.data?.message || 'Registration failed'))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600">DevConnect</h1>
          <p className="text-gray-500 mt-2">Join the developer community</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Sunidhi Chauhan"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="sunidhi@example.com"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-semibold py-3 rounded-lg transition duration-200"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

        </form>

        {/* Login Link */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-primary-600 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Register