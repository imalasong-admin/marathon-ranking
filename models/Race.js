// models/Race.js
import mongoose from 'mongoose';

const RaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入比赛名称'],
    unique: true,
    trim: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Race || mongoose.model('Race', RaceSchema);