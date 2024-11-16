import connectDB from '../../../lib/mongodb';
import Series from '../../../models/Series';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);

  console.log('API session:', session); // 调试用

  if (!session) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  if (!session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }

  if (req.method === 'GET') {
    try {
      const series = await Series.find({})
        .sort({ name: 1 });
      res.status(200).json({ success: true, series });
    } catch (error) {
      console.error('获取赛事列表错误:', error);
      res.status(500).json({ success: false, message: '获取赛事列表失败' });
    }
  } 
  else if (req.method === 'POST') {
    // 检查管理员权限
    if (!session.user.isAdmin) {
      return res.status(403).json({ success: false, message: '需要管理员权限' });
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
        website: website || ''
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