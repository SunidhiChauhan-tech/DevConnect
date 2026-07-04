import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1
}

const postSlice = createSlice({
  name: 'posts',
  initialState,

  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload.posts
      state.totalPages = action.payload.totalPages
      state.currentPage = action.payload.currentPage
      state.loading = false
    },

    addPost: (state, action) => {
      // Add new post to the BEGINNING of the array
      state.posts.unshift(action.payload)
    },

    removePost: (state, action) => {
      // Filter out deleted post by ID
      state.posts = state.posts.filter(
        post => post._id !== action.payload
      )
    },

    updatePostLike: (state, action) => {
      const { postId, liked, likesCount } = action.payload
      const post = state.posts.find(p => p._id === postId)
      if (post) {
        post.likesCount = likesCount
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload
    },

    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    }
  }
})

export const {
  setPosts,
  addPost,
  removePost,
  updatePostLike,
  setLoading,
  setError
} = postSlice.actions

export default postSlice.reducer