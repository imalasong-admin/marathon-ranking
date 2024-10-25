import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    await connectDB();

    const { name, email, password, birthDate } = req.body;

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
      birthDate: new Date(birthDate)
    });

    res.status(201).json({ 
      success: true,
      message: '注册成功' 
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '注册失败，请重试' });
  }
}