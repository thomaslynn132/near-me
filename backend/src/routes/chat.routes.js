import { Router } from 'express';
import { getMessages, sendMessage, markAsRead, getConversations } from '../controllers/chat.controller.js';
import { auth, messageLimiter } from '../middlewares/index.js';

const router = Router();
router.use(auth);

router.get('/conversations', getConversations);
router.get('/:matchId', getMessages);
router.post('/', messageLimiter, sendMessage);
router.put('/:messageId/read', markAsRead);

export default router;
