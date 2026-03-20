import { User, Match, Message, FriendRequest } from '../models/index.js';

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or not an admin'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const jwt = (await import('jsonwebtoken')).default;
    const config = (await import('../config/index.js')).default;
    
    const token = jwt.sign({ userId: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: '24h'
    });

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfile = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        _id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email,
        role: req.admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const [totalUsers, activeUsers, totalMatches, totalMessages, reportedUsers, onlineUsers] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Match.countDocuments(),
      Message.countDocuments(),
      FriendRequest.countDocuments({ status: 'pending' }),
      User.countDocuments({ isOnline: true })
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSignups = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $project: { date: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalMatches,
        totalMessages,
        reportedUsers,
        onlineUsers,
        recentSignups
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const [users, total] = await Promise.all([
      User.find(query).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
      User.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(total / parseInt(limit)),
        currentPage: parseInt(page),
        total
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('friends', 'name email')
      .populate('matchedUsers', 'name email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByIdAndUpdate(id, updates, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Promise.all([
      User.findByIdAndDelete(id),
      Match.deleteMany({ users: id }),
      Message.deleteMany({ $or: [{ senderId: id }, { receiverId: id }] }),
      FriendRequest.deleteMany({ $or: [{ sender: id }, { receiver: id }] })
    ]);

    res.json({
      success: true,
      message: 'User deleted'
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: { isActive: user.isActive }
    });
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [matches, total] = await Promise.all([
      Match.find()
        .populate('users', 'name email profileImages')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Match.countDocuments()
    ]);

    res.json({
      success: true,
      data: { matches, totalPages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMatch = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Promise.all([
      Match.findByIdAndDelete(id),
      Message.deleteMany({ matchId: id })
    ]);

    res.json({
      success: true,
      message: 'Match deleted'
    });
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  res.json({
    success: true,
    message: 'Logged out'
  });
};
