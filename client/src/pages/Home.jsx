import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts, removePost } from '../features/postSlice'
import api from '../services/api'
import Navbar from '../components/Navbar'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'

const Home = () => {
  const dispatch = useDispatch()
  const { posts, loading } = useSelector(state => state.posts)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [fetching, setFetching] = useState(false)

  // Fetch posts when component mounts
  useEffect(() => {
    fetchPosts()
  }, [page])

  const fetchPosts = async () => {
    try {
      setFetching(true)
      const response = await api.get(`/posts?page=${page}&limit=10`)

      dispatch(setPosts({
        posts: response.data.posts,
        totalPages: response.data.totalPages,
        currentPage: response.data.currentPage
      }))

      setTotalPages(response.data.totalPages)
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setFetching(false)
    }
  }

  // Remove deleted post from feed
  const handleDeletePost = (postId) => {
    dispatch(removePost(postId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Create Post */}
        <CreatePost />

        {/* Posts Feed */}
        {fetching && posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Loading posts...
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-4xl mb-3">👋</p>
            <p className="font-medium">No posts yet!</p>
            <p className="text-sm">Be the first to share something.</p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard
                key={post._id}
                post={post}
                onDelete={handleDeletePost}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  ← Previous
                </button>
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  )
}

export default Home