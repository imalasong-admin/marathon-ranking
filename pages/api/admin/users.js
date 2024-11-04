import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  // 1. 检查请求方法
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      message: '不支持的请求方法' 
    });
  }

  try {
    // 2. 验证管理员权限
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '无权进行此操作' 
      });
    }

    // 3. 连接数据库
    await connectDB();

    // 4. 获取用户列表 - 添加 isLocked 和 lockReason 字段
    const users = await User.find({})
      .select('name email createdAt isAdmin isLocked lockReason')  // 添加了锁定相关字段
      .sort({ createdAt: -1 });

    // 5. 返回成功响应
    return res.status(200).json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin || false,
        isLocked: user.isLocked || false,       // 添加锁定状态
        lockReason: user.lockReason || ''       // 添加锁定原因
      }))
    });

  } catch (error) {
    console.error('获取用户列表出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: '获取用户列表失败，请重试' 
    });
  }
}