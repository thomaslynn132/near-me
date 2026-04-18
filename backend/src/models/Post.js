import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    maxlength: [2000, 'Post cannot exceed 2000 characters'],
    default: ''
  },
  media: [{
    url: String,
    publicId: String,
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      default: 'image'
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'followers', 'friends', 'private'],
    default: 'public'
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentsCount: {
    type: Number,
    default: 0
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ privacy: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;