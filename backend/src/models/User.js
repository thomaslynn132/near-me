import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  age: {
    type: Number,
    required: [true, 'Age is required'],
    min: [18, 'You must be at least 18 years old'],
    max: [100, 'Age cannot exceed 100']
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  interests: [{
    type: String,
    enum: ['music', 'movies', 'sports', 'travel', 'food', 'art', 'reading', 'gaming', 'fitness', 'photography', 'hiking', 'cooking', 'dancing', 'yoga', 'tech', 'fashion', 'nature', 'books', 'coffee', 'wine']
  }],
  profileImages: [{
    url: String,
    publicId: String
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  visibility: {
    type: String,
    enum: ['public', 'friends', 'hidden'],
    default: 'public'
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  matchedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  settings: {
    discoveryRadius: {
      type: Number,
      default: 50,
      min: 1,
      max: 100
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: true
    },
    notificationsEnabled: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

export default User;
