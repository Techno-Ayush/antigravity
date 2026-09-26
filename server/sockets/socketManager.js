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

        // Also notify recipient personal room for instant real-time unread badge
        const conv = await Conversation.findById(conversationId);
        if (conv?.participants) {
          conv.participants.forEach((pId) => {
            if (pId.toString() !== senderId.toString()) {
              io.to(pId.toString()).emit('new_unread_message', {
                conversationId,
                message
              });
            }
          });
        }
      } catch (err) {
        console.error('[Socket] Error handling send_message:', err.message);
      }
    });

    // Mark conversation as read in real-time
    socket.on('mark_conversation_read', async ({ conversationId, userId }) => {
      try {
        if (!conversationId || !userId) return;
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: userId }, read: false },
          { $set: { read: true } }
        );
        io.to(userId.toString()).emit('conversation_marked_read', { conversationId });
      } catch (err) {
        console.error('[Socket] Error in mark_conversation_read:', err.message);
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
