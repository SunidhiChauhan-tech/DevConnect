import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addPost } from '../features/postSlice'
import api from '../services/api'

const CreatePost = () => {
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const dispatch = useDispatch()
  const { user } = useSelector(state => state.auth)

  // Handle image selection and show preview
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      // Create a local URL to preview image before uploading
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      setError('Post content cannot be empty')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // FormData is used when sending files
      // Regular JSON cannot send binary file data
      const formData = new FormData()
      formData.append('content', content)
      if (image) formData.append('image', image)

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
          // multipart/form-data tells server this request contains files
        }
      })

      // Add new post to Redux store (appears at top of feed instantly)
      dispatch(addPost(response.data.post))

      // Reset form
      setContent('')
      setImage(null)
      setImagePreview(null)

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-6">

      {/* User avatar + input area */}
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something with the developer community..."
            rows={3}
            className="w-full resize-none border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
          />

          {/* Image preview */}
          {imagePreview && (
            <div className="relative mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="rounded-lg max-h-48 object-cover"
              />
              <button
                onClick={() => { setImage(null); setImagePreview(null) }}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-red-500 text-xs mt-2">{error}</p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-3">

            {/* Image upload button */}
            <label className="cursor-pointer text-gray-500 hover:text-primary-600 text-sm flex items-center gap-1 transition">
              <span>📷</span>
              <span>Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading || !content.trim()}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2 rounded-lg transition"
            >
              {loading ? 'Posting...' : 'Post'}
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost