 # DevConnect 🚀
### A Full-Stack Developer Community Platform

A social networking platform built specifically for developers to share posts,
connect with peers, and collaborate — built with the MERN stack.

---

## 🌐 Live Demo
> - **Frontend:** https://dev-connect-xi-rouge.vercel.app
- **Backend API:** https://devconnect-qndq.onrender.com
- **Health Check:** https://devconnect-qndq.onrender.com/health


## ✨ Features

- 🔐 JWT-based authentication with bcrypt password hashing
- 👤 Developer profiles with skills, bio, GitHub link
- 📝 Create, like, and comment on posts
- 👥 Follow / Unfollow developers
- 🔔 Real-time notifications using Socket.io
- 🖼️ Image uploads via Cloudinary
- 🔍 Search developers by name or skill
- 🛡️ Role-based access control (User / Admin)

---

## 🛠️ Tech Stack

**Frontend**
- React.js (Vite)
- Redux Toolkit (global state management)
- Tailwind CSS
- Axios
- Socket.io Client

**Backend**
- Node.js
- Express.js
- JWT Authentication
- Bcrypt.js
- Socket.io
- Multer + Cloudinary

**Database**
- MongoDB Atlas
- Mongoose ODM

**Deployment**
- Frontend → Vercel
- Backend → Render
- Database → MongoDB Atlas

---

## 📁 Project Structure

```
devconnect/
├── client/                 # React Frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── features/       # Redux slices
│       ├── pages/          # Route-level pages
│       ├── services/       # Axios API calls
│       └── store.js        # Redux store
│
└── server/                 # Node/Express Backend
    ├── config/             # DB and Cloudinary config
    ├── controllers/        # Business logic
    ├── middleware/         # Auth, error, upload middleware
    ├── models/             # Mongoose schemas
    ├── routes/             # Express route definitions
    ├── socket/             # Socket.io setup
    └── utils/              # Helper functions
```

---

## 🗄️ Database Design

**Collections:** Users · Posts · Notifications

**User** stores profile info, skills, followers/following arrays
**Post** stores content, likes array, embedded comments
**Notification** stores recipient, sender, type (like/comment/follow)

---

## 🔐 Authentication Flow

```
Register → validate → hash password (bcrypt) → save to DB → return JWT
Login    → find user → compare password → return JWT
Request  → auth middleware verifies JWT → attach user to req → controller
```

---

## 🚀 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register new user | ❌ |
| POST | /api/auth/login | Login user | ❌ |
| GET | /api/users | Get all developers | ✅ |
| GET | /api/users/:id | Get user profile | ✅ |
| PUT | /api/users/profile | Update profile | ✅ |
| POST | /api/users/:id/follow | Follow user | ✅ |
| GET | /api/posts | Get all posts | ✅ |
| POST | /api/posts | Create post | ✅ |
| PUT | /api/posts/:id/like | Like/Unlike post | ✅ |
| POST | /api/posts/:id/comment | Add comment | ✅ |
| GET | /api/notifications | Get notifications | ✅ |

---

## ⚙️ Local Setup

```bash
# Clone the repository
git clone https://github.com/SunidhiChauhan-tech/DevConnect.git
cd devconnect

# Setup backend
cd server
npm install
# Create .env file with your credentials (see .env.example)
npm run dev

# Setup frontend (new terminal)
cd client
npm install
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `server` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

---

## 👩‍💻 Author

**Sunidhi Chauhan**
- GitHub: [@SunidhiChauhan-tech](https://github.com/SunidhiChauhan-tech)
- LinkedIn: [sunidhi-chauhan](https://www.linkedin.com/in/sunidhi-chauhan-6244452b4)

---

## 📌 Status
## 📌 Status
> ✅ Fully deployed and live!
> - Backend on Render
> - Frontend on Vercel  
> - Database on MongoDB Atlas
> - Images on Cloudinary
> - Real-time notifications via Socket.io
