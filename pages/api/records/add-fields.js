// pages/api/admin/records/add-fields.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import connectDB from '../../../../lib/mongodb';
import Record from '../../../../models/Record';

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

    // 强制添加字段
    const result = await Record.updateMany(
      {},  // 匹配所有记录
      {
        $set: {
          raceAge: 0,
          bqAge: 0,
          bqDiff: 0
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: '字段添加成功',
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    });

  } catch (error) {
    console.error('添加字段出错:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || '添加字段失败' 
    });
  }
}