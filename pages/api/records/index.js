import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    await connectDB();

    const { gender, ageGroup } = req.query;
    let query = {};

    // 添加筛选条件
    if (gender) {
      query.gender = gender;
    }

    if (ageGroup) {
      const [minAge, maxAge] = ageGroup.split('-');
      if (maxAge === '+') {
        query.age = { $gte: parseInt(minAge) };
      } else {
        query.age = {
          $gte: parseInt(minAge),
          $lte: parseInt(maxAge)
        };
      }
    }

    // 获取记录并根据完成时间排序
    const records = await Record.find(query)
      .sort({ totalSeconds: 1 }) // 按完成时间升序排序
      .populate({
        path: 'userId',
        select: 'name email'
      })
      .lean();

    const formattedRecords = records.map(record => ({
      _id: record._id,
      name: record.userId?.name || '未知用户',
      totalSeconds: record.totalSeconds,
      gender: record.gender,
      age: record.age,
      date: record.date,
      finishTime: record.finishTime
    }));

    return res.status(200).json({
      success: true,
      records: formattedRecords
    });
  } catch (error) {
    console.error('获取记录列表错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取数据失败，请重试'
    });
  }
}