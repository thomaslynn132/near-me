import { FriendRequest, User } from '../models/index.js';

class FriendService {
  async sendRequest(senderId, receiverId) {
    if (senderId === receiverId) {
      throw new Error('Cannot send friend request to yourself');
    }

    const [sender, receiver] = await Promise.all([
      User.findById(senderId),
      User.findById(receiverId)
    ]);

    if (!sender || !receiver) {
      throw new Error('User not found');
    }

    if (sender.friends.includes(receiverId)) {
      throw new Error('Already friends with this user');
    }

    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId }
      ],
      status: 'pending'
    });

    if (existingRequest) {
      throw new Error('Friend request already exists');
    }

    const request = await FriendRequest.create({
      sender: senderId,
      receiver: receiverId
    });

    return request;
  }

  async acceptRequest(userId, requestId) {
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    request.status = 'accepted';
    await request.save();

    await Promise.all([
      User.findByIdAndUpdate(request.sender, {
        $addToSet: { friends: userId }
      }),
      User.findByIdAndUpdate(userId, {
        $addToSet: { friends: request.sender }
      })
    ]);

    return request;
  }

  async rejectRequest(userId, requestId) {
    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: userId,
      status: 'pending'
    });

    if (!request) {
      throw new Error('Friend request not found');
    }

    request.status = 'rejected';
    await request.save();

    return request;
  }

  async getFriends(userId) {
    const user = await User.findById(userId)
      .populate('friends', 'name profileImages age bio isOnline lastSeen interests');

    return user.friends;
  }

  async getPendingRequests(userId) {
    const requests = await FriendRequest.find({
      receiver: userId,
      status: 'pending'
    })
      .populate('sender', 'name profileImages age bio isOnline');

    return requests;
  }

  async getSentRequests(userId) {
    const requests = await FriendRequest.find({
      sender: userId,
      status: 'pending'
    })
      .populate('receiver', 'name profileImages age bio isOnline');

    return requests;
  }

  async removeFriend(userId, friendId) {
    const user = await User.findById(userId);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      throw new Error('User not found');
    }

    if (!user.friends.includes(friendId)) {
      throw new Error('Not friends with this user');
    }

    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { friends: friendId }
      }),
      User.findByIdAndUpdate(friendId, {
        $pull: { friends: userId }
      }),
      FriendRequest.deleteOne({
        $or: [
          { sender: userId, receiver: friendId },
          { sender: friendId, receiver: userId }
        ]
      })
    ]);

    return { success: true };
  }

  async getFriendshipStatus(userId1, userId2) {
    const areFriends = await User.findOne({
      _id: userId1,
      friends: userId2
    });

    if (areFriends) {
      return { status: 'friends' };
    }

    const sentRequest = await FriendRequest.findOne({
      sender: userId1,
      receiver: userId2,
      status: 'pending'
    });

    if (sentRequest) {
      return { status: 'request_sent' };
    }

    const receivedRequest = await FriendRequest.findOne({
      sender: userId2,
      receiver: userId1,
      status: 'pending'
    });

    if (receivedRequest) {
      return { status: 'request_received', requestId: receivedRequest._id };
    }

    return { status: 'none' };
  }
}

export default new FriendService();
