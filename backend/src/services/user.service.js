import { User } from '../models/index.js';

class UserService {
  async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateProfile(userId, updates) {
    const allowedUpdates = ['name', 'bio', 'interests', 'profileImages', 'settings', 'visibility'];
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key];
        return obj;
      }, {});

    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdates,
      { new: true, runValidators: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateLocation(userId, coordinates) {
    const [lng, lat] = coordinates;
    
    if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      throw new Error('Invalid coordinates');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async findNearbyUsers(userId, lng, lat, radiusKm = 50) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    let visibilityQuery = { visibility: 'public' };
    if (currentUser.friends.includes(userId)) {
      visibilityQuery = { visibility: { $in: ['public', 'friends'] } };
    }

    const users = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            _id: { $ne: userId },
            ...visibilityQuery,
            _id: { $nin: [...currentUser.likedUsers, ...currentUser.dislikedUsers, ...currentUser.matchedUsers] }
          }
        }
      },
      { $limit: 50 },
      {
        $project: {
          password: 0,
          __v: 0,
          dislikedUsers: 0,
          likedUsers: 0
        }
      }
    ]);

    return users.map(user => ({
      ...user,
      distance: Math.round(user.distance / 1000 * 10) / 10
    }));
  }

  async likeUser(likerId, likedId) {
    if (likerId === likedId) {
      throw new Error('Cannot like yourself');
    }

    const [liker, liked] = await Promise.all([
      User.findById(likerId),
      User.findById(likedId)
    ]);

    if (!liker || !liked) {
      throw new Error('User not found');
    }

    if (liker.likedUsers.includes(likedId)) {
      throw new Error('Already liked this user');
    }

    if (liker.dislikedUsers.includes(likedId)) {
      throw new Error('Cannot like a disliked user');
    }

    if (liker.matchedUsers.includes(likedId)) {
      throw new Error('Already matched with this user');
    }

    liker.likedUsers.push(likedId);
    await liker.save();

    const isMutual = liked.likedUsers.includes(likerId);

    if (isMutual) {
      liker.matchedUsers.push(likedId);
      liked.matchedUsers.push(likerId);
      await Promise.all([liker.save(), liked.save()]);
    }

    return { isMutual, likedId, likerId };
  }

  async dislikeUser(userId, dislikedId) {
    if (userId === dislikedId) {
      throw new Error('Cannot dislike yourself');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.likedUsers.includes(dislikedId)) {
      user.likedUsers = user.likedUsers.filter(id => id.toString() !== dislikedId);
    }

    if (!user.dislikedUsers.includes(dislikedId)) {
      user.dislikedUsers.push(dislikedId);
    }

    await user.save();
    return { dislikedId };
  }

  async getUserProfile(userId, targetUserId) {
    const user = await User.findById(targetUserId)
      .select('-password -__v -likedUsers -dislikedUsers');

    if (!user) {
      throw new Error('User not found');
    }

    const isFriend = user.friends.includes(userId);
    const isMatched = user.matchedUsers.includes(userId);

    if (user.visibility === 'hidden' && !isFriend && !isMatched) {
      throw new Error('This profile is private');
    }

    if (user.visibility === 'friends' && !isFriend && !isMatched) {
      return {
        name: user.name,
        age: user.age,
        interests: [],
        profileImages: user.profileImages.slice(0, 1),
        distance: null,
        isOnline: false
      };
    }

    return user;
  }

  async setOnlineStatus(userId, isOnline) {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnline,
        lastSeen: isOnline ? new Date() : user.lastSeen
      },
      { new: true }
    );
    return user;
  }

  async getOnlineUsers(userIds) {
    const users = await User.find({
      _id: { $in: userIds },
      isOnline: true
    }).select('_id');
    return users.map(u => u._id);
  }
}

export default new UserService();
