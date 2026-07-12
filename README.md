# SocialSphere

A complete, production-ready social media platform built with Node.js, Express.js, MongoDB, and vanilla JavaScript.

## Features

- **Authentication** - Register, Login, JWT-based auth, Logout
- **User Profiles** - Profile picture upload, bio, username, follower/following counts
- **Posts** - Create text/image posts, edit, delete, like/unlike
- **Comments** - Add, view, delete comments on posts
- **Social** - Follow/unfollow users, search users, view profiles
- **Feed** - Posts from followed users sorted by newest first

## Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** JWT (JSON Web Tokens), bcrypt
- **File Upload:** Multer

## Project Structure

```
SocialSphere/
├── public/
│   ├── css/style.css          # Styles
│   └── js/
│       ├── common.js          # Shared utilities
│       ├── auth.js            # Login/Register logic
│       ├── feed.js            # Feed page logic
│       ├── profile.js         # Own profile logic
│       ├── userProfile.js     # Other user's profile
│       └── search.js          # Search users logic
├── routes/
│   ├── authRoutes.js          # Auth API routes
│   ├── userRoutes.js          # User API routes
│   ├── postRoutes.js          # Post API routes
│   ├── commentRoutes.js       # Comment API routes
│   └── followRoutes.js        # Follow API routes
├── controllers/
│   ├── authController.js      # Auth business logic
│   ├── userController.js      # User business logic
│   ├── postController.js      # Post business logic
│   ├── commentController.js   # Comment business logic
│   └── followController.js    # Follow business logic
├── models/
│   ├── User.js                # User schema
│   ├── Post.js                # Post schema
│   └── Comment.js             # Comment schema
├── middleware/
│   └── auth.js                # JWT verification middleware
├── config/
│   └── db.js                  # MongoDB connection
├── uploads/                   # User-uploaded files
├── views/                     # HTML pages
├── .env                       # Environment variables
├── package.json               # Dependencies
└── server.js                  # Entry point
```

## Setup Instructions

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally or MongoDB Atlas)

### Step 1: Install Dependencies

```bash
cd SocialSphere
npm install
```

### Step 2: Configure Environment Variables

Edit the `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialsphere
JWT_SECRET=your_super_secret_key_change_this_in_production_2024
JWT_EXPIRE=7d
```

For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/socialsphere
```

### Step 3: Start MongoDB

If running locally, make sure MongoDB is running:

```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### Step 4: Run the Server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

The server will start at `http://localhost:5000`.

### Step 5: Open in Browser

Navigate to `http://localhost:5000` to access the login page.

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/search?q=` | Search users by username |
| GET | `/api/users/:id` | Get user profile by ID |
| PUT | `/api/users/profile` | Update own profile |
| PUT | `/api/users/profile-picture` | Upload profile picture |

### Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create a post (text + optional image) |
| GET | `/api/posts/feed` | Get feed (followed users + self) |
| GET | `/api/posts/user/:userId` | Get posts by a specific user |
| PUT | `/api/posts/:id` | Edit own post |
| DELETE | `/api/posts/:id` | Delete own post |
| PUT | `/api/posts/:id/like` | Like/unlike a post |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts/:id/comments` | Add comment to a post |
| GET | `/api/posts/:id/comments` | Get all comments on a post |
| DELETE | `/api/comments/:id` | Delete own comment |

### Follow
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/follow/:id` | Follow a user |
| DELETE | `/api/follow/:id` | Unfollow a user |

## Testing APIs with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"123456","fullName":"John Doe"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"123456"}'
```

### Create Post (use token from login response)
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"content":"Hello from SocialSphere!"}'
```

### Get Feed
```bash
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/posts/feed
```

### Follow User
```bash
curl -X PUT http://localhost:5000/api/follow/USER_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
