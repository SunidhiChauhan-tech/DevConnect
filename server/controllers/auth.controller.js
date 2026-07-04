import User from '../models/User.model.js'
import generateToken from '../utils/generateToken.js'
import { AppError } from '../middleware/error.middleware.js'

// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (no token needed)
// ─────────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    // Step 1 — Extract data from request body
    // req.body contains what the frontend sent us
    const { name, email, password } = req.body

    // Step 2 — Basic validation
    // Check all required fields are present
    if (!name || !email || !password) {
      return next(new AppError('Please provide name, email and password', 400))
    }

    // Step 3 — Check if user already exists
    // We don't want two accounts with same email
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return next(new AppError('An account with this email already exists', 400))
    }

    // Step 4 — Create the user
    // Notice we pass plain password here
    // Our pre-save hook in User.model.js will hash it automatically
    const user = await User.create({
      name,
      email,
      password
    })

    // Step 5 — Generate JWT token
    // We pass the user's MongoDB _id into the token
    const token = generateToken(user._id)

    // Step 6 — Send response
    // We never send the password back — even hashed
    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    })

  } catch (error) {
    // Pass any unexpected error to our global error handler
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    // Step 1 — Extract credentials
    const { email, password } = req.body

    // Step 2 — Validate fields exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400))
    }

    // Step 3 — Find user by email
    // We use .select('+password') because password has select: false in schema
    // Without this, password would not be returned and comparison would fail
    const user = await User.findOne({ email }).select('+password')

    // Step 4 — Check if user exists
    if (!user) {
      // Important: use vague error message
      // Don't say "email not found" — that tells attackers which emails exist
      return next(new AppError('Invalid email or password', 401))
    }

    // Step 5 — Compare password
    // user.comparePassword is the instance method we wrote in User.model.js
    const isPasswordMatch = await user.comparePassword(password)

    if (!isPasswordMatch) {
      return next(new AppError('Invalid email or password', 401))
    }

    // Step 6 — Check if account is active
    if (!user.isActive) {
      return next(new AppError('Your account has been suspended', 403))
    }

    // Step 7 — Generate token and send response
    const token = generateToken(user._id)

    res.status(200).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      }
    })

  } catch (error) {
    next(error)
  }
}

// ─────────────────────────────────────────────
// @desc    Get currently logged in user
// @route   GET /api/auth/me
// @access  Protected (token required)
// ─────────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by our auth middleware
    // It contains the decoded token data (user id)
    // We fetch fresh data from DB to get latest profile
    const user = await User.findById(req.user.id)
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
// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Protected
// ─────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    // JWT is stateless — we cannot invalidate it server side
    // We tell the frontend to delete the token
    // Frontend is responsible for removing it from localStorage and Redux
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    next(error)
  }
}