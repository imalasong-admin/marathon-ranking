// pages/api/records/index.js
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import { calculateAdjustedSeconds } from '../../../lib/ageFactors';
import { BQ_RACE_DATE, getStandard, checkBQ, getBQDiff } from '../../../lib/bqStandards';
import { calculateAge } from '../../../lib/ageUtils';

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

     if (recordObj.raceId?.seriesId?.raceType === '全程马拉松') {
       const bostonAge = calculateAge(recordObj.userId?.birthDate, BQ_RACE_DATE);
       recordObj.bostonAge = bostonAge;
       recordObj.bqStandard = getStandard(recordObj.userId?.gender, bostonAge);
       recordObj.bqDiff = getBQDiff(recordObj.totalSeconds, recordObj.userId?.gender, bostonAge);
       recordObj.isBQ = checkBQ(recordObj.totalSeconds, recordObj.userId?.gender, bostonAge);
     }

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
       age,
       date: recordObj.raceId?.date,
       raceName: recordObj.raceId?.seriesId?.name,
       adjustedSeconds
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