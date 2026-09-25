import mongoose from 'mongoose';
import { SESSION_STATUS, SESSION_MODES } from '../config/constants.js';

const sessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    startTime: {
      type: String,
      required: true,
      default: '18:00'
    },
    duration: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 4
    },
    creditAmount: {
      type: Number,
      required: true,
      default: 1
    },
    mode: {
      type: String,
      enum: Object.values(SESSION_MODES),
      default: SESSION_MODES.ONLINE
    },
    meetingLink: {
      type: String,
      default: 'https://meet.google.com/skill-exchange-demo'
    },
    location: {
      type: String,
      default: ''
    },
    topic: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(SESSION_STATUS),
      default: SESSION_STATUS.REQUESTED,
      index: true
    },
    teacherConfirmed: {
      type: Boolean,
      default: false
    },
    learnerConfirmed: {
      type: Boolean,
      default: false
    },
    teacherConfirmedAt: {
      type: Date,
      default: null
    },
    learnerConfirmedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    disputeReason: {
      type: String,
      default: ''
    },
    disputeResolved: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('Session', sessionSchema);
