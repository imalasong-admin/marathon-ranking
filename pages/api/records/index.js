// pages/api/records/index.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import Race from '../../../models/Race';
import User from '../../../models/User';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: '只支持 GET 请求' });
  }

  try {
    await connectDB();
    
    const allRecords = await Record.find()
      .populate({
        path: 'userId',
        model: User,
        select: 'name gender birthDate'
      })
      .populate({
        path: 'raceId',
        model: Race,
        select: 'name date'
      })
      .sort({ totalSeconds: 1 });

    const formatDate = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    };

    const recordsWithAge = allRecords.map(record => {
      const recordObj = record.toObject();
      
      // 使用比赛日期计算参赛年龄
      let raceAge = null;
      const raceDate = recordObj.raceId?.date ? new Date(recordObj.raceId.date) : null;
      const birthDate = recordObj.userId?.birthDate ? new Date(recordObj.userId.birthDate) : null;
      
      if (birthDate && raceDate && !isNaN(raceDate.getTime()) && !isNaN(birthDate.getTime())) {
        if (raceDate >= birthDate && birthDate.getFullYear() > 1920) {
          raceAge = raceDate.getFullYear() - birthDate.getFullYear();
          const m = raceDate.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && raceDate.getDate() < birthDate.getDate())) {
            raceAge--;
          }
        }
      }

      // 格式化日期显示
      const formattedDate = formatDate(recordObj.raceId?.date);
      
      return {
        ...recordObj,
        age: (raceAge && raceAge >= 0 && raceAge <= 100) ? raceAge : null,
        userName: recordObj.userId?.name || '未知用户',
        gender: recordObj.userId?.gender || '未知',
        raceName: recordObj.raceId?.name || '未知比赛',
        date: formattedDate || ''  // 如果没有日期，返回空字符串
      };
    });
      
    res.status(200).json({ 
      success: true, 
      records: recordsWithAge 
    });
  } catch (error) {
    console.error('获取记录错误:', error);
    res.status(500).json({ success: false, message: '获取记录失败' });
  }
}