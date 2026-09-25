import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null
    },
    lastMessage: {
      text: { type: String, default: '' },
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now }
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ participants: 1 });

export default mongoose.model('Conversation', conversationSchema);
