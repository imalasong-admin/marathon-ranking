// pages/api/races/[id].js
import connectDB from '../../../lib/mongodb';
import Race from '../../../models/Race';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session?.user?.isAdmin) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({ 
          success: false, 
          message: '日期不能为空' 
        });
      }

      // 调整时区
    
      const adjustedDate = new Date(date + 'T12:00:00.000Z');  // 直接使用UTC时间

      const updatedRace = await Race.findByIdAndUpdate(
        id,
        { date: adjustedDate },
        { new: true }
      );

      if (!updatedRace) {
        return res.status(404).json({ 
          success: false, 
          message: '场次不存在' 
        });
      }

      res.status(200).json({
        success: true,
        message: '更新成功',
        race: updatedRace
      });
    } catch (error) {
      console.error('更新场次错误:', error);
      res.status(500).json({ 
        success: false, 
        message: '更新失败，请重试' 
      });
    }
  } else {
    res.status(405).json({ message: '不支持的请求方法' });
  }
}