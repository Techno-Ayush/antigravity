import User from '../models/User.js';
import Rating from '../models/Rating.js';
import Skill from '../models/Skill.js';

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('skillsOffered.skill')
      .populate('skillsWanted.skill');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch user reviews
    const reviews = await Rating.find({ ratee: req.params.id })
      .populate('rater', 'name profilePhoto')
      .populate({
        path: 'session',
        populate: { path: 'skill', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(15);

    res.json({
      success: true,
      user,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { bio, location, timezone, preferredMode, availability, profilePhoto } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (timezone !== undefined) user.timezone = timezone;
    if (preferredMode !== undefined) user.preferredMode = preferredMode;
    if (profilePhoto !== undefined) user.profilePhoto = profilePhoto;
    if (availability !== undefined) user.availability = availability;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

export const updateSkills = async (req, res, next) => {
  try {
    const { skillsOffered, skillsWanted } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (skillsOffered) {
      user.skillsOffered = skillsOffered;
    }
    if (skillsWanted) {
      user.skillsWanted = skillsWanted;
    }

    await user.save();
    await user.populate('skillsOffered.skill skillsWanted.skill');

    res.json({
      success: true,
      message: 'Skills updated successfully',
      skillsOffered: user.skillsOffered,
      skillsWanted: user.skillsWanted
    });
  } catch (err) {
    next(err);
  }
};

export const completeOnboarding = async (req, res, next) => {
  try {
    const { bio, location, preferredMode, availability, skillsOffered, skillsWanted } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (bio) user.bio = bio;
    if (location) user.location = location;
    if (preferredMode) user.preferredMode = preferredMode;
    if (availability) user.availability = availability;
    if (skillsOffered) user.skillsOffered = skillsOffered;
    if (skillsWanted) user.skillsWanted = skillsWanted;
    user.onboardingCompleted = true;

    await user.save();
    await user.populate('skillsOffered.skill skillsWanted.skill');

    res.json({
      success: true,
      message: 'Onboarding completed! Welcome to the knowledge exchange community.',
      user
    });
  } catch (err) {
    next(err);
  }
};

export const discoverUsers = async (req, res, next) => {
  try {
    const { skill, category, mode, minRating, level, search, page = 1, limit = 12 } = req.query;
    const filter = {
      _id: { $ne: req.user ? req.user._id : null },
      isSuspended: false
    };

    if (mode && mode !== 'ALL') {
      filter.preferredMode = { $in: [mode, 'BOTH'] };
    }

    if (minRating) {
      filter.rating = { $gte: Number(minRating) };
    }

    let users = await User.find(filter)
      .select('-password')
      .populate('skillsOffered.skill')
      .populate('skillsWanted.skill')
      .sort({ rating: -1, completedSessions: -1 });

    // Client-side / in-memory filter on populated fields for precision
    if (skill) {
      users = users.filter((u) =>
        u.skillsOffered.some((s) => s.skill?.name?.toLowerCase().includes(skill.toLowerCase()))
      );
    }

    if (category && category !== 'All') {
      users = users.filter((u) =>
        u.skillsOffered.some((s) => s.skill?.category?.toLowerCase() === category.toLowerCase())
      );
    }

    if (level && level !== 'ALL') {
      users = users.filter((u) => u.skillsOffered.some((s) => s.level === level));
    }

    if (search) {
      const q = search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.bio.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q) ||
          u.skillsOffered.some((s) => s.skill?.name?.toLowerCase().includes(q))
      );
    }

    const total = users.length;
    const skip = (Number(page) - 1) * Number(limit);
    const paginatedUsers = users.slice(skip, skip + Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      users: paginatedUsers
    });
  } catch (err) {
    next(err);
  }
};
