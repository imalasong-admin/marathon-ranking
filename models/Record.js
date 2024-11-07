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
      return this.raceId?.raceType === '超马';  // 使用英文的单引号
    }
  }
}, {
  timestamps: true
});

const Record = mongoose.models.Record || mongoose.model('Record', recordSchema);

export default Record;