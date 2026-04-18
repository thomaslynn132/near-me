import { User, Follow } from '../models/index.js';

class FollowService {
  async follow(followerId, followingId) {
    if (followerId === followingId) {
      throw new Error('Cannot follow yourself');
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    const existingFollow = await Follow.findOne({ followerId, followingId });
    if (existingFollow) {
      throw new Error('Already following this user');
    }

    await Follow.create({ followerId, followingId });

    await User.findByIdAndUpdate(followerId, {
      $addToSet: { following: followingId }
    });

    await User.findByIdAndUpdate(followingId, {
      $addToSet: { followers: followerId }
    });

    return { success: true };
  }

  async unfollow(followerId, followingId) {
    await Follow.findOneAndDelete({ followerId, followingId });

    await User.findByIdAndUpdate(followerId, {
      $pull: { following: followingId }
    });

    await User.findByIdAndUpdate(followingId, {
      $pull: { followers: followerId }
    });

    return { success: true };
  }

  async getFollowers(userId, page = 1, limit = 20) {
    const follows = await Follow.find({ followingId: userId })
      .populate('followerId', 'name profileImages')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return follows.map(f => f.followerId);
  }

  async getFollowing(userId, page = 1, limit = 20) {
    const follows = await Follow.find({ followerId: userId })
      .populate('followingId', 'name profileImages')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    return follows.map(f => f.followingId);
  }

  async isFollowing(followerId, followingId) {
    const follow = await Follow.findOne({ followerId, followingId });
    return !!follow;
  }
}

export default new FollowService();