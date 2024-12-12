// pages/api/stats/index.js
import connectDB from '../../../lib/mongodb';
import { getStatsForYear } from '../../../lib/statsService';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: '只支持 GET 请求' });
  }

  try {
    await connectDB();
    const stats = await getStatsForYear(2024);
    
    if (!stats) {
      return res.status(200).json({ 
        success: false, 
        message: '未找到统计数据' 
      });
    }

    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return res.status(500).json({
      success: false,
      message: '获取统计数据失败'
    });
  }
}