import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      unique: true,
      trim: true
    },
    normalizedName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Programming', 'Creative', 'Academic', 'Professional', 'Languages', 'Lifestyle', 'Music', 'Fitness'],
      index: true
    },
    description: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'BookOpen'
    },
    popularityCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

skillSchema.pre('validate', function (next) {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase();
  }
  next();
});

export default mongoose.model('Skill', skillSchema);
