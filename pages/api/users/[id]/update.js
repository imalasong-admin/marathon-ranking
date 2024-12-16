// pages/api/users/[id]/update.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { isValidState, isValidCityForState } from '../../../../lib/us-cities-data';

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
    // 添加 chineseName 到解构中
    const { bio, stravaUrl, state, city, chineseName } = req.body;

    // 验证简介长度
    if (bio && bio.length > 500) {
      return res.status(400).json({ message: '简介不能超过500字' });
    }

    // 验证州和城市
    if ((state && !city) || (!state && city)) {
      return res.status(400).json({ message: '州和城市必须同时提供' });
    }

    if (state && city) {
      if (!isValidState(state)) {
        return res.status(400).json({ message: '无效的州' });
      }
      if (!isValidCityForState(state, city)) {
        return res.status(400).json({ message: '该城市不属于所选州' });
      }
    }

    // 构建更新数据，添加 chineseName
    const updateData = {};
    if (bio !== undefined) updateData.bio = bio;
    if (stravaUrl !== undefined) updateData.stravaUrl = stravaUrl;
    if (chineseName !== undefined) updateData.chineseName = chineseName;
    if (state && city) {
      updateData.state = state;
      updateData.city = city;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: '未找到用户' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        gender: updatedUser.gender,
        birthDate: updatedUser.birthDate,
        bio: updatedUser.bio,
        stravaUrl: updatedUser.stravaUrl,
        state: updatedUser.state,
        city: updatedUser.city,
        chineseName: updatedUser.chineseName  // 添加到返回数据中
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