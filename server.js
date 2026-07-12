const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/follow', require('./routes/followRoutes'));

// HTML View Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'register.html'));
});
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forgot-password.html'));
});

app.get('/reset-password/:token', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'reset-password.html'));
});
app.get('/feed', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'feed.html'));
});
app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'profile.html'));
});
app.get('/edit-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'editProfile.html'));
});
app.get('/user/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'userProfile.html'));
});
app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'search.html'));
});
app.get('/forgot-password.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'forgotPassword.html'));
});


// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`SocialSphere running on http://localhost:${PORT}`);
});
