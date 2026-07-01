import multer from 'multer'

// memoryStorage stores the file in RAM as a Buffer
// instead of saving to disk first
// This is better for Cloudinary because we stream directly from memory
const storage = multer.memoryStorage()

// File filter — only allow image files
const fileFilter = (req, file, cb) => {
  // file.mimetype looks like "image/jpeg" or "image/png"
  if (file.mimetype.startsWith('image/')) {
    cb(null, true)   // null = no error, true = accept file
  } else {
    cb(new Error('Only image files are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB max file size
                                 // 5 * 1024 = 5KB * 1024 = 5MB in bytes
  }
})

export default upload