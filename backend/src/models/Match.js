import mongoose from 'mongoose';

const matchSchema = new mongoose.Schema({
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  isBlind: {
    type: Boolean,
    default: false
  },
  isRevealed: {
    type: Boolean,
    default: false
  },
  messageCount: {
    type: Number,
    default: 0
  },
  revealThreshold: {
    type: Number,
    default: 10
  },
  lastMessageAt: {
    type: Date,
    default: null
  },
  initiator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

matchSchema.index({ users: 1 });
matchSchema.index({ 'users.userId': 1 });
matchSchema.index({ isBlind: 1, isRevealed: 1 });

const Match = mongoose.model('Match', matchSchema);

export default Match;
