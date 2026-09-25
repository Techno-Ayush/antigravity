import express from 'express';
import {
  getUserProfile,
  updateProfile,
  updateSkills,
  completeOnboarding,
  discoverUsers
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/discover', discoverUsers);
router.get('/profile/:id', getUserProfile);
router.put('/profile', protect, updateProfile);
router.put('/skills', protect, updateSkills);
router.put('/onboarding', protect, completeOnboarding);

export default router;
