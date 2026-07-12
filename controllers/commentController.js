const Comment = require('../models/Comment');
const Post = require('../models/Post');

// POST /api/posts/:id/comments
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    // Verify the post exists
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const comment = await Comment.create({
      post: req.params.id,
      user: req.user._id,
      text: text.trim(),
    });

    // Populate user info
    await comment.populate('user', 'username fullName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/posts/:id/comments
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: 1 }); // Oldest first

    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/comments/:id
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found',
      });
    }

    // Only the comment author can delete
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own comments',
      });
    }

    await comment.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Comment deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
