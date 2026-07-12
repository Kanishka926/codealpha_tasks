const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment,
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/:id', addComment);
router.get('/:id', getComments);

module.exports = router;
