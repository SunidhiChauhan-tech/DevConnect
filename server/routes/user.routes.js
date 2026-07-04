import express from 'express'
import {
  getAllUsers,
  getUserById,
  updateProfile,
  followUser,
  unfollowUser,
  searchUsers
} from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'

const router = express.Router()

// All user routes are protected
// protect runs before every controller below

router.get('/search', protect, searchUsers)
router.get('/', protect, getAllUsers)
router.get('/:id', protect, getUserById)

// upload.single('avatar') runs before updateProfile
// It processes the uploaded file and puts it on req.file
router.put('/profile', protect, upload.single('avatar'), updateProfile)

router.post('/:id/follow', protect, followUser)
router.delete('/:id/follow', protect, unfollowUser)

export default router