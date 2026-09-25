import express from 'express';
import {
  getAdminStats,
  getAdminUsers,
  toggleSuspendUser,
  getDisputes,
  resolveDispute,
  getReports,
  updateReportStatus
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/adminMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/suspend', toggleSuspendUser);
router.get('/disputes', getDisputes);
router.patch('/disputes/:id/resolve', resolveDispute);
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

export default router;
