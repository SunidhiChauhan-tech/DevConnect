import express from 'express'
import {
  getAllPosts,
  createPost,
  deletePost,
  likePost,
  addComment,
  deleteComment
} from '../controllers/post.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import upload from '../middleware/upload.middleware.js'

const router = express.Router()

router.get('/', protect, getAllPosts)
router.post('/', protect, upload.single('image'), createPost)
router.delete('/:id', protect, deletePost)
router.put('/:id/like', protect, likePost)
router.post('/:id/comment', protect, addComment)
router.delete('/:id/comment/:commentId', protect, deleteComment)

export default router