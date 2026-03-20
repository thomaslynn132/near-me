import { Router } from 'express';
import { sendRequest, acceptRequest, rejectRequest, getFriends, getPendingRequests, removeFriend } from '../controllers/friend.controller.js';
import { auth } from '../middlewares/index.js';

const router = Router();
router.use(auth);

router.get('/', getFriends);
router.get('/requests', getPendingRequests);
router.post('/request', sendRequest);
router.put('/request/:requestId/accept', acceptRequest);
router.put('/request/:requestId/reject', rejectRequest);
router.delete('/:friendId', removeFriend);

export default router;
