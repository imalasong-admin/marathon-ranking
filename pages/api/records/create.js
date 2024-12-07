// pages/api/records/create.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import Race from '../../../models/Race';
import User from '../../../models/User';
import Series from '../../../models/Series';
import { calculateAdjustedSeconds } from '../../../lib/ageFactors';
import { checkBQ } from '../../../lib/bqUtils';

export default async function handler(req, res) {
 if (req.method !== 'POST') {
   return res.status(405).json({ message: '只支持 POST 请求' });
 }

 try {
   const session = await getServerSession(req, res, authOptions);
   if (!session) {
     return res.status(401).json({ message: '请先登录' });
   }

   await connectDB();

   const user = await User.findById(session.user.id);
   if (user.isLocked) {
     return res.status(403).json({ 
       success: false,
       message: user.lockReason ? 
         `账号已被锁定: ${user.lockReason}` : 
         '账号已被锁定，无法提交成绩'
     });
   }

   const { 
     hours, 
     minutes, 
     seconds, 
     totalSeconds, 
     raceId, 
     proofUrl,
     ultraDistance
   } = req.body;

   if (!raceId) {
     return res.status(400).json({ message: '请选择比赛' });
   }

   const race = await Race.findById(raceId).populate('seriesId');
   if (!race) {
     return res.status(400).json({ message: '比赛不存在' });
   }

   if (totalSeconds <= 0) {
     return res.status(400).json({ message: '请填写有效的完赛时间' });
   }

   if (race.seriesId?.raceType === '超马' && !ultraDistance) {
     return res.status(400).json({ message: '请选择超马项目' });
   }

   // 计算调整后的成绩
   const adjustedSeconds = calculateAdjustedSeconds(
     totalSeconds,
     user.gender,
     user.birthDate,
     race.date
   );

// 检查是否达到BQ标准
const isBQ = race.seriesId?.raceType === '全程马拉松' ? 
checkBQ(totalSeconds, user.gender, user.birthDate) : 
false;

   const recordData = {
     userId: session.user.id,
     raceId,
     finishTime: {
       hours: parseInt(hours),
       minutes: parseInt(minutes),
       seconds: parseInt(seconds)
     },
     totalSeconds,
     adjustedSeconds, // 添加调整后的成绩
     proofUrl: proofUrl || '',
     verificationStatus: 'pending',
     isBQ
   };

   if (race.seriesId?.raceType === '超马') {
     recordData.ultraDistance = ultraDistance;
   }

   const record = await Record.create(recordData);

   return res.status(201).json({
     success: true,
     message: '成绩提交成功',
     record
   });

 } catch (error) {
   console.error('提交成绩错误:', error);
   return res.status(500).json({
     success: false,
     message: error.message || '提交失败，请重试'
   });
 }
}