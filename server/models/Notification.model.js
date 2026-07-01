import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema(
  {
    // Who receives the notification
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // Who triggered the notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    // What kind of notification
    type: {
      type: String,
      enum: ['like', 'comment', 'follow'],
      required: true
    },

    // Which post this notification is about (null for follow notifications)
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },

    // Has the recipient seen it?
    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
)

// Get all notifications for a user, newest first
notificationSchema.index({ recipient: 1, createdAt: -1 })

// Quickly find unread notifications count
notificationSchema.index({ recipient: 1, read: 1 })

const Notification = mongoose.model('Notification', notificationSchema)

export default Notification