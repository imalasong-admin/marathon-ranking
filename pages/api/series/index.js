import connectDB from '../../../lib/mongodb';
import Series from '../../../models/Series';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  if (req.method === 'GET') {
    try {
      const series = await Series.find({})
        .populate({
          path: 'addedBy',      // 保留原有的
          select: 'name isAdmin'
        })
        .populate({
          path: 'lastModifiedBy',  // 添加新的
          select: 'name isAdmin'
        })
        .sort({ name: 1 });
      
      // 添加调试日志
      console.log('获取的赛事数据:', series);
      
      res.status(200).json({ success: true, series });
    } catch (error) {
      console.error('获取赛事列表错误:', error);
      res.status(500).json({ success: false, message: '获取赛事列表失败' });
    }
  }
  else if (req.method === 'POST') {
    // 只检查是否登录，不检查管理员权限
    if (!session) {
      return res.status(401).json({ success: false, message: '请先登录' });
    }
  
    try {
      const { name, raceType, location, website } = req.body;

      if (!name || !raceType) {
        return res.status(400).json({ 
          success: false, 
          message: '赛事名称和类型不能为空' 
        });
      }

      const existingSeries = await Series.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') }
      });
      
      if (existingSeries) {
        return res.status(400).json({ 
          success: false, 
          message: '该赛事名称已存在' 
        });
      }

      const series = await Series.create({
        name,
        raceType,
        location: location || '',
        website: website || '',
        addedBy: session.user.id  // 添加这一行
      });

      res.status(201).json({ 
        success: true, 
        message: '添加成功',
        series
      });
    } catch (error) {
      console.error('添加赛事错误:', error);
      res.status(500).json({ success: false, message: '添加失败，请重试' });
    }
  } 
  else {
    res.status(405).json({ message: '不支持的请求方法' });
  }
}