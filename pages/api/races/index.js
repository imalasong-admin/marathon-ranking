// pages/api/races/index.js
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

  if (req.method === 'POST') {
    try {
      const { seriesId, date } = req.body;
      console.log('收到的数据:', { seriesId, date });  // 添加这行
  
      // 验证必填字段
      if (!seriesId || !date) {
        return res.status(400).json({ 
          success: false, 
          message: '请选择赛事和日期' 
        });
      }

      // 调整时区，确保保存的是当天中午12点
      const adjustedDate = new Date(date);
      adjustedDate.setHours(12, 0, 0, 0);
     
      
      // 检查是否已存在相同场次
      const existingRace = await Race.findOne({
        seriesId,
        date: adjustedDate
      });

      if (existingRace) {
        return res.status(400).json({
          success: false,
          message: '该赛事在此日期已有场次'
        });
      }

      // 创建新场次
      const race = await Race.create({
        seriesId,
        date: new Date(date),  // 直接保存，不做时区调整
        addedBy: session.user.id
      });

      res.status(201).json({
        success: true,
        message: '添加成功',
        race
      });

    } catch (error) {
      console.error('添加比赛场次错误:', error);
      res.status(500).json({ 
        success: false, 
        message: '添加失败，请重试' 
      });
    }
  } 
  else if (req.method === 'GET') {
    try {
      // 获取场次列表时关联查询赛事信息
      const races = await Race.find()
        .populate('seriesId', 'name raceType')  // 关联查询赛事名称和类型
        .sort({ date: -1 });                    // 按日期倒序

      res.status(200).json({ 
        success: true, 
        races 
      });
    } catch (error) {
      console.error('获取场次列表错误:', error);
      res.status(500).json({ 
        success: false, 
        message: '获取场次列表失败' 
      });
    }
  }
  else {
    res.status(405).json({ message: '不支持的请求方法' });
  }
}