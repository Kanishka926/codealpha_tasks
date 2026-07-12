const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchUsers,
  getUser,
  updateProfile,
  updateProfilePicture,
  uploadProfilePicture,
} = require('../controllers/userController');
// All routes require authentication
router.use(protect);

router.get('/search', searchUsers);
router.get('/:id', getUser);
router.put('/profile', updateProfile);
router.put(
  '/profile-picture',
  uploadProfilePicture,
  updateProfilePicture
);

module.exports = router;
