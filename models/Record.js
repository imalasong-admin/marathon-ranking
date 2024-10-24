import mongoose from 'mongoose';

const RecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  finishTime: {
    hours: { type: Number, required: true },
    minutes: { type: Number, required: true },
    seconds: { type: Number, required: true }
  },
  totalSeconds: { type: Number, required: true },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 100
  },
  date: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.models.Record || mongoose.model('Record', 
RecordSchema);
