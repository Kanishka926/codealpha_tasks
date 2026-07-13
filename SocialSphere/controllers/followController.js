const User = require('../models/User');

// PUT /api/follow/:id
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Can't follow yourself
    if (targetUserId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already following
    const isAlreadyFollowing = currentUser.following.includes(targetUserId);
    if (isAlreadyFollowing) {
      return res.status(400).json({
        success: false,
        message: 'Already following this user',
      });
    }

    // Add to current user's following list
    currentUser.following.push(targetUserId);
    await currentUser.save();

    // Add to target user's followers list
    targetUser.followers.push(currentUserId);
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'User followed',
      data: {
        followers: targetUser.followers.length,
        following: currentUser.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/unfollow/:id
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user._id;

    // Check if target user exists
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if actually following
    const isFollowing = currentUser.following.includes(targetUserId);
    if (!isFollowing) {
      return res.status(400).json({
        success: false,
        message: 'Not following this user',
      });
    }

    // Remove from current user's following list
    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    await currentUser.save();

    // Remove from target user's followers list
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId.toString()
    );
    await targetUser.save();

    res.status(200).json({
      success: true,
      message: 'User unfollowed',
      data: {
        followers: targetUser.followers.length,
        following: currentUser.following.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
