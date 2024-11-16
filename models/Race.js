// models/Race.js
import mongoose from 'mongoose';

const raceSchema = new mongoose.Schema({
  seriesId: {           // 关联到标准赛事
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Series',      // 关联 Series 模型
    required: true
  },
  date: {               // 比赛日期
    type: Date,
    required: true
  },
  isLocked: {           // 锁定状态
    type: Boolean,
    default: false
  },
  addedBy: {            // 添加人
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Race || mongoose.model('Race', raceSchema);