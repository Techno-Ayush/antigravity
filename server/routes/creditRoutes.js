import express from 'express';
import { getCreditSummary, getCreditTransactions } from '../controllers/creditController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, getCreditSummary);
router.get('/transactions', protect, getCreditTransactions);

export default router;
