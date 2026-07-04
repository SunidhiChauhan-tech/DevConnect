import { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../services/api'

const CommentSection = ({ post, onCommentAdded }) => {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useSelector(state => state.auth)

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!text.trim()) return

    try {
      setLoading(true)
      const response = await api.post(`/posts/${post._id}/comment`, { text })
      onCommentAdded(response.data.post)  // update parent with new post data
      setText('')  // clear input
    } catch (err) {
      console.error('Comment failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-100">

      {/* Existing comments */}
      {post.comments?.length > 0 && (
        <div className="space-y-2 mb-3">
          {post.comments.map((comment) => (
            <div key={comment._id} className="flex gap-2">
              {/* Commenter avatar */}
              <div className="w-7 h-7 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {comment.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="bg-gray-50 rounded-lg px-3 py-2 flex-1">
                <span className="text-xs font-semibold text-gray-800">
                  {comment.user?.name}
                </span>
                <p className="text-xs text-gray-600 mt-0.5">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add comment input */}
      <form onSubmit={handleAddComment} className="flex gap-2">
        <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="text-primary-600 text-xs font-semibold disabled:text-gray-300 transition"
        >
          {loading ? '...' : 'Post'}
        </button>
      </form>

    </div>
  )
}

export default CommentSection