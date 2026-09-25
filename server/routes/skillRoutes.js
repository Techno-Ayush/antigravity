import express from 'express';
import { getSkills, createSkill } from '../controllers/skillController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSkills);
router.post('/', protect, createSkill);

export default router;
