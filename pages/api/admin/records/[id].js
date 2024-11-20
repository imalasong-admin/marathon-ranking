// pages/api/admin/records/[id].js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Record from '../../../../models/Record';
import User from '../../../../models/User';
import Race from '../../../../models/Race';

export default async function handler(req, res) {
  try {
    // 验证管理员权限
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ success: false, message: '无权访问' });
    }

    await connectDB();
    const { id } = req.query;

    // 验证记录是否存在
    const record = await Record.findById(id);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    if (req.method === 'PUT') {
      const { raceId, hours, minutes, seconds, totalSeconds, proofUrl } = req.body;

      // 验证场次是否存在
      const race = await Race.findById(raceId);
      if (!race) {
        return res.status(400).json({ success: false, message: '场次不存在' });
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
          verificationStatus: 'pending', // 重置验证状态
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

      return res.status(200).json({ success: true, record: updatedRecord });
    }

    if (req.method === 'DELETE') {
      await Record.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: '删除成功' });
    }

    return res.status(405).json({ success: false, message: '不支持的请求方法' });
  } catch (error) {
    console.error('处理请求错误:', error);
    return res.status(500).json({ success: false, message: '操作失败' });
  }
}