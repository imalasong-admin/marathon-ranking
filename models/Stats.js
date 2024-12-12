// models/Stats.js
import mongoose from 'mongoose';

const statsItemSchema = new mongoose.Schema({
  runners: { type: Number, default: 0 },
  races: { type: Number, default: 0 },
  avgAge: { type: Number, default: 0 },
  avgFinishTime: { type: Number, default: 0 },
  bqCount: { type: Number, default: 0 },
  sub3Count: { type: Number, default: 0 },
  sub330Count: { type: Number, default: 0 }
}, { _id: false });

const regionStatsSchema = new mongoose.Schema({
  region: { type: String, required: true },
  totalStats: statsItemSchema,
  maleStats: statsItemSchema,
  femaleStats: statsItemSchema
}, { _id: false });

const statsSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true,
    unique: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  northAmerica: regionStatsSchema,
  stateStats: [regionStatsSchema]
}, {
  timestamps: true,
  collection: 'stats'  // 明确指定集合名称
});

export default mongoose.models.Stats || mongoose.model('Stats', statsSchema, 'stats');