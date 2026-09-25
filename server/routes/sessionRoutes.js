import express from 'express';
import {
  requestSession,
  getSessions,
  getSessionById,
  acceptSession,
  rejectSession,
  cancelSession,
  confirmSession,
  disputeSession
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', requestSession);
router.get('/', getSessions);
router.get('/:id', getSessionById);
router.patch('/:id/accept', acceptSession);
router.patch('/:id/reject', rejectSession);
router.patch('/:id/cancel', cancelSession);
router.patch('/:id/confirm', confirmSession);
router.patch('/:id/dispute', disputeSession);

export default router;
