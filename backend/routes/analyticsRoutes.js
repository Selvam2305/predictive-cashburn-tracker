import express from 'express';
import { getCashBurnAnalytics } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getCashBurnAnalytics);

export default router;
