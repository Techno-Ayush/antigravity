import Report from '../models/Report.js';

export const createReport = async (req, res, next) => {
  try {
    const { reportedUser, session, category, description } = req.body;

    if (!reportedUser || !category || !description) {
      return res.status(400).json({ success: false, message: 'Reported user, category and description are required' });
    }

    const report = await Report.create({
      reporter: req.user._id,
      reportedUser,
      session: session || null,
      category,
      description
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review this shortly.',
      report
    });
  } catch (err) {
    next(err);
  }
};
