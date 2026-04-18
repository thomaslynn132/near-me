import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import matchRoutes from './match.routes.js';
import chatRoutes from './chat.routes.js';
import friendRoutes from './friend.routes.js';
import adminRoutes from './admin.routes.js';
import postRoutes from './post.routes.js';
import followRoutes from './follow.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/matches', matchRoutes);
router.use('/messages', chatRoutes);
router.use('/friends', friendRoutes);
router.use('/admin', adminRoutes);
router.use('/posts', postRoutes);
router.use('/users', followRoutes);

export default router;
