// pages/api/records/create.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import connectDB from '../../../lib/mongodb';
import Record from '../../../models/Record';
import Race from '../../../models/Race';
import User from '../../../models/User';

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
      proofUrl,
      ultraDistance
    } = req.body;

    // 基础验证
    if (!raceId) {
      return res.status(400).json({ message: '请选择比赛' });
    }

    // 验证比赛ID
    const race = await Race.findById(raceId);
    if (!race) {
      return res.status(400).json({ message: '比赛不存在' });
    }

    // 验证完赛时间
    if (totalSeconds <= 0) {
      return res.status(400).json({ message: '请填写有效的完赛时间' });
    }

    // 如果是超马比赛，验证 ultraDistance
    if (race.raceType === '超马' && !ultraDistance) {
      return res.status(400).json({ message: '请选择超马项目' });
    }

    // 构建记录数据
    const recordData = {
      userId: session.user.id,
      raceId,
      finishTime: {
        hours: parseInt(hours),
        minutes: parseInt(minutes),
        seconds: parseInt(seconds)
      },
      totalSeconds,
      proofUrl: proofUrl || '',
      verificationStatus: 'pending'
    };

    // 只在超马比赛时添加 ultraDistance 字段
    if (race.raceType === '超马') {
      recordData.ultraDistance = ultraDistance;
    }

    // 创建成绩记录
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