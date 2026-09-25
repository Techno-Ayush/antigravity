import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id
    })
      .populate('participants', 'name profilePhoto rating location')
      .populate({
        path: 'session',
        populate: { path: 'skill', select: 'name category' }
      })
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (err) {
    next(err);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to view messages in this thread' });
    }

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name profilePhoto')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      messages
    });
  } catch (err) {
    next(err);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: 'Message text cannot be empty' });
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (!conversation.participants.some((p) => p.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to post in this thread' });
    }

    const message = await Message.create({
      conversation: req.params.id,
      sender: req.user._id,
      text: text.trim()
    });

    await message.populate('sender', 'name profilePhoto');

    conversation.lastMessage = {
      text: text.trim(),
      sender: req.user._id,
      createdAt: new Date()
    };
    await conversation.save();

    res.status(201).json({
      success: true,
      message
    });
  } catch (err) {
    next(err);
  }
};
