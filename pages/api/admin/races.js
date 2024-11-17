// pages/api/admin/races.js
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import Race from '../../../models/Race';

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

    // 4. 获取比赛列表，按日期倒序排列
    const races = await Race.find({})
      .populate('addedBy', 'name email')  // 获取创建者信息
      .sort({ date: -1 });  // 按比赛日期倒序

    // 5. 返回成功响应
    return res.status(200).json({
      success: true,
      races: races.map(race => ({
        _id: race._id,
        name: race.name,
        date: race.date,
        raceType: race.raceType,
        location: race.location || '',
        website: race.website || '',
        addedBy: race.addedBy ? {
          name: race.addedBy.name,
          email: race.addedBy.email
        } : null,
        createdAt: race.createdAt
      }))
    });

  } catch (error) {
    console.error('获取比赛列表出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: '获取比赛列表失败，请重试' 
    });
  }
}