// pages/api/admin/records/[id].js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Record from '../../../../models/Record';
import User from '../../../../models/User';
import Race from '../../../../models/Race';
import { checkBQ, BQ_RACE_DATE, getBQDiff } from '../../../../lib/bqStandards';
import { calculateAge } from '../../../../lib/ageUtils';
import { updateStatsForYear } from '../../../../lib/statsService';



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
    const originalRecord = await Record.findById(id).populate({
      path: 'raceId',
      populate: {
        path: 'seriesId',
        select: 'raceType'
      }
    });
    
    if (!originalRecord) {
      return res.status(404).json({ success: false, message: '记录不存在' });
    }

    if (req.method === 'PUT') {
      const { raceId, hours, minutes, seconds, totalSeconds, proofUrl } = req.body;

      // 验证场次是否存在
      const race = await Race.findById(raceId).populate('seriesId');
      if (!race) {
        return res.status(400).json({ success: false, message: '场次不存在' });
      }

      // 获取用户信息用于计算
      const user = await User.findById(originalRecord.userId);
      if (!user) {
        return res.status(400).json({ success: false, message: '用户不存在' });
      }

      // 计算相关字段
      const raceAge = calculateAge(user.birthDate, race.date);
      const bqAge = calculateAge(user.birthDate, BQ_RACE_DATE);
      const isMarathon = race.seriesId?.raceType === '全程马拉松';
      const isBQ = isMarathon ? 
        checkBQ(totalSeconds, user.gender, bqAge) : 
        false;
      const bqDiff = isMarathon ? 
        getBQDiff(totalSeconds, user.gender, bqAge) : 
        null;

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
          reportedBy: [],
          isBQ,
          // 新增字段
          raceAge,
          bqAge,
          bqDiff
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

      // 如果原记录和新记录都是马拉松，更新统计
      if (originalRecord.raceId?.seriesId?.raceType === '全程马拉松' || 
          race.seriesId?.raceType === '全程马拉松') {
        
        const originalYear = new Date(originalRecord.raceId?.date).getFullYear();
        const newYear = new Date(race.date).getFullYear();
        
        // 异步更新统计，不影响响应
        if (originalYear === 2024) {
          updateStatsForYear(2024).catch(console.error);
        }
        if (newYear === 2024 && newYear !== originalYear) {
          updateStatsForYear(2024).catch(console.error);
        }
      }

      return res.status(200).json({ success: true, record: updatedRecord });
    }

    if (req.method === 'DELETE') {
      await Record.findByIdAndDelete(id);

      // 如果删除的是马拉松成绩，更新统计
      if (originalRecord.raceId?.seriesId?.raceType === '全程马拉松') {
        const year = new Date(originalRecord.raceId?.date).getFullYear();
        if (year === 2024) {
          // 异步更新统计，不影响响应
          updateStatsForYear(2024).catch(console.error);
        }
      }

      return res.status(200).json({ success: true, message: '删除成功' });
    }

    return res.status(405).json({ success: false, message: '不支持的请求方法' });
  } catch (error) {
    console.error('处理请求错误:', error);
    return res.status(500).json({ success: false, message: '操作失败' });
  }
}