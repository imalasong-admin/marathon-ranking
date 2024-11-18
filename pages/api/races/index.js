// pages/api/races/index.js
import connectDB from '../../../lib/mongodb';
import Race from '../../../models/Race';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (req.method === 'POST') {
    // 只检查登录状态
    if (!session) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }
  
    try {
      const { seriesId, date } = req.body;
  
      if (!seriesId || !date) {
        return res.status(400).json({ 
          success: false, 
          message: '请选择赛事和日期' 
        });
      }

      const adjustedDate = new Date(date);
      adjustedDate.setHours(12, 0, 0, 0);
      
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

      const race = await Race.create({
        seriesId,
        date: new Date(date),
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
      // 获取查询参数
      const { year, type } = req.query;
      
      // 构建查询条件
      let query = {};
      
      // 如果提供了年份，添加日期范围条件
      if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        query.date = {
          $gte: startDate,
          $lte: endDate
        };
      }

      // 获取场次列表并关联查询赛事信息
      let races = await Race.find(query)
  .populate('seriesId', 'name raceType location website')
  .populate('addedBy', 'name isAdmin')
  .populate('lastModifiedBy', 'name isAdmin')
  .sort({ date: -1 });
      
      // 如果提供了类型，在内存中过滤
      if (type) {
        races = races.filter(race => race.seriesId?.raceType === type);
      }

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