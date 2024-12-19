// pages/api/admin/records/update-fields.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Record from '../../../../models/Record';
import { calculateAge } from '../../../../lib/ageUtils';
import { getBQDiff, BQ_RACE_DATE } from '../../../../lib/bqStandards';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ success: false, message: '无权访问' });
    }

    await connectDB();

    const records = await Record.find()
      .populate({
        path: 'userId',
        select: 'birthDate gender'
      })
      .populate({
        path: 'raceId',
        populate: {
          path: 'seriesId',
          select: 'raceType'
        }
      });

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const record of records) {
      try {
        if (!record.userId?.birthDate || !record.raceId?.date) {
          throw new Error('缺少必要数据');
        }

        const raceAge = calculateAge(record.userId.birthDate, record.raceId.date);
        const bqAge = calculateAge(record.userId.birthDate, BQ_RACE_DATE);
        const isMarathon = record.raceId.seriesId?.raceType === '全程马拉松';
        const bqDiff = isMarathon ? 
          getBQDiff(record.totalSeconds, record.userId.gender, bqAge) : 
          null;

        await Record.findByIdAndUpdate(record._id, {
          raceAge,
          bqAge,
          bqDiff
        });

        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({
          recordId: record._id,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: '更新完成',
      stats: {
        total: records.length,
        success: successCount,
        error: errorCount
      },
      errors
    });

  } catch (error) {
    console.error('更新过程出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '更新失败' 
    });
  }
}