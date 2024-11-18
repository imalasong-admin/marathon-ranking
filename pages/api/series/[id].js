import connectDB from '../../../lib/mongodb';
import Series from '../../../models/Series';
import { getServerSession } from "next-auth/next";  
import { authOptions } from "../auth/[...nextauth]";  

export default async function handler(req, res) {
  await connectDB();
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({ success: false, message: '请先登录' });
  }

  if (!session.user.isAdmin) {
    return res.status(403).json({ success: false, message: '需要管理员权限' });
  }


  switch(req.method) {
    case 'GET':
      try {
        const series = await Series.findById(id);
        if (!series) {
          return res.status(404).json({ success: false, message: '赛事不存在' });
        }
        res.status(200).json({ success: true, series });
      } catch (error) {
        res.status(500).json({ success: false, message: '获取失败' });
      }
      break;

    case 'PUT':
      try {
        const { name, raceType, location, website } = req.body;
        
        if (!name || !raceType) {
          return res.status(400).json({ 
            success: false, 
            message: '名称和类型不能为空' 
          });
        }

        // 检查名称是否重复(排除自身)
        const existingSeries = await Series.findOne({
          _id: { $ne: id },
          name: { $regex: new RegExp(`^${name}$`, 'i') }
        });

        if (existingSeries) {
          return res.status(400).json({
            success: false,
            message: '该赛事名称已存在'
          });
        }

        const updatedSeries = await Series.findByIdAndUpdate(
            id,
            { 
              name, 
              raceType, 
              location, 
              website,
              lastModifiedBy: session.user.id  // 添加这行
            },
            { new: true, runValidators: true }
          ).populate('lastModifiedBy', 'name isAdmin');  // 添加这个 populate
      
          if (!updatedSeries) {
            return res.status(400).json({ success: false, message: '赛事不存在' });
          }
      
          res.status(200).json({
            success: true,
            message: '更新成功',
            series: updatedSeries
          });
        } catch (error) {
          console.error('更新赛事错误:', error);
          res.status(500).json({ success: false, message: '更新失败，请重试' });
        }
        break;

    default:
      res.status(405).json({ message: '不支持的请求方法' });
  }
}   