import mongoose from 'mongoose';

const RaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入比赛名称'],
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: [true, '请输入比赛日期']
  },
  raceType: {
    type: String,
    required: [true, '请选择比赛类型'],
    enum: [
      '全程马拉松',
      '超马50K',
      '超马50M',
      '超马100K',
      '超马100迈',
      '超马计时赛',
      '超马多日赛'
    ]
  },
  location: {
    type: String,
    trim: true
  },
  website: {
    type: String,
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