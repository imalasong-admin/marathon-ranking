// pages/api/stats/update.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import { updateStatsForYear } from '../../../lib/statsService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: '只支持 POST 请求' });
  }

  try {
    // 验证管理员权限
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.isAdmin) {
      return res.status(403).json({ success: false, message: '需要管理员权限' });
    }

    await connectDB();
    const { year = 2024 } = req.body;
    
    const success = await updateStatsForYear(year);
    
    if (success) {
      return res.status(200).json({
        success: true,
        message: `${year}年统计数据更新成功`
      });
    } else {
      return res.status(500).json({
        success: false,
        message: '统计数据更新失败'
      });
    }
  } catch (error) {
    console.error('更新统计数据错误:', error);
    return res.status(500).json({
      success: false,
      message: '更新统计数据失败'
    });
  }
}