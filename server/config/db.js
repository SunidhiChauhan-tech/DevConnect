import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // mongoose.connect() returns a promise so we await it
    const conn = await mongoose.connect(process.env.MONGO_URI)

    // conn.connection.host tells us which Atlas cluster we connected to
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

  } catch (error) {
    // If connection fails, log the error and exit the process
    // process.exit(1) means "exit with failure"
    // We exit because there is no point running the server without a database
    console.error(`❌ MongoDB connection failed: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB