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
        select: 'name'
      })
      .sort({ totalSeconds: 1 });

      const recordsWithAge = allRecords.map(record => {
        const recordObj = record.toObject();
        
        // 计算比赛时的年龄，添加合理性检查
        let raceAge = null;
        if (recordObj.userId?.birthDate && recordObj.date) {
          const raceDate = new Date(recordObj.date);
          const birthDate = new Date(recordObj.userId.birthDate);
          
          // 检查日期的合理性
          if (raceDate >= birthDate && birthDate.getFullYear() > 1920) {
            raceAge = raceDate.getFullYear() - birthDate.getFullYear();
            const m = raceDate.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && raceDate.getDate() < birthDate.getDate())) {
              raceAge--;
            }
          }
        }
        
        return {
          ...recordObj,
          age: (raceAge && raceAge >= 0 && raceAge <= 100) ? raceAge : null,
          userName: recordObj.userId?.name || '未知用户',
          gender: recordObj.userId?.gender || '未知',
          raceName: recordObj.raceId?.name || '未知比赛'
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