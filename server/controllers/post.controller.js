import { sendNotification } from '../socket/socket.js'
import Post from '../models/Post.model.js'
import User from '../models/User.model.js'
import Notification from '../models/Notification.model.js'
import cloudinary from '../config/cloudinary.js'
import { AppError } from '../middleware/error.middleware.js'

// ─────────────────────────────────────────────
// @desc    Get all posts (feed)
// @route   GET /api/posts
// @access  Protected
// ─────────────────────────────────────────────
export const getAllPosts = async (req, res, next) => {
  try {
    // Pagination setup
    // req.query.page comes from URL: /api/posts?page=2
    const page = parseInt(req.query.page) || 1   // default page 1
    const limit = parseInt(req.query.limit) || 10 // 10 posts per page
    const skip = (page - 1) * limit
    // page 1 → skip 0  (show posts 1-10)
    // page 2 → skip 10 (show posts 11-20)
    // page 3 → skip 20 (show posts 21-30)

    // Get total count for frontend to know total pages
    const totalPosts = await Post.countDocuments()

    const posts = await Post.find()
      .populate('author', 'name avatar role')
      // populate nested comment authors
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })  // newest first
      .skip(skip)
      .limit(limit)

    res.status(200).json({
      success: true,
      count: posts.length,
      totalPosts,
      totalPages: Math.ceil(totalPosts / limit),
      currentPage: page,
      posts
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Create a post
// @route   POST /api/posts
// @access  Protected
// ─────────────────────────────────────────────
export const createPost = async (req, res, next) => {
  try {
    const { content } = req.body

    // Validate content exists
    if (!content) {
      return next(new AppError('Post content is required', 400))
    }

    // Build post object
    const postData = {
      author: req.user.id,  // set from protect middleware
      content
    }

    // Handle optional image upload
    if (req.file) {
      const fileStr = req.file.buffer.toString('base64')
      const fileType = req.file.mimetype

      const uploadResponse = await cloudinary.uploader.upload(
        `data:${fileType};base64,${fileStr}`,
        {
          folder: 'devconnect/posts',
          transformation: [
            { width: 800, quality: 'auto' }
          ]
        }
      )
      postData.image = uploadResponse.secure_url
    }

    // Create the post in MongoDB
    let post = await Post.create(postData)

    // Populate author details before sending response
    // So frontend immediately gets name and avatar
    post = await post.populate('author', 'name avatar role')

    res.status(201).json({
      success: true,
      post
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Protected
// ─────────────────────────────────────────────
export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(new AppError('Post not found', 404))
    }

    // Check ownership — only author or admin can delete
    // post.author is an ObjectId so we convert to string to compare
    if (
      post.author.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('You can only delete your own posts', 403))
    }

    await Post.findByIdAndDelete(req.params.id)

    // Clean up related notifications
    await Notification.deleteMany({ post: req.params.id })

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Like or Unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Protected
// ─────────────────────────────────────────────
export const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(new AppError('Post not found', 404))
    }

    // Check if user already liked this post
    const alreadyLiked = post.likes.includes(req.user.id)

    if (alreadyLiked) {
      // Unlike — remove user ID from likes array
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user.id }
      })

      return res.status(200).json({
        success: true,
        message: 'Post unliked',
        liked: false,
        likesCount: post.likes.length - 1
      })
    }

    // Like — add user ID to likes array
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { likes: req.user.id }
    })

    // Create notification (only if liking someone else's post)
    if (post.author.toString() !== req.user.id.toString()) {
    const notification = await Notification.create({
    recipient: post.author,
    sender: req.user.id,
    type: 'like',
    post: post._id
  })

  // Populate sender info before sending via socket
  const populatedNotification = await notification.populate(
    'sender',
    'name avatar'
  )

  // Send real-time notification to recipient
  sendNotification(post.author, populatedNotification)
}

    res.status(200).json({
      success: true,
      message: 'Post liked',
      liked: true,
      likesCount: post.likes.length + 1
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Add a comment
// @route   POST /api/posts/:id/comment
// @access  Protected
// ─────────────────────────────────────────────
export const addComment = async (req, res, next) => {
  try {
    const { text } = req.body

    if (!text) {
      return next(new AppError('Comment text is required', 400))
    }

    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(new AppError('Post not found', 404))
    }

    // Build new comment object
    const newComment = {
      user: req.user.id,
      text
    }

    // $push adds comment to the embedded comments array
    await Post.findByIdAndUpdate(req.params.id, {
      $push: { comments: newComment }
    })

    // Create notification (only if commenting on someone else's post)
    if (post.author.toString() !== req.user.id.toString()) {
    const notification = await Notification.create({
    recipient: post.author,
    sender: req.user.id,
    type: 'comment',
    post: post._id
  })

    const populatedNotification = await notification.populate(
    'sender',
    'name avatar'
  )

  sendNotification(post.author, populatedNotification)
}

    // Fetch updated post with populated data to return
    const updatedPost = await Post.findById(req.params.id)
      .populate('author', 'name avatar')
      .populate('comments.user', 'name avatar')

    res.status(201).json({
      success: true,
      post: updatedPost
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Delete a comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Protected
// ─────────────────────────────────────────────
export const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)

    if (!post) {
      return next(new AppError('Post not found', 404))
    }

    // Find the specific comment
    const comment = post.comments.id(req.params.commentId)
    // .id() is a Mongoose method to find subdocument by its _id

    if (!comment) {
      return next(new AppError('Comment not found', 404))
    }

    // Only comment owner or post author or admin can delete
    if (
      comment.user.toString() !== req.user.id.toString() &&
      post.author.toString() !== req.user.id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(new AppError('You cannot delete this comment', 403))
    }

    // $pull removes the comment with matching _id
    await Post.findByIdAndUpdate(req.params.id, {
      $pull: { comments: { _id: req.params.commentId } }
    })

    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    })

  } catch (error) {
    next(error)
  }
}