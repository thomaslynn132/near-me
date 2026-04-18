import postService from '../services/post.service.js';
import { validationResult } from 'express-validator';

export default {
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const post = await postService.create(req.user.id, req.body);
      res.status(201).json({ data: post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async update(req, res) {
    try {
      const post = await postService.update(req.params.id, req.user.id, req.body);
      res.json({ data: post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async delete(req, res) {
    try {
      await postService.delete(req.params.id, req.user.id);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getFeed(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const posts = await postService.getFeed(req.user.id, page, limit);
      res.json({ data: posts });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getUserPosts(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const posts = await postService.getUserPosts(req.params.userId, req.user.id, page, limit);
      res.json({ data: posts });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getPost(req, res) {
    try {
      const post = await postService.getById(req.params.id);
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      res.json({ data: post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async like(req, res) {
    try {
      const post = await postService.like(req.params.id, req.user.id);
      res.json({ data: post });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  async getPresignedUploadUrl(req, res) {
    try {
      const { filename, mediaType } = req.query;
      const result = await postService.getPresignedUploadUrl(filename, mediaType);
      res.json({ data: result });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },
};