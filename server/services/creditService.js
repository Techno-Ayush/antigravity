import User from '../models/User.js';
import CreditTransaction from '../models/CreditTransaction.js';
import { TRANSACTION_TYPES } from '../config/constants.js';

export const creditService = {
  /**
   * Get dynamic summary of user's credits
   */
  async getUserCreditSummary(userId) {
    const user = await User.findById(userId).select(
      'totalCredits reservedCredits earnedCredits spentCredits completedTeachingHours completedLearningHours completedSessions'
    );
    if (!user) throw new Error('User not found');

    const spendable = Math.max(0, user.totalCredits - user.reservedCredits);

    return {
      totalCredits: user.totalCredits,
      reservedCredits: user.reservedCredits,
      spendableCredits: spendable,
      earnedCredits: user.earnedCredits,
      spentCredits: user.spentCredits,
      completedTeachingHours: user.completedTeachingHours,
      completedLearningHours: user.completedLearningHours,
      completedSessions: user.completedSessions
    };
  },

  /**
   * Hold/Reserve credits when a learner requests a session
   * Rule: User cannot spend more than spendable balance.
   */
  async reserveCredits({ userId, amount, sessionId, counterpartyId, description }) {
    if (amount <= 0) throw new Error('Credit amount must be greater than zero');

    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const spendable = user.totalCredits - user.reservedCredits;
    if (spendable < amount) {
      throw new Error(`Insufficient spendable credits. You have ${spendable} available, but this session requires ${amount} credits.`);
    }

    const balanceBefore = spendable;
    
    // Atomically increment reserved credits
    user.reservedCredits += amount;
    await user.save();

    const balanceAfter = user.totalCredits - user.reservedCredits;

    const transaction = await CreditTransaction.create({
      user: userId,
      counterparty: counterpartyId,
      session: sessionId,
      type: TRANSACTION_TYPES.HOLD,
      amount,
      balanceBefore,
      balanceAfter,
      description: description || `Reserved ${amount} credit(s) for upcoming session`
    });

    return { user, transaction };
  },

  /**
   * Release reserved credits back to spendable if session is cancelled or rejected
   */
  async releaseCredits({ userId, amount, sessionId, counterpartyId, description }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const balanceBefore = Math.max(0, user.totalCredits - user.reservedCredits);
    
    user.reservedCredits = Math.max(0, user.reservedCredits - amount);
    await user.save();

    const balanceAfter = Math.max(0, user.totalCredits - user.reservedCredits);

    const transaction = await CreditTransaction.create({
      user: userId,
      counterparty: counterpartyId,
      session: sessionId,
      type: TRANSACTION_TYPES.RELEASE,
      amount,
      balanceBefore,
      balanceAfter,
      description: description || `Released ${amount} held credit(s) back to spendable balance`
    });

    return { user, transaction };
  },

  /**
   * Finalize/Transfer credits upon Double Confirmation of completed session
   * Learner spends N credits (deducted from total and reserved)
   * Teacher earns N credits (added to total and earned)
   */
  async settleSessionCredits({ teacherId, learnerId, amount, sessionId, skillName }) {
    if (amount <= 0) throw new Error('Credit amount must be positive');

    const learner = await User.findById(learnerId);
    const teacher = await User.findById(teacherId);

    if (!learner || !teacher) throw new Error('Participants not found');

    // 1. Process Learner (SPEND)
    const learnerSpendableBefore = learner.totalCredits - learner.reservedCredits;
    
    learner.totalCredits = Math.max(0, learner.totalCredits - amount);
    learner.reservedCredits = Math.max(0, learner.reservedCredits - amount);
    learner.spentCredits += amount;
    learner.completedLearningHours += amount;
    learner.completedSessions += 1;
    await learner.save();

    const learnerSpendableAfter = learner.totalCredits - learner.reservedCredits;

    await CreditTransaction.create({
      user: learnerId,
      counterparty: teacherId,
      session: sessionId,
      type: TRANSACTION_TYPES.SPEND,
      amount,
      balanceBefore: learnerSpendableBefore,
      balanceAfter: learnerSpendableAfter,
      description: `Spent ${amount} credit(s) learning ${skillName || 'skill'} from ${teacher.name}`
    });

    // 2. Process Teacher (EARN)
    const teacherSpendableBefore = teacher.totalCredits - teacher.reservedCredits;

    teacher.totalCredits += amount;
    teacher.earnedCredits += amount;
    teacher.completedTeachingHours += amount;
    teacher.completedSessions += 1;
    await teacher.save();

    const teacherSpendableAfter = teacher.totalCredits - teacher.reservedCredits;

    await CreditTransaction.create({
      user: teacherId,
      counterparty: learnerId,
      session: sessionId,
      type: TRANSACTION_TYPES.EARN,
      amount,
      balanceBefore: teacherSpendableBefore,
      balanceAfter: teacherSpendableAfter,
      description: `Earned +${amount} credit(s) teaching ${skillName || 'skill'} to ${learner.name}`
    });

    return {
      teacherNewBalance: teacherSpendableAfter,
      learnerNewBalance: learnerSpendableAfter
    };
  },

  /**
   * Allocate initial bonus starter credits
   */
  async grantBonusCredits({ userId, amount, description }) {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    const balanceBefore = user.totalCredits - user.reservedCredits;
    user.totalCredits += amount;
    await user.save();

    const balanceAfter = user.totalCredits - user.reservedCredits;

    const transaction = await CreditTransaction.create({
      user: userId,
      type: TRANSACTION_TYPES.BONUS,
      amount,
      balanceBefore,
      balanceAfter,
      description: description || `Welcome bonus: ${amount} starter knowledge credits`
    });

    return { user, transaction };
  },

  /**
   * Get user's transaction ledger history
   */
  async getUserTransactions(userId, { page = 1, limit = 20 } = {}) {
    const skip = (page - 1) * limit;

    const transactions = await CreditTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('counterparty', 'name profilePhoto')
      .populate({
        path: 'session',
        populate: { path: 'skill', select: 'name category' }
      });

    const total = await CreditTransaction.countDocuments({ user: userId });

    return {
      transactions,
      page,
      totalPages: Math.ceil(total / limit),
      total
    };
  }
};
