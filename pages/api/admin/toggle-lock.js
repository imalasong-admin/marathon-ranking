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
    // 检查管理员权限
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '无权进行此操作' 
      });
    }

    await connectDB();

    const { userId, isLocked, lockReason } = req.body;
    
    // 验证参数
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: '用户ID不能为空' 
      });
    }
    if (typeof isLocked !== 'boolean') {
      return res.status(400).json({ 
        success: false, 
        message: '锁定状态值无效' 
      });
    }

    // 查找用户
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    // 不能锁定管理员
    if (user.isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: '不能锁定管理员账号' 
      });
    }

    // 更新用户状态
    user.isLocked = isLocked;
    user.lockReason = isLocked ? (lockReason || '') : '';  // 如果解锁，清空锁定原因
    await user.save();

    return res.status(200).json({
      success: true,
      message: isLocked ? '用户已锁定' : '用户已解锁',
      user: {
        id: user._id,
        name: user.name,
        isLocked: user.isLocked,
        lockReason: user.lockReason
      }
    });

  } catch (error) {
    console.error('切换用户锁定状态出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: '操作失败，请重试' 
    });
  }
}