const express = require('express');
const router = express.Router();
const {
  createPost,
  getFeed,
  getUserPosts,
  updatePost,
  deletePost,
  toggleLike,
  uploadPostImage,
} = require('../controllers/postController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/', uploadPostImage, createPost);
router.get('/feed', getFeed);
router.get('/user/:userId', getUserPosts);
router.put('/:id', updatePost);
router.delete('/:id', deletePost);
router.put('/:id/like', toggleLike);

module.exports = router;
