// models/Record.js
import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  raceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race',
    required: true
  },
  finishTime: {
    hours: Number,
    minutes: Number,
    seconds: Number
  },
  totalSeconds: Number,
  proofUrl: String,
  ultraDistance: {
    type: String,
    enum: ['50K', '50M', '100K', '100M', '计时赛', '多日赛', '其他距离'],
    required: function() {
      return this.raceId?.raceType === '超马';
    }
  },
  // 添加验证相关字段
  verificationStatus: {     // 新增
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  verifiedCount: {
    type: Number,
    default: 0
  },
  verifiedCount: {
    type: Number,
    default: 0
  },
  verifiedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date
  }],
  reportedBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reportedAt: Date,
    reason: String
  }]
}, {
  timestamps: true
});

const Record = mongoose.models.Record || mongoose.model('Record', recordSchema);

export default Record;