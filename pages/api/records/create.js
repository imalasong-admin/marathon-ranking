import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import Race from '../../../models/Race';
import User from '../../../models/User';  // 添加 User 模型导入

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: '只支持 POST 请求' });
  }

  try {
    // 检查会话
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ message: '请先登录' });
    }

    await connectDB();

    // 检查用户是否被锁定
    const user = await User.findById(session.user.id);
    if (user.isLocked) {
      return res.status(403).json({ 
        success: false,
        message: user.lockReason ? 
          `账号已被锁定: ${user.lockReason}` : 
          '账号已被锁定，无法提交成绩'
      });
    }

    // 从请求中获取数据
    const { 
      hours, 
      minutes, 
      seconds, 
      totalSeconds, 
      raceId, 
      proofUrl 
    } = req.body;

    // 验证比赛ID
    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(400).json({ message: '比赛不存在' });
    }

    // 验证成绩证明链接
    if (!proofUrl) {
      return res.status(400).json({ message: '请提供成绩证明链接' });
    }

    // 创建成绩记录
    const record = await Record.create({
      userId: session.user.id,
      raceId,
      finishTime: {
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds)
      },
      totalSeconds,
      proofUrl,
      verificationStatus: 'pending'
    });

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