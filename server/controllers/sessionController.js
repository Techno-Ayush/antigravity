import Session from '../models/Session.js';
import Conversation from '../models/Conversation.js';
import { sessionService } from '../services/sessionService.js';

export const requestSession = async (req, res, next) => {
  try {
    const { teacherId, skillId, scheduledDate, startTime, duration, mode, topic, meetingLink, location } = req.body;

    if (!teacherId || !skillId || !scheduledDate || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide teacher, skill, scheduled date, and session topic'
      });
    }

    const session = await sessionService.requestSession({
      learnerId: req.user._id,
      teacherId,
      skillId,
      scheduledDate,
      startTime,
      duration: Number(duration) || 1,
      mode,
      topic,
      meetingLink,
      location
    });

    // Create or find a conversation for this session
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, teacherId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, teacherId],
        session: session._id
      });
    }

    res.status(201).json({
      success: true,
      message: 'Session requested! Knowledge credits have been reserved.',
      session,
      conversationId: conversation._id
    });
  } catch (err) {
    next(err);
  }
};

export const getSessions = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const userId = req.user._id;

    const filter = {
      $or: [{ teacher: userId }, { learner: userId }]
    };

    if (type === 'teaching') {
      filter.teacher = userId;
      delete filter.$or;
    } else if (type === 'learning') {
      filter.learner = userId;
      delete filter.$or;
    }

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const sessions = await Session.find(filter)
      .populate('teacher', 'name profilePhoto rating completedSessions location')
      .populate('learner', 'name profilePhoto rating completedSessions location')
      .populate('skill', 'name category')
      .sort({ scheduledDate: -1, createdAt: -1 });

    res.json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (err) {
    next(err);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('teacher', 'name email profilePhoto bio rating completedSessions location')
      .populate('learner', 'name email profilePhoto bio rating completedSessions location')
      .populate('skill', 'name category description');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    const userId = req.user._id.toString();
    const isTeacher = session.teacher._id.toString() === userId;
    const isLearner = session.learner._id.toString() === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isTeacher && !isLearner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this session' });
    }

    res.json({
      success: true,
      session
    });
  } catch (err) {
    next(err);
  }
};

export const acceptSession = async (req, res, next) => {
  try {
    const session = await sessionService.acceptSession(req.params.id, req.user._id);
    res.json({
      success: true,
      message: 'Session accepted! Scheduled with learner.',
      session
    });
  } catch (err) {
    next(err);
  }
};

export const rejectSession = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const session = await sessionService.rejectSession(req.params.id, req.user._id, reason);
    res.json({
      success: true,
      message: 'Session declined. Held credits released to learner.',
      session
    });
  } catch (err) {
    next(err);
  }
};

export const cancelSession = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const session = await sessionService.cancelSession(req.params.id, req.user._id, reason);
    res.json({
      success: true,
      message: 'Session cancelled. Held credits returned.',
      session
    });
  } catch (err) {
    next(err);
  }
};

export const confirmSession = async (req, res, next) => {
  try {
    const session = await sessionService.confirmSession(req.params.id, req.user._id);
    res.json({
      success: true,
      message:
        session.status === 'COMPLETED'
          ? 'Double confirmation complete! Knowledge credits transferred successfully.'
          : 'Your completion is recorded! Waiting for the other participant to confirm.',
      session
    });
  } catch (err) {
    next(err);
  }
};

export const disputeSession = async (req, res, next) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Dispute reason is required' });
    }

    const session = await sessionService.disputeSession(req.params.id, req.user._id, reason);
    res.json({
      success: true,
      message: 'Dispute submitted for admin review.',
      session
    });
  } catch (err) {
    next(err);
  }
};
