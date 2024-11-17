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
    select: 'name gender birthDate isLocked'
  })
  .populate({
    path: 'raceId',
    model: Race,
    select: 'date seriesId',  // 只选择需要的字段
    populate: {
      path: 'seriesId',      // 进一步关联 Series
      select: 'name raceType'  // 从 Series 中获取名称和类型
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      // 使用美国东部时间
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'America/New_York'  // 使用美国东部时区
      };
  
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return null;
      
      return new Date(date).toLocaleDateString('zh-CN', options).replace(/\//g, '-');
    } catch (error) {
      return null;
    }
  };

    // 只过滤掉锁定用户的记录
    const filteredRecords = allRecords.filter(record => 
      record.userId && !record.userId.isLocked
    );

    const recordsWithAge = filteredRecords.map(record => {
      const recordObj = record.toObject();
      
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

      const formattedDate = formatDate(recordObj.raceId?.date);
      
      return {
        ...recordObj,
        age: (raceAge && raceAge >= 0 && raceAge <= 100) ? raceAge : null,
        userName: recordObj.userId?.name || '未知用户',
        gender: recordObj.userId?.gender || '未知',
        raceName: recordObj.raceId?.seriesId?.name || '未知比赛',  // 从 seriesId 获取赛事名称
        raceType: recordObj.raceId?.seriesId?.raceType,           // 从 seriesId 获取赛事类型
        date: formattedDate || ''
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