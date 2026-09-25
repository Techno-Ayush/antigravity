import User from '../models/User.js';
import Session from '../models/Session.js';
import Skill from '../models/Skill.js';
import CreditTransaction from '../models/CreditTransaction.js';
import Report from '../models/Report.js';
import { creditService } from '../services/creditService.js';
import { SESSION_STATUS, TRANSACTION_TYPES } from '../config/constants.js';

export const getAdminStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isSuspended: false });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: SESSION_STATUS.COMPLETED });

    // Credits exchanged (sum of all EARN transaction amounts)
    const creditEarnAgg = await CreditTransaction.aggregate([
      { $match: { type: TRANSACTION_TYPES.EARN } },
      { $group: { _id: null, totalCreditsExchanged: { $sum: '$amount' } } }
    ]);
    const creditsExchanged = creditEarnAgg.length > 0 ? creditEarnAgg[0].totalCreditsExchanged : 0;

    // Most popular skills
    const popularSkills = await Skill.find().sort({ popularityCount: -1 }).limit(8);

    // Most taught skills
    const taughtSkillsAgg = await User.aggregate([
      { $unwind: '$skillsOffered' },
      { $group: { _id: '$skillsOffered.skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $lookup: { from: 'skills', localField: '_id', foreignField: '_id', as: 'skill' } },
      { $unwind: '$skill' }
    ]);

    // Most requested skills
    const wantedSkillsAgg = await User.aggregate([
      { $unwind: '$skillsWanted' },
      { $group: { _id: '$skillsWanted.skill', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
      { $lookup: { from: 'skills', localField: '_id', foreignField: '_id', as: 'skill' } },
      { $unwind: '$skill' }
    ]);

    const pendingDisputes = await Session.countDocuments({ status: SESSION_STATUS.DISPUTED });
    const pendingReports = await Report.countDocuments({ status: 'PENDING' });

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalSessions,
        completedSessions,
        creditsExchanged,
        pendingDisputes,
        pendingReports,
        popularSkills,
        mostTaughtSkills: taughtSkillsAgg.map((s) => ({ name: s.skill.name, count: s.count })),
        mostRequestedSkills: wantedSkillsAgg.map((s) => ({ name: s.skill.name, count: s.count }))
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, isSuspended, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;
    if (isSuspended !== undefined) filter.isSuspended = isSuspended === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      users,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (err) {
    next(err);
  }
};

export const toggleSuspendUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ success: false, message: 'Cannot suspend an administrator account' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.isSuspended ? 'suspended' : 'reactivated'} successfully`,
      isSuspended: user.isSuspended
    });
  } catch (err) {
    next(err);
  }
};

export const getDisputes = async (req, res, next) => {
  try {
    const disputes = await Session.find({ status: SESSION_STATUS.DISPUTED })
      .populate('teacher learner skill')
      .sort({ updatedAt: -1 });

    res.json({
      success: true,
      count: disputes.length,
      disputes
    });
  } catch (err) {
    next(err);
  }
};

export const resolveDispute = async (req, res, next) => {
  try {
    const { resolution, adminNotes } = req.body;
    // resolution: "REFUND_LEARNER" | "PAY_TEACHER" | "SPLIT"

    const session = await Session.findById(req.params.id).populate('teacher learner skill');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== SESSION_STATUS.DISPUTED) {
      return res.status(400).json({ success: false, message: 'Session is not in disputed status' });
    }

    const amount = session.creditAmount;

    if (resolution === 'REFUND_LEARNER') {
      // Release held credits back to learner
      await creditService.releaseCredits({
        userId: session.learner._id,
        amount,
        sessionId: session._id,
        counterpartyId: session.teacher._id,
        description: `Admin dispute resolution: Full refund of ${amount} credit(s) to learner (${adminNotes || ''})`
      });
      session.status = SESSION_STATUS.CANCELLED;
    } else if (resolution === 'PAY_TEACHER') {
      // Transfer credits to teacher
      await creditService.settleSessionCredits({
        teacherId: session.teacher._id,
        learnerId: session.learner._id,
        amount,
        sessionId: session._id,
        skillName: session.skill.name
      });
      session.status = SESSION_STATUS.COMPLETED;
    }

    session.disputeResolved = true;
    session.cancellationReason = `Dispute resolved by Admin: ${resolution}. Notes: ${adminNotes || 'N/A'}`;
    await session.save();

    res.json({
      success: true,
      message: `Dispute resolved with action: ${resolution}`,
      session
    });
  } catch (err) {
    next(err);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporter reportedUser session')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reports
    });
  } catch (err) {
    next(err);
  }
};

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes },
      { new: true }
    );

    res.json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
};
