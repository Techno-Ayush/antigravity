import express from 'express';
import {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  markConversationRead
} from '../controllers/conversationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/unread-count', getUnreadCount);
router.get('/', getConversations);
router.get('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);
router.patch('/:id/read', markConversationRead);

export default router;
