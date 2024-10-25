import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  birthDate: {    // 新增生日字段
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// 添加虚拟字段计算年龄
UserSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = this.birthDate;
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

export default mongoose.models.User || mongoose.model('User', UserSchema);