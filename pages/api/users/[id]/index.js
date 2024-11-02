// pages/api/users/[id]/index.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Record from '../../../../models/Record';
import Race from '../../../../models/Race';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    await dbConnect();
    const { id } = req.query;

    // 获取用户基本信息，确保包含 bio 字段
    const user = await User.findById(id)
      .select('name gender birthDate bio');  // 显式包含 bio 字段

    console.log('Found user data:', {
      userId: id,
      userBio: user.bio,
      bioType: typeof user.bio
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到用户' 
      });
    }

    // 计算年龄
    let age = null;
    if (user.birthDate) {
      const today = new Date();
      const birthDate = new Date(user.birthDate);
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    // 获取用户的比赛记录
    const records = await Record.find({ userId: id })
      .populate({
        path: 'raceId',
        model: Race,
        select: 'name date'
      })
      .sort({ 'raceId.date': -1 });

    const formattedRecords = records.map(record => ({
      _id: record._id,
      raceName: record.raceId?.name || '未知比赛',
      date: record.raceId?.date,
      finishTime: record.finishTime,
      verificationStatus: record.verificationStatus
    }));

    // 构造响应数据
    const responseData = {
      success: true,
      data: {
        user: {
          ...user.toObject(),
          age,
          bio: user.bio || ''  // 确保即使 bio 为 null 也返回空字符串
        },
        records: formattedRecords
      }
    };

    // 在返回数据前记录日志
    console.log('Sending response:', {
      userId: id,
      userData: responseData.data.user,
      bioField: responseData.data.user.bio
    });

    res.status(200).json(responseData);

  } catch (error) {
    console.error('获取用户数据错误:', error);
    res.status(500).json({ 
      success: false, 
      message: '获取用户数据失败' 
    });
  }
}