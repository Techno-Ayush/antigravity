import { creditService } from '../services/creditService.js';

export const getCreditSummary = async (req, res, next) => {
  try {
    const summary = await creditService.getUserCreditSummary(req.user._id);
    res.json({
      success: true,
      summary
    });
  } catch (err) {
    next(err);
  }
};

export const getCreditTransactions = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await creditService.getUserTransactions(req.user._id, { page, limit });

    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    next(err);
  }
};
