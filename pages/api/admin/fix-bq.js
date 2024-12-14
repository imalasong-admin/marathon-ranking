// pages/api/admin/fix-bq.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import connectDB from "../../../lib/mongodb";
import Record from "../../../models/Record";
import { calculateAge } from "../../../lib/ageUtils";
import { checkBQ, BQ_RACE_DATE } from "../../../lib/bqStandards";

export default async function handler(req, res) {
  // 只允许 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 验证管理员权限
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin only' });
    }

    await connectDB();

    // 获取2024年的马拉松成绩
    const records = await Record.find()
      .populate({
        path: 'raceId',
        populate: { path: 'seriesId' }
      })
      .populate('userId', 'birthDate gender')
      .lean();

    const updates = [];
    const errors = [];

    // 更新 BQ 状态
    for (const record of records) {
      try {
        const raceDate = new Date(record.raceId?.date);
        const isMarathon = record.raceId?.seriesId?.raceType === '全程马拉松';
        
        if (raceDate.getFullYear() === 2024 && isMarathon) {
          const bostonAge = calculateAge(record.userId.birthDate, BQ_RACE_DATE);
          const isBQ = checkBQ(record.totalSeconds, record.userId.gender, bostonAge);

          if (isBQ !== record.isBQ) {
            await Record.findByIdAndUpdate(record._id, { isBQ });
            updates.push({
              id: record._id,
              name: record.userId.name,
              old: record.isBQ,
              new: isBQ
            });
          }
        }
      } catch (err) {
        errors.push({
          id: record._id,
          error: err.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      updates,
      errors,
      summary: {
        total: records.length,
        updated: updates.length,
        errors: errors.length
      }
    });

  } catch (error) {
    console.error('Fix BQ status error:', error);
    return res.status(500).json({ message: error.message });
  }
}
