import bcrypt from 'bcryptjs';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    // 测试环境变量是否正确读取
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? '已设置' : '未设置');
    
    // 尝试连接数据库
    console.log('正在连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    const { name, email, password } = req.body;
    console.log('收到注册数据:', { name, email });

    // 创建新用户
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    console.log('用户创建成功:', user._id);
    res.status(201).json({ message: '注册成功', userId: user._id });
    
  } catch (error) {
    // 详细记录错误信息
    console.error('注册错误详情:', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({ 
      message: '注册失败，请重试',
      error: error.message, // 在开发环境中返回详细错误信息
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
