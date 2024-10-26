// pages/api/users.js
import { connectDB } from '../../lib/mongodb';
import User from '../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    console.log('尝试连接数据库...');
    await connectDB();
    console.log('数据库连接成功');

    console.log('开始查询用户数据...');
    const users = await User.find({}, {
      password: 0,
      name: 1,
      email: 1,
      gender: 1,
      birthDate: 1
    }).lean();  // 使用 lean() 提高性能
    
    console.log('查询到的用户数:', users.length);
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('详细错误信息:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      message: '获取数据失败，请重试',
      debug: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}