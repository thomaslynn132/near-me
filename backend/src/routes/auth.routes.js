import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller.js';
import { auth, validate, authLimiter } from '../middlewares/index.js';
import Joi from 'joi';

const router = Router();

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().min(18).max(100).required(),
  bio: Joi.string().max(500).allow(''),
  interests: Joi.array().items(Joi.string())
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

export default router;
