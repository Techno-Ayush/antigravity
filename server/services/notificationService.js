import Notification from '../models/Notification.js';

let ioInstance = null;

export const setSocketIO = (io) => {
  ioInstance = io;
};

export const notificationService = {
  /**
   * Create notification and dispatch real-time socket event
   */
  async createNotification({ recipient, sender = null, type, title, message, link = '', data = {} }) {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      link,
      data
    });

    if (ioInstance) {
      ioInstance.to(recipient.toString()).emit('new_notification', notification);
    }

    return notification;
  },

  async getUserNotifications(userId, { limit = 30 } = {}) {
    return await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'name profilePhoto');
  },

  async markAsRead(notificationId, userId) {
    return await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );
  },

  async markAllAsRead(userId) {
    return await Notification.updateMany({ recipient: userId, read: false }, { read: true });
  }
};
