// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请输入用户名'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, '请输入邮箱'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, '请输入密码']
  },
  birthDate: {
    type: Date,
    required: [true, '请输入出生日期']
  },
  gender: {
    type: String,
    enum: ['M', 'F'],
    required: [true, '请选择性别']
  },
  bio: {
    type: String,
    default: '',  // 设置默认值为空字符串
  },
  stravaUrl: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  isLocked: {                    // 新增锁定状态字段
    type: Boolean,
    default: false
  },
  lockReason: {                  // 新增锁定原因字段
    type: String,
    default: ''
  },
  emailVerified: {
    type: Boolean,
    default: true  // 改为默认true，这样之前的用户自动为已验证状态
  },
  verificationCode: {
    type: String,
    length: 4
  },
  verificationExpires: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);