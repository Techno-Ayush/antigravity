import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    category: {
      type: String,
      required: true,
      enum: ['INAPPROPRIATE_BEHAVIOR', 'FAKE_SKILL_CLAIMS', 'SPAM', 'HARASSMENT', 'NO_SHOW', 'OTHER']
    },
    description: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED', 'DISMISSED'],
      default: 'PENDING'
    },
    adminNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Report', reportSchema);
