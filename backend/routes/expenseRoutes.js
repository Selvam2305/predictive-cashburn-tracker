import express from 'express';
import multer from 'multer';
import {
  getExpenses,
  addExpense,
  deleteExpense,
  uploadCSV,
  reTagExpense,
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Memory Storage configuration for RAM CSV buffer streaming (zero disk I/O)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.use(protect);

router.get('/', getExpenses);
router.post('/', addExpense);
router.delete('/:id', deleteExpense);
router.post('/upload-csv', upload.single('file'), uploadCSV);
router.put('/:id/retag', reTagExpense);

export default router;
