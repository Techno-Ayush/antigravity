import Rating from '../models/Rating.js';
import Session from '../models/Session.js';
import User from '../models/User.js';
import { SESSION_STATUS, NOTIFICATION_TYPES } from '../config/constants.js';
import { notificationService } from '../services/notificationService.js';

export const createRating = async (req, res, next) => {
  try {
    const { sessionId, rating, review } = req.body;
    const userId = req.user._id;

    if (!sessionId || !rating) {
      return res.status(400).json({ success: false, message: 'Session ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    const session = await Session.findById(sessionId).populate('teacher learner skill');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    if (session.status !== SESSION_STATUS.COMPLETED) {
      return res.status(400).json({ success: false, message: 'Ratings can only be submitted for completed sessions' });
    }

    const isTeacher = session.teacher._id.toString() === userId.toString();
    const isLearner = session.learner._id.toString() === userId.toString();

    if (!isTeacher && !isLearner) {
      return res.status(403).json({ success: false, message: 'Only session participants can submit a rating' });
    }

    const rateeId = isTeacher ? session.learner._id : session.teacher._id;
    const role = isTeacher ? 'LEARNER' : 'TEACHER'; // The role of the person being rated

    // Check if already rated
    const existingRating = await Rating.findOne({ session: sessionId, rater: userId });
    if (existingRating) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this session' });
    }

    const newRating = await Rating.create({
      session: sessionId,
      rater: userId,
      ratee: rateeId,
      role,
      rating: Number(rating),
      review: review ? review.trim() : ''
    });

    // Recalculate ratee's average rating
    const allUserRatings = await Rating.find({ ratee: rateeId });
    const totalScore = allUserRatings.reduce((acc, curr) => acc + curr.rating, 0);
    const avgRating = totalScore / allUserRatings.length;

    await User.findByIdAndUpdate(rateeId, {
      rating: Number(avgRating.toFixed(2)),
      reviewCount: allUserRatings.length
    });

    // Notify ratee
    await notificationService.createNotification({
      recipient: rateeId,
      sender: userId,
      type: NOTIFICATION_TYPES.RATING_RECEIVED,
      title: 'New Rating & Review Received!',
      message: `${req.user.name} rated you ${rating} ★ for the ${session.skill.name} session.`,
      link: `/profile/${rateeId}`,
      data: { ratingId: newRating._id }
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully!',
      rating: newRating
    });
  } catch (err) {
    next(err);
  }
};

export const getUserRatings = async (req, res, next) => {
  try {
    const ratings = await Rating.find({ ratee: req.params.userId })
      .populate('rater', 'name profilePhoto')
      .populate({
        path: 'session',
        populate: { path: 'skill', select: 'name' }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: ratings.length,
      ratings
    });
  } catch (err) {
    next(err);
  }
};
