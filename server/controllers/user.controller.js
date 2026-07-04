import { sendNotification } from '../socket/socket.js' 
 import User from '../models/User.model.js'
import Notification from '../models/Notification.model.js'
import cloudinary from '../config/cloudinary.js'
import { AppError } from '../middleware/error.middleware.js'

// ─────────────────────────────────────────────
// @desc    Get all developers
// @route   GET /api/users
// @access  Protected
// ─────────────────────────────────────────────
export const getAllUsers = async (req, res, next) => {
  try {
    // Find all users except the logged in user
    // '-password' means exclude password field
    const users = await User.find({ 
      _id: { $ne: req.user.id },  // $ne = not equal
      isActive: true 
    })
    .select('-password')
    .sort({ createdAt: -1 })  // newest first

    res.status(200).json({
      success: true,
      count: users.length,
      users
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Get single user profile
// @route   GET /api/users/:id
// @access  Protected
// ─────────────────────────────────────────────
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name avatar')
      .populate('following', 'name avatar')

    if (!user) {
      return next(new AppError('User not found', 404))
    }

    res.status(200).json({
      success: true,
      user
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Update my profile
// @route   PUT /api/users/profile
// @access  Protected
// ─────────────────────────────────────────────
export const updateProfile = async (req, res, next) => {
  try {
    // Fields the user is allowed to update
    // They cannot update email, password, or role here
    const { name, bio, skills, githubLink, location } = req.body

    // Build update object with only provided fields
    const updateData = {}
    if (name) updateData.name = name
    if (bio) updateData.bio = bio
    if (location) updateData.location = location
    if (githubLink) updateData.githubLink = githubLink

    // Skills comes as comma separated string from frontend
    // We convert it to an array
    // "React, Node.js, MongoDB" → ["React", "Node.js", "MongoDB"]
    if (skills) {
      updateData.skills = skills
        .split(',')
        .map(skill => skill.trim())  // remove extra spaces
        .filter(skill => skill)      // remove empty strings
    }

    // Handle avatar upload if file was sent
    if (req.file) {
      // Convert buffer to base64 string for cloudinary
      const fileStr = req.file.buffer.toString('base64')
      const fileType = req.file.mimetype

      // Upload to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${fileType};base64,${fileStr}`,
        {
          folder: 'devconnect/avatars',  // organized folder in cloudinary
          transformation: [
            { width: 400, height: 400, crop: 'fill' },  // resize to square
            { quality: 'auto' }                          // auto optimize quality
          ]
        }
      )

      // Save the cloudinary URL
      updateData.avatar = uploadResponse.secure_url
    }

    // findByIdAndUpdate with { new: true } returns the UPDATED document
    // Without { new: true } it returns the OLD document before update
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
      //            ↑ runs schema validators on update too
    ).select('-password')

    res.status(200).json({
      success: true,
      user: updatedUser
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Follow a user
// @route   POST /api/users/:id/follow
// @access  Protected
// ─────────────────────────────────────────────
export const followUser = async (req, res, next) => {
  try {
    // Cannot follow yourself
    if (req.params.id === req.user.id.toString()) {
      return next(new AppError('You cannot follow yourself', 400))
    }

    const userToFollow = await User.findById(req.params.id)
    const currentUser = await User.findById(req.user.id)

    if (!userToFollow) {
      return next(new AppError('User not found', 404))
    }

    // Check if already following
    const isAlreadyFollowing = currentUser.following.includes(req.params.id)

    if (isAlreadyFollowing) {
      return next(new AppError('You are already following this user', 400))
    }

    // Add to following/followers arrays
    // $push adds an element to an array field
    await User.findByIdAndUpdate(req.user.id, {
      $push: { following: req.params.id }
    })

    await User.findByIdAndUpdate(req.params.id, {
      $push: { followers: req.user.id }
    })

    // Create notification for the user being followed
    const notification = await Notification.create({
  recipient: req.params.id,
  sender: req.user.id,
  type: 'follow'
})

const populatedNotification = await notification.populate(
  'sender',
  'name avatar'
)

sendNotification(req.params.id, populatedNotification)

    res.status(200).json({
      success: true,
      message: `You are now following ${userToFollow.name}`
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Unfollow a user
// @route   DELETE /api/users/:id/follow
// @access  Protected
// ─────────────────────────────────────────────
export const unfollowUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id.toString()) {
      return next(new AppError('You cannot unfollow yourself', 400))
    }

    const userToUnfollow = await User.findById(req.params.id)

    if (!userToUnfollow) {
      return next(new AppError('User not found', 404))
    }

    // $pull removes an element from an array field
    // Opposite of $push
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { following: req.params.id }
    })

    await User.findByIdAndUpdate(req.params.id, {
      $pull: { followers: req.user.id }
    })

    res.status(200).json({
      success: true,
      message: `You have unfollowed ${userToUnfollow.name}`
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Search developers
// @route   GET /api/users/search?q=react
// @access  Protected
// ─────────────────────────────────────────────
export const searchUsers = async (req, res, next) => {
  try {
    const { q } = req.query  // get search term from URL query parameter

    if (!q) {
      return next(new AppError('Please provide a search term', 400))
    }

    // $text search uses the text index we created on name and skills
    // $search performs full text search across indexed fields
    const users = await User.find({
      $text: { $search: q },
      _id: { $ne: req.user.id },
      isActive: true
    })
    .select('name avatar bio skills location')
    .limit(20)  // max 20 results

    res.status(200).json({
      success: true,
      count: users.length,
      users
    })

  } catch (error) {
    next(error)
  }
}