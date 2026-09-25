import Session from '../models/Session.js';
import Skill from '../models/Skill.js';
import User from '../models/User.js';
import { creditService } from './creditService.js';
import { notificationService } from './notificationService.js';
import { SESSION_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';

export const sessionService = {
  /**
   * Request a new skill session.
   * Atomically reserves credits from the learner.
   */
  async requestSession({ learnerId, teacherId, skillId, scheduledDate, startTime, duration = 1, mode, topic, meetingLink, location }) {
    if (learnerId.toString() === teacherId.toString()) {
      throw new Error('You cannot request a session with yourself');
    }

    const teacher = await User.findById(teacherId);
    const learner = await User.findById(learnerId);
    const skill = await Skill.findById(skillId);

    if (!teacher || !learner || !skill) {
      throw new Error('Teacher, learner, or skill not found');
    }

    const creditAmount = duration; // 1 hour = 1 credit

    // 1. Verify and reserve learner's credits
    await creditService.reserveCredits({
      userId: learnerId,
      amount: creditAmount,
      counterpartyId: teacherId,
      description: `Hold ${creditAmount} credit(s) for ${duration}h ${skill.name} session with ${teacher.name}`
    });

    // 2. Create the Session record
    const session = await Session.create({
      teacher: teacherId,
      learner: learnerId,
      skill: skillId,
      scheduledDate,
      startTime: startTime || '18:00',
      duration,
      creditAmount,
      mode: mode || 'ONLINE',
      meetingLink: meetingLink || 'https://meet.google.com/skill-exchange-demo',
      location: location || '',
      topic,
      status: SESSION_STATUS.REQUESTED
    });

    // 3. Notify the teacher
    await notificationService.createNotification({
      recipient: teacherId,
      sender: learnerId,
      type: NOTIFICATION_TYPES.SESSION_REQUESTED,
      title: 'New Session Request!',
      message: `${learner.name} requested a ${duration}-hour session to learn ${skill.name}.`,
      link: `/sessions/${session._id}`,
      data: { sessionId: session._id }
    });

    return session;
  },

  /**
   * Teacher accepts session request
   */
  async acceptSession(sessionId, teacherId) {
    const session = await Session.findById(sessionId).populate('skill teacher learner');
    if (!session) throw new Error('Session not found');

    if (session.teacher._id.toString() !== teacherId.toString()) {
      throw new Error('Only the assigned teacher can accept this session');
    }

    if (session.status !== SESSION_STATUS.REQUESTED) {
      throw new Error(`Cannot accept session in status ${session.status}`);
    }

    session.status = SESSION_STATUS.SCHEDULED;
    await session.save();

    await notificationService.createNotification({
      recipient: session.learner._id,
      sender: teacherId,
      type: NOTIFICATION_TYPES.SESSION_ACCEPTED,
      title: 'Session Accepted!',
      message: `${session.teacher.name} accepted your session for ${session.skill.name}!`,
      link: `/sessions/${session._id}`,
      data: { sessionId: session._id }
    });

    return session;
  },

  /**
   * Teacher rejects session request -> releases held credits to learner
   */
  async rejectSession(sessionId, teacherId, reason = '') {
    const session = await Session.findById(sessionId).populate('skill teacher learner');
    if (!session) throw new Error('Session not found');

    if (session.teacher._id.toString() !== teacherId.toString()) {
      throw new Error('Only the assigned teacher can reject this request');
    }

    if (session.status !== SESSION_STATUS.REQUESTED) {
      throw new Error(`Cannot reject session in status ${session.status}`);
    }

    // Release held credits back to learner
    await creditService.releaseCredits({
      userId: session.learner._id,
      amount: session.creditAmount,
      sessionId: session._id,
      counterpartyId: teacherId,
      description: `Released ${session.creditAmount} credit(s) because session was declined by ${session.teacher.name}`
    });

    session.status = SESSION_STATUS.REJECTED;
    session.cancellationReason = reason || 'Declined by teacher';
    await session.save();

    await notificationService.createNotification({
      recipient: session.learner._id,
      sender: teacherId,
      type: NOTIFICATION_TYPES.SESSION_REJECTED,
      title: 'Session Request Declined',
      message: `${session.teacher.name} could not accept your request. Your ${session.creditAmount} credit(s) have been returned to spendable balance.`,
      link: `/sessions/${session._id}`,
      data: { sessionId: session._id }
    });

    return session;
  },

  /**
   * Either participant cancels session -> releases held credits back to learner
   */
  async cancelSession(sessionId, userId, reason = '') {
    const session = await Session.findById(sessionId).populate('skill teacher learner');
    if (!session) throw new Error('Session not found');

    const isTeacher = session.teacher._id.toString() === userId.toString();
    const isLearner = session.learner._id.toString() === userId.toString();

    if (!isTeacher && !isLearner) {
      throw new Error('You are not a participant in this session');
    }

    if (session.status === SESSION_STATUS.COMPLETED) {
      throw new Error('Completed sessions cannot be cancelled');
    }

    if (session.status === SESSION_STATUS.CANCELLED) {
      throw new Error('Session is already cancelled');
    }

    // Release reserved credits to learner
    await creditService.releaseCredits({
      userId: session.learner._id,
      amount: session.creditAmount,
      sessionId: session._id,
      counterpartyId: isTeacher ? session.teacher._id : session.learner._id,
      description: `Released ${session.creditAmount} held credit(s) due to session cancellation`
    });

    session.status = SESSION_STATUS.CANCELLED;
    session.cancelledBy = userId;
    session.cancellationReason = reason || 'Cancelled by participant';
    await session.save();

    const recipientId = isTeacher ? session.learner._id : session.teacher._id;
    const actorName = isTeacher ? session.teacher.name : session.learner.name;

    await notificationService.createNotification({
      recipient: recipientId,
      sender: userId,
      type: NOTIFICATION_TYPES.SESSION_CANCELLED,
      title: 'Session Cancelled',
      message: `${actorName} cancelled the ${session.skill.name} session.`,
      link: `/sessions/${session._id}`,
      data: { sessionId: session._id }
    });

    return session;
  },

  /**
   * DOUBLE CONFIRMATION LIFECYCLE:
   * Teacher clicks "Mark Complete" & Learner clicks "Confirm Completion".
   * Credits are ONLY transferred when both parties confirm.
   */
  async confirmSession(sessionId, userId) {
    const session = await Session.findById(sessionId).populate('skill teacher learner');
    if (!session) throw new Error('Session not found');

    const isTeacher = session.teacher._id.toString() === userId.toString();
    const isLearner = session.learner._id.toString() === userId.toString();

    if (!isTeacher && !isLearner) {
      throw new Error('You are not a participant in this session');
    }

    if (session.status === SESSION_STATUS.COMPLETED) {
      throw new Error('Session has already been completed and credits finalized');
    }

    if (session.status === SESSION_STATUS.CANCELLED || session.status === SESSION_STATUS.REJECTED) {
      throw new Error(`Cannot confirm a session that was ${session.status.toLowerCase()}`);
    }

    if (isTeacher) {
      session.teacherConfirmed = true;
      session.teacherConfirmedAt = new Date();
    } else if (isLearner) {
      session.learnerConfirmed = true;
      session.learnerConfirmedAt = new Date();
    }

    // Check if double confirmation is fulfilled
    if (session.teacherConfirmed && session.learnerConfirmed) {
      session.status = SESSION_STATUS.COMPLETED;
      session.completedAt = new Date();
      await session.save();

      // Finalize credits: Transfer from learner to teacher
      await creditService.settleSessionCredits({
        teacherId: session.teacher._id,
        learnerId: session.learner._id,
        amount: session.creditAmount,
        sessionId: session._id,
        skillName: session.skill.name
      });

      // Notify both participants
      await notificationService.createNotification({
        recipient: session.teacher._id,
        sender: session.learner._id,
        type: NOTIFICATION_TYPES.CREDIT_EARNED,
        title: 'Credits Earned! (+1)',
        message: `Session completed! You earned +${session.creditAmount} credit for teaching ${session.skill.name}.`,
        link: `/sessions/${session._id}`,
        data: { sessionId: session._id }
      });

      await notificationService.createNotification({
        recipient: session.learner._id,
        sender: session.teacher._id,
        type: NOTIFICATION_TYPES.SESSION_COMPLETED,
        title: 'Session Successfully Completed!',
        message: `Both parties confirmed! You spent ${session.creditAmount} credit for learning ${session.skill.name}. Please leave a review!`,
        link: `/sessions/${session._id}`,
        data: { sessionId: session._id }
      });
    } else {
      // First party has confirmed; waiting for second party
      session.status = SESSION_STATUS.AWAITING_CONFIRMATION;
      await session.save();

      const counterpartyId = isTeacher ? session.learner._id : session.teacher._id;
      const confirmerName = isTeacher ? session.teacher.name : session.learner.name;

      await notificationService.createNotification({
        recipient: counterpartyId,
        sender: userId,
        type: NOTIFICATION_TYPES.SESSION_CONFIRMED,
        title: 'Confirmation Needed',
        message: `${confirmerName} marked your session as completed. Please confirm to finalize the exchange!`,
        link: `/sessions/${session._id}`,
        data: { sessionId: session._id }
      });
    }

    return session;
  },

  /**
   * File a dispute for admin review
   */
  async disputeSession(sessionId, userId, reason) {
    const session = await Session.findById(sessionId).populate('teacher learner skill');
    if (!session) throw new Error('Session not found');

    const isTeacher = session.teacher._id.toString() === userId.toString();
    const isLearner = session.learner._id.toString() === userId.toString();

    if (!isTeacher && !isLearner) {
      throw new Error('Not authorized to dispute this session');
    }

    session.status = SESSION_STATUS.DISPUTED;
    session.disputeReason = reason;
    await session.save();

    return session;
  }
};
