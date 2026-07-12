const express = require('express');
const router = express.Router();
const { followUser, unfollowUser } = require('../controllers/followController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.put('/:id', followUser);
router.delete('/:id', unfollowUser);

module.exports = router;
