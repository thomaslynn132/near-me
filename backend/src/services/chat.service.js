import { Message, Match } from '../models/index.js';

class ChatService {
  async getMessages(userId, matchId, limit = 50, before) {
    const match = await Match.findOne({
      _id: matchId,
      users: userId
    });

    if (!match) {
      throw new Error('Match not found or unauthorized');
    }

    const query = { matchId };
    if (before) {
      query.createdAt = { $lt: before };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return messages.reverse();
  }

  async sendMessage(senderId, matchId, content, messageType = 'text', mediaUrl = null) {
    const match = await Match.findOne({
      _id: matchId,
      users: senderId
    });

    if (!match) {
      throw new Error('Match not found or unauthorized');
    }

    const receiverId = match.users.find(
      id => id.toString() !== senderId
    );

    const message = await Message.create({
      senderId,
      receiverId,
      matchId,
      content,
      messageType,
      mediaUrl
    });

    match.lastMessageAt = new Date();
    if (match.isBlind && !match.isRevealed) {
      match.messageCount += 1;
    }
    await match.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('senderId', 'name profileImages')
      .populate('receiverId', 'name profileImages');

    return populatedMessage;
  }

  async markAsRead(userId, messageId) {
    const message = await Message.findOne({
      _id: messageId,
      receiverId: userId
    });

    if (!message) {
      throw new Error('Message not found');
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    return message;
  }

  async markMessagesAsRead(userId, matchId) {
    await Message.updateMany(
      {
        matchId,
        receiverId: userId,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );
  }

  async getUnreadCount(userId) {
    const count = await Message.countDocuments({
      receiverId: userId,
      isRead: false
    });
    return count;
  }

  async getConversations(userId) {
    const matches = await Match.find({
      users: userId
    })
      .populate('users', 'name profileImages age isOnline lastSeen')
      .sort({ lastMessageAt: -1 });

    const conversations = await Promise.all(
      matches.map(async (match) => {
        const otherUser = match.users.find(
          u => u._id.toString() !== userId
        );

        const lastMessage = await Message.findOne({ matchId: match._id })
          .sort({ createdAt: -1 });

        const unreadCount = await Message.countDocuments({
          matchId: match._id,
          receiverId: userId,
          isRead: false
        });

        return {
          matchId: match._id,
          isBlind: match.isBlind,
          isRevealed: match.isRevealed,
          otherUser: match.isBlind && !match.isRevealed ? {
            _id: otherUser._id,
            name: otherUser.name.split(' ')[0],
            age: otherUser.age,
            isOnline: otherUser.isOnline
          } : otherUser,
          lastMessage,
          unreadCount,
          messageCount: match.messageCount,
          revealThreshold: match.revealThreshold
        };
      })
    );

    return conversations.filter(c => c.lastMessage);
  }
}

export default new ChatService();
