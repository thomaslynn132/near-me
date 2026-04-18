import express from 'express';
import followController from '../controllers/follow.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { param } from 'express-validator';

const router = express.Router();

router.use(protect);

router.route('/:userId/follow')
  .post(followController.follow)
  .delete(followController.unfollow);

router.route('/:userId/is-following')
  .get(followController.isFollowing);

router.route('/:userId/followers')
  .get(followController.getFollowers);

router.route('/:userId/following')
  .get(followController.getFollowing);

export default router;