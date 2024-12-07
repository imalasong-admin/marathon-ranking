// pages/api/records/index.js
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import { calculateAdjustedSeconds } from '../../../lib/ageFactors';
import { checkBQ, getBostonAge } from '../../../lib/bqUtils';

export default async function handler(req, res) {
 if (req.method !== 'GET') {
   return res.status(405).json({ message: '只支持 GET 请求' });
 }

 try {
   await connectDB();

   const records = await Record.find()
     .populate({
       path: 'userId',
       select: 'name gender birthDate state city'
     })
     .populate({
       path: 'raceId',
       populate: {
         path: 'seriesId',
         select: 'name raceType'
       }
     })
     // 添加这两个 populate
  .populate({
    path: 'verifiedBy.userId',
    select: 'name'
  })
  .populate({
    path: 'reportedBy.userId',
    select: 'name'
  })

     .sort({ createdAt: -1 });

   const recordsWithDetails = records.map(record => {
     const recordObj = record.toObject();

     // 计算比赛时的年龄（用于显示）
    let age = null;
    if (recordObj.userId?.birthDate && recordObj.raceId?.date) {
      const raceDate = new Date(recordObj.raceId.date);
      const birthDate = new Date(recordObj.userId.birthDate);
      
      age = raceDate.getFullYear() - birthDate.getFullYear();
      const m = raceDate.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && raceDate.getDate() < birthDate.getDate())) {
        age--;
      }
    }
    // 如果是马拉松且没有isBQ字段，重新计算（兼容旧数据）
    if (
      recordObj.raceId?.seriesId?.raceType === '全程马拉松' && 
      !recordObj.hasOwnProperty('isBQ')
    ) {
      recordObj.isBQ = checkBQ(
        recordObj.totalSeconds, 
        recordObj.userId?.gender, 
        recordObj.userId?.birthDate
      );
    }

    // 添加波马比赛日的年龄
    const bostonAge = getBostonAge(recordObj.userId?.birthDate);

     // 计算调整后成绩
     const adjustedSeconds = calculateAdjustedSeconds(
       recordObj.totalSeconds,
       recordObj.userId?.gender,
       recordObj.userId?.birthDate,
       recordObj.raceId?.date
     );

     return {
       ...recordObj,
       userName: recordObj.userId?.name,
       gender: recordObj.userId?.gender,
       state: recordObj.userId?.state,
       city: recordObj.userId?.city,
       age, // 比赛当天的年龄
       bostonAge, // 波马比赛日的年龄
       date: recordObj.raceId?.date,
       raceName: recordObj.raceId?.seriesId?.name,
       adjustedSeconds,
       isBQ: recordObj.isBQ
     };
   });

   res.status(200).json({
     success: true,
     records: recordsWithDetails
   });
 } catch (error) {
   console.error('获取记录列表错误:', error);
   res.status(500).json({ 
     success: false,
     message: error.message || '获取记录列表失败' 
   });
 }
}