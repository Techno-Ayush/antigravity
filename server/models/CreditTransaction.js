import mongoose from 'mongoose';
import { TRANSACTION_TYPES } from '../config/constants.js';

const creditTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    counterparty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0.1, 'Transaction amount must be positive']
    },
    balanceBefore: {
      type: Number,
      required: true
    },
    balanceAfter: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false } // Immutable ledger
  }
);

export default mongoose.model('CreditTransaction', creditTransactionSchema);
