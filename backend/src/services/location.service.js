import { User } from '../models/index.js';
import config from '../config/index.js';

class LocationService {
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  async updateUserLocation(userId, coordinates) {
    const [lng, lat] = coordinates;

    if (isNaN(lng) || isNaN(lat)) {
      throw new Error('Invalid coordinates');
    }

    if (lng < -180 || lng > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    if (lat < -90 || lat > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        isOnline: true,
        lastSeen: new Date()
      },
      { new: true }
    );

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async getUsersInRadius(userId, lng, lat, radiusKm = null) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const radius = radiusKm || currentUser.settings?.discoveryRadius || config.discoveryRadius;

    const blockedUsers = [
      ...(currentUser.likedUsers || []),
      ...(currentUser.dislikedUsers || []),
      ...(currentUser.matchedUsers || []),
      currentUser._id
    ];

    let visibilityQuery = { visibility: 'public' };
    if (currentUser.friends && currentUser.friends.length > 0) {
      visibilityQuery = {
        $or: [
          { visibility: 'public' },
          { visibility: 'friends', _id: { $in: currentUser.friends } }
        ]
      };
    }

    const users = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radius * 1000,
          spherical: true,
          query: {
            _id: { $nin: blockedUsers },
            ...visibilityQuery
          }
        }
      },
      {
        $addFields: {
          distanceKm: { $divide: ['$distance', 1000] }
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          likedUsers: 0,
          dislikedUsers: 0
        }
      },
      { $sort: { distance: 1 } },
      { $limit: 100 }
    ]);

    return users.map(user => ({
      ...user,
      distance: Math.round(user.distanceKm * 10) / 10
    }));
  }

  async getOnlineFriendsNearUser(userId, lng, lat, radiusKm = 10) {
    const currentUser = await User.findById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const friendIds = currentUser.friends || [];

    const users = await User.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          maxDistance: radiusKm * 1000,
          spherical: true,
          query: {
            _id: { $in: friendIds, $ne: userId },
            isOnline: true,
            visibility: { $in: ['public', 'friends'] }
          }
        }
      },
      {
        $project: {
          password: 0,
          __v: 0,
          likedUsers: 0,
          dislikedUsers: 0
        }
      }
    ]);

    return users;
  }

  formatLocationDisplay(distanceKm) {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m away`;
    }
    return `${Math.round(distanceKm * 10) / 10}km away`;
  }

  isWithinRadius(userLat, userLng, targetLat, targetLng, radiusKm) {
    const distance = this.calculateDistance(userLat, userLng, targetLat, targetLng);
    return distance <= radiusKm;
  }
}

export default new LocationService();
