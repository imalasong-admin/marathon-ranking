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
 adjustedSeconds: {  // 新增 - 经过年龄性别调整后的时间(秒)
   type: Number,
   required: true
 },
 proofUrl: String,
 ultraDistance: {
   type: String,
   enum: ['50K', '50M', '100K', '100M', '计时赛', '多日赛', '其他距离'],
   required: function() {
     return this.raceId?.raceType === '超马';
   }
 },
 verificationStatus: {
   type: String,
   enum: ['pending', 'verified', 'rejected'],
   default: 'pending'
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