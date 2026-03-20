import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import config from '../config/index.js';

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }

  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = await User.create(userData);
    const token = this.generateToken(user._id);

    return { user, token };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = this.generateToken(user._id);

    return { user, token };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date()
    });
  }

  async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

export default new AuthService();
