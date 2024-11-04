import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      message: '不支持的请求方法' 
    });
  }

  try {
    // 获取当前会话用户
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '无权进行此操作' 
      });
    }

    await connectDB();

    // 验证操作用户是否是 admin
    const currentUser = await User.findOne({ email: session.user.email });
    if (currentUser.name !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: '只有 admin 可以管理管理员权限' 
      });
    }

    const { userId, isAdmin } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '用户ID不能为空' 
      });
    }
    if (typeof isAdmin !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: '管理员状态值无效' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 不允许修改 admin 自己的权限
    if (user.name === 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: '不能修改超级管理员的权限' 
      });
    }

    user.isAdmin = isAdmin;
    await user.save();

    return res.status(200).json({
      success: true,
      message: isAdmin ? '已设置为管理员' : '已取消管理员权限',
      user: {
        id: user._id,
        name: user.name,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('设置管理员状态出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: '操作失败，请重试' 
    });
  }
}