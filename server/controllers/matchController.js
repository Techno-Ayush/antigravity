import { matchingService } from '../services/matchingService.js';

export const getMatches = async (req, res, next) => {
  try {
    const matches = await matchingService.getMatchesForUser(req.user._id, {
      limit: req.query.limit ? Number(req.query.limit) : 20
    });

    res.json({
      success: true,
      count: matches.length,
      matches
    });
  } catch (err) {
    next(err);
  }
};
