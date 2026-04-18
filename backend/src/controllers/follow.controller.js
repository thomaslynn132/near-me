import followService from '../services/follow.service.js';

export default {
  async follow(req, res) {
    try {
      const result = await followService.follow(req.user.id, req.params.userId);
      res.json({ data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async unfollow(req, res) {
    try {
      const result = await followService.unfollow(req.user.id, req.params.userId);
      res.json({ data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getFollowers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const users = await followService.getFollowers(req.params.userId, page, limit);
      res.json({ data: users });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getFollowing(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const users = await followService.getFollowing(req.params.userId, page, limit);
      res.json({ data: users });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async isFollowing(req, res) {
    try {
      const isFollowing = await followService.isFollowing(req.user.id, req.params.userId);
      res.json({ data: { isFollowing } });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};