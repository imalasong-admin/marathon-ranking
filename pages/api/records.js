// pages/api/records.js
import { connectDB } from '../../lib/mongodb';
import Record from '../../models/Record';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    await connectDB();
    const records = await Record.find({})
      .sort({ totalSeconds: 1 })  // 按完赛时间排序
      .populate('userId', 'name gender');  // 关联用户信息
    
    res.status(200).json({ success: true, records });
  } catch (error) {
    console.error('获取记录数据错误:', error);
    res.status(500).json({ success: false, message: '获取数据失败，请重试' });
  }
}