const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const multer = require('multer');
const path = require('path');

// Configure multer for post image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `post-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

exports.uploadPostImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('image');

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { content } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    if (!content && !image) {
      return res.status(400).json({
        success: false,
        message: 'Post must have text content or an image',
      });
    }

    const post = await Post.create({
      user: req.user._id,
      content: content || '',
      image,
    });

    // Populate user info for the response
    await post.populate('user', 'username fullName profilePicture');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/posts/feed
exports.getFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Get posts from users the current user follows, plus own posts
    const userIds = [req.user._id, ...currentUser.following];

    const posts = await Post.find({ user: { $in: userIds } })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get comment counts for each post
    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        const isLiked = post.likes.includes(req.user._id);
        return {
          ...post.toObject(),
          commentCount,
          isLiked,
          likeCount: post.likes.length,
        };
      })
    );

    res.status(200).json({ success: true, data: postsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/posts/user/:userId
exports.getUserPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate('user', 'username fullName profilePicture')
      .sort({ createdAt: -1 })
      .limit(50);

    const postsWithCounts = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });
        const isLiked = post.likes.includes(req.user._id);
        return {
          ...post.toObject(),
          commentCount,
          isLiked,
          likeCount: post.likes.length,
        };
      })
    );

    res.status(200).json({ success: true, data: postsWithCounts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only the post author can edit
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own posts',
      });
    }

    post.content = req.body.content || post.content;
    await post.save();

    await post.populate('user', 'username fullName profilePicture');

    res.status(200).json({
      success: true,
      message: 'Post updated',
      data: post,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Only the post author can delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts',
      });
    }

    // Delete all comments on this post
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/posts/:id/like
exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    const userId = req.user._id;
    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      // Unlike: remove user from likes array
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like: add user to likes array
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: post.likes.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
