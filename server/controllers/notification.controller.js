import Notification from '../models/Notification.model.js'
import { AppError } from '../middleware/error.middleware.js'

// ─────────────────────────────────────────────
// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Protected
// ─────────────────────────────────────────────
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user.id
    })
    .populate('sender', 'name avatar')
    .populate('post', 'content')
    .sort({ createdAt: -1 })
    .limit(20)

    // Count unread notifications
    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      read: false
    })

    res.status(200).json({
      success: true,
      unreadCount,
      notifications
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Protected
// ─────────────────────────────────────────────
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return next(new AppError('Notification not found', 404))
    }

    // Make sure this notification belongs to current user
    if (notification.recipient.toString() !== req.user.id.toString()) {
      return next(new AppError('Not authorized', 403))
    }

    notification.read = true
    await notification.save()

    res.status(200).json({
      success: true,
      notification
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Protected
// ─────────────────────────────────────────────
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    )

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    })

  } catch (error) {
    next(error)
  }
}