import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import api from '../api/axiosInstance';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const fetchUnreadMessages = async () => {
    try {
      const res = await api.get('/conversations/unread-count').catch(() => null);
      if (res?.data?.success) {
        setUnreadMessagesCount(res.data.count || 0);
      }
    } catch (err) {
      console.warn('Could not fetch unread messages count:', err);
    }
  };

  // Initialize socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setUnreadMessagesCount(0);
      return;
    }

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_user', user._id);
    });

    newSocket.on('new_notification', (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      // If notification is credit related, refresh user balances!
      if (notification.type?.includes('CREDIT') || notification.type?.includes('SESSION')) {
        refreshUser();
      }
    });

    newSocket.on('new_unread_message', () => {
      setUnreadMessagesCount((prev) => prev + 1);
    });

    newSocket.on('conversation_marked_read', () => {
      fetchUnreadMessages();
    });

    setSocket(newSocket);

    // Initial fetch of notifications and unread messages
    fetchNotifications();
    fetchUnreadMessages();

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        const unread = res.data.notifications.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications read:', err);
    }
  };

  const markConversationRead = async (convId) => {
    try {
      if (!convId) return;
      if (!String(convId).startsWith('demo-')) {
        await api.patch(`/conversations/${convId}/read`).catch(() => {});
        if (socket && user?._id) {
          socket.emit('mark_conversation_read', { conversationId: convId, userId: user._id });
        }
      }
      setUnreadMessagesCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking conversation read:', err);
    }
  };

  const clearAllUnreadMessages = () => {
    setUnreadMessagesCount(0);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        unreadMessagesCount,
        markNotificationRead,
        markAllRead,
        markConversationRead,
        clearAllUnreadMessages,
        refreshNotifications: fetchNotifications,
        refreshUnreadMessages: fetchUnreadMessages
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
