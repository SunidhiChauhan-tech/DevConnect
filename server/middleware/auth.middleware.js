import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import { AppError } from './error.middleware.js'

// ─────────────────────────────────────────────
// protect middleware — verifies JWT token
// Used on every protected route
// ─────────────────────────────────────────────
export const protect = async (req, res, next) => {
  try {
    let token

    // Step 1 — Check if token exists in Authorization header
    // Token format: "Bearer eyJhbGciOiJIUzI1NiJ9..."
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Split "Bearer TOKEN" and take the second part
      token = req.headers.authorization.split(' ')[1]
    }

    // Step 2 — If no token found, reject immediately
    if (!token) {
      return next(new AppError('Access denied. Please login first.', 401))
    }

    // Step 3 — Verify the token
    // jwt.verify() checks:
    // a) Was this token signed with our secret?
    // b) Has it expired?
    // If either fails, it throws an error
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // decoded = { id: "64abc123...", iat: 1234567890, exp: 1234567890 }

    // Step 4 — Find the user this token belongs to
    // We do this to make sure user still exists in DB
    // (in case account was deleted after token was issued)
    const user = await User.findById(decoded.id)

    if (!user) {
      return next(new AppError('User no longer exists', 401))
    }

    // Step 5 — Check if user is active (not banned)
    if (!user.isActive) {
      return next(new AppError('Your account has been suspended', 403))
    }

    // Step 6 — Attach user to request object
    // Now every controller that runs after this middleware
    // can access req.user to know who is making the request
    req.user = user

    // Step 7 — Pass control to the next middleware or controller
    next()

  } catch (error) {
    // jwt.verify() throws specific errors we can handle
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please login again.', 401))
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token expired. Please login again.', 401))
    }
    next(error)
  }
}

// ─────────────────────────────────────────────
// authorize middleware — checks user role
// Used on admin-only routes
// Usage: protect, authorize('admin')
// ─────────────────────────────────────────────
export const authorize = (...roles) => {
  return (req, res, next) => {
    // req.user is set by protect middleware above
    // roles is an array like ['admin'] or ['admin', 'moderator']
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      )
    }
    next()
  }
}