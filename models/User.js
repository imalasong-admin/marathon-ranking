// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {                 // 保持不变，确保系统正常运行
    type: String,
    required: [true, '请输入用户名'],
    unique: true,
    trim: true
  },
  firstName: {    // 新增，但不设为required
    type: String,
    trim: true,
    default: ''
  },
  lastName: {     // 新增，但不设为required
    type: String,
    trim: true,
    default: ''
  },
  chineseName: {  // 新增
    type: String,
    trim: true,
    default: ''
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
  state: {
    type: String,
    trim: true,
    required: [true, '请选择所在州'] 
  },
  city: {
    type: String,
    trim: true,
    required: [true, '请选择所在城市']  
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