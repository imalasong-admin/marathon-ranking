// pages/api/races.js
import connectDB from '../../lib/mongodb';
import Race from '../../models/Race';

export default async function handler(req, res) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const races = await Race.find({})
        .sort({ date: -1 })  // 按日期降序排序
        .select('name date');    // 返回名称和日期字段
      
      res.status(200).json({ success: true, races });
    } catch (error) {
      console.error('获取比赛列表错误:', error);
      res.status(500).json({ success: false, message: '获取比赛列表失败' });
    }
  } 
  else if (req.method === 'POST') {
    try {
      const { name, date, userId } = req.body;

      if (!name || !date) {
        return res.status(400).json({ 
          success: false, 
          message: '比赛名称和日期不能为空' 
        });
      }

      // 检查日期格式是否有效
      const raceDate = new Date(date);
      if (isNaN(raceDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: '无效的日期格式'
        });
      }

      // 检查是否已存在
      const existingRace = await Race.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingRace) {
        return res.status(400).json({ 
          success: false, 
          message: '该比赛名称已存在' 
        });
      }

      // 创建新比赛
      const race = await Race.create({
        name,
        date: raceDate,
        addedBy: userId
      });

      res.status(201).json({ 
        success: true, 
        message: '添加成功',
        race
      });
    } catch (error) {
      console.error('添加比赛错误:', error);
      res.status(500).json({ 
        success: false, 
        message: '添加失败，请重试' 
      });
    }
  } 
  else {
    res.status(405).json({ message: '不支持的请求方法' });
  }
}