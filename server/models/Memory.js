import mongoose from 'mongoose';

const memorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: String, default: 'Personal' },
  date: { type: Date, default: Date.now },
  image: { type: String, default: null },
  isPrivate: { type: Boolean, default: false },
  password: { type: String, default: '' },
  isFavorite: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  mood: { type: String, default: '😐' },
  audio: { type: String, default: null },
  video: { type: String, default: null },
  unlockDate: { type: Date, default: null }
});

export default mongoose.model('Memory', memorySchema);