import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { INITIAL_CREDITS, SESSION_MODES, SKILL_LEVELS, USER_ROLES } from '../config/constants.js';

const userSkillOfferedSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    level: {
      type: String,
      enum: Object.values(SKILL_LEVELS),
      default: SKILL_LEVELS.INTERMEDIATE
    },
    experienceYears: {
      type: Number,
      default: 1
    },
    description: {
      type: String,
      default: ''
    }
  },
  { _id: false }
);

const userSkillWantedSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: true
    },
    desiredLevel: {
      type: String,
      enum: Object.values(SKILL_LEVELS),
      default: SKILL_LEVELS.BEGINNER
    },
    urgency: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'MEDIUM'
    }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    profilePhoto: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    },
    bio: {
      type: String,
      default: 'Passionate about sharing knowledge and learning new skills!'
    },
    location: {
      type: String,
      default: 'Bengaluru, India'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    preferredMode: {
      type: String,
      enum: Object.values(SESSION_MODES),
      default: SESSION_MODES.ONLINE
    },
    availability: {
      weekdays: { type: Boolean, default: true },
      weekends: { type: Boolean, default: true },
      timeSlots: {
        type: [String],
        default: ['EVENING', 'AFTERNOON']
      }
    },
    skillsOffered: [userSkillOfferedSchema],
    skillsWanted: [userSkillWantedSchema],
    totalCredits: {
      type: Number,
      default: INITIAL_CREDITS,
      min: [0, 'Total credits cannot be negative']
    },
    reservedCredits: {
      type: Number,
      default: 0,
      min: [0, 'Reserved credits cannot be negative']
    },
    earnedCredits: {
      type: Number,
      default: 0
    },
    spentCredits: {
      type: Number,
      default: 0
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    completedTeachingHours: {
      type: Number,
      default: 0
    },
    completedLearningHours: {
      type: Number,
      default: 0
    },
    completedSessions: {
      type: Number,
      default: 0
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER
    },
    isSuspended: {
      type: Boolean,
      default: false
    },
    onboardingCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for Spendable Credits: Total - Reserved
userSchema.virtual('spendableCredits').get(function () {
  return Math.max(0, (this.totalCredits || 0) - (this.reservedCredits || 0));
});

// Password hashing before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
