import { Match, User, Message } from '../models/index.js';

class MatchService {
  async getMatches(userId) {
    const matches = await Match.find({
      users: userId,
      isBlind: false
    })
      .populate('users', 'name profileImages age bio isOnline lastSeen')
      .sort({ updatedAt: -1 });

    return matches.map(match => {
      const otherUser = match.users.find(
        u => u._id.toString() !== userId
      );
      return {
        ...match.toObject(),
        otherUser
      };
    });
  }

  async getBlindMatches(userId) {
    const matches = await Match.find({
      users: userId,
      isBlind: true,
      isRevealed: false
    })
      .populate('users', 'name profileImages age bio isOnline lastSeen')
      .sort({ updatedAt: -1 });

    return matches.map(match => {
      const otherUser = match.users.find(
        u => u._id.toString() !== userId
      );
      return {
        ...match.toObject(),
        otherUser: {
          _id: otherUser._id,
          name: otherUser.name.split(' ')[0],
          age: otherUser.age,
          isOnline: otherUser.isOnline
        },
        canReveal: match.messageCount >= match.revealThreshold
      };
    });
  }

  async createMatch(userId1, userId2) {
    const existingMatch = await Match.findOne({
      users: { $all: [userId1, userId2] }
    });

    if (existingMatch) {
      return existingMatch;
    }

    const match = await Match.create({
      users: [userId1, userId2],
      isBlind: false,
      initiator: userId1
    });

    return match;
  }

  async createBlindMatch(userId, targetUserId) {
    const existingMatch = await Match.findOne({
      users: { $all: [userId, targetUserId] }
    });

    if (existingMatch) {
      if (existingMatch.isBlind) {
        return existingMatch;
      }
      throw new Error('Already matched with this user');
    }

    const match = await Match.create({
      users: [userId, targetUserId],
      isBlind: true,
      isRevealed: false,
      initiator: userId
    });

    return match;
  }

  async revealMatch(userId, matchId) {
    const match = await Match.findOne({
      _id: matchId,
      users: userId,
      isBlind: true
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.messageCount < match.revealThreshold) {
      throw new Error('Not enough messages to reveal');
    }

    match.isRevealed = true;
    await match.save();

    const populatedMatch = await Match.findById(matchId)
      .populate('users', 'name profileImages age bio isOnline lastSeen interests');

    return populatedMatch;
  }

  async unmatch(userId, matchId) {
    const match = await Match.findOne({
      _id: matchId,
      users: userId
    });

    if (!match) {
      throw new Error('Match not found');
    }

    const otherUserId = match.users.find(id => id.toString() !== userId);
    
    await Promise.all([
      User.findByIdAndUpdate(userId, {
        $pull: { matchedUsers: otherUserId }
      }),
      User.findByIdAndUpdate(otherUserId, {
        $pull: { matchedUsers: userId }
      }),
      Message.deleteMany({ matchId }),
      Match.findByIdAndDelete(matchId)
    ]);

    return { success: true };
  }

  async incrementMessageCount(matchId) {
    await Match.findByIdAndUpdate(matchId, {
      $inc: { messageCount: 1 },
      lastMessageAt: new Date()
    });
  }

  async getMatchById(matchId) {
    return await Match.findById(matchId)
      .populate('users', 'name profileImages age bio isOnline lastSeen interests');
  }

  async getMatchBetweenUsers(userId1, userId2) {
    return await Match.findOne({
      users: { $all: [userId1, userId2] }
    });
  }
}

export default new MatchService();
