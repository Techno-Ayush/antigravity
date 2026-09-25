import express from 'express';
import { getConversations, getMessages, sendMessage } from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;
