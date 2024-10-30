// models/Record.js
import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: [true, '请选择比赛名称']
  },
  finishTime: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    seconds: { type: Number, required: true }
  },
  totalSeconds: { 
    type: Number, 
    required: true 
  },
  date: {
    type: Date,
    required: [true, '请选择比赛日期']
  },
  proofUrl: {
    type: String,
    required: [true, '请提供成绩证明链接']
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

export default mongoose.models.Record || mongoose.model('Record', RecordSchema);