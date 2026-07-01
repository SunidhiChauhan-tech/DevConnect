import mongoose from 'mongoose'

// Schema for individual comments inside a post
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      maxlength: [500, 'Comment cannot exceed 500 characters'],
      trim: true
    }
  },
  { timestamps: true }
)

const postSchema = new mongoose.Schema(
  {
    // Who created this post
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [1000, 'Post cannot exceed 1000 characters'],
      trim: true
    },

    // Optional image URL from Cloudinary
    image: {
      type: String,
      default: ''
    },

    // Array of user IDs who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    // Embedded comment documents
    // We embed comments instead of referencing because:
    // 1. Comments are always loaded WITH the post
    // 2. Comments don't exist independently
    // 3. Faster — one query gets post + all comments
    comments: [commentSchema]
  },
  { timestamps: true }
)

// Index for getting posts newest first (most common query)
postSchema.index({ createdAt: -1 })

// Index for getting all posts by a specific user
postSchema.index({ author: 1, createdAt: -1 })

const Post = mongoose.model('Post', postSchema)

export default Post