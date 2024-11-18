import mongoose from 'mongoose';

const SeriesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入赛事名称'],
    unique: true,
    trim: true
  },
  raceType: {
    type: String,
    required: true,
    enum: ['全程马拉松', '超马']
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
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default mongoose.models.Series || mongoose.model('Series', SeriesSchema);