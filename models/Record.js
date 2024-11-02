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
  date: {  // 保留字段但移除 required
    type: Date
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 添加虚拟字段，用于获取比赛日期
RecordSchema.virtual('raceDate').get(function() {
  return this.raceId?.date;
});

export default mongoose.models.Record || mongoose.model('Record', RecordSchema);