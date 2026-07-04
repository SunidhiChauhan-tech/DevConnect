import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    // ─────────────────────────────────
    // BASIC INFO
    // ─────────────────────────────────
    name: {
      type: String,
      required: [true, 'Name is required'],  // custom error message
      trim: true,                             // removes extra spaces
      maxlength: [50, 'Name cannot exceed 50 characters']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,        // no two users can have same email
      lowercase: true,     // always store email in lowercase
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email'
      ]
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false   // IMPORTANT: never return password in queries by default
    },

    // ─────────────────────────────────
    // PROFILE INFO
    // ─────────────────────────────────
    avatar: {
      type: String,
      default: ''   // empty string until user uploads one
    },

    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: ''
    },

    skills: {
      type: [String],   // array of strings e.g. ["React", "Node.js"]
      default: []
    },

    githubLink: {
      type: String,
      default: ''
    },

    location: {
      type: String,
      default: ''
    },

    // ─────────────────────────────────
    // SOCIAL GRAPH
    // ─────────────────────────────────
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,  // stores MongoDB IDs
        ref: 'User'                            // references the User collection
      }
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],

    // ─────────────────────────────────
    // SYSTEM FIELDS
    // ─────────────────────────────────
    role: {
      type: String,
      enum: ['user', 'admin'],   // only these two values allowed
      default: 'user'
    },

    isActive: {
      type: Boolean,
      default: true    // false = banned user
    }
  },

  {
    // timestamps: true automatically adds:
    // createdAt → when user registered
    // updatedAt → when user last updated profile
    timestamps: true
  }
)

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────

// We search users by email on every login
// Index makes this lookup instant instead of scanning entire collection


// We search developers by name and skills
userSchema.index({ name: 'text', skills: 'text' })

// ─────────────────────────────────────────────
// MIDDLEWARE — runs automatically before saving
// ─────────────────────────────────────────────

// pre('save') runs BEFORE every .save() call
userSchema.pre('save', async function () {
  // 'this' refers to the current user document being saved

  // Only hash password if it was changed or is new
  // Without this check, every profile update would re-hash the already hashed password
  if (!this.isModified('password')) {
    return   // skip hashing, move to next middleware
  }

  // Generate salt — adds randomness to the hash
  // 12 rounds = strong security (10-12 is industry standard)
  const salt = await bcrypt.genSalt(12)

  // Replace plain text password with hashed version
  this.password = await bcrypt.hash(this.password, salt)

    
})

// ─────────────────────────────────────────────
// INSTANCE METHODS
// These are functions available on every user document
// ─────────────────────────────────────────────

// Compare entered password with stored hash during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  // bcrypt.compare handles the hashing and comparison internally
  // returns true if match, false if not
  return await bcrypt.compare(enteredPassword, this.password)
}

// ─────────────────────────────────────────────
// CREATE AND EXPORT MODEL
// ─────────────────────────────────────────────

// mongoose.model('User', userSchema) does two things:
// 1. Creates a 'users' collection in MongoDB (lowercase + plural automatically)
// 2. Gives us User.find(), User.create(), User.findById() etc.
const User = mongoose.model('User', userSchema)

export default User