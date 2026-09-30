import express from 'express';
import { register, login, updateBudget, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.put('/budget', protect, updateBudget);
router.get('/me', protect, getMe);

export default router;
