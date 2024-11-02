// pages/api/users/[id]/update.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: '只支持 PATCH 请求' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    const { id } = req.query;
    if (session.user.id !== id) {
      return res.status(403).json({ message: '没有权限' });
    }

    await dbConnect();
    const { bio } = req.body;

    // 调试日志：输入数据
    console.log('Update request:', {
      userId: id,
      newBio: bio,
      bioType: typeof bio
    });

    if (bio && bio.length > 500) {
      return res.status(400).json({ message: '简介不能超过500字' });
    }

    // 更新前查询当前数据
    const beforeUser = await User.findById(id);
    console.log('Before update:', {
      currentBio: beforeUser.bio
    });

    // 执行更新
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { bio },  // 直接设置值，不使用条件操作符
      { new: true }  // 返回更新后的文档
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '未找到用户' });
    }

    // 验证更新
    const verifyUser = await User.findById(id);
    console.log('After update:', {
      updatedBio: updatedUser.bio,
      verifiedBio: verifyUser.bio
    });

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate,
        bio: updatedUser.bio  // 确保返回更新后的 bio
      }
    });

  } catch (error) {
    console.error('更新用户资料错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '更新失败，请重试' 
    });
  }
}