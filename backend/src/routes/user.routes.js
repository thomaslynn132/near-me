import { Router } from 'express';
import { getNearbyUsers, getUserProfile, updateProfile, updateLocation, likeUser, dislikeUser, setOnlineStatus } from '../controllers/user.controller.js';
import { auth } from '../middlewares/index.js';

const router = Router();

router.use(auth);

router.get('/nearby', getNearbyUsers);
router.get('/:userId', getUserProfile);
router.put('/profile', updateProfile);
router.put('/location', updateLocation);
router.post('/like/:userId', likeUser);
router.post('/dislike/:userId', dislikeUser);
router.put('/online-status', setOnlineStatus);

export default router;
