// pages/api/auth/register.js
import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';  
import User from '../../../models/User';
import { generateVerificationCode, sendVerificationEmail } from '../../../lib/email';

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

    // 开发环境下允许重复注册
    if (process.env.NODE_ENV === 'development') {
      console.log('开发环境: 删除已存在的账号:', email);
      await User.deleteOne({ email });
    } else {
      // 生产环境检查邮箱唯一性
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: '该邮箱已被注册' });
      }
    }

    // 生成验证码和过期时间
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    console.log('生成的验证码:', verificationCode); // 用于测试

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 12);

    // 创建新用户
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      birthDate: new Date(birthDate),
      gender,
      verificationCode,
      verificationExpires,
      emailVerified: false
    });

    console.log('用户创建成功, 验证码信息:', {  // 用于测试
      email: user.email,
      code: user.verificationCode,
      expires: user.verificationExpires
    });

    // 发送验证邮件
    const emailResult = await sendVerificationEmail(email, name, verificationCode);
    console.log('邮件发送结果:', emailResult);  // 用于测试

    if (!emailResult.success) {
      console.error('验证邮件发送失败:', emailResult.error);
    }

    res.status(201).json({ 
      success: true,
      message: '注册成功，请查收验证邮件',
      redirectTo: '/submit'
    });

  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请重试' });
  }
}