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
  }
}, {
  timestamps: true
});

export default mongoose.models.User || mongoose.model('User', UserSchema);