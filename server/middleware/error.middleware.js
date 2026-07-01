// Global error handler — catches ALL errors thrown in the app
// Express knows this is an error handler because it has 4 parameters (err, req, res, next)

export const errorHandler = (err, req, res, next) => {
  // If no status code set, default to 500 (Internal Server Error)
  const statusCode = err.statusCode || 500

  // Log error in development for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR:', err.message)
    console.error('STACK:', err.stack)
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // Only show stack trace in development, never in production
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}

// Custom error class — lets us create errors with custom status codes
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message)           // calls the parent Error class with message
    this.statusCode = statusCode
    this.isOperational = true // marks this as a known/expected error
  }
}