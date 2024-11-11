// pages/api/users/[id].js
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import Record from '../../../../models/Record';
import Race from '../../../../models/Race';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';

// 将辅助函数移到顶部
function calculateAge(birthDate) {
  if (!birthDate) return null;
  
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}


export default async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        await connectDB();

        const { id } = req.query;
        
        // 查询用户信息
        const user = await User.findById(id)
          .select('name gender birthDate bio isLocked');

        if (!user) {
          return res.status(404).json({ success: false, message: '未找到用户' });
        }

        // 如果用户被锁定，只有管理员和用户本人可以查看
        if (user.isLocked) {
          const session = await getServerSession(req, res, authOptions);
          const isAdmin = session?.user?.isAdmin;
          const isOwnProfile = session?.user?.id === id;

          if (!isAdmin && !isOwnProfile) {
            return res.status(403).json({ success: false, message: '该用户已被锁定' });
          }
        }

        // 查询用户的所有成绩记录
        const records = await Record.find({ userId: id })
        .select('finishTime totalSeconds proofUrl ultraDistance verificationStatus verifiedCount verifiedBy reportedBy')
          .populate({
            path: 'raceId',
            model: Race,
            select: 'name date raceType'
          })
          .sort({ 'raceId.date': -1 });

        // 计算年龄并格式化记录
        const recordsWithDetails = records.map(record => {
          const recordObj = record.toObject();
          
          // 计算比赛时的年龄
          let age = null;
          if (user.birthDate && recordObj.raceId?.date) {
            const raceDate = new Date(recordObj.raceId.date);
            const birthDate = new Date(user.birthDate);
            
            if (raceDate >= birthDate) {
              age = raceDate.getFullYear() - birthDate.getFullYear();
              const m = raceDate.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && raceDate.getDate() < birthDate.getDate())) {
                age--;
              }
            }
          }

          // 返回格式化后的记录
          return {
            ...recordObj,
            age,
            raceName: recordObj.raceId?.name || '未知比赛',
            date: recordObj.raceId?.date,
            raceType: recordObj.raceId?.raceType,
            userName: user.name,
            gender: user.gender,
            ultraDistance: recordObj.ultraDistance,  // 确保返回超马项目信息
            verificationStatus: recordObj.verificationStatus,
            verifiedCount: recordObj.verifiedCount,
            verifiedBy: recordObj.verifiedBy,
            reportedBy: recordObj.reportedBy
          };
        });

        // 返回用户信息和成绩记录
        res.status(200).json({
          success: true,
          data: {
            user: {
              ...user.toObject(),
              age: calculateAge(user.birthDate)
            },
            records: recordsWithDetails
          }
        });

      } catch (error) {
        console.error('获取用户数据错误:', error);
        res.status(500).json({ success: false, message: '获取用户数据失败' });
      }
      break;

    // ... PATCH 方法保持不变 ...
  }
}

// ... calculateAge 函数保持不变 ...