const User = require('../models/User');
const crypto = require('crypto');
// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? 'Email already registered'
            : 'Username already taken',
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName,
    });

    // Generate token
    const token = user.generateToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          bio: user.bio,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = user.generateToken();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          bio: user.bio,
          profilePicture: user.profilePicture,
          followers: user.followers.length,
          following: user.following.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Count user's posts
    const Post = require('../models/Post');
    const postsCount = await Post.countDocuments({ user: user._id });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        profilePicture: user.profilePicture,
        followers: user.followers.length,
        following: user.following.length,
        postsCount,
        followersList: user.followers,
        followingList: user.following,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "Password reset feature is under development",
      });
    }

    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

   const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: user.email,
  subject: 'SocialSphere Password Reset',
  html: `
    <h2>Reset Your Password</h2>

    <p>Hello ${user.fullName},</p>

    <p>You requested to reset your SocialSphere password.</p>

    <a href="${resetURL}" style="background:#1877f2;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
      Reset Password
    </a>

    <p>This link will expire in 10 minutes.</p>

    <p>If you didn't request this, please ignore this email.</p>
  `,
});
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};
exports.resetPassword = async (req, res) => {
  try {

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful.',
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });

  }
};