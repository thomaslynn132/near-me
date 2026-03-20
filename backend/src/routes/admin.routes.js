import { Router } from 'express';
import { adminLogin, getAdminProfile, adminLogout, getStats, getUsers, getUser, updateUser, deleteUser, toggleUserStatus, getMatches, deleteMatch } from '../controllers/admin.controller.js';
import { adminAuth } from '../middlewares/admin.middleware.js';

const router = Router();

router.post('/auth/login', adminLogin);
router.get('/auth/me', adminAuth, getAdminProfile);
router.post('/auth/logout', adminAuth, adminLogout);

router.get('/stats', adminAuth, getStats);

router.get('/users', adminAuth, getUsers);
router.get('/users/:id', adminAuth, getUser);
router.put('/users/:id', adminAuth, updateUser);
router.delete('/users/:id', adminAuth, deleteUser);
router.post('/users/:id/toggle-status', adminAuth, toggleUserStatus);

router.get('/matches', adminAuth, getMatches);
router.delete('/matches/:id', adminAuth, deleteMatch);

export default router;
