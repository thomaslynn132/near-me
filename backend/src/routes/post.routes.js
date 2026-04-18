import express from 'express';
import postController from '../controllers/post.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { body, param, query } from 'express-validator';

const router = express.Router();

router.use(protect);

router.route('/feed')
  .get(postController.getFeed);

router.route('/presigned-url')
  .get([
    query('filename').notEmpty(),
  ], postController.getPresignedUploadUrl);

router.route('/')
  .post([
    body('content').optional().isString().isLength({ max: 2000 }),
    body('media').optional().isArray(),
    body('privacy').optional().isIn(['public', 'followers', 'friends', 'private']),
  ], postController.create);

router.route('/:id')
  .get(postController.getPost)
  .put([
    body('content').optional().isString().isLength({ max: 2000 }),
    body('media').optional().isArray(),
    body('privacy').optional().isIn(['public', 'followers', 'friends', 'private']),
  ], postController.update)
  .delete(postController.delete);

router.route('/:id/like')
  .post(postController.like);

router.route('/user/:userId')
  .get([
    param('userId').isMongoId(),
  ], postController.getUserPosts);

export default router;