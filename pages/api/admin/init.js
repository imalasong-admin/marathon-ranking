import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';

export default async function handler(req, res) {
  // 仅在开发环境可用
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ 
      success: false, 
      message: '此接口仅在开发环境可用' 
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: '不支持的请求方法' 
    });
  }

  try {
    await connectDB();

    // 查找并更新指定用户
    const user = await User.findOneAndUpdate(
      { email: 'imalasong2024@gmail.com' },
      { isAdmin: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到指定用户' 
      });
    }

    return res.status(200).json({
      success: true,
      message: '初始管理员设置成功',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });

  } catch (error) {
    console.error('设置初始管理员出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: '操作失败，请重试' 
    });
  }
}