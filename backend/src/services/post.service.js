import { Post, User, Follow } from '../models/index.js';
import storageService from './storage.service.js';

class PostService {
  async create(userId, data) {
    const post = await Post.create({
      userId,
      content: data.content || '',
      media: data.media || [],
      privacy: data.privacy || 'public',
    });

    return this.populatePost(post);
  }

  async update(postId, userId, data) {
    const post = await Post.findById(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId.toString() !== userId) {
      throw new Error('Not authorized to edit this post');
    }

    if (data.content !== undefined) {
      post.content = data.content;
    }
    if (data.media !== undefined) {
      post.media = data.media;
    }
    if (data.privacy !== undefined) {
      post.privacy = data.privacy;
    }

    post.isEdited = true;
    await post.save();

    return this.populatePost(post);
  }

  async delete(postId, userId) {
    const post = await Post.findById(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }

    if (post.userId.toString() !== userId) {
      throw new Error('Not authorized to delete this post');
    }

    for (const media of post.media) {
      if (media.publicId) {
        await storageService.delete(media.publicId);
      }
    }

    await post.deleteOne();
  }

  async getById(postId) {
    const post = await Post.findById(postId);
    return post ? this.populatePost(post) : null;
  }

  async getFeed(userId, page = 1, limit = 20) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const followingIds = user.following || [];
    const friendIds = user.friends || [];
    const userIds = [...new Set([userId, ...followingIds, ...friendIds])];

    const posts = await Post.find({
      $or: [
        { userId: { $in: userIds }, privacy: 'public' },
        { userId: { $in: friendIds }, privacy: 'friends' },
        { userId: { $in: followingIds }, privacy: 'followers' },
        { userId: userId, privacy: { $in: ['public', 'followers', 'friends', 'private'] } },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const populatedPosts = await Promise.all(
      posts.map(post => this.populatePost(post))
    );

    for (const post of populatedPosts) {
      if (post.media && post.media.length > 0) {
        for (const media of post.media) {
          if (media.publicId) {
            media.url = await storageService.getPresignedUrl(media.publicId);
          }
        }
      }
    }

    return populatedPosts;
  }

  async getUserPosts(userId, viewerId, page = 1, limit = 20) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    let privacyQuery = { userId, privacy: 'public' };

    if (viewerId === userId) {
      privacyQuery = { userId };
    } else if (user.friends && user.friends.map(id => id.toString()).includes(viewerId)) {
      privacyQuery = {
        userId,
        privacy: { $in: ['public', 'friends'] }
      };
    } else if (user.following && user.following.map(id => id.toString()).includes(viewerId)) {
      privacyQuery = {
        userId,
        privacy: { $in: ['public', 'followers'] }
      };
    }

    const posts = await Post.find(privacyQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const populatedPosts = await Promise.all(
      posts.map(post => this.populatePost(post))
    );

    for (const post of populatedPosts) {
      if (post.media && post.media.length > 0) {
        for (const media of post.media) {
          if (media.publicId) {
            media.url = await storageService.getPresignedUrl(media.publicId);
          }
        }
      }
    }

    return populatedPosts;
  }

  async like(postId, userId) {
    const post = await Post.findById(postId);
    
    if (!post) {
      throw new Error('Post not found');
    }

    const userIdStr = userId.toString();
    const isLiked = post.likes.map(id => id.toString()).includes(userIdStr);

    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userIdStr);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    return post;
  }

  async populatePost(post) {
    const populated = await post.populate('userId', 'name profileImages');
    return {
      ...populated.toObject(),
      likesCount: populated.likes.length,
      isLiked: false,
    };
  }

  async getPresignedUploadUrl(filename, mediaType = 'image') {
    const ext = filename.split('.').pop();
    const key = `posts/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
    const url = await storageService.getPresignedUploadUrl(key);
    return { uploadUrl: url, key };
  }
}

export default new PostService();