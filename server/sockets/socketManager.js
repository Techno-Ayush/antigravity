import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { setSocketIO } from '../services/notificationService.js';

export const initSocket = (io) => {
  setSocketIO(io);

  io.on('connection', (socket) => {
    // User joins their personal room for direct notifications
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(userId.toString());
      }
    });

    // User joins specific session or conversation room
    socket.on('join_conversation', (conversationId) => {
      if (conversationId) {
        socket.join(conversationId.toString());
      }
    });

    // Handle new chat message
    socket.on('send_message', async ({ conversationId, senderId, text }) => {
      try {
        if (!conversationId || !senderId || !text?.trim()) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          text: text.trim()
        });

        await message.populate('sender', 'name profilePhoto');

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: {
            text: text.trim(),
            sender: senderId,
            createdAt: new Date()
          }
        });

        // Broadcast to everyone in conversation room
        io.to(conversationId.toString()).emit('receive_message', message);
      } catch (err) {
        console.error('[Socket] Error handling send_message:', err.message);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, userName }) => {
      socket.to(conversationId.toString()).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ conversationId }) => {
      socket.to(conversationId.toString()).emit('user_stop_typing');
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });
};
