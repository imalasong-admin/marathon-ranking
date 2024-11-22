// pages/api/admin/records/[id].js
import { getServerSession } from "next-auth";
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';   
import Record from '../../../models/Record'; 
import User from '../../../models/User';  
import Race from '../../../models/Race';

export default async function handler(req, res) {
  // 仅支持 PUT 和 DELETE 请求
  console.log('API Route Hit:', {
    method: req.method,
    id: req.query.id,
    body: req.body
  });
  if (req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ message: '不支持的请求方法' });
  }

  try {
    // 权限检查
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    // 检查管理员权限
    const user = await User.findById(session.user.id);
    if (!user?.isAdmin) {
      return res.status(403).json({ message: '无权访问' });
    }

    await connectDB();
    const { id } = req.query;

    // 检查记录是否存在
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({ 
        success: false, 
        message: '未找到该记录' 
      });
    }

    if (req.method === 'PUT') {
      // 更新记录
      const { raceId, hours, minutes, seconds, totalSeconds, proofUrl } = req.body;

      // 验证比赛是否存在
      const race = await Race.findById(raceId);
      if (!race) {
        return res.status(400).json({
          success: false,
          message: '选择的比赛不存在'
        });
      }

      // 验证时间格式
      if (hours < 0 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
        return res.status(400).json({
          success: false,
          message: '时间格式无效'
        });
      }

      // 更新记录
      const updatedRecord = await Record.findByIdAndUpdate(
        id,
        {
          raceId,
          finishTime: {
            hours: parseInt(hours),
            minutes: parseInt(minutes),
            seconds: parseInt(seconds)
          },
          totalSeconds,
          proofUrl: proofUrl || '',
          verificationStatus: 'pending',
          verifiedCount: 0,
          verifiedBy: [],
          reportedBy: []
        },
        { new: true }
      ).populate([
        {
          path: 'userId',
          select: 'name gender birthDate'
        },
        {
          path: 'raceId',
          populate: {
            path: 'seriesId',
            select: 'name raceType'
          }
        }
      ]);
    
      // 替换原来的 return 语句为这个新的格式
      return res.status(200).json({
        success: true,
        message: '更新成功',
        record: updatedRecord
      });

    } else if (req.method === 'DELETE') {
      // 删除记录
      await Record.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: '删除成功'
      });
    }

  } catch (error) {
    console.error('记录操作错误:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '操作失败，请重试'
    });
  }
}