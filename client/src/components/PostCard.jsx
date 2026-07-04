import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../services/api'
import CommentSection from './CommentSection'

const PostCard = ({ post: initialPost, onDelete }) => {
  const [post, setPost] = useState(initialPost)
  const [showComments, setShowComments] = useState(false)
  const [likeLoading, setLikeLoading] = useState(false)

  const { user } = useSelector(state => state.auth)

  // Check if current user already liked this post
  const isLiked = post.likes?.includes(user?._id)

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const handleLike = async () => {
    try {
      setLikeLoading(true)
      const response = await api.put(`/posts/${post._id}/like`)

      // Update likes array locally without refetching
      // If liked → add user ID, if unliked → remove user ID
      if (response.data.liked) {
        setPost(prev => ({
          ...prev,
          likes: [...prev.likes, user._id]
        }))
      } else {
        setPost(prev => ({
          ...prev,
          likes: prev.likes.filter(id => id !== user._id)
        }))
      }
    } catch (err) {
      console.error('Like failed:', err)
    } finally {
      setLikeLoading(false)
    }
  }

  const handleDelete = async () => {
    // Confirm before deleting
    if (!window.confirm('Delete this post?')) return

    try {
      await api.delete(`/posts/${post._id}`)
      onDelete(post._id)  // tell parent to remove from feed
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const handleCommentAdded = (updatedPost) => {
    setPost(updatedPost)  // replace post with updated version containing new comment
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mb-4">

      {/* Post Header — author info */}
      <div className="flex items-start justify-between mb-3">
        <Link
          to={`/profile/${post.author?._id}`}
          className="flex items-center gap-3 hover:opacity-80 transition"
        >
          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
            {post.author?.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              post.author?.name?.charAt(0).toUpperCase()
            )}
          </div>

          {/* Name and date */}
          <div>
            <p className="font-semibold text-gray-800 text-sm">
              {post.author?.name}
            </p>
            <p className="text-xs text-gray-400">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </Link>

        {/* Delete button — only for post owner or admin */}
        {(user?._id === post.author?._id || user?.role === 'admin') && (
          <button
            onClick={handleDelete}
            className="text-gray-300 hover:text-red-500 text-xs transition"
          >
            🗑️ Delete
          </button>
        )}
      </div>

      {/* Post Content */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">
        {post.content}
      </p>

      {/* Post Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="rounded-lg w-full object-cover max-h-80 mb-3"
        />
      )}

      {/* Like and Comment Actions */}
      <div className="flex items-center gap-5 pt-2 border-t border-gray-100">

        {/* Like button */}
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`flex items-center gap-1.5 text-sm font-medium transition ${
            isLiked
              ? 'text-red-500'
              : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <span>{isLiked ? '❤️' : '🤍'}</span>
          <span>{post.likes?.length || 0}</span>
        </button>

        {/* Comment toggle button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-primary-600 transition"
        >
          <span>💬</span>
          <span>{post.comments?.length || 0}</span>
        </button>

      </div>

      {/* Comments Section — shown when toggled */}
      {showComments && (
        <CommentSection
          post={post}
          onCommentAdded={handleCommentAdded}
        />
      )}

    </div>
  )
}

export default PostCard