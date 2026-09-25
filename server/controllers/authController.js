import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { creditService } from '../services/creditService.js';
import { INITIAL_CREDITS } from '../config/constants.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_peer_exchange_jwt_key_2026_xyz', {
    expiresIn: '30d'
  });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password, location, preferredMode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password,
      location: location || 'Bengaluru, India',
      preferredMode: preferredMode || 'ONLINE',
      totalCredits: INITIAL_CREDITS,
      reservedCredits: 0
    });

    // Create initial welcome bonus credit transaction in ledger
    await creditService.grantBonusCredits({
      userId: user._id,
      amount: INITIAL_CREDITS,
      description: `Welcome to Peer-to-Peer Skill Exchange! +${INITIAL_CREDITS} starter knowledge credits`
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully with 3 starter knowledge credits',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        role: user.role,
        totalCredits: user.totalCredits,
        reservedCredits: user.reservedCredits,
        spendableCredits: user.spendableCredits,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('skillsOffered.skill')
      .populate('skillsWanted.skill');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'This account has been suspended' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location,
        preferredMode: user.preferredMode,
        role: user.role,
        totalCredits: user.totalCredits,
        reservedCredits: user.reservedCredits,
        spendableCredits: user.spendableCredits,
        earnedCredits: user.earnedCredits,
        spentCredits: user.spentCredits,
        rating: user.rating,
        reviewCount: user.reviewCount,
        completedSessions: user.completedSessions,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        availability: user.availability,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('skillsOffered.skill')
      .populate('skillsWanted.skill');

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location,
        timezone: user.timezone,
        preferredMode: user.preferredMode,
        availability: user.availability,
        role: user.role,
        totalCredits: user.totalCredits,
        reservedCredits: user.reservedCredits,
        spendableCredits: user.spendableCredits,
        earnedCredits: user.earnedCredits,
        spentCredits: user.spentCredits,
        rating: user.rating,
        reviewCount: user.reviewCount,
        completedSessions: user.completedSessions,
        completedTeachingHours: user.completedTeachingHours,
        completedLearningHours: user.completedLearningHours,
        skillsOffered: user.skillsOffered,
        skillsWanted: user.skillsWanted,
        onboardingCompleted: user.onboardingCompleted
      }
    });
  } catch (err) {
    next(err);
  }
};
