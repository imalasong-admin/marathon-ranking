// pages/api/auth/register.js

import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';  // 改为默认导入
import User from '../../../models/User';


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    await connectDB();

    const { name, email, password, birthDate, gender } = req.body;

    // 检查必填字段
    if (!name || !email || !password || !birthDate || !gender) {
      return res.status(400).json({ message: '所有字段都是必填的' });
    }

    // 性别验证
    if (gender !== 'M' && gender !== 'F') {
      return res.status(400).json({ message: '性别只能是 M 或 F' });
    }

    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建新用户
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      birthDate: new Date(birthDate),
      gender
    });

    // 成功后返回，包含重定向信息
    res.status(201).json({ 
      success: true,
      message: '注册成功',
      redirectTo: '/submit'
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请重试' });
  }
}