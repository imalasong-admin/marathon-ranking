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
  // 在 Record 模型中新增字段
  ultraDistance: {
    type: String,
    enum: ['50K', '50M', '100K', '100M', '计时赛', '多日赛', '其他距离'],
    // 允许为空，因为马拉松不需要这个字段
    required: function() {
      return this.raceType === '超马';
    }
  }
}, {
  timestamps: true
});

const Record = mongoose.models.Record || mongoose.model('Record', recordSchema);

export default Record;