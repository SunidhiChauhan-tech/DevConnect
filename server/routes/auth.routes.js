import express from 'express'
import {
  register,
  login,
  logout,
  getMe
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

// Public routes — no token needed
router.post('/register', register)
router.post('/login', login)

// Protected routes — token required
// protect runs first, then the controller
router.get('/me', protect, getMe)
router.post('/logout', protect, logout)

export default router